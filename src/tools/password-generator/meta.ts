import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'password-generator',
  category: 'generator',
  icon: 'sparkle',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'usability', 'features'],
  competitors: [
    {
      name: 'LastPass Password Generator',
      url: 'https://www.lastpass.com/features/password-generator',
      weakness:
        'The opened page surrounds its generator with repeated personal/business trial calls to action and product-plan navigation. Betterbit keeps password creation in a compact, ad-free tool surface, shows the entropy estimate beside the result, and offers a distinct word-passphrase mode. (Strength: LastPass can save and autofill passwords through its password manager.)',
    },
    {
      name: 'Calculator.net Password Generator',
      url: 'https://www.calculator.net/password-generator.html',
      weakness:
        'The opened page supports length, character sets, ambiguity exclusion, brackets, and repeats, but its tool is a dense checkbox list with no memorable word mode or inline result-strength summary in the visible form. Betterbit has one-screen random-password and passphrase modes, a copy action, and a visible entropy value. (Strength: it offers extra bracket and repeated-character exclusions.)',
    },
    {
      name: 'Larely Password Generator',
      url: 'https://larely.com/passwordgen/',
      weakness:
        'Its searched result advertises character controls, ambiguity filtering, passphrases, and a strength/entropy display, so it is a close feature match. Betterbit makes the exact selection model visible: its passphrase result names the fixed 128-word source and its character-password generator guarantees enabled classes before calculating the eligible result space. (Strength: it presents the settings in a particularly short single-page flow.)',
    },
    {
      name: 'Utoolgo 랜덤 비밀번호 생성기',
      url: 'https://utoolgo.com/ko/password',
      weakness:
        'Its Korean search result combines password creation with uniqueness statistics, policy checks, batch generation, code samples, and a large knowledge base. Betterbit is intentionally a focused Korean interface: select either a password or passphrase, see entropy immediately, and copy the one result without navigating an advanced tool suite. (장점: 대량 생성과 정책 검증 기능을 제공한다.)',
    },
    {
      name: 'PANDORA TOOLS 강력한 비밀번호 생성기',
      url: 'https://pandoratools.kr/password.html',
      weakness:
        'The opened Korean search result frames the tool around a long general security article, while the result snippet does not expose a passphrase option or an entropy calculation. Betterbit puts the result, exact entropy estimate, character controls, and a separate word-combination mode before the explanatory content. (장점: 크리덴셜 스터핑 위험을 설명하는 한국어 안내를 제공한다.)',
    },
    {
      name: '의학계산기 비밀번호 생성기',
      url: 'https://www.medcalc.co.kr/password/',
      weakness:
        'Its Korean result describes a strength estimate based on length and character types, but does not disclose the generated result space or provide a memorable-word mode in the visible result description. Betterbit labels entropy in bits, explains the 128-word selection source, and leaves generated passwords only in the browser. (장점: 생성기와 비밀번호 강도 판별기를 함께 제공한다.)',
    },
  ],
  related: ['random-number', 'qr-code-generator', 'random-picker'],
};
