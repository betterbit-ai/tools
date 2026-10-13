import { type CaseFormat, convertCase } from './logic';

interface ConversionRequest {
  id: number;
  text: string;
  format: CaseFormat;
}

self.addEventListener('message', (event: MessageEvent<ConversionRequest>) => {
  const { id, text, format } = event.data;
  self.postMessage({ id, result: convertCase(text, format) });
});
