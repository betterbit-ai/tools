/** Browser-only file I/O around the pure metadata parser. */
import { inspectMetadata, stripMetadata, type ExifSummary } from './logic';

export async function inspectFile(file: File): Promise<ExifSummary> {
  return inspectMetadata(new Uint8Array(await file.arrayBuffer()));
}

export async function cleanFile(file: File): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const cleaned = stripMetadata(bytes);
  const output = cleaned.buffer.slice(cleaned.byteOffset, cleaned.byteOffset + cleaned.byteLength) as ArrayBuffer;
  return new Blob([output], { type: file.type || 'application/octet-stream' });
}
