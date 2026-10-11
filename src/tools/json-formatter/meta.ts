import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'json-formatter',
  category: 'developer',
  icon: 'code',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['privacy', 'no-ads', 'performance', 'features'],
  competitors: [
    {
      name: 'CodeBeautify JSON Viewer',
      url: 'https://codebeautify.org/jsonviewer',
      weakness:
        'Supports uploading files to its server and loading JSON from a URL rather than keeping everything local; a prominent ad block asks visitors to disable their ad blocker or share on social media; error messages only say the JSON is invalid without a line or column.',
    },
    {
      name: 'MiniWebTool JSON Formatter/Validator',
      url: 'https://miniwebtool.com/json-formatter-validator/',
      weakness:
        'Shows an ad-blocker nag and pushes a paid "Pro" upgrade before formatting; has no way to open a .json file directly, only paste. (Strength: does show the exact line/column of a syntax error and has a collapsible tree view plus key sorting.)',
    },
    {
      name: 'Toptal JSON Formatter',
      url: 'https://www.toptal.com/developers/json-formatter',
      weakness:
        'The formatter is wrapped in heavy freelance-recruiting marketing content; no tree view, no key sorting, and no indication of how large an input it can handle before the page stalls.',
    },
    {
      name: '피리앱 JSON 포맷터 (PiliApp)',
      url: 'https://kr.piliapp.com/json/formatter/',
      weakness:
        '트리 뷰와 오류 위치(줄·열) 표시가 없어 JSON이 깨졌을 때 어디를 고쳐야 할지 알 수 없고, 여러 변환 도구가 섞인 범용 유틸리티 사이트 안에 있어 광고가 함께 노출됨.',
    },
    {
      name: '리코드로그 JSON Formatter',
      url: 'https://recodelog.com/features/json-formatter',
      weakness:
        '포맷·압축만 지원하고 트리 뷰, 오류 위치, 키 정렬 기능이 없어 깨진 JSON을 붙여넣어도 어디가 문제인지 알려주지 않음.',
    },
  ],
  related: ['case-converter', 'text-diff', 'word-counter', 'base64'],
};
