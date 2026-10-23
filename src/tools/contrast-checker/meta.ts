import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'contrast-checker',
  category: 'color',
  icon: 'palette',
  added: '2026-10-24',
  updated: '2026-10-24',
  edges: ['features', 'usability'],
  competitors: [
    {
      name: 'Screen of Colors — Color contrast checker',
      url: 'https://www.screenofcolors.com/contrast-checker/',
      weakness:
        'The opened checker measures WCAG contrast, opacity, and a suggested foreground, but its result view does not expose an APCA reading. Betterbit keeps the four WCAG text checks, 3:1 UI result, signed APCA Lc, preview, and copyable summary together without a separate target step. (Strength: it offers opacity input, downloadable summaries, and a foreground suggestion.)',
    },
    {
      name: 'ColorContrast-Checker.com',
      url: 'https://www.colorcontrast-checker.com/',
      weakness:
        'The opened page shows four WCAG pass/fail rows and a ratio but no APCA result, live editable interface preview, swap action, or copyable summary. Betterbit adds those checks and actions in the initial two-colour view. (Strength: it gives a concise introduction to the four WCAG text thresholds.)',
    },
    {
      name: 'ColorContrast.org — Color Contrast Ratio Checker',
      url: 'https://www.colorcontrast.org/',
      weakness:
        'The opened page combines a contrast checker with a URL scanner, image upload, palette explorer, lead-capture form, and many linked utilities. Betterbit keeps a direct two-colour check focused on the current pair, including its WCAG and APCA results, preview, and clipboard summary. (Strength: it offers screenshot sampling, vision simulations, and wider page-analysis tools.)',
    },
    {
      name: '깨알도구 — 색상 대비 검사',
      url: 'https://kkaealtools.com/tools/dev/contrast/',
      weakness:
        'The opened Korean search result describes a foreground/background WCAG recommendation check, but does not state that it provides APCA, a polarity-aware Lc value, or a copyable review summary. Betterbit exposes all of these alongside the formal WCAG rows. (장점: 한국어로 간단한 WCAG 색상 대비 확인에 집중한다.)',
    },
    {
      name: '후니소프트 — 명도대비 검사기',
      url: 'https://www.jhnsoft.co.kr/contrast-checker/',
      weakness:
        'The opened Korean tool has WCAG 2.2 checks, a preview, presets, and a closest-colour recommendation, but its visible results do not include APCA Lc or a single copyable WCAG-and-APCA review summary. Betterbit makes the dual reading and copy action available immediately. (장점: 현재 글자 크기·굵기 판정과 가까운 색상 추천을 제공한다.)',
    },
    {
      name: '도구상자 — 색상 대비 검사',
      url: 'https://dogubox.shop/contrast-checker/',
      weakness:
        'The opened Korean search result presents a WCAG contrast-ratio checker and explains the 1:1 to 21:1 range, but does not advertise APCA, a live interface preview, or a review-summary copy action. Betterbit includes each in its first screen. (장점: 한국어로 대비율의 범위를 간단히 설명한다.)',
    },
  ],
  related: ['color-picker', 'color-converter'],
};
