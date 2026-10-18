import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'keyboard-tester',
  category: 'device',
  icon: 'keyboard',
  added: '2026-10-11',
  updated: '2026-10-15',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'KeyboardTest.io',
      url: 'https://keyboardtest.io/',
      weakness:
        'Its current rollover page includes a full-size key map and a live maximum count, but it does not show Korean 2-set (두벌식) key labels or surface stuck/chattering status on that page. (Strength: separate latency, polling-rate and dedicated chatter tests.)',
    },
    {
      name: 'Online Keyboard Tester',
      url: 'https://onlinekeyboardtester.com/',
      weakness:
        'A first visit opens a privacy-preferences dialog before the tester, even though it offers a substantial seven-layout diagnostic suite. (Strength: its 104-key, compact and Mac layouts, key-event inspector, and local CSV/TXT history export are broader than this focused tester.)',
    },
    {
      name: 'keytest.co.kr',
      url: 'https://keytest.co.kr/',
      weakness:
        'It offers Windows and Mac modifier labels but its visible letter keys remain QWERTY, not the 2-set Hangul jamo printed on a Korean keyboard; its keyboard test is also bundled with mouse testing. (Strength: it visualizes a full navigation cluster and numpad.)',
    },
  ],
  related: ['mic-test', 'typing-test', 'mouse-test', 'dead-pixel-test'],
};
