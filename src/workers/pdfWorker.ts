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

    // Attempt to parse width/height from the first image
    let width = options?.format?.[0] ?? 800;
    let height = options?.format?.[1] ?? 600;

    try {
      const gw = self as unknown as DedicatedWorkerGlobalScope & { createImageBitmap?: (blob: Blob) => Promise<ImageBitmap> };
      const createImageBitmapFn = gw.createImageBitmap;
      if (createImageBitmapFn) {
        let blob: Blob | null = null;
        // If first is a data URL string, fetch it; if it's already a Blob, use directly
        if (typeof first === 'string') {
          try {
            const resp = await fetch(first);
            blob = await resp.blob();
          } catch (fetchErr) {
            // ignore
            blob = null;
          }
        } else if (first instanceof Blob) {
          blob = first as Blob;
        }

        if (blob) {
          const img = await createImageBitmap(blob);
          if (img) {
            width = img.width;
            height = img.height;
            try { img.close(); } catch (closeErr) { /* ignore */ }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to determine image size in worker', e);
    }

    const pdf = new jsPDF({ orientation: options?.orientation || 'portrait', unit: 'px', format: [width, height] });

    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      // Item may be a data URL string or a Blob
      if (typeof item === 'string') {
        pdf.addImage(item, 'PNG', 0, 0, width, height);
      } else if (item instanceof Blob) {
        // Convert Blob to object URL and use an ImageBitmap to add via canvas-based path
        try {
          // createImageBitmap + draw to canvas not necessary for jsPDF addImage if we can use dataURL; create object URL then Image
          const url = URL.createObjectURL(item);
          // jsPDF supports adding images from URL by passing HTMLImageElement data via canvas conversion internally; addImage accepts dataURL only, so convert via ImageBitmap -> canvas
          const gw = self as unknown as DedicatedWorkerGlobalScope & { createImageBitmap?: (b: Blob) => Promise<ImageBitmap> };
          if (gw.createImageBitmap) {
            const imgBitmap = await gw.createImageBitmap(item);
            // Draw bitmap to an OffscreenCanvas and get data URL
            const off = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
            const ctx = off.getContext('2d');
            if (ctx) {
              ctx.drawImage(imgBitmap, 0, 0);
              try { imgBitmap.close(); } catch (cErr) { /* ignore */ }
              // Convert to blob and then to dataURL via blob -> ArrayBuffer -> base64
              const b = await off.convertToBlob();
              const base64 = await (async (blob: Blob) => {
                const arr = new Uint8Array(await blob.arrayBuffer());
                // base64 encode
                let binary = '';
                const chunk = 0x8000;
                for (let i = 0; i < arr.length; i += chunk) {
                  const sub = arr.subarray(i, i + chunk);
                  binary += String.fromCharCode.apply(null, Array.from(sub));
                }
                return 'data:image/png;base64,' + btoa(binary);
              })(b);
              pdf.addImage(base64, 'PNG', 0, 0, width, height);
            } else {
              // fallback: try addImage using object URL via Image element approach
              pdf.addImage(url, 'PNG', 0, 0, width, height);
            }
            try { URL.revokeObjectURL(url); } catch (_) { /* ignore */ }
          } else {
            const url = URL.createObjectURL(item);
            pdf.addImage(url, 'PNG', 0, 0, width, height);
            try { URL.revokeObjectURL(url); } catch (_) { /* ignore */ }
          }
        } catch (e) {
          console.warn('Failed to add blob image to PDF in worker', e);
        }
      }

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
