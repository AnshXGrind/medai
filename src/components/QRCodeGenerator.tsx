/**
 * QR Code Generator Component
 * Generates QR codes for Health IDs, Vaccination Certificates, etc.
 */

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

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

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  logo,
  errorCorrectionLevel = 'M',
  foregroundColor = '#000000',
  backgroundColor = '#FFFFFF',
  onDataUrl,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setError('No value provided for QR code');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const generateQR = async () => {
      try {
        // Generate QR code
        await QRCode.toCanvas(canvas, value, {
          width: size,
          margin: 2,
          errorCorrectionLevel,
          color: {
            dark: foregroundColor,
            light: backgroundColor
          }
        });

        // Add logo if provided
        if (logo) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const img = new Image();
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
            img.src = logo;
          }
        } else if (onDataUrl) {
          onDataUrl(canvas.toDataURL('image/png'));
        }

        setError(null);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setError('Failed to generate QR code');
      }
    };

    generateQR();
  }, [value, size, logo, errorCorrectionLevel, foregroundColor, backgroundColor, onDataUrl]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-red-50 text-red-600 rounded p-4" style={{ width: size, height: size }}>
        <p className="text-sm text-center">{error}</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: size, height: size }}
    />
  );
};

/**
 * Generate QR code as data URL (for use in PDFs, etc.)
 */
export async function generateQRDataUrl(
  value: string,
  options?: {
    size?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    foregroundColor?: string;
    backgroundColor?: string;
  }
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(value, {
      width: options?.size || 200,
      margin: 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.foregroundColor || '#000000',
        light: options?.backgroundColor || '#FFFFFF'
      }
    });
    
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate QR code data URL:', error);
    throw error;
  }
}

/**
 * Download QR code as PNG image
 */
export function downloadQRCode(dataUrl: string, filename: string = 'health-id-qr.png') {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
