/**
 * QR Code Generator Component
 * Generates QR codes for Health IDs, Vaccination Certificates, etc.
 */

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useTheme } from '@/contexts/ThemeContext';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  logo?: string;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  foregroundColor?: string;
  backgroundColor?: string;
  onDataUrl?: (dataUrl: string) => void;
  className?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = React.memo(({
  value,
  size = 200,
  logo,
  errorCorrectionLevel = 'M',
  foregroundColor,
  backgroundColor,
  onDataUrl,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  // Theme-aware default colors
  const defaultForegroundColor = theme === 'dark' ? '#ffffff' : '#000000';
  const defaultBackgroundColor = theme === 'dark' ? '#1a1a1a' : '#ffffff';

  const fgColor = foregroundColor || defaultForegroundColor;
  const bgColor = backgroundColor || defaultBackgroundColor;

  useEffect(() => {
    if (!value) {
      setError('No value provided for QR code');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setError('Canvas not initialized');
      return;
    }

    const generateQR = async () => {
      try {
        setError(null);
        
        // Generate QR code
        await QRCode.toCanvas(canvas, value, {
          width: size,
          margin: 2,
          errorCorrectionLevel,
          color: {
            dark: fgColor,
            light: bgColor
          }
        });

        // Add logo if provided
        if (logo) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              const logoSize = size * 0.2; // Logo takes 20% of QR code
              const x = (size - logoSize) / 2;
              const y = (size - logoSize) / 2;
              
              // Draw white background for logo
              ctx.fillStyle = backgroundColor;
              ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
              
              // Draw logo
              ctx.drawImage(img, x, y, logoSize, logoSize);
              
              // Callback with data URL
              if (onDataUrl) {
                onDataUrl(canvas.toDataURL('image/png'));
              }
            };
            img.onerror = () => {
              console.error('Failed to load logo image');
              if (onDataUrl) {
                onDataUrl(canvas.toDataURL('image/png'));
              }
            };
            img.src = logo;
          }
        } else if (onDataUrl) {
          onDataUrl(canvas.toDataURL('image/png'));
        }
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setError('Failed to generate QR code');
      }
    };

    generateQR();
  }, [value, size, logo, errorCorrectionLevel, fgColor, bgColor, foregroundColor, backgroundColor, onDataUrl]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-red-50 text-red-600 rounded p-4">
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={size}
      height={size}
    />
  );
});

// export default QRCodeGenerator; // Commenting out the named export
export default QRCodeGenerator; // Ensuring it's only a default export

/**
 * Generate QR code as data URL (for use in PDFs, etc.)
 */
// Utility functions moved to src/lib/qrUtils.ts
