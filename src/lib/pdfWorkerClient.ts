type Pending = {
  resolve: (b: Blob) => void;
  reject: (e: unknown) => void;
};

const worker = new Worker(new URL('../workers/pdfWorker.ts', import.meta.url), { type: 'module' });

let nextId = 1;
const pendingMap = new Map<number, Pending>();

worker.addEventListener('message', (ev: MessageEvent<unknown>) => {
  const data = ev.data as { id?: number; success?: boolean; blob?: Blob; error?: string } | undefined;
  if (!data || typeof data.id !== 'number') return;
  const { id, success, blob, error } = data;
  const p = pendingMap.get(id);
  if (!p) return;
  pendingMap.delete(id);
  if (success && blob) p.resolve(blob as Blob);
  else p.reject(error || new Error('PDF worker failed'));
});

export async function generatePdfFromDataUrls(images: string[], filename: string, options?: { orientation?: 'portrait' | 'landscape'; format?: [number, number] }): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const id = nextId++;
    pendingMap.set(id, { resolve, reject });
    worker.postMessage({ id, images, filename, options });
  });
}

export default { generatePdfFromDataUrls };
