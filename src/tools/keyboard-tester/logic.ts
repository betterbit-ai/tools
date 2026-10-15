/**
 * Pure keyboard-test logic — no DOM, no Preact. `Tool.tsx` only wires browser
 * keyboard events to these functions. Layout data uses `KeyboardEvent.code`
 * (the physical key), which stays the same regardless of the active layout.
 */

export type LayoutId = 'en' | 'ko';
export type RolloverLevel = 'single' | 'partial' | 'high';

export interface KeySpec {
  code: string;
  /** Relative width; 1 = one standard keycap. */
  weight: number;
}

export type KeyRow = KeySpec[];

const row = (codes: Array<string | [string, number]>): KeyRow =>
  codes.map((c) => (Array.isArray(c) ? { code: c[0], weight: c[1] } : { code: c, weight: 1 }));

/** Main block of a standard ANSI/104-key board. Shared physical shape for every layout. */
export const MAIN_ROWS: KeyRow[] = [
  row(['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']),
  row([
    'Backquote',
    'Digit1',
    'Digit2',
    'Digit3',
    'Digit4',
    'Digit5',
    'Digit6',
    'Digit7',
    'Digit8',
    'Digit9',
    'Digit0',
    'Minus',
    'Equal',
    ['Backspace', 2],
  ]),
  row([
    ['Tab', 1.5],
    'KeyQ',
    'KeyW',
    'KeyE',
    'KeyR',
    'KeyT',
    'KeyY',
    'KeyU',
    'KeyI',
    'KeyO',
    'KeyP',
    'BracketLeft',
    'BracketRight',
    ['Backslash', 1.5],
  ]),
  row([
    ['CapsLock', 1.75],
    'KeyA',
    'KeyS',
    'KeyD',
    'KeyF',
    'KeyG',
    'KeyH',
    'KeyJ',
    'KeyK',
    'KeyL',
    'Semicolon',
    'Quote',
    ['Enter', 2.25],
  ]),
  row([
    ['ShiftLeft', 2.25],
    'KeyZ',
    'KeyX',
    'KeyC',
    'KeyV',
    'KeyB',
    'KeyN',
    'KeyM',
    'Comma',
    'Period',
    'Slash',
    ['ShiftRight', 2.75],
  ]),
  row([
    ['ControlLeft', 1.25],
    ['MetaLeft', 1.25],
    ['AltLeft', 1.25],
    ['Space', 6.25],
    ['AltRight', 1.25],
    ['MetaRight', 1.25],
    ['ContextMenu', 1.25],
    ['ControlRight', 1.25],
  ]),
];

/** Arrow cluster, rendered as its own inverted-T block next to the main board. */
export const ARROW_CODES = ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'];

/** The system/navigation cluster on a full-size ANSI board. */
export const SYSTEM_ROWS: KeyRow[] = [row(['PrintScreen', 'ScrollLock', 'Pause'])];

export const NAVIGATION_ROWS: KeyRow[] = [row(['Insert', 'Home', 'PageUp']), row(['Delete', 'End', 'PageDown'])];

/** Numpad rows are rendered rectangularly; their physical key heights vary by keyboard. */
export const NUMPAD_ROWS: KeyRow[] = [
  row(['NumLock', 'NumpadDivide', 'NumpadMultiply', 'NumpadSubtract']),
  row(['Numpad7', 'Numpad8', 'Numpad9', 'NumpadAdd']),
  row(['Numpad4', 'Numpad5', 'Numpad6']),
  row(['Numpad1', 'Numpad2', 'Numpad3', 'NumpadEnter']),
  row([['Numpad0', 2], 'NumpadDecimal']),
];

/** All 104 physical keys on a standard full-size ANSI board. */
export const ALL_CODES: string[] = [
  ...MAIN_ROWS.flat().map((k) => k.code),
  ...ARROW_CODES,
  ...SYSTEM_ROWS.flat().map((k) => k.code),
  ...NAVIGATION_ROWS.flat().map((k) => k.code),
  ...NUMPAD_ROWS.flat().map((k) => k.code),
];

const ALL_CODE_SET = new Set(ALL_CODES);

export function isBoardCode(code: string): boolean {
  return ALL_CODE_SET.has(code);
}

const EN_LABELS: Record<string, string> = {
  Escape: 'Esc',
  Backquote: '`',
  Minus: '-',
  Equal: '=',
  Backspace: 'Backspace',
  Tab: 'Tab',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  CapsLock: 'Caps',
  Semicolon: ';',
  Quote: "'",
  Enter: 'Enter',
  ShiftLeft: 'Shift',
  ShiftRight: 'Shift',
  Comma: ',',
  Period: '.',
  Slash: '/',
  ControlLeft: 'Ctrl',
  ControlRight: 'Ctrl',
  AltLeft: 'Alt',
  AltRight: 'Alt',
  ContextMenu: 'Menu',
  Space: 'Space',
  PrintScreen: 'PrtSc',
  ScrollLock: 'ScrLk',
  Pause: 'Pause',
  Insert: 'Ins',
  Home: 'Home',
  PageUp: 'PgUp',
  Delete: 'Del',
  End: 'End',
  PageDown: 'PgDn',
  NumLock: 'Num',
  NumpadDivide: '/',
  NumpadMultiply: '*',
  NumpadSubtract: '−',
  NumpadAdd: '+',
  NumpadEnter: 'Enter',
  NumpadDecimal: '.',
  ArrowUp: '↑',
  ArrowLeft: '←',
  ArrowDown: '↓',
  ArrowRight: '→',
};

/** 2-set standard (두벌식 표준) Hangul jamo printed on a Korean ANSI keyboard. */
const KO_LETTER_LABELS: Record<string, string> = {
  KeyQ: 'ㅂ',
  KeyW: 'ㅈ',
  KeyE: 'ㄷ',
  KeyR: 'ㄱ',
  KeyT: 'ㅅ',
  KeyY: 'ㅛ',
  KeyU: 'ㅕ',
  KeyI: 'ㅑ',
  KeyO: 'ㅐ',
  KeyP: 'ㅔ',
  KeyA: 'ㅁ',
  KeyS: 'ㄴ',
  KeyD: 'ㅇ',
  KeyF: 'ㄹ',
  KeyG: 'ㅎ',
  KeyH: 'ㅗ',
  KeyJ: 'ㅓ',
  KeyK: 'ㅏ',
  KeyL: 'ㅣ',
  KeyZ: 'ㅋ',
  KeyX: 'ㅌ',
  KeyC: 'ㅊ',
  KeyV: 'ㅍ',
  KeyB: 'ㅠ',
  KeyN: 'ㅜ',
  KeyM: 'ㅡ',
};

for (let i = 0; i < 26; i++) {
  const code = `Key${String.fromCharCode(65 + i)}`;
  if (!(code in EN_LABELS)) EN_LABELS[code] = String.fromCharCode(65 + i);
}
for (let i = 0; i <= 9; i++) EN_LABELS[`Digit${i}`] = String(i);
for (let i = 1; i <= 12; i++) EN_LABELS[`F${i}`] = `F${i}`;
for (let i = 0; i <= 9; i++) EN_LABELS[`Numpad${i}`] = String(i);

/** Visible label for `code` in `layout`. Falls back to the English label, then the raw code. */
export function keyLabel(layout: LayoutId, code: string): string {
  if (layout === 'ko' && code in KO_LETTER_LABELS) return KO_LETTER_LABELS[code];
  return EN_LABELS[code] ?? code;
}

/** macOS swaps the printed Alt/Meta names; every other platform keeps Win/Ctrl/Alt. */
export function modifierLabel(code: string, isMac: boolean): string | null {
  if (!isMac) return null;
  if (code === 'MetaLeft' || code === 'MetaRight') return '⌘';
  if (code === 'AltLeft' || code === 'AltRight') return '⌥';
  if (code === 'ControlLeft' || code === 'ControlRight') return '⌃';
  return null;
}

/**
 * Qualitative read of how many keys stayed registered at once this session.
 * 6 keys is the common USB boot-protocol ceiling (6KRO). This only reports the
 * lower bound observed in this session; no finite test can certify full NKRO.
 */
export function classifyRollover(maxSimultaneous: number): RolloverLevel {
  if (maxSimultaneous >= 10) return 'high';
  if (maxSimultaneous >= 2) return 'partial';
  return 'single';
}

export interface KeyTransition {
  code: string;
  type: 'down' | 'up';
  /** ms timestamp. Only real presses/releases — filter out OS auto-repeat before calling. */
  t: number;
}

/**
 * Flags codes that register a new keydown within `windowMs` of a release on the
 * same code — the signature of a chattering/double-firing switch on a quick tap.
 * Held-repeat keydowns do not count as chatter.
 */
export function detectChatter(events: KeyTransition[], windowMs = 60): string[] {
  const lastDown = new Map<string, number>();
  const down = new Set<string>();
  const chattering = new Set<string>();
  for (const event of events) {
    if (event.type === 'up') {
      down.delete(event.code);
      continue;
    }

    const previous = lastDown.get(event.code);
    if (!down.has(event.code) && previous !== undefined && event.t - previous < windowMs) {
      chattering.add(event.code);
    }
    lastDown.set(event.code, event.t);
    down.add(event.code);
  }
  return [...chattering];
}

/** A key held well past any real typing press is more likely stuck than intentional. */
export function isLikelyStuck(heldMs: number, thresholdMs = 5000): boolean {
  return heldMs >= thresholdMs;
}

export function formatHeldSeconds(heldMs: number): string {
  return `${Math.max(0, heldMs / 1000).toFixed(1)}s`;
}

/** Percentage of the board confirmed working this session, rounded for display. */
export function coveragePercent(testedCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  return Math.round((Math.max(0, Math.min(testedCount, totalCount)) / totalCount) * 100);
}
