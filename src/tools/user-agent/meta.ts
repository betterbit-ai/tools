import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'user-agent',
  category: 'developer',
  icon: 'globe',
  added: '2026-11-28',
  updated: '2026-11-28',
  edges: ['privacy', 'features', 'usability'],
  competitors: [
    {
      name: 'Privatrak User Agent Checker',
      url: 'https://privatrak.com/tools/user-agent',
      weakness:
        'Its page states that the user agent you check is “sent to Privatrak’s API only to classify it”, so even your own string travels to a server to be parsed; it also presents the result as crawler-or-person classification rather than a full client report. (Strength: it explains that a user agent is a claim rather than proof.)',
    },
    {
      name: 'antibot.dev — What is my user agent',
      url: 'https://antibot.dev/tools/what-is-my-user-agent/',
      weakness:
        'Its parsing combines the string a script reads with “what our server received in the header”, and the page is built around a server-side JSON API (ua.antibot.dev), so the answer depends on a request to their infrastructure instead of being computed in the tab. (Strength: a free, keyless JSON endpoint for scripts.)',
    },
    {
      name: 'BrowserProbe — What is my browser',
      url: 'https://browserprobe.app/tools/what-is-my-browser',
      weakness:
        'Its result page names the browser, version, engine and string and explains frozen tokens well, but it lists only navigator.* and Client Hints values — it does not identify an embedded in-app browser such as KakaoTalk or the Naver app, and it has no single copyable support report. (Strength: it flags where the string disagrees with Client Hints.)',
    },
    {
      name: 'Medleyo User-Agent 확인기',
      url: 'https://medleyo.com/ko/user-agent-checker/',
      weakness:
        'Its Korean page reads the user agent locally and shows browser, OS and Client Hints, but nothing on it separates an in-app browser (KakaoTalk, Instagram, Naver app) from the standalone browser — the failure Korean users actually hit when a login or upload dies. (Strength: it explains why OS versions are frozen.)',
    },
    {
      name: 'spcxtools 유저 에이전트 파서',
      url: 'https://spcxtools.com/ko/network/user-agent-parser/',
      weakness:
        'It parses browser, system, device model and engine locally and offers one-click copy, but its feature list names no in-app browser detection and no cross-check between the string and Client Hints brands; it also mixes screen size, memory and timezone into the same list. (Strength: languages, CPU cores, memory and timezone in one view.)',
    },
  ],
  related: ['screen-resolution', 'url-encoder', 'base64', 'dead-pixel-test'],
};
