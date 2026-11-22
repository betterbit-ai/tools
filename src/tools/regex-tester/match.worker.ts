import { testRegex } from './logic';

/**
 * Runs the match loop off the page. A pattern with nested repetition can make one RegExp.exec
 * call take minutes on a short string, and JavaScript cannot cancel a call in progress: on the
 * page that froze the tab. Here the page can stop waiting (and terminate this worker) instead.
 */
interface MatchRequest {
  id: number;
  pattern: string;
  flags: string;
  text: string;
  replacement?: string;
}

self.addEventListener('message', (event: MessageEvent<MatchRequest>) => {
  const { id, pattern, flags, text, replacement } = event.data;
  self.postMessage({ id, result: testRegex(pattern, flags, text, replacement) });
});
