import QRCode from 'qrcode';

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
