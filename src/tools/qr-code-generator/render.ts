import qrcode from 'qrcode-generator';
import type { ErrorCorrectionLevel } from './logic';

export interface RenderedQr {
  svg: string;
  moduleCount: number;
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/** Creates a static Model 2 QR SVG with a four-module quiet zone. */
export function renderQrSvg(
  payload: string,
  errorCorrection: ErrorCorrectionLevel,
  foreground: string,
  background: string,
  logoDataUrl: string | null,
): RenderedQr {
  const code = qrcode(0, errorCorrection);
  code.addData(payload, 'Byte');
  code.make();

  let svg = code
    .createSvgTag({ cellSize: 1, margin: 4, scalable: true })
    .replace('<svg ', `<svg fill="${foreground}" `)
    .replace('fill="white"', `fill="${background}"`);
  if (logoDataUrl) {
    // A white plate keeps the center readable. 22% is deliberately conservative for H correction.
    const side = code.getModuleCount() + 8;
    const plate = side * 0.22;
    const inset = plate * 0.1;
    const start = (side - plate) / 2;
    const logo = `<rect x="${start}" y="${start}" width="${plate}" height="${plate}" rx="${plate * 0.14}" fill="${background}"/><image href="${escapeAttribute(logoDataUrl)}" x="${start + inset}" y="${start + inset}" width="${plate - inset * 2}" height="${plate - inset * 2}" preserveAspectRatio="xMidYMid meet"/>`;
    svg = svg.replace('</svg>', `${logo}</svg>`);
  }
  return { svg, moduleCount: code.getModuleCount() };
}
