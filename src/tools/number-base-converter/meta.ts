import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'number-base-converter',
  category: 'converter',
  icon: 'calculator',
  added: '2026-10-15',
  updated: '2026-10-15',
  edges: ['usability', 'features', 'accuracy'],
  competitors: [
    {
      name: 'Deftkit — Binary to Decimal Converter',
      url: 'https://www.deftkit.com/tools/binary-to-decimal',
      weakness:
        'Its opened converter is polished, local and live, but its input selector and result panel are limited to binary, octal, decimal and hexadecimal. Betterbit retains those four simultaneous results while also accepting any integer base from 2 through 36 and displaying a selected fifth base in the same panel. (Strength: it shows bit/byte width and accepts standard 0b/0o/0x prefixes.)',
    },
    {
      name: 'FormatterHQ — Binary to Decimal Converter',
      url: 'https://formatterhq.com/binary-to-decimal',
      weakness:
        'Its opened page is a binary-to-decimal flow; the rendered related-tool list sends decimal-to-octal, decimal-to-hexadecimal and other directions to separate pages. Betterbit changes the input base and shows binary, octal, decimal, hexadecimal and a chosen base 2–36 together without a page change. (Strength: it supports binary fractions as well as whole numbers.)',
    },
    {
      name: 'BinaryTranslator.ai — Binary to Decimal Converter',
      url: 'https://www.binarytranslator.ai/binary-to-decimal/',
      weakness:
        'Its opened tool focuses on a binary-to-decimal tab, with the reverse direction as a separate tab; its extra workflow includes batch rows, files, downloads and signed-width controls. Betterbit keeps a compact one-number panel where all four standard representations and an arbitrary base appear while typing. (Strength: it supports batch files, fractions, two’s-complement widths and worked steps.)',
    },
    {
      name: 'CalculatorLib — 2진수 10진수 변환기',
      url: 'https://calculatorlib.com/ko/binary-to-decimal-converter-calculator',
      weakness:
        'Its Korean result page asks visitors to press “계산하다” and says that non-0/1 characters are automatically ignored; its FAQ also warns that very long input can lose precision because of floating-point limits. Betterbit updates while typing, flags invalid pasted characters instead of changing them silently, and uses exact BigInt arithmetic for up to 10,000 digits. (Strength: it shows a bit-count result and offers PDF output.)',
    },
    {
      name: 'UnitFlow — 2진수를 10진수로 변환',
      url: 'https://unitflow.net/ko/binary-to-decimal',
      weakness:
        'Its opened page provides one binary input and one decimal output, then lists each other conversion direction as a separate related-tool link. Betterbit displays binary, octal, decimal and hexadecimal in one live result grid and adds any base from 2 through 36. (Strength: its focused page gives a concise bit-place-value explanation and a binary reference table.)',
    },
    {
      name: 'DataChef — 진법 변환 계산기',
      url: 'https://tech-lagoon.com/numberchef/ko/base-conversion.html',
      weakness:
        'Its search result and opened page describe a “계산” button workflow for four bases and a 64-bit integer limit; decimal input is capped at 18,446,744,073,709,551,615. Betterbit recalculates on every edit, supports bases 2–36, and keeps exact whole-number values up to 10,000 digits. (Strength: it shows worked positional-expansion and division steps for its four supported bases.)',
    },
  ],
  related: ['scientific-calculator', 'data-size-converter', 'base64', 'korean-number'],
};
