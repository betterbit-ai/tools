/** Pure barcode encoding and SVG generation — no DOM or Preact. */

export const BARCODE_FORMATS = ['CODE128', 'EAN13'] as const;
export type BarcodeFormat = (typeof BARCODE_FORMATS)[number];

export interface BarcodeSettings {
  format: BarcodeFormat;
  value: string;
  moduleWidth: number;
  height: number;
  displayValue: boolean;
}

export type BarcodeError =
  'empty' | 'too-long' | 'unsupported-character' | 'invalid-ean-length' | 'invalid-check-digit';

export interface EncodedBarcode {
  encodedValue: string;
  modules: string;
  moduleCount: number;
}

export interface RenderedBarcode extends EncodedBarcode {
  svg: string;
  width: number;
  height: number;
}

// Code 128 codeword patterns from ISO/IEC 15417. Values 0–105 have 11 modules; stop has 13.
const CODE128_PATTERNS = [
  '11011001100',
  '11001101100',
  '11001100110',
  '10010011000',
  '10010001100',
  '10001001100',
  '10011001000',
  '10011000100',
  '10001100100',
  '11001001000',
  '11001000100',
  '11000100100',
  '10110011100',
  '10011011100',
  '10011001110',
  '10111001100',
  '10011101100',
  '10011100110',
  '11001110010',
  '11001011100',
  '11001001110',
  '11011100100',
  '11001110100',
  '11101101110',
  '11101001100',
  '11100101100',
  '11100100110',
  '11101100100',
  '11100110100',
  '11100110010',
  '11011011000',
  '11011000110',
  '11000110110',
  '10100011000',
  '10001011000',
  '10001000110',
  '10110001000',
  '10001101000',
  '10001100010',
  '11010001000',
  '11000101000',
  '11000100010',
  '10110111000',
  '10110001110',
  '10001101110',
  '10111011000',
  '10111000110',
  '10001110110',
  '11101110110',
  '11010001110',
  '11000101110',
  '11011101000',
  '11011100010',
  '11011101110',
  '11101011000',
  '11101000110',
  '11100010110',
  '11101101000',
  '11101100010',
  '11100011010',
  '11101111010',
  '11001000010',
  '11110001010',
  '10100110000',
  '10100001100',
  '10010110000',
  '10010000110',
  '10000101100',
  '10000100110',
  '10110010000',
  '10110000100',
  '10011010000',
  '10011000010',
  '10000110100',
  '10000110010',
  '11000010010',
  '11001010000',
  '11110111010',
  '11000010100',
  '10001111010',
  '10100111100',
  '10010111100',
  '10010011110',
  '10111100100',
  '10011110100',
  '10011110010',
  '11110100100',
  '11110010100',
  '11110010010',
  '11011011110',
  '11011110110',
  '11110110110',
  '10101111000',
  '10100011110',
  '10001011110',
  '10111101000',
  '10111100010',
  '11110101000',
  '11110100010',
  '10111011110',
  '10111101110',
  '11101011110',
  '11110101110',
  '11010000100',
  '11010010000',
  '11010011100',
  '1100011101011',
] as const;

/** Calculates the final EAN-13 digit from exactly 12 numeric digits. */
export function calculateEan13CheckDigit(value: string): number | null {
  if (!/^\d{12}$/.test(value)) return null;
  const sum = [...value].reduce((total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 1 : 3), 0);
  return (10 - (sum % 10)) % 10;
}

/** Removes display separators that are not encoded in EAN-13. */
export function normalizeEan13(value: string): string {
  return value.replace(/[\s-]/g, '');
}

export function validateBarcode(settings: Pick<BarcodeSettings, 'format' | 'value'>): BarcodeError | null {
  if (!settings.value) return 'empty';
  if (settings.format === 'CODE128') {
    if (settings.value.length > 80) return 'too-long';
    return /^[\x20-\x7e]+$/.test(settings.value) ? null : 'unsupported-character';
  }
  const value = normalizeEan13(settings.value);
  if (!/^\d{12,13}$/.test(value)) return 'invalid-ean-length';
  if (value.length === 13 && calculateEan13CheckDigit(value.slice(0, 12)) !== Number(value[12]))
    return 'invalid-check-digit';
  return null;
}

function encodeCode128(value: string): EncodedBarcode {
  const data = [...value].map((character) => character.charCodeAt(0) - 32);
  const checksum = (104 + data.reduce((sum, code, index) => sum + code * (index + 1), 0)) % 103;
  const codewords = [104, ...data, checksum, 106];
  const modules = codewords.map((codeword) => CODE128_PATTERNS[codeword]).join('');
  return { encodedValue: value, modules, moduleCount: modules.length };
}

const EAN_LEFT_PARITY = [
  'AAAAAA',
  'AABABB',
  'AABBAB',
  'AABBBA',
  'ABAABB',
  'ABBAAB',
  'ABBBAA',
  'ABABAB',
  'ABABBA',
  'ABBABA',
] as const;
const EAN_LEFT_A = [
  '0001101',
  '0011001',
  '0010011',
  '0111101',
  '0100011',
  '0110001',
  '0101111',
  '0111011',
  '0110111',
  '0001011',
] as const;
const EAN_LEFT_B = [
  '0100111',
  '0110011',
  '0011011',
  '0100001',
  '0011101',
  '0111001',
  '0000101',
  '0010001',
  '0001001',
  '0010111',
] as const;
const EAN_RIGHT = [
  '1110010',
  '1100110',
  '1101100',
  '1000010',
  '1011100',
  '1001110',
  '1010000',
  '1000100',
  '1001000',
  '1110100',
] as const;

function encodeEan13(input: string): EncodedBarcode {
  const value = input.length === 12 ? `${input}${calculateEan13CheckDigit(input)}` : input;
  const digits = [...value].map(Number);
  const parity = EAN_LEFT_PARITY[digits[0]];
  const left = digits
    .slice(1, 7)
    .map((digit, index) => (parity[index] === 'A' ? EAN_LEFT_A[digit] : EAN_LEFT_B[digit]));
  const right = digits.slice(7).map((digit) => EAN_RIGHT[digit]);
  const modules = `101${left.join('')}01010${right.join('')}101`;
  return { encodedValue: value, modules, moduleCount: modules.length };
}

export function encodeBarcode(settings: Pick<BarcodeSettings, 'format' | 'value'>): EncodedBarcode | null {
  if (validateBarcode(settings)) return null;
  return settings.format === 'CODE128' ? encodeCode128(settings.value) : encodeEan13(normalizeEan13(settings.value));
}

function escapeXml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]!,
  );
}

/** Renders black bars on a white background with a 10-module quiet zone on each side. */
export function renderBarcodeSvg(settings: BarcodeSettings): RenderedBarcode | null {
  const encoded = encodeBarcode(settings);
  if (!encoded) return null;
  const quietZone = 10;
  const textHeight = settings.displayValue ? 20 : 0;
  const width = (encoded.moduleCount + quietZone * 2) * settings.moduleWidth;
  const totalHeight = settings.height + textHeight;
  let x = quietZone * settings.moduleWidth;
  let bars = '';
  for (const module of encoded.modules) {
    if (module === '1') bars += `<rect x="${x}" y="0" width="${settings.moduleWidth}" height="${settings.height}"/>`;
    x += settings.moduleWidth;
  }
  const label = settings.displayValue
    ? `<text x="${width / 2}" y="${settings.height + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14">${escapeXml(encoded.encodedValue)}</text>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalHeight}" viewBox="0 0 ${width} ${totalHeight}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="white"/><g fill="black">${bars}</g>${label}</svg>`;
  return { ...encoded, svg, width, height: totalHeight };
}
