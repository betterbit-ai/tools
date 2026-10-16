import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'barcode-generator',
  category: 'generator',
  icon: 'code',
  added: '2026-10-16',
  updated: '2026-10-16',
  edges: ['usability'],
  competitors: [
    {
      name: "Saturnity's Tools Barcode Generator",
      url: 'https://saturnitystools.com/tools/barcode-generator/',
      weakness:
        'Its English search result exposes a separate Generate Barcode action after the value and appearance controls, so the result is not shown as the user types. Betterbit validates and redraws the SVG live, names a wrong EAN-13 check digit, and can copy the finished SVG markup. (Strength: it exposes foreground, background, and label-font controls.)',
    },
    {
      name: 'Toolbita Barcode Generator',
      url: 'https://www.toolbita.com/barcode-generator',
      weakness:
        'Its opened search result lists a Generate Barcode button before Download SVG and Copy, rather than a live result while typing. Betterbit renders immediately and specifically separates a 12-digit EAN input that needs a check digit from a 13-digit value whose final digit is wrong. (Strength: it exposes a colour setting and an explicit 100–800 px width range.)',
    },
    {
      name: 'Make Barcode Online',
      url: 'https://makebarcodeonline.com/',
      weakness:
        'Its opened generator offers Code 128, EAN-13, UPC-A, EAN-8 and Code 39 with PNG/SVG downloads, but the visible action row has downloads only and no raw-SVG copy control. Betterbit keeps the narrower Code 128/EAN-13 workflow and lets users copy the generated SVG markup beside the download. (Strength: it supports three additional symbologies and PNG export.)',
    },
    {
      name: '코노웹 무료 바코드 생성기',
      url: 'https://kono.co.kr/qr/index.html',
      weakness:
        'Its opened Korean page combines barcode and QR controls and exposes a PNG-save button; its guide says the barcode SVG is converted to PNG for saving. Betterbit keeps a focused two-format screen, preserves a vector SVG download, and displays EAN-13 check-digit errors before export. (장점: QR코드와 바코드를 한 페이지에서 함께 꾸밀 수 있다.)',
    },
    {
      name: 'Muxtly 바코드 생성기',
      url: 'https://www.muxtly.com/ko/barcode-generator/',
      weakness:
        'Its Korean search result describes a Code128-only generator with one height choice, a Generate button, and a PNG download. Betterbit adds EAN-13 with 12-digit check-digit completion, live preview, adjustable bar geometry, and SVG download/copy. (장점: CODE128의 ASCII 범위와 사용 사례를 짧게 설명한다.)',
    },
    {
      name: 'BarcodeMate 바코드 생성기',
      url: 'https://barcodemate.com/ko/',
      weakness:
        'Its opened Korean result presents a much broader, multi-format workspace that stores barcode content in the browser and prepares the workspace before previewing. Betterbit is a smaller immediate screen for one Code 128 or EAN-13 label, with a visible EAN check-digit result and direct SVG markup copy. (장점: 대량 생성과 매우 다양한 1D·2D 심볼로지를 지원한다.)',
    },
  ],
  related: ['qr-code-generator', 'qr-code-scanner', 'image-converter'],
};
