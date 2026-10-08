import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop HEIC photos here, click to choose, or paste',
  dropHint: '.heic, .heif, .hif · as many as you like, nothing is uploaded',
  privacyNote: 'Photos are decoded and re-encoded on your device. Nothing is uploaded.',
  notHeic: 'Not a HEIC file — use the Image Converter for JPG, PNG and WebP.',
  unsupported: 'This file could not be decoded. It may be damaged or not a HEIC image.',
  processing: 'Converting…',
  decoderLoading: 'Preparing the HEIC decoder (about 2 MB, downloaded once). Safari decodes HEIC without it.',
  download: 'Download',
  downloadAll: 'Download all ({n}) as ZIP',
  remove: 'Remove',
  clear: 'Clear all',
  quality: 'JPG quality',
  qualityHint: '90 is visually identical to the original for most photos. Lower it for smaller files.',
  metadata: 'Photo info (EXIF)',
  metadataNoGps: 'No location',
  metadataKeep: 'Keep all',
  metadataStrip: 'Remove',
  metadataNoGpsHint: 'Keeps the capture date, camera and settings; leaves GPS coordinates out of the JPG.',
  metadataKeepHint: 'Copies the EXIF block as-is, including GPS coordinates.',
  metadataStripHint: 'Writes a JPG with no EXIF at all — no date, camera or location.',
  dateKept: 'Date kept: {date}',
  gpsRemoved: 'location removed',
  noMetadata: 'No EXIF in the original.',
  metadataDropped: 'EXIF removed.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'HEIC to JPG — Free, No Upload, Keeps Photo Dates',
    description:
      'Convert HEIC to JPG in your browser — one photo or hundreds. No upload, no sign-up, no ads. Keeps each photo’s capture date and camera, and can leave GPS out.',
    h1: 'HEIC to JPG Converter',
    tagline: 'Turn iPhone HEIC photos into JPG without uploading them — and without losing the date they were taken.',
    name: 'HEIC to JPG',
    keywords: [
      'heic to jpg',
      'heic to jpeg',
      'convert heic',
      'heic converter',
      'heif to jpg',
      'iphone photo to jpg',
      'open heic file',
    ],
    howTo: [
      'Drop your .heic files onto the box, click to choose them, or paste with Ctrl/⌘ + V.',
      'Set JPG quality — 90 is a good default — and choose what to do with the photo info (EXIF).',
      'Each photo converts as soon as it is added; the thumbnail you see is the finished JPG.',
      'Download photos one by one, or all of them together as a ZIP.',
    ],
    sections: [
      {
        heading: 'Why HEIC photos won’t open outside Apple devices',
        body: 'HEIC is a HEIF container (ISO/IEC 23008-12) holding an image compressed with HEVC, also known as H.265 — the format every iPhone has shot by default since iOS 11 in 2017. HEVC is patent-licensed separately from the operating system, which is why support is so uneven: Safari 17 and later display HEIC natively on macOS and iOS, while Chrome, Firefox, Edge and Opera decode no HEIF at all, on any platform. On Windows you need Microsoft’s free HEIF Image Extensions plus the HEVC Video Extensions, which Microsoft sells for about US$0.99 in the Microsoft Store. Converting to JPG sidesteps all of that: JPG has opened everywhere since 1992.',
      },
      {
        heading: 'Your capture date survives the conversion',
        body: 'A HEIC file keeps the capture date, camera model and GPS position in an “Exif” item inside the container, separate from the pixels. Browser converters that hand the image straight to a Canvas get pixels and nothing else, so the JPG comes out with no metadata — this is why converted photos so often land in your library sorted under today’s date instead of the day you took them. This tool reads the Exif item out of the HEIC itself and writes it back into the JPG as an APP1 segment, so the date, camera and exposure settings travel with the file. Two things are deliberately left behind: the embedded thumbnail, and proprietary maker notes, whose internal offsets would be wrong after the move. The Orientation tag is reset to 1 because the decoder has already rotated the pixels upright — copying the original value would make viewers rotate the photo a second time.',
      },
      {
        heading: 'Location data is left out by default',
        body: 'An iPhone photo normally records where it was taken to within a few metres, and that GPS block is copied verbatim by most converters that preserve EXIF — so sharing the JPG shares your home address. The default here, “No location”, keeps the date, camera and exposure settings but rebuilds the EXIF block without the GPS directory, so the coordinates are not merely hidden from viewers, they are not in the file. Pick “Keep all” when you are archiving your own photos and want the map pin, or “Remove” to publish a JPG with no metadata whatsoever.',
      },
      {
        heading: 'Expect a bigger file, and set quality accordingly',
        body: 'HEVC is roughly twice as efficient as JPEG, so a JPG of the same photo at visually equivalent quality typically lands at 1.5–2.5× the size of the HEIC you started from — that is the price of universal compatibility, not a bug in the conversion. Quality 90 is a sensible default: on a photograph the difference from the original is hard to see, while dropping to 75 usually cuts the file roughly in half again. If you need to hit a specific file-size limit, convert here first and then run the JPG through the image compressor, which can target a size in KB directly.',
      },
    ],
    faq: [
      {
        q: 'Are my photos uploaded to a server?',
        a: 'No. The HEIC is decoded and the JPG is encoded entirely inside your browser, so the photo never leaves your computer or phone. Once the page has loaded you can disconnect from the internet and it still works.',
      },
      {
        q: 'Does the converted JPG keep the date the photo was taken?',
        a: 'Yes. The EXIF block is read out of the HEIC container and written into the JPG as an APP1 segment, so the capture date, camera model and exposure settings are preserved. GPS coordinates are left out unless you choose "Keep all".',
      },
      {
        q: 'Why is the JPG larger than the HEIC?',
        a: 'HEIC uses HEVC compression, which is about twice as efficient as JPEG, so the same photo re-encoded as JPG at comparable quality is typically 1.5–2.5× bigger. Lowering the quality slider to 80–85 brings the size down with little visible difference.',
      },
      {
        q: 'How do I convert HEIC to JPG on Windows?',
        a: 'Open this page in any browser on Windows and drop the files in — no codec or app install is needed, because the HEIC decoder runs as WebAssembly inside the page. That avoids Microsoft’s HEVC Video Extensions, which cost about US$0.99 in the Microsoft Store.',
      },
      {
        q: 'Can I convert a whole batch at once?',
        a: 'Yes. Add as many HEIC files as you like — there is no file count or size limit beyond your device’s memory — and download them individually or all together as a single ZIP.',
      },
      {
        q: 'Why is the first conversion slower in Chrome or Firefox?',
        a: 'Those browsers cannot decode HEIC, so the page downloads a 2 MB WebAssembly build of libheif the first time you add a file. It is cached afterwards, and every later photo converts immediately. Safari on macOS and iOS decodes HEIC natively and never downloads it.',
      },
      {
        q: 'What happens to a Live Photo?',
        a: 'Only the still image converts. A Live Photo is a HEIC paired with a separate .MOV video file, and JPG cannot store motion, so the video part is not included in the result.',
      },
      {
        q: 'How do I stop my iPhone from taking HEIC photos?',
        a: 'Open Settings → Camera → Formats and choose "Most Compatible": the camera then shoots JPEG instead of HEIC. Photos already in your library stay HEIC and still need converting.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'HEIC JPG 변환 — 업로드 없이, 촬영 날짜 유지',
    description:
      '아이폰 HEIC 사진을 브라우저에서 바로 JPG로 변환합니다. 한 장도 수백 장도 가능하고, 업로드·가입·광고가 없습니다. 촬영 날짜와 카메라 정보는 유지하고 위치정보는 빼 줍니다.',
    h1: 'HEIC JPG 변환',
    tagline: '아이폰 HEIC 사진을 업로드 없이 JPG로 바꿉니다. 촬영 날짜도 그대로 남습니다.',
    name: 'HEIC JPG 변환',
    keywords: [
      'heic jpg 변환',
      'heic 변환',
      '아이폰 사진 jpg 변환',
      'heic 파일 열기',
      'heic jpeg 변환',
      'heif 변환',
      '아이폰 사진 확장자 변경',
    ],
    howTo: [
      '.heic 파일을 끌어다 놓거나, 클릭해서 고르거나, Ctrl/⌘ + V로 붙여넣습니다.',
      'JPG 품질(기본 90)을 정하고, 사진 정보(EXIF)를 어떻게 할지 고릅니다.',
      '파일을 올리면 바로 변환됩니다. 목록의 썸네일이 완성된 JPG입니다.',
      '한 장씩 받거나, 전체를 ZIP 하나로 다운로드합니다.',
    ],
    sections: [
      {
        heading: 'HEIC가 안 열리는 이유',
        body: 'HEIC는 HEIF 컨테이너(ISO/IEC 23008-12) 안에 HEVC(H.265)로 압축한 사진을 담은 형식입니다. 2017년 iOS 11부터 아이폰 기본 촬영 형식이 됐습니다. 문제는 HEVC가 운영체제와 별도로 특허 라이선스를 받아야 하는 코덱이라는 점입니다. 그래서 지원이 들쭉날쭉합니다. macOS·iOS의 Safari 17 이상은 HEIC를 그대로 보여 주지만, 크롬·파이어폭스·엣지·오페라는 어떤 운영체제에서도 HEIF를 디코딩하지 못합니다. 윈도우에서는 무료인 HEIF 이미지 확장과 함께 HEVC 비디오 확장이 필요한데, 이 HEVC 확장은 Microsoft Store에서 약 1,500원(US$0.99)에 판매됩니다. JPG로 바꾸면 이 문제가 전부 사라집니다. JPG는 1992년부터 어디서나 열립니다.',
      },
      {
        heading: '촬영 날짜가 그대로 남습니다',
        body: 'HEIC 파일은 촬영 날짜, 카메라 기종, GPS 위치를 사진 데이터와 별도로 컨테이너 안의 "Exif" 항목에 저장합니다. 브라우저에서 Canvas로만 변환하는 도구는 픽셀만 받아 가기 때문에 결과 JPG에는 메타데이터가 하나도 남지 않습니다. 변환한 사진이 앨범에서 촬영일이 아니라 오늘 날짜로 정렬되는 이유가 바로 이것입니다. 이 도구는 HEIC 컨테이너에서 Exif 항목을 직접 읽어 JPG의 APP1 세그먼트로 다시 써 넣습니다. 그래서 촬영 날짜, 기종, 노출 설정이 파일과 함께 따라옵니다. 두 가지는 일부러 버립니다. 내장 썸네일과 제조사 전용 메이커노트인데, 위치를 옮기면 내부 오프셋이 어긋나 깨지기 때문입니다. 방향(Orientation) 태그는 1로 맞춥니다. 디코딩 단계에서 이미 사진을 똑바로 세워 놓았기 때문에, 원래 값을 그대로 복사하면 보는 쪽에서 한 번 더 회전시켜 버립니다.',
      },
      {
        heading: '위치정보는 기본적으로 빼 둡니다',
        body: '아이폰 사진에는 촬영 장소가 보통 몇 미터 오차로 기록됩니다. EXIF를 유지해 주는 변환 도구는 이 GPS 블록까지 그대로 복사하기 때문에, JPG를 그냥 공유하면 집 주소를 함께 공유하는 셈이 됩니다. 이 도구의 기본값인 "위치 제외"는 날짜·기종·노출 설정은 남기고 GPS 디렉터리만 뺀 상태로 EXIF를 다시 만들어 넣습니다. 숨기는 것이 아니라 파일에 아예 없습니다. 내 사진을 보관할 목적이고 지도 위치도 필요하면 "모두 유지"를, 메타데이터가 전혀 없는 JPG가 필요하면 "제거"를 고르면 됩니다.',
      },
      {
        heading: '용량은 커집니다. 품질은 이렇게 잡으세요',
        body: 'HEVC는 JPEG보다 압축 효율이 약 두 배입니다. 그래서 같은 사진을 체감 화질이 비슷한 JPG로 바꾸면 원본 HEIC의 1.5~2.5배 정도가 됩니다. 변환이 잘못된 것이 아니라 어디서나 열리는 형식을 쓰는 대가입니다. 품질 90이 무난한 기본값입니다. 사진에서는 원본과 차이를 알아보기 어렵고, 75까지 내리면 보통 용량이 다시 절반 가까이 줄어듭니다. 지원서 첨부처럼 정해진 용량 제한을 맞춰야 한다면, 여기서 JPG로 바꾼 뒤 이미지 압축 도구에서 KB 단위로 목표 용량을 지정하는 것이 정확합니다.',
      },
    ],
    faq: [
      {
        q: '사진이 서버에 업로드되나요?',
        a: '아니요. HEIC 디코딩과 JPG 인코딩이 모두 브라우저 안에서 일어나므로 사진이 기기 밖으로 나가지 않습니다. 페이지를 한 번 열어 둔 뒤에는 인터넷을 끊어도 동작합니다.',
      },
      {
        q: '변환한 JPG에 촬영 날짜가 남나요?',
        a: '네. HEIC 컨테이너의 EXIF 블록을 읽어 JPG의 APP1 세그먼트에 다시 써 넣기 때문에 촬영 날짜, 카메라 기종, 노출 설정이 유지됩니다. GPS 위치는 "모두 유지"를 고르지 않는 한 빠집니다.',
      },
      {
        q: 'JPG가 원본 HEIC보다 커지는데 정상인가요?',
        a: '정상입니다. HEIC는 JPEG보다 압축 효율이 약 두 배인 HEVC를 쓰기 때문에, 같은 사진을 비슷한 화질의 JPG로 다시 인코딩하면 보통 1.5~2.5배가 됩니다. 품질 슬라이더를 80~85로 내리면 눈에 띄는 차이 없이 용량이 줄어듭니다.',
      },
      {
        q: '윈도우에서 HEIC를 JPG로 바꾸는 방법은?',
        a: '윈도우의 어떤 브라우저에서든 이 페이지를 열고 파일을 올리면 됩니다. HEIC 디코더가 WebAssembly로 페이지 안에서 돌기 때문에 코덱이나 프로그램 설치가 필요 없습니다. Microsoft Store에서 약 1,500원에 파는 HEVC 비디오 확장도 사지 않아도 됩니다.',
      },
      {
        q: '여러 장을 한 번에 변환할 수 있나요?',
        a: '네. 파일 개수나 용량 제한은 없고 기기 메모리만큼 올릴 수 있습니다. 한 장씩 받거나 전체를 ZIP 파일 하나로 내려받을 수 있습니다.',
      },
      {
        q: '크롬에서 첫 변환이 느린 이유는?',
        a: '크롬과 파이어폭스는 HEIC를 디코딩할 수 없어서, 파일을 처음 올릴 때 libheif의 WebAssembly 빌드 약 2MB를 내려받습니다. 그다음부터는 캐시에서 바로 쓰기 때문에 즉시 변환됩니다. macOS·iOS의 Safari는 HEIC를 자체적으로 디코딩해서 이 파일을 아예 내려받지 않습니다.',
      },
      {
        q: 'Live Photo(라이브 포토)는 어떻게 되나요?',
        a: '정지 사진만 변환됩니다. 라이브 포토는 HEIC 파일과 별도의 .MOV 동영상이 한 쌍으로 묶인 형태이고 JPG는 움직임을 담을 수 없어서, 동영상 부분은 결과에 포함되지 않습니다.',
      },
      {
        q: '아이폰이 HEIC로 찍지 않게 하려면?',
        a: '설정 → 카메라 → 포맷에서 "높은 호환성"을 고르면 그다음부터 JPEG로 촬영됩니다. 이미 앨범에 있는 사진은 HEIC 그대로이므로 변환이 필요합니다.',
      },
    ],
    ui: {
      dropTitle: 'HEIC 사진을 끌어다 놓거나, 클릭하거나, 붙여넣으세요',
      dropHint: '.heic, .heif, .hif · 여러 장 가능, 업로드되지 않습니다',
      privacyNote: '사진은 내 기기에서 디코딩·변환됩니다. 어디에도 업로드되지 않습니다.',
      notHeic: 'HEIC 파일이 아닙니다 — JPG·PNG·WebP는 이미지 형식 변환을 이용하세요.',
      unsupported: '디코딩할 수 없는 파일입니다. 손상되었거나 HEIC 이미지가 아닐 수 있습니다.',
      processing: '변환 중…',
      decoderLoading: 'HEIC 디코더를 준비하는 중입니다(약 2MB, 한 번만 내려받습니다). Safari는 이 과정이 없습니다.',
      download: '다운로드',
      downloadAll: '전체 ({n}장) ZIP 다운로드',
      remove: '삭제',
      clear: '모두 지우기',
      quality: 'JPG 품질',
      qualityHint: '90이면 대부분의 사진에서 원본과 차이가 거의 없습니다. 용량을 줄이려면 낮추세요.',
      metadata: '사진 정보(EXIF)',
      metadataNoGps: '위치 제외',
      metadataKeep: '모두 유지',
      metadataStrip: '제거',
      metadataNoGpsHint: '촬영 날짜·카메라·설정은 남기고, GPS 위치만 JPG에서 뺍니다.',
      metadataKeepHint: 'GPS 위치를 포함해 EXIF를 그대로 옮깁니다.',
      metadataStripHint: 'EXIF가 전혀 없는 JPG를 만듭니다. 날짜·카메라·위치 모두 없습니다.',
      dateKept: '촬영일 유지: {date}',
      gpsRemoved: '위치정보 제거',
      noMetadata: '원본에 EXIF가 없습니다.',
      metadataDropped: 'EXIF를 제거했습니다.',
    },
  },
};
