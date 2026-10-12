/** Browser-only qpdf WebAssembly integration. Loaded only after Protect is chosen. */
import { createQpdfRunner } from 'qpdf-run';
import { protectArgs } from './logic';

function randomOwnerPassword(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function protectPdf(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  const qpdf = await createQpdfRunner({
    workerUrl: new URL('qpdf-run/worker', import.meta.url).href,
    qpdfJsUrl: new URL('qpdf-run/qpdf.js', import.meta.url).href,
    wasmUrl: new URL('qpdf-run/qpdf.wasm', import.meta.url).href,
    timeoutMs: 60_000,
  });
  try {
    return await qpdf.runOne({
      input: bytes,
      inputName: 'input.pdf',
      outputName: 'output.pdf',
      args: protectArgs(password, randomOwnerPassword()),
    });
  } finally {
    await qpdf.destroy();
  }
}
