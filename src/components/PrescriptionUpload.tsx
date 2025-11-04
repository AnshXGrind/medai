import { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { isHarmful } from '@/lib/contentSafety';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Camera, FileText, CheckCircle, Loader2, X, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface PrescriptionUploadProps {
  userId: string;
  onUploadComplete?: () => void;
}

export const PrescriptionUpload = ({ userId, onUploadComplete }: PrescriptionUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const navigate = useNavigate();

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check for HEIC/HEIF by file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isHeic = fileExtension === 'heic' || fileExtension === 'heif';

    if (!file.type.startsWith('image/') && !isHeic) {
      toast.error("Please upload an image file", {
        description: "Supported: JPG, PNG, GIF, WebP, HEIC, TIFF, BMP, AVIF"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    
    // Create preview - HEIC files may not display in all browsers
    try {
      if (isHeic) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPreviewUrl(result);
        };
        reader.readAsDataURL(file);
        
        toast.success("HEIC file selected", {
          description: "Preview may not be available in all browsers"
        });
      } else {
        setPreviewUrl(URL.createObjectURL(file));
      }
    } catch (error) {
      console.error("Error creating preview:", error);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const startCamera = async () => {
    try {
      // Request camera with specific constraints for better compatibility
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Ensure video plays
        try {
          await videoRef.current.play();
          setIsCameraActive(true);
          toast.success("Camera activated", {
            description: "Position your prescription in the frame"
          });
        } catch (playError) {
          console.error('Video play error:', playError);
          // Try again with user interaction
          videoRef.current.play().catch(e => {
            console.error('Second play attempt failed:', e);
          });
          setIsCameraActive(true);
        }
      }
    } catch (error) {
      console.error('Camera access error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMsg.includes('Permission denied') || errorMsg.includes('NotAllowedError')) {
        toast.error("Camera permission denied", {
          description: "Please allow camera access in your browser settings"
        });
      } else if (errorMsg.includes('NotFoundError') || errorMsg.includes('DevicesNotFoundError')) {
        toast.error("No camera found", {
          description: "Please connect a camera device"
        });
      } else if (errorMsg.includes('NotReadableError') || errorMsg.includes('TrackStartError')) {
        toast.error("Camera is busy", {
          description: "Please close other apps using the camera"
        });
      } else {
        toast.error("Unable to access camera", {
          description: "Please check permissions and try again"
        });
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped:', track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    toast.info("Camera closed");
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Check if video is ready
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        toast.error("Camera not ready", {
          description: "Please wait for the camera to load"
        });
        return;
      }
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (canvas.width === 0 || canvas.height === 0) {
        toast.error("Camera not ready", {
          description: "Please wait a moment and try again"
        });
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the current video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to blob with high quality
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `prescription-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setUploadedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            stopCamera();
            toast.success("Photo captured successfully!", {
              description: "Review and upload your prescription"
            });
          } else {
            toast.error("Failed to capture photo", {
              description: "Please try again"
            });
          }
        }, 'image/jpeg', 0.95);
      }
    } else {
      toast.error("Camera not available", {
        description: "Please restart the camera"
      });
    }
  };

  const handleUpload = async () => {
    // Basic safety check on optional notes
    if (isHarmful(notes)) {
      toast.error("Notes contain harmful or illegal content. Redirecting to emergency help page.");
      setTimeout(() => navigate('/emergency'), 250);
      return;
    }
    if (!uploadedFile) return;

    setUploading(true);

    try {
      const fileExt = uploadedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `prescriptions/${fileName}`;

      // Determine content type for HEIC files
      let contentType = uploadedFile.type;
      if (!contentType || contentType === '') {
        if (fileExt === 'heic' || fileExt === 'heif') {
          contentType = 'image/heic';
        } else {
          contentType = 'image/jpeg';
        }
      }

      // Try to upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        
        // Fallback: Store file info locally
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = {
            name: uploadedFile.name,
            type: contentType,
            size: uploadedFile.size,
            data: e.target?.result,
            notes: notes,
            uploadedAt: new Date().toISOString(),
            userId: userId
          };
          
          // Store in localStorage
          const prescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
          prescriptions.push(fileData);
          localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
          
          toast.success("Prescription saved locally!", {
            description: `File stored: ${uploadedFile.name} (${fileExt.toUpperCase()})`
          });
          
          setUploadedFile(null);
          setPreviewUrl(null);
          setNotes("");
          if (fileInputRef.current) fileInputRef.current.value = '';
          onUploadComplete?.();
          setUploading(false);
        };
        reader.readAsDataURL(uploadedFile);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Log the successful upload
      console.log('Prescription uploaded successfully:', {
        publicUrl,
        notes,
        fileName,
        fileSize: uploadedFile.size
      });
      
      toast.success("Prescription uploaded successfully!", {
        description: `File: ${uploadedFile.name}`
      });
      
      setUploadedFile(null);
      setPreviewUrl(null);
      setNotes("");
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUploadComplete?.();
    } catch (error) {
      console.error("Upload error details:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      if (errorMessage.includes('bucket') || errorMessage.includes('not found')) {
        toast.error("Storage not configured", {
          description: "Please contact support to set up file storage."
        });
      } else if (errorMessage.includes('permission') || errorMessage.includes('policy')) {
        toast.error("Permission denied", {
          description: "Unable to upload file. Please check your permissions."
        });
      } else {
        toast.error("Failed to upload prescription", {
          description: errorMessage
        });
      }
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card className="shadow-md touch-manipulation">
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <FileText className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <CardTitle className="text-base md:text-lg">Upload Prescription</CardTitle>
            <CardDescription className="text-xs md:text-sm">Upload or capture prescription image</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        {isCameraActive ? (
          /* Camera View */
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border-2 border-primary bg-black">
              <video 
                ref={videoRef}
                autoPlay 
                playsInline
                muted
                className="w-full h-auto min-h-[300px] object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Camera overlay with guide */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg" />
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                  Position prescription within frame
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={capturePhoto}
                className="flex-1 h-11 bg-primary hover:bg-primary/90"
                size="lg"
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
              <Button
                onClick={stopCamera}
                variant="outline"
                className="h-11 px-6"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        ) : !previewUrl ? (
          <div className="space-y-3">
            {/* Upload from file */}
            <div className="border-2 border-dashed border-border rounded-lg p-4 md:p-6 text-center hover:border-primary/50 transition-smooth">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                onChange={handleFileSelect}
                className="hidden"
                id="prescription-upload"
              />
              <label htmlFor="prescription-upload" className="cursor-pointer">
                <Image className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs md:text-sm font-medium mb-1">Upload from gallery</p>
                <p className="text-xs text-muted-foreground">All image formats (JPG, PNG, HEIC, etc.) up to 10MB</p>
              </label>
            </div>

            {/* Capture with camera */}
            <div 
              className="border-2 border-dashed border-border rounded-lg p-4 md:p-6 text-center hover:border-primary/50 transition-smooth cursor-pointer"
              onClick={startCamera}
            >
              <Camera className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs md:text-sm font-medium mb-1">Capture with camera</p>
              <p className="text-xs text-muted-foreground">Take a photo now</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={previewUrl} alt="Prescription preview" className="w-full h-auto" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription-notes" className="text-xs md:text-sm">Notes (Optional)</Label>
              <Textarea
                id="prescription-notes"
                placeholder="Add any notes about this prescription..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full h-10 md:h-11 touch-manipulation active:scale-95"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Upload Prescription
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PrescriptionUpload;
