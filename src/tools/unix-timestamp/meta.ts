import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'unix-timestamp',
  category: 'time',
  icon: 'convert',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['usability'],
  competitors: [
    {
      name: 'Unix Time Tools',
      url: 'https://unixtimetools.com/',
      weakness:
        'Its opened landing page presents Batch, Milliseconds, and Timezone as separate linked pages rather than showing a focused converter interface in the rendered main view. Betterbit keeps numeric input, manual unit override, UTC/device-time date input, and all copyable results in one keyboard-focusable panel. (Strength: it offers a separate batch converter for up to 500 values and microsecond/nanosecond support.)',
    },
    {
      name: 'Epoch Converter',
      url: 'https://www.epochconverter.com/',
      weakness:
        'Its visible date-to-timestamp flow splits a date into Year, Month, Day, Hour, Minute, and Second fields and includes a separate “Date to timestamp” action. Betterbit accepts one native date/time field and updates the timestamp and every result while the value is edited. (Strength: it supports microseconds, nanoseconds, many specialized epoch formats, and code examples.)',
    },
    {
      name: 'unixtime.sh',
      url: 'https://unixtime.sh/',
      weakness:
        'Its Unix-to-date section exposes a “Convert” button after the timestamp field, so pasted values need an additional action before results appear. Betterbit converts on input, remembers the last browser-local values, and provides a / shortcut to focus the timestamp field. (Strength: it additionally accepts hexadecimal values and publishes a JSON API.)',
    },
    {
      name: 'Integrity 타임스탬프 변환기',
      url: 'https://www.integrity.co.kr/tools/timestamp/',
      weakness:
        'Its Korean page has separate “변환” buttons for timestamp-to-date and date-to-timestamp, and loads a Google Tag Manager iframe. Betterbit updates both directions as values change and stores inputs only in browser-local storage without an external tracking iframe. (Strength: it explains Korean practical uses and shows UTC, KST, and ISO 8601 together.)',
    },
    {
      name: 'calai Unix 타임스탬프 변환',
      url: 'https://www.calai.kr/timestamp',
      weakness:
        'Its visible conversion section presents four precision buttons—seconds, milliseconds, microseconds, and nanoseconds—before the result area. Betterbit starts with one numeric input that states the detected seconds/milliseconds unit and lets a user override it without a separate conversion step. (Strength: it displays KST, UTC, ISO 8601, RFC 2822, relative time, and nanoseconds together.)',
    },
    {
      name: 'ToolMole 타임스탬프 변환',
      url: 'https://toolmole.com/ko/timestamp-converter/',
      weakness:
        'Its Korean tool describes automatic 10-digit/13-digit detection but its visible interface does not expose a unit override for an ambiguous value. Betterbit labels the chosen unit and lets the user force seconds or milliseconds directly beside the input. (Strength: it gives a concise Korean explanation of the seconds-versus-milliseconds mistake.)',
    },
  ],
  related: ['time-zone-converter', 'date-calculator', 'countdown', 'world-clock', 'jwt-decoder'],
};
