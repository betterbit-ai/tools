import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'jwt-decoder',
  category: 'developer',
  icon: 'code',
  added: '2026-10-15',
  updated: '2026-10-15',
  edges: ['usability'],
  competitors: [
    {
      name: 'TabUtils JWT Decoder',
      url: 'https://www.tabutils.com/tools/jwt-decoder',
      weakness:
        'Its opened search result presents a header/payload view and expiry check, but does not expose the raw NumericDate together with both device-local and UTC timestamps for each exp, iat, and nbf claim. Betterbit makes all three comparisons visible in one live panel. (Strength: it clearly labels that decoding is client-side and warns that signatures are unverified.)',
    },
    {
      name: 'ManyHand JWT Decoder',
      url: 'https://manyhand.com/jwt/',
      weakness:
        'Its opened result says standard time claims become readable dates and flags a token active or expired, but it does not show a live relative value alongside the exact local and UTC rendering for every present time claim. Betterbit keeps those values together. (Strength: it includes a separate registered-claims section and signature display.)',
    },
    {
      name: 'ToolNinja JWT Decoder',
      url: 'https://toolninja.io/tools/jwt-decoder',
      weakness:
        'Its opened page describes an expiry countdown and a separate signature-verification panel, but the visible decoder view does not provide the raw NumericDate plus exact device-local and UTC values for exp, iat, and nbf in one compact inspection flow. Betterbit does. (Strength: it can verify HS/RS/PS/ES signatures with supplied key material in the browser.)',
    },
    {
      name: 'CodeKitHub JWT 디코더',
      url: 'https://codekithub.com/ko/jwt-decoder/',
      weakness:
        'Its opened Korean result promises header/payload decoding and an expiry display, but does not state that iat and nbf are shown with raw NumericDate, device-local time, UTC, and live relative time together. Betterbit exposes that full comparison. (Strength: it clearly states that it only decodes and does not verify a signature.)',
    },
    {
      name: '로베린 JWT 디코더',
      url: 'https://roberin.com/jwt-decoder/',
      weakness:
        'Its opened Korean page shows expiry, start, and issue-time placeholders but requires the user to infer the relationship from separate rows; Betterbit pairs each time claim with its Unix seconds value, exact local and UTC values, and a live relative reading. (Strength: it explicitly explains that a decoded token is not verified.)',
    },
    {
      name: '유틸로 JWT 디코더',
      url: 'https://utilo.co.kr/tools/jwt-decoder/',
      weakness:
        'Its opened Korean result highlights readable exp, iat, and nbf timestamps and signature verification, but does not describe a single view combining the raw NumericDate with exact local and UTC time for each claim. Betterbit makes that timestamp comparison immediate. (Strength: it supports local HS256, RS256, and ES256 signature verification.)',
    },
  ],
  related: ['base64', 'json-formatter', 'unix-timestamp'],
};
