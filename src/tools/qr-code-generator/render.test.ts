import { describe, expect, it } from 'vitest';
import qrcode from 'qrcode-generator';
import { utf8Bytes } from './logic';
import { renderQrSvg } from './render';

describe('renderQrSvg', () => {
  it('uses UTF-8 bytes for Korean and emoji payloads', () => {
    renderQrSvg('한글 😀', 'M', '#000000', '#ffffff', null);

    expect(qrcode.stringToBytes('한글 😀')).toEqual(utf8Bytes('한글 😀'));
  });

  it('uses the selected foreground and background colors in the SVG', () => {
    const { svg } = renderQrSvg('betterbit.org', 'M', '#102a43', '#f7fafc', null);

    expect(svg).toContain('fill="#102a43"');
    expect(svg).toContain('fill="#f7fafc"');
  });
});
