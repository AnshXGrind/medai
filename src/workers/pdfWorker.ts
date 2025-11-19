import { jsPDF } from 'jspdf';

type MessageIn = {
  id: number;
  images: string[]; // data URLs
  filename: string;
  options?: { orientation?: 'portrait' | 'landscape'; format?: [number, number] };
};

type MessageOut = {
  id: number;
  success: boolean;
  blob?: Blob;
  error?: string;
};

self.addEventListener('message', async (ev: MessageEvent<MessageIn>) => {
  const { id, images, filename, options } = ev.data;

  try {
    if (!images || images.length === 0) {
      const out: MessageOut = { id, success: false, error: 'No images provided' };
      const gw = self as unknown as DedicatedWorkerGlobalScope;
      gw.postMessage(out);
      return;
    }

    // Use first image to determine page size if provided
    const [first] = images;

    // Attempt to parse width/height from data URL by creating an ImageBitmap
    let width = options?.format?.[0] ?? 800;
    let height = options?.format?.[1] ?? 600;

    try {
      const gw = self as unknown as DedicatedWorkerGlobalScope & { createImageBitmap?: (blob: Blob) => Promise<ImageBitmap> };
      const createImageBitmapFn = gw.createImageBitmap;
      if (createImageBitmapFn) {
        const resp = await fetch(first);
        const blob = await resp.blob();
        const img = await createImageBitmapFn(blob);
        if (img) {
          width = img.width;
          height = img.height;
          try {
            img.close();
          } catch (closeErr) {
            console.warn('Failed to close ImageBitmap', closeErr);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to determine image size in worker', e);
    }

    const pdf = new jsPDF({ orientation: options?.orientation || 'portrait', unit: 'px', format: [width, height] });

    for (let i = 0; i < images.length; i++) {
      const dataUrl = images[i];
      // Add image to PDF
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      if (i < images.length - 1) pdf.addPage([width, height], height > width ? 'portrait' : 'landscape');
    }

    const blob = pdf.output('blob');

    const out: MessageOut = { id, success: true, blob };
    const gw = self as unknown as DedicatedWorkerGlobalScope;
    gw.postMessage(out, [blob]);
  } catch (err) {
    const out: MessageOut = { id, success: false, error: String((err as Error)?.message || err) };
    const gw = self as unknown as DedicatedWorkerGlobalScope;
    gw.postMessage(out);
  }
});

export {};
