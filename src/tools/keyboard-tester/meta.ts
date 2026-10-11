import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'keyboard-tester',
  category: 'device',
  icon: 'keyboard',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'usability', 'features'],
  competitors: [
    {
      name: 'KeyboardTest.io',
      url: 'https://keyboardtest.io/',
      weakness:
        'The main tester shows a fixed QWERTY key diagram with no layout switch, and its dedicated rollover page reports ghosting but not a running "most keys held at once" count on the test itself. (Strength: a focused NKRO/6KRO rollover sub-page with real-time conflict detection and a clear local-only privacy statement.)',
    },
    {
      name: 'KeyboardTester.com',
      url: 'https://www.keyboardtester.com/',
      weakness:
        'The page carries PayPal tracking pixels and Amazon affiliate keyboard links around the tester, and gives no rollover, ghosting or simultaneous-key information at all.',
    },
    {
      name: 'MechanicalKeyboard.net NKRO Test',
      url: 'https://mechanicalkeyboard.net/tools/nkro-test/',
      weakness:
        'The rollover tester sits inside a keyboard review/shopping blog with a newsletter signup prompt, and makes you pick between three separate modes (Free Test, Challenge, Combos) before a simple answer appears. (Strength: 5 selectable board sizes, an S–F grade and saved results.)',
    },
    {
      name: 'keytest.co.kr',
      url: 'https://keytest.co.kr/',
      weakness:
        'The only "layout" choice is Windows vs Mac modifier labels, not an actual Korean 2-벌식 key layout, so letter keys still show plain QWERTY letters instead of the jamo printed on a real Korean keyboard; it also warns that a mouse\'s back/forward buttons may be caught by browser navigation first, a generic browser caveat unrelated to keyboard keys.',
    },
    {
      name: 'onlinemictest.com 키보드 테스트',
      url: 'https://onlinemictest.com/ko/keyboard-test/',
      weakness:
        'Bundled into a multi-device suite (mic, webcam, sound, mouse, controller) with a QWERTY-only key diagram, no layout selector and no rollover/simultaneous-key detail.',
    },
  ],
  related: ['mic-test', 'word-counter', 'stopwatch', 'timer', 'typing-test'],
};
