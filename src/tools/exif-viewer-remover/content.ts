import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop photos here',
  dropHint: 'JPG, PNG, or WebP · multiple files welcome · paste with Ctrl/⌘+V',
  privacyNote: 'Files are read and cleaned only in this browser. Nothing is uploaded.',
  unsupported: 'Use a valid JPG, PNG, or WebP image.',
  cleanError: 'Could not create a clean copy. Keep the original and try another image.',
  zipError: 'Could not create the ZIP. Your cleaned files are still available one by one.',
  batchLimit: 'Up to {n} photos can be kept in one batch. Extra files were not added.',
  remove: 'Remove',
  clear: 'Clear all',
  cancel: 'Cancel',
  cancelled: 'Cleaning cancelled.',
  zipCancelled: 'ZIP preparation cancelled.',
  processing: 'Reading…',
  cleanProgress: 'Cleaning {current} of {total}…',
  zipProgress: 'Preparing ZIP {current} of {total}…',
  ready: 'Ready to clean',
  clean: 'Remove metadata',
  cleanAll: 'Clean {n} photos',
  download: 'Download clean copy',
  downloadAll: 'Download ZIP ({n})',
  metadataFound: 'Metadata found',
  noMetadata: 'No removable metadata found',
  cleaned: 'Metadata removed',
  fileLabel: 'File',
  gpsLabel: 'GPS location',
  formatLabel: 'Format',
  beforeLabel: 'Before',
  afterLabel: 'After',
  tagLabel: 'Detected data',
  cleanNote: 'A new copy is created; your original stays unchanged.',
  resultNote: 'Each clean copy contains no removable metadata detected by this tool.',
  privateNames: 'Use private download names',
  privateNamesHint:
    'Uses private-image-01.jpg instead of the original filename. Turn this off to keep a cleaned version of the source name.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Remove EXIF Data — View and Clean Photos Locally',
    description:
      'Remove EXIF, GPS, and photo metadata from JPG, PNG, and WebP files in your browser. Scan a batch first, then download clean copies without uploading.',
    h1: 'EXIF Viewer & Remover',
    tagline: 'Check what a photo reveals, then remove its metadata locally in one file or a batch.',
    name: 'EXIF Viewer & Remover',
    keywords: [
      'remove exif',
      'exif remover',
      'photo metadata remover',
      'remove gps from photo',
      'image metadata viewer',
    ],
    howTo: [
      'Drop or paste JPG, PNG, or WebP photos.',
      'Review the detected camera, date, and GPS data.',
      'Select Remove metadata.',
      'Download each clean copy or all copies as a ZIP.',
    ],
    sections: [
      {
        heading: 'What this tool removes',
        body: 'For JPEG files, the cleaner removes APP1 (EXIF/XMP), APP13 (IPTC), comment segments, and bytes after the end-of-image marker. For PNG it removes eXIf, text, and time chunks; for WebP it removes EXIF and XMP chunks and their container flags. The encoded image data is copied instead of being redrawn, so supported JPG, PNG, and WebP pixels are not recompressed. A batch holds up to 50 photos and processes them one at a time to bound memory use. The downloaded copy gets a neutral name by default because filenames can reveal personal details too.',
      },
      {
        heading: 'What EXIF data can reveal',
        body: 'A camera or phone can save the capture time, camera make and model, lens settings, software, and GPS coordinates in an image file. GPS coordinates can point to a precise place even when the place is not visible in the picture. This tool shows the common camera, date, and GPS fields it can read before making a separate clean copy.',
      },
      {
        heading: 'Check the downloaded copy before sharing',
        body: 'Removing metadata does not hide an address, face, vehicle number, or watermark visible in the pixels. Keep the original for your records and inspect the downloaded copy again if the sharing context is sensitive. Unsupported formats are not converted, so this tool never makes a surprise format or quality change.',
      },
    ],
    faq: [
      {
        q: 'Does removing EXIF reduce photo quality?',
        a: 'For supported JPG, PNG, and WebP files, this tool removes metadata containers at the byte level and copies the encoded image data unchanged, so it does not recompress the visible pixels.',
      },
      {
        q: 'Can EXIF metadata include a photo location?',
        a: 'EXIF GPS tags can contain latitude and longitude, which can reveal where a photo was taken. The scanner reports readable GPS coordinates before a clean copy is downloaded.',
      },
      {
        q: 'Are my photos uploaded when I remove EXIF?',
        a: 'No. Reading, scanning, and cleaning run in the current browser tab, and the selected files are not sent to a server.',
      },
      {
        q: 'Which photo formats can this EXIF remover clean?',
        a: 'This tool cleans JPG/JPEG, PNG, and WebP metadata containers. It rejects other formats instead of converting them, so there is no unexpected format or quality change.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '사진 위치정보 삭제 — EXIF 확인·제거, 업로드 없음',
    description:
      'JPG·PNG·WebP 사진의 위치정보, EXIF, 메타데이터를 브라우저에서 확인하고 삭제합니다. 여러 장을 먼저 검사한 뒤 업로드 없이 새 파일을 받으세요.',
    h1: '사진 위치정보·EXIF 확인 및 삭제',
    tagline: '사진에 남은 촬영 정보와 GPS를 확인하고, 원본은 그대로 둔 채 새 파일에서 지웁니다.',
    name: '사진 위치정보·EXIF 삭제',
    keywords: ['사진 위치정보 삭제', '사진 exif 삭제', '사진 메타데이터 삭제', 'gps 위치정보 제거', 'exif 보는 법'],
    howTo: [
      'JPG, PNG, WebP 사진을 끌어 놓거나 붙여넣습니다.',
      '감지된 카메라·날짜·GPS 정보를 확인합니다.',
      '메타데이터 삭제를 선택합니다.',
      '정리된 파일 또는 ZIP 파일을 다운로드합니다.',
    ],
    sections: [
      {
        heading: '어떤 정보를 지우나요?',
        body: 'JPEG에서는 APP1(EXIF/XMP), APP13(IPTC), 주석 세그먼트와 이미지 종료 표시 뒤의 데이터를 제거합니다. PNG에서는 eXIf·텍스트·시간 청크를, WebP에서는 EXIF·XMP 청크와 해당 컨테이너 표시를 제거합니다. JPG·PNG·WebP의 압축된 이미지 데이터는 다시 인코딩하지 않고 그대로 복사합니다. 메모리 사용량을 제한하기 위해 한 번에 최대 50장을 보관하고 한 장씩 처리합니다.',
      },
      {
        heading: '사진 위치정보이란 무엇인가요?',
        body: '휴대폰이나 카메라는 촬영 시각, 기기 제조사·모델, 렌즈 정보, 편집 프로그램, GPS 위도·경도를 사진 파일에 저장할 수 있습니다. GPS 좌표는 사진 안에 장소가 보이지 않아도 촬영 위치를 드러낼 수 있습니다. 이 도구는 읽을 수 있는 카메라·날짜·GPS 필드를 새 파일을 만들기 전에 보여 줍니다.',
      },
      {
        heading: '공유 전 새 파일을 다시 확인하세요',
        body: '메타데이터를 지워도 사진에 보이는 집 주소, 얼굴, 차량 번호, 워터마크는 가려지지 않습니다. 원본은 보관하고, 민감한 사진이라면 다운로드한 새 파일을 다시 검사한 뒤 공유하세요. 지원하지 않는 형식은 변환하지 않으므로, 뜻하지 않게 형식이나 화질이 바뀌지 않습니다.',
      },
    ],
    faq: [
      {
        q: 'EXIF를 지우면 사진 화질이 떨어지나요?',
        a: '지원하는 JPG, PNG, WebP 파일은 메타데이터 컨테이너만 바이트 단위로 제거하고 압축된 이미지 데이터는 그대로 복사하므로, 보이는 픽셀을 다시 압축하지 않습니다.',
      },
      {
        q: '사진 위치정보에는 무엇이 들어 있나요?',
        a: 'EXIF GPS 태그에는 위도와 경도가 들어갈 수 있으며, 사진 속에 장소가 보이지 않아도 촬영 위치가 드러날 수 있습니다. 이 도구는 읽을 수 있는 GPS 좌표를 새 파일 생성 전에 표시합니다.',
      },
      {
        q: '사진이 서버로 업로드되나요?',
        a: '아닙니다. 사진 읽기, 검사, 정리는 현재 브라우저 탭 안에서 실행되며 선택한 파일은 서버로 전송되지 않습니다.',
      },
      {
        q: '어떤 형식의 사진에서 EXIF를 지울 수 있나요?',
        a: 'JPG/JPEG, PNG, WebP의 메타데이터 컨테이너를 정리합니다. 다른 형식은 예기치 않은 변환이나 화질 변화를 막기 위해 변환하지 않고 거부합니다.',
      },
    ],
    ui: {
      dropTitle: '사진을 여기에 끌어 놓으세요',
      dropHint: 'JPG, PNG, WebP · 여러 장 가능 · Ctrl/⌘+V로 붙여넣기',
      privacyNote: '파일은 이 브라우저 안에서만 읽고 정리합니다. 업로드하지 않습니다.',
      unsupported: '올바른 JPG, PNG, WebP 이미지를 사용하세요.',
      cleanError: '정리된 파일을 만들 수 없습니다. 원본은 보관하고 다른 이미지로 다시 시도하세요.',
      zipError: 'ZIP 파일을 만들 수 없습니다. 정리된 파일은 한 장씩 계속 다운로드할 수 있습니다.',
      batchLimit: '한 번에 사진을 최대 {n}장까지 보관할 수 있습니다. 초과 파일은 추가하지 않았습니다.',
      remove: '삭제',
      clear: '모두 비우기',
      cancel: '취소',
      cancelled: '사진 정리를 취소했습니다.',
      zipCancelled: 'ZIP 준비를 취소했습니다.',
      processing: '읽는 중…',
      cleanProgress: '{total}장 중 {current}번째 정리 중…',
      zipProgress: '{total}장 중 {current}번째 ZIP 준비 중…',
      ready: '정리 준비 완료',
      clean: '메타데이터 삭제',
      cleanAll: '사진 {n}장 정리',
      download: '정리된 파일 다운로드',
      downloadAll: 'ZIP 다운로드 ({n})',
      metadataFound: '메타데이터 감지',
      noMetadata: '삭제할 메타데이터 없음',
      cleaned: '메타데이터 삭제 완료',
      fileLabel: '파일',
      gpsLabel: 'GPS 위치',
      formatLabel: '형식',
      beforeLabel: '정리 전',
      afterLabel: '정리 후',
      tagLabel: '감지된 정보',
      cleanNote: '원본은 바꾸지 않고 새 파일을 만듭니다.',
      resultNote: '각 새 파일에는 이 도구가 감지하는 삭제 대상 메타데이터가 없습니다.',
      privateNames: '개인정보 보호용 파일명 사용',
      privateNamesHint: '원본 파일명 대신 private-image-01.jpg처럼 저장합니다. 원본 파일명에 -clean을 붙이려면 끄세요.',
    },
  },
};
