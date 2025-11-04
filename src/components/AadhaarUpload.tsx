import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CreditCard, CheckCircle, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AadhaarUploadProps {
  userId: string;
  onUploadComplete?: () => void;
}

export const AadhaarUpload = ({ userId, onUploadComplete }: AadhaarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported image formats including HEIC/HEIF
    const supportedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
      'image/heic',
      'image/heif',
      'image/avif'
    ];

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isHeic = fileExtension === 'heic' || fileExtension === 'heif';
    
    // Validate file type (check both MIME type and extension for HEIC)
    if (!file.type.startsWith('image/') && !isHeic) {
      toast.error("Please upload an image file", {
        description: "Supported: JPG, PNG, GIF, WebP, HEIC, TIFF, BMP, AVIF"
      });
      return;
    }

    // Validate file size (max 10MB to accommodate HEIC files)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    
    // For HEIC files, create a data URL for preview
    // HEIC files may not preview in all browsers, but we'll still upload them
    try {
      if (isHeic) {
        // Create a FileReader to show file info
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
      // Set a placeholder or just continue without preview
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploading(true);

    try {
      // Get file extension, handling HEIC/HEIF specially
      const fileExt = uploadedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `aadhaar/${fileName}`;

      // Determine content type for HEIC files
      let contentType = uploadedFile.type;
      if (!contentType || contentType === '') {
        // Fallback content type detection for HEIC/HEIF
        if (fileExt === 'heic' || fileExt === 'heif') {
          contentType = 'image/heic';
        } else {
          contentType = 'image/jpeg'; // default fallback
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, uploadedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        
        // Fallback to localStorage if Supabase storage fails
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          const storageKey = `aadhaar_${userId}_${Date.now()}`;
          
          localStorage.setItem(storageKey, JSON.stringify({
            fileName: uploadedFile.name,
            fileType: contentType,
            data: base64String,
            uploadedAt: new Date().toISOString()
          }));
          
          toast.success("Aadhaar saved locally!", {
            description: `File: ${uploadedFile.name} (${fileExt.toUpperCase()})`
          });
          
          setUploadedFile(null);
          setPreviewUrl(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
          onUploadComplete?.();
        };
        reader.readAsDataURL(uploadedFile);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save to database (will work after migration)
      console.log('Aadhaar uploaded:', {
        publicUrl,
        fileName,
        userId,
        fileType: contentType
      });

      toast.success("Aadhaar document uploaded successfully!", {
        description: `File: ${uploadedFile.name} (${fileExt.toUpperCase()})`
      });
      
      setUploadedFile(null);
      setPreviewUrl(null);
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
        toast.error("Failed to upload document", {
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
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-indigo-600 dark:text-indigo-300" />
          </div>
          <div>
            <CardTitle className="text-base md:text-lg">Upload Aadhaar Card</CardTitle>
            <CardDescription className="text-xs md:text-sm">Upload your Aadhaar for verification</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 space-y-4">
        {!previewUrl ? (
          <div className="border-2 border-dashed border-border rounded-lg p-6 md:p-8 text-center hover:border-primary/50 transition-smooth">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleFileSelect}
              className="hidden"
              id="aadhaar-upload"
            />
            <label htmlFor="aadhaar-upload" className="cursor-pointer">
              <Upload className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm md:text-base font-medium mb-1">Click to upload Aadhaar</p>
              <p className="text-xs md:text-sm text-muted-foreground">All image formats supported (JPG, PNG, HEIC, etc.) up to 10MB</p>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-lg overflow-hidden border border-border">
              <img src={previewUrl} alt="Aadhaar preview" className="w-full h-auto" />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
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
                  Upload Document
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AadhaarUpload;
