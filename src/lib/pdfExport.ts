/**
 * PDF Export Utilities
 * Generate and download PDF documents for Health ID cards, certificates, etc.
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Download HTML element as PDF
 */
export async function downloadElementAsPDF(
  element: HTMLElement,
  filename: string = 'document.pdf',
  options?: {
    orientation?: 'portrait' | 'landscape';
    format?: string;
    scale?: number;
  }
): Promise<void> {
  try {
    const scale = options?.scale || 2;
    
    // Convert HTML to canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true
    });

    // Get image data
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Create PDF
    const pdf = new jsPDF({
      orientation: options?.orientation || 'portrait',
      unit: 'px',
      format: [imgWidth / scale, imgHeight / scale]
    });

    // Add image to PDF
    pdf.addImage(
      imgData,
      'PNG',
      0,
      0,
      imgWidth / scale,
      imgHeight / scale
    );

    // Download
    pdf.save(filename);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Download Health ID card as PDF
 */
export async function downloadHealthIDCardAsPDF(
  element: HTMLElement,
  filename: string = 'health-id-card.pdf'
): Promise<void> {
  return downloadElementAsPDF(element, filename, {
    orientation: 'landscape',
    scale: 3
  });
}

/**
 * Download vaccination certificate as PDF
 */
export async function downloadVaccinationCertificateAsPDF(
  element: HTMLElement,
  filename: string = 'vaccination-certificate.pdf'
): Promise<void> {
  return downloadElementAsPDF(element, filename, {
    orientation: 'portrait',
    scale: 2
  });
}

/**
 * Generate PDF from multiple elements (multi-page)
 */
export async function generateMultiPagePDF(
  elements: HTMLElement[],
  filename: string = 'document.pdf',
  options?: {
    orientation?: 'portrait' | 'landscape';
    scale?: number;
  }
): Promise<void> {
  try {
    const scale = options?.scale || 2;
    let pdf: jsPDF | null = null;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      
      // Convert to canvas
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width / scale;
      const imgHeight = canvas.height / scale;

      // Create PDF on first page
      if (i === 0) {
        pdf = new jsPDF({
          orientation: options?.orientation || 'portrait',
          unit: 'px',
          format: [imgWidth, imgHeight]
        });
      } else if (pdf) {
        pdf.addPage([imgWidth, imgHeight], imgHeight > imgWidth ? 'portrait' : 'landscape');
      }

      // Add image
      if (pdf) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
    }

    // Download
    if (pdf) {
      pdf.save(filename);
    }
  } catch (error) {
    console.error('Failed to generate multi-page PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Generate PDF with custom content
 */
export function generateCustomPDF(
  content: {
    title?: string;
    subtitle?: string;
    body: string[];
    footer?: string;
  },
  filename: string = 'document.pdf'
): void {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let y = margin;

    // Title
    if (content.title) {
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(content.title, pageWidth / 2, y, { align: 'center' });
      y += 15;
    }

    // Subtitle
    if (content.subtitle) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(content.subtitle, pageWidth / 2, y, { align: 'center' });
      y += 10;
    }

    // Body
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    content.body.forEach((line) => {
      const lines = pdf.splitTextToSize(line, pageWidth - 2 * margin);
      lines.forEach((textLine: string) => {
        if (y > pdf.internal.pageSize.getHeight() - margin) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(textLine, margin, y);
        y += 7;
      });
    });

    // Footer
    if (content.footer) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      const footerY = pdf.internal.pageSize.getHeight() - 15;
      pdf.text(content.footer, pageWidth / 2, footerY, { align: 'center' });
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Failed to generate custom PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Print element (opens print dialog)
 */
export function printElement(element: HTMLElement, title: string = 'Print'): void {
  try {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; } @media print { body { margin: 0; padding: 0; } }</style></head><body>${element.outerHTML}<script>window.onload = function(){ try { window.print(); } catch(e) { console.error(e); } setTimeout(function(){ window.close(); }, 200); };</script></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      // If popup blocked, navigate in current window as a fallback
      window.location.href = url;
    }

    // Revoke URL after some time to free memory
    setTimeout(() => {
      try { URL.revokeObjectURL(url); } catch (e) { /* ignore */ }
    }, 15000);
  } catch (err) {
    console.error('Failed to open print window:', err);
    alert('Unable to open print window. Please allow popups or try downloading the PDF.');
  }
}
