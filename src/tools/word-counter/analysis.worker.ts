import { analyze, topKeywords } from './logic';

interface AnalysisRequest {
  id: number;
  text: string;
}

self.addEventListener('message', (event: MessageEvent<AnalysisRequest>) => {
  const { id, text } = event.data;
  self.postMessage({ id, stats: analyze(text), keywords: topKeywords(text) });
});
