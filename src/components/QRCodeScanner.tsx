/**
 * QR Code Scanner Component
 * Allows users to scan QR codes for quick access to health records
 */

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface QRCodeScannerProps {
  onScanSuccess?: (data: string) => void;
  onScanError?: (error: string) => void;
  className?: string;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { theme } = useTheme();

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      setSuccess(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err) {
      const errorMessage = 'Camera access denied or not available';
      setError(errorMessage);
      onScanError?.(errorMessage);
    }
  }, [onScanError]);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const scanQRCode = useCallback(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image data for QR code detection
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Here you would integrate with a QR code scanning library like jsQR
    // For now, we'll simulate detection
    // In a real implementation, you'd use: https://github.com/cozmo/jsQR

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanQRCode);
    }
  }, [isScanning]);

  const handleManualEntry = useCallback(() => {
    // For demo purposes, simulate a successful scan
    const mockHealthId = '27-1234-5678-9012';
    setSuccess(`Successfully scanned Health ID: ${mockHealthId}`);
    onScanSuccess?.(mockHealthId);
    stopScanning();
  }, [onScanSuccess, stopScanning]);

  // Start scanning loop when isScanning becomes true
  React.useEffect(() => {
    if (isScanning) {
      scanQRCode();
    }
  }, [isScanning, scanQRCode]);

  React.useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Quick Access Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning ? (
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
              <Camera className="h-12 w-12 text-muted-foreground" />
            </div>
            <Button onClick={startScanning} className="w-full button-glow">
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
            <Button onClick={handleManualEntry} variant="outline" className="w-full">
              Demo: Simulate Scan
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white rounded-lg"></div>
              </div>
            </div>
            <Button onClick={stopScanning} variant="outline" className="w-full">
              <X className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">{success}</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center">
          Point your camera at a Health ID QR code for instant access
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeScanner;