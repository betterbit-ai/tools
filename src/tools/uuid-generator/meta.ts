import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'uuid-generator',
  category: 'developer',
  icon: 'code',
  added: '2026-10-15',
  updated: '2026-10-15',
  edges: ['usability', 'features', 'accuracy'],
  competitors: [
    {
      name: 'UUIDDev — UUID Generator',
      url: 'https://www.uuiddev.com/',
      weakness:
        'Its opened generator exposes only v4/v7 selection and a single Generate UUID button; no batch count, output-case, compact/braced/URN, or JSON-copy controls are visible. Betterbit keeps v4/v7, batches up to 10,000, and four text formats with JSON output on the first screen. (Strength: its surrounding guide explains the v4/v7 database trade-off in depth.)',
    },
    {
      name: 'CreateUUID — Multi-Version UUID Generator',
      url: 'https://createuuid.com/',
      weakness:
        'Its opened page supports many versions, namespaces, a decoder, history, and quantities up to 10,000, so it is the broader UUID suite. Betterbit is intentionally the shorter v4/v7 flow: a useful UUID is generated on landing and standard, compact, brace, URN, or JSON output stays in one focused two-column surface. (Strength: it also provides v1, v3, v5, v6 and decoding.)',
    },
    {
      name: 'FastUUID — UUID Generator Online',
      url: 'https://fastuuid.com/',
      weakness:
        'Its opened main generator presents one identifier after the page loads and routes bulk export to a separate “Bulk UUID Generator” page; the visible main form does not expose case or UUID text-format choices. Betterbit generates an editable-size batch on the landing page and lets users copy JSON, compact, braced, and URN forms without changing pages. (Strength: it offers dedicated validator, decoder, and conversion tools.)',
    },
    {
      name: 'Integrity — UUID 생성기',
      url: 'https://www.integrity.co.kr/tools/uuid/',
      weakness:
        'Its opened Korean page makes v4 only, limits one generation to 100 values, and says it uses Math.random(). Betterbit visibly provides RFC 9562 v4 and v7, batches up to 10,000, and uses crypto.getRandomValues() for its random fields. (장점: UUID v1·v4·v7과 ULID를 비교하는 긴 한국어 안내를 제공한다.)',
    },
    {
      name: 'Sunasty — UUID v4 생성기',
      url: 'https://sunasty.com/ko/uuid-saengseong/',
      weakness:
        'Its Korean search result supports v4/v7 and local generation but caps a batch at 100 values. Betterbit supports a visible 1–10,000 batch range and adds compact, braced, URN, and JSON copy formats in the same generator. (장점: v1을 개인정보 이유로 제외한 이유를 한국어로 설명한다.)',
    },
    {
      name: 'calai — UUID 생성기',
      url: 'https://www.calai.kr/uuid',
      weakness:
        'Its opened Korean page describes a v4-only, 1–100 UUID generator. Betterbit adds RFC 9562 v7 for time-ordered identifiers and lets a batch of up to 10,000 copy as a JSON array or four UUID string forms. (장점: JSON·SQL·URL 입력의 포맷·변환 기능을 함께 소개한다.)',
    },
  ],
  related: ['base64', 'json-formatter', 'url-encoder', 'random-number', 'hash-generator'],
};
