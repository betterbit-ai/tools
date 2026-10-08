/**
 * Browser-only pixel work: decode a source image and re-encode it as JPEG bytes
 * suitable for embedding in a PDF (/DCTDecode). Transparency is flattened to white.
 */

export async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const dims = { width: bmp.width, height: bmp.height };
  bmp.close();
  return dims;
}

export async function encodeToJpeg(
  file: File,
  quality: number,
): Promise<{ bytes: Uint8Array; width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext('2d')!;
    // JPEG has no alpha channel: flatten transparent sources onto white first.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bmp, 0, 0);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', quality),
    );
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return { bytes, width: bmp.width, height: bmp.height };
  } finally {
    bmp.close();
  }
}
