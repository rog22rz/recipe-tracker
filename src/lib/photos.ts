import { getPhoto, putPhoto } from './db/db';

export async function downscaleImage(
  file: File,
  maxLongEdge = 1600,
  quality = 0.8,
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxLongEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    throw new Error('Canvas 2D context unavailable');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to encode image'))),
      'image/jpeg',
      quality,
    );
  });
}

export async function storePhoto(file: File): Promise<string> {
  const blob = await downscaleImage(file);
  const id = crypto.randomUUID();
  await putPhoto({ id, blob, createdAt: Date.now() });
  return id;
}

export async function getPhotoBlob(id: string): Promise<Blob | undefined> {
  const photo = await getPhoto(id);
  return photo?.blob;
}
