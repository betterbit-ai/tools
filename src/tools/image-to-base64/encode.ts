/** Browser-only file reading for image-to-base64. */

/** Read a local file as a data URL without sending it anywhere. */
export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('File could not be read'));
    reader.onabort = () => reject(new DOMException('File reading was aborted', 'AbortError'));
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('File could not be read'));
    };
    reader.readAsDataURL(file);
  });
}
