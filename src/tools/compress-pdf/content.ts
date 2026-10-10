import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a PDF here, or click to choose',
  dropHint: 'One PDF at a time — it stays on this device',
  remove: 'Remove',
  levelLabel: 'Image compression level',
  balanced: 'Balanced',
  smaller: 'Smaller',
  smallest: 'Smallest',
  balancedHint: '150 dpi, JPEG quality 78% — a sensible choice for readable scans.',
  smallerHint: '110 dpi, JPEG quality 65% — for sharing and most on-screen reading.',
  smallestHint: '80 dpi, JPEG quality 50% — use when a size limit matters most.',
  rasterWarning:
    'Pages are rebuilt as JPEG images. Selectable levels work best for scans and image-heavy PDFs; selectable text, links, forms, and signatures are flattened.',
  privacyNote: 'Your PDF is compressed in this browser. Nothing is uploaded, and no ads are shown.',
  reading: 'Reading PDF…',
  processingPages: 'Compressing page {n} of {total}…',
  invalidPdf: "This file can't be read as a PDF.",
  encryptedPdf: 'This PDF is password-protected. Remove its password before compressing it.',
  fileSizeLimit: 'This PDF is over the 100 MB browser-safety limit.',
  pageCountLimit: 'This PDF has more than 100 pages, the browser-safety limit for this tool.',
  pagePixelLimit: 'A page is too large to render safely in this browser. Try a smaller PDF.',
  totalPixelLimit: 'This PDF needs too much total image memory to compress safely in this browser.',
  compressionFailed: "This PDF couldn't be compressed in this browser. Try a smaller file or another PDF.",
  retry: 'Try again',
  pageCount: '{n} page(s)',
  resultReady: 'Compressed PDF ready',
  smallerBy: '{n}% smaller',
  largerBy: '{n}% larger',
  sameSize: 'about the same size',
  download: 'Download compressed PDF',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Compress PDF — Private Image Compression',
    description:
      'Compress a scan or image-heavy PDF with three visible quality levels, entirely in your browser. No upload, account, ads, or server copy of your document.',
    h1: 'Compress PDF',
    tagline: 'Make scan-heavy PDFs smaller with a quality level you can see — without uploading the file.',
    name: 'Compress PDF',
    keywords: [
      'compress pdf',
      'pdf compressor',
      'reduce pdf size',
      'shrink pdf',
      'compress scanned pdf',
      'make pdf smaller',
    ],
    howTo: [
      'Choose a PDF or drop it into the file area.',
      'Pick Balanced, Smaller, or Smallest according to the quality you need.',
      'Wait while each page is rebuilt on this device; the before-and-after sizes appear automatically.',
      'Open the downloaded PDF and check the pages at normal reading size before submitting it.',
    ],
    sections: [
      {
        heading: 'Choose the level for the job',
        body: 'Balanced renders pages at 150 dpi with JPEG quality 78%, which is a sensible starting point for ordinary scans. Smaller uses 110 dpi and 65% JPEG quality for email or on-screen reading. Smallest uses 80 dpi and 50% quality when a strict upload cap is more important than fine detail. Each option is visible before processing, rather than hiding the quality trade-off behind a generic label. Compression cannot promise a smaller result for every PDF: a text-only or already optimized PDF may stay similar in size, and the result panel reports that honestly.',
      },
      {
        heading: 'What this compressor changes',
        body: 'This tool renders each source page and rebuilds it as a JPEG image on a PDF page of the same physical dimensions. That makes it particularly useful for scanned paperwork, photographed pages, and image-heavy handouts, where large embedded images dominate the file size. The trade-off is intentional: searchable or selectable text, links, fillable form fields, layers, and digital-signature information are flattened into the page image. Keep the original PDF if you need any of those features later.',
      },
      {
        heading: 'Private compression, not an upload workflow',
        body: 'The leading online results iLovePDF, Smallpdf, and PDF24 all show an upload or cloud-processing step. Smallpdf says uploaded files are automatically deleted after one hour, while PDF24 says processing happens on its servers. Here, the PDF is read, rendered, and rebuilt in your browser; no file is sent to a server, no account is required, and there are no advertisements around the document workflow. This is useful for scans containing IDs, contracts, financial records, or student documents.',
      },
    ],
    faq: [
      {
        q: 'Does this upload my PDF?',
        a: 'No. The PDF is read, rendered, compressed, and downloaded entirely in the browser on your device. Once this page has loaded, the document itself is never sent to a server.',
      },
      {
        q: 'Which compression level should I use?',
        a: 'Start with Balanced at 150 dpi and JPEG quality 78% for readable scans. Use Smaller at 110 dpi and 65% for everyday sharing, or Smallest at 80 dpi and 50% only when meeting a strict size limit matters more than fine detail.',
      },
      {
        q: 'Will a compressed PDF keep searchable text and links?',
        a: 'No. This tool rebuilds every page as a JPEG image, so selectable text, hyperlinks, fillable form fields, layers, and signature data are flattened. Keep the original file whenever those features are needed.',
      },
      {
        q: 'Why did my PDF not get much smaller?',
        a: 'A text-only PDF or one that already contains efficiently compressed images may have little removable data. Rebuilding it can therefore produce a similar size, and occasionally a larger one; the tool shows the exact before-and-after sizes rather than claiming a fixed reduction.',
      },
      {
        q: 'Can I compress a password-protected PDF?',
        a: 'Not yet. Password-protected PDFs are stopped before processing because the browser cannot read their pages without unlocking them. Remove the password in a PDF reader you trust, then add the unlocked copy here.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF 용량 줄이기 — 업로드 없는 이미지 압축',
    description:
      '스캔·이미지 중심 PDF를 화질 수준 3가지로 줄이세요. 파일은 브라우저에서만 처리되며 업로드·가입·광고 없이 결과를 바로 다운로드합니다.',
    h1: 'PDF 용량 줄이기',
    tagline: '화질 수준을 직접 고르고, 스캔 PDF를 내 기기 안에서 가볍게 만듭니다.',
    name: 'PDF 용량 줄이기',
    keywords: [
      'pdf 용량 줄이기',
      'pdf 압축',
      'pdf 파일 용량 줄이기',
      '스캔 pdf 압축',
      'pdf 가볍게 만들기',
      'pdf 줄이기',
    ],
    howTo: [
      'PDF를 선택하거나 파일 영역으로 끌어다 놓습니다.',
      '필요한 화질에 맞춰 균형, 더 작게, 최소 용량 중 하나를 고릅니다.',
      '각 페이지가 내 기기에서 다시 만들어지는 동안 기다리면 전후 용량이 자동으로 표시됩니다.',
      '다운로드한 PDF를 열어 일반적인 읽기 크기에서 내용이 충분히 선명한지 확인합니다.',
    ],
    sections: [
      {
        heading: '제출 목적에 맞춰 화질을 고르세요',
        body: '균형은 150dpi·JPEG 품질 78%로, 일반적인 스캔 문서를 읽기 좋은 수준에서 시작할 때 적합합니다. 더 작게는 110dpi·65%로 이메일 첨부나 화면 열람용에 맞추고, 최소 용량은 80dpi·50%로 제출 사이트의 엄격한 제한을 맞춰야 할 때 사용합니다. 세 수준의 실제 설정을 작업 전에 모두 보여 주므로 막연한 “고화질” 표현에 의존하지 않습니다. 텍스트만 있는 PDF나 이미 최적화된 PDF는 더 줄일 여지가 적어 결과가 비슷하거나 더 커질 수도 있으며, 이 도구는 실제 전후 용량을 그대로 표시합니다.',
      },
      {
        heading: '이 도구가 바꾸는 것',
        body: '이 도구는 원본의 각 페이지를 이미지로 렌더링한 뒤, 같은 용지 크기의 PDF 페이지에 JPEG로 다시 담습니다. 따라서 큰 이미지가 대부분을 차지하는 스캔 서류, 촬영한 문서, 이미지 중심 안내문에 특히 알맞습니다. 대신 선택·검색 가능한 텍스트, 링크, 입력 양식, 레이어, 전자서명 정보는 페이지 이미지로 평면화됩니다. 이런 기능이 나중에 필요하다면 원본 PDF를 반드시 보관하세요.',
      },
      {
        heading: '업로드하지 않는 PDF 압축',
        body: '검색 상위 결과인 iLovePDF, Smallpdf, PDF24는 모두 업로드 또는 클라우드 처리 단계를 보여 줍니다. Smallpdf는 업로드 파일을 1시간 뒤 자동 삭제한다고 안내하고, PDF24는 서버에서 처리한다고 밝힙니다. 여기서는 PDF를 읽고 렌더링하고 다시 만드는 전 과정이 브라우저에서만 이루어집니다. 파일을 서버에 보내지 않고, 회원가입이나 광고도 없으므로 신분증 사본, 계약서, 금융 서류, 재학 증명처럼 민감한 스캔본에 쓸 수 있습니다.',
      },
    ],
    faq: [
      {
        q: 'PDF 파일이 서버로 업로드되나요?',
        a: '아니요. PDF를 읽고, 페이지를 렌더링하고, 압축 결과를 만드는 작업은 모두 현재 브라우저와 기기 안에서 이루어집니다. 페이지를 불러온 뒤 문서 파일 자체는 서버로 전송되지 않습니다.',
      },
      {
        q: '어떤 압축 수준을 선택해야 하나요?',
        a: '읽기 좋은 스캔본은 150dpi·JPEG 품질 78%인 균형부터 시작하세요. 일반 공유용은 110dpi·65%인 더 작게를, 용량 제한을 최우선으로 맞춰야 할 때만 80dpi·50%인 최소 용량을 권합니다.',
      },
      {
        q: '압축한 PDF에서도 글자를 선택하거나 링크를 누를 수 있나요?',
        a: '아니요. 이 도구는 각 페이지를 JPEG 이미지로 다시 만들기 때문에 선택·검색 가능한 텍스트, 하이퍼링크, 입력 양식, 레이어, 전자서명 정보는 유지되지 않습니다. 해당 기능이 필요하면 원본 파일을 사용해야 합니다.',
      },
      {
        q: 'PDF 용량이 거의 줄지 않는 이유는 무엇인가요?',
        a: '텍스트 위주 PDF나 이미 이미지가 효율적으로 압축된 PDF는 줄일 수 있는 데이터가 적습니다. 이 경우 결과가 비슷하거나 더 커질 수 있으며, 도구가 고정된 압축률을 약속하는 대신 실제 전후 용량을 표시합니다.',
      },
      {
        q: '암호가 걸린 PDF도 압축할 수 있나요?',
        a: '아직은 안 됩니다. 암호로 보호된 PDF는 브라우저가 페이지를 읽을 수 없어서 처리 전에 중단됩니다. 신뢰할 수 있는 PDF 리더에서 암호를 해제한 사본을 만든 뒤 이 도구에 넣으세요.',
      },
    ],
    ui: {
      dropTitle: 'PDF를 끌어다 놓거나 클릭해서 선택하세요',
      dropHint: '한 번에 PDF 1개 — 파일은 이 기기에만 남습니다',
      remove: '삭제',
      levelLabel: '이미지 압축 수준',
      balanced: '균형',
      smaller: '더 작게',
      smallest: '최소 용량',
      balancedHint: '150dpi, JPEG 품질 78% — 읽기 좋은 스캔 문서에 알맞습니다.',
      smallerHint: '110dpi, JPEG 품질 65% — 공유와 일반적인 화면 열람용입니다.',
      smallestHint: '80dpi, JPEG 품질 50% — 용량 제한이 가장 중요할 때 사용합니다.',
      rasterWarning:
        '페이지를 JPEG 이미지로 다시 만듭니다. 수준 선택은 스캔·이미지 중심 PDF에 알맞고, 선택 가능한 글자·링크·입력 양식·전자서명은 평면화됩니다.',
      privacyNote: 'PDF는 이 브라우저에서 압축합니다. 어디에도 업로드되지 않으며 광고도 없습니다.',
      reading: 'PDF 읽는 중…',
      processingPages: '{total}페이지 중 {n}페이지 압축 중…',
      invalidPdf: '이 파일은 PDF로 읽을 수 없습니다.',
      encryptedPdf: '암호로 보호된 PDF입니다. 암호를 해제한 뒤 압축하세요.',
      fileSizeLimit: '이 PDF는 브라우저 안전 제한인 100MB를 넘습니다.',
      pageCountLimit: '이 PDF는 100페이지를 넘어 이 도구의 브라우저 안전 제한을 넘습니다.',
      pagePixelLimit: '페이지가 너무 커서 이 브라우저에서 안전하게 렌더링할 수 없습니다. 더 작은 PDF로 시도하세요.',
      totalPixelLimit: '이 PDF는 브라우저에서 안전하게 압축하기에 전체 이미지 메모리가 너무 많이 필요합니다.',
      compressionFailed: '이 브라우저에서 PDF를 압축하지 못했습니다. 더 작은 파일이나 다른 PDF로 시도해 보세요.',
      retry: '다시 시도',
      pageCount: '{n}페이지',
      resultReady: '압축한 PDF가 준비되었습니다',
      smallerBy: '{n}% 감소',
      largerBy: '{n}% 증가',
      sameSize: '용량이 거의 같습니다',
      download: '압축한 PDF 다운로드',
    },
  },
};
