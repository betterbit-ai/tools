import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'qr-code-scanner',
  category: 'generator',
  icon: 'qrcode',
  added: '2026-10-16',
  updated: '2026-10-16',
  edges: ['usability'],
  competitors: [
    {
      name: 'ScanQR.org',
      url: 'https://scanqr.org/',
      weakness:
        'Its opened scanner makes a separate WiFi QR Code Scanner one of its linked tools, while its main result area is a generic copy result/history flow. Betterbit keeps camera, image/paste input, a deliberate HTTP(S)-only open action, and decoded Wi-Fi SSID/password/security/hidden fields together. (Strength: it lists zoom, torch, multi-camera support and optional local history/export.)',
    },
    {
      name: 'ScanQR.ai',
      url: 'https://scanqr.ai/',
      weakness:
        'Its opened page routes Wi-Fi decoding to a dedicated WiFi QR Scanner page and lists separate image, webcam and screenshot tools. Betterbit puts every input route and readable Wi-Fi fields in one focused scanner, without opening a decoded link automatically. (Strength: it documents its two-decoder fallback and publishes a longer safety guide.)',
    },
    {
      name: 'W3Schools QR Code Scanner / Decoder',
      url: 'https://www.w3schools.com/tools/tool_qr_decoder.php',
      weakness:
        'The opened tool exposes drop/upload, camera, Copy and Scan Another, but no screenshot-paste instruction or parsed Wi-Fi fields; its page also places a visible REMOVE ADS promotion below the scanner. Betterbit accepts pasted screenshots and turns standard Wi-Fi payloads into named fields before any user action. (Strength: its short scanner surface is very direct and it explains that camera frames stay in the browser.)',
    },
    {
      name: 'IMG.DIY QR 코드 리더',
      url: 'https://tools.pixpix.com/ko/qr-reader/',
      weakness:
        'Its Korean result explicitly focuses on one code per stored screenshot, PDF image or photo and says it is not a live webcam tool. Betterbit adds an in-page live camera route alongside file drag/drop and clipboard paste, while preserving the same local decoding model. (장점: 이미지 속 코드만 읽는 단순한 흐름을 아주 명확히 설명한다.)',
    },
    {
      name: '바스캔 QR코드 스캔',
      url: 'https://tools.barscan.kr/qr-scanner',
      weakness:
        'The opened Korean scanner supports camera, file and Ctrl+V input, but inserts a promoted 180,000원 Alpha Scanner purchase block immediately below the tool controls. Betterbit keeps the scanning surface focused and makes Wi-Fi QR values legible as separate fields rather than only offering generic copy/open actions. (장점: iOS Safari fallback requirements and barcode-scanner use cases are documented in detail.)',
    },
    {
      name: '바로툴 QR·바코드 스캐너',
      url: 'https://barotool.co.kr/tools/qr-barcode-scanner',
      weakness:
        'Its Korean search result combines QR, EAN, UPC and Code 128 in one scanner and presents a generic text-or-number result. Betterbit stays focused on QR content, keeps a decoded URL inert until selected, and parses the common Wi-Fi payload into network fields. (장점: product barcodes such as EAN and UPC are within its broader scope.)',
    },
  ],
  related: ['qr-code-generator', 'barcode-generator', 'webcam-test', 'image-cropper'],
};
