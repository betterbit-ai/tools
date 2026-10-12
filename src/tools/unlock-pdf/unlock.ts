/** Browser-only qpdf WebAssembly integration. Loaded only after Unlock is chosen. */
import { createQpdfRunner } from 'qpdf-run';
import { unlockArgs } from './logic';

export async function unlockPdf(bytes: Uint8Array, password: string): Promise<Uint8Array> {
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
      args: unlockArgs(password),
    });
  } finally {
    await qpdf.destroy();
  }
}
