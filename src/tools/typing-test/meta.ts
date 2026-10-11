import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'typing-test',
  category: 'device',
  icon: 'zap',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'no-signup', 'accuracy', 'usability'],
  competitors: [
    {
      name: 'Monkeytype',
      url: 'https://monkeytype.com/',
      weakness:
        'Korean results fail to save on Chromium-based browsers with a "Result data doesn\'t make sense" error, confirmed as an open bug (GitHub issue #7484) tied to how Korean IME input is validated — the tool is built English-first with Korean bolted on. (Strength: no ads or account required by default, very minimal UI, many practice modes.)',
    },
    {
      name: 'TypingTest.com',
      url: 'https://www.typingtest.com/',
      weakness:
        'Saving your history across devices and tracking goals requires creating a free account, and the result screen nudges sign-up; a one-off test with no account gets no saved personal best. (Strength: many duration and difficulty options, themed text choices.)',
    },
    {
      name: 'LiveChat Typing Speed Test',
      url: 'https://www.livechat.com/typing-speed-test/',
      weakness:
        'The typing test page is wrapped in marketing for LiveChat’s paid chat software and HelpDesk.com, with upsell content surrounding the actual test rather than the test being the whole page.',
    },
    {
      name: '타자 속도 테스트 (Picksight)',
      url: 'https://picksight.kr/tools/typing-speed-test',
      weakness:
        '페이지에 쿠팡 파트너스 제휴 광고가 명시적으로 포함되어 있다고 안내하며, 실제 쿠팡 상품 배너가 테스트 화면 옆에 노출된다. (Strength: 모바일 최적화와 S~D 등급 판정.)',
    },
  ],
  related: ['keyboard-tester', 'mic-test', 'word-counter', 'stopwatch'],
};
