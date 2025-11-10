/**
 * Digital Health ID Card Component
 * Displays beautiful Aadhaar-like health ID card
 */

import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QRCodeGenerator from './QRCodeGenerator';
import { Download, Share2, CheckCircle2, Activity } from 'lucide-react';
import { generateHealthIdQRData } from '@/lib/universalHealthId';
import { downloadHealthIDCardAsPDF } from '@/lib/pdfExport';

interface HealthIDCardProps {
  healthId: string;
  fullName: string;
  dateOfBirth: string;
  bloodGroup?: string;
  photoUrl?: string;
  gender?: string;
  address?: string;
  verified?: boolean;
  organDonor?: boolean;
  issueDate?: string;
  className?: string;
}

export const HealthIDCard: React.FC<HealthIDCardProps> = ({
  healthId,
  fullName,
  dateOfBirth,
  bloodGroup,
  photoUrl,
  gender,
  address,
  verified = false,
  organDonor = false,
  issueDate,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const qrData = generateHealthIdQRData(healthId, fullName, dateOfBirth);

  const handleDownloadPDF = async () => {
    if (!cardRef.current) return;
    
    setDownloading(true);
    try {
      await downloadHealthIDCardAsPDF(cardRef.current, `health-id-${healthId}.pdf`);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && qrDataUrl) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'health-id-qr.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'My Universal Health ID',
          text: `Health ID: ${healthId}`,
          files: [file]
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    }
  };

  return (
    <div className={className}>
      <Card 
        ref={cardRef}
        className="w-full max-w-2xl mx-auto overflow-hidden shadow-2xl border-2 border-primary/20"
      >
        {/* Card Header with Gradient */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              <div>
                <h3 className="font-bold text-lg">Universal Health ID</h3>
                <p className="text-xs opacity-90">Government of India</p>
              </div>
            </div>
            {verified && (
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Section: Photo and Basic Info */}
            <div className="flex flex-col items-center space-y-4">
              {/* Photo */}
              <div className="w-32 h-32 rounded-lg border-4 border-primary/20 overflow-hidden bg-muted flex items-center justify-center">
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl font-bold text-muted-foreground">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center">
                {bloodGroup && (
                  <Badge variant="destructive" className="text-xs">
                    🩸 {bloodGroup}
                  </Badge>
                )}
                {organDonor && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    💚 Organ Donor
                  </Badge>
                )}
              </div>
            </div>

            {/* Middle Section: Personal Details */}
            <div className="flex flex-col justify-center space-y-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</p>
                <p className="font-semibold text-lg">{fullName}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Health ID</p>
                <p className="font-mono font-bold text-primary text-lg tracking-wider">
                  {healthId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">DOB</p>
                  <p className="font-medium text-sm">
                    {new Date(dateOfBirth).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {gender && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Gender</p>
                    <p className="font-medium text-sm">{gender}</p>
                  </div>
                )}
              </div>

              {address && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Address</p>
                  <p className="text-sm line-clamp-2">{address}</p>
                </div>
              )}

              {issueDate && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Issue Date</p>
                  <p className="text-sm">
                    {new Date(issueDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              )}
            </div>

            {/* Right Section: QR Code */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="bg-white p-3 rounded-lg border-2 border-primary/20 shadow-inner">
                <QRCodeGenerator
                  value={qrData}
                  size={140}
                  errorCorrectionLevel="H"
                  onDataUrl={setQrDataUrl}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Scan for verification
              </p>
            </div>
          </div>

          {/* Emergency Notice */}
          <div className="mt-6 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-xs text-amber-800 dark:text-amber-300 text-center">
              🚨 In case of emergency, this card provides access to critical health information
            </p>
          </div>
        </CardContent>

        {/* Card Footer: Actions */}
        <div className="bg-muted/30 px-6 py-4 border-t">
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={!qrDataUrl}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              <Download className="h-4 w-4 mr-2" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Mini Card Version (for wallet/mobile) */}
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground mb-2">Save to wallet</p>
        <div className="inline-block">
          <Card className="w-64 h-40 bg-gradient-to-br from-primary to-primary/80 text-white p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-semibold">HEALTH ID</span>
              </div>
              <p className="font-bold text-sm mb-1">{fullName}</p>
              <p className="font-mono text-xs tracking-wider mb-2">{healthId}</p>
              <div className="flex items-center justify-between text-xs">
                <span>{bloodGroup || 'N/A'}</span>
                <span>DOB: {new Date(dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
