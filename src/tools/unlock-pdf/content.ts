import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a locked PDF here, or click to choose',
  dropHint: 'One PDF up to 100 MB · processed only on this device',
  passwordLabel: 'Current PDF password',
  passwordHint: 'Leave blank to try a file that only has permission restrictions.',
  showPassword: 'Show',
  hidePassword: 'Hide',
  unlock: 'Unlock and download',
  progressReading: 'Unlocking locally: reading your PDF…',
  progressChecking: 'Unlocking locally: checking the PDF and password…',
  progressLoading: 'Unlocking locally: loading the secure PDF engine…',
  progressDecrypting: 'Unlocking locally: removing encryption…',
  progressFinishing: 'Unlocking locally: preparing the download…',
  cancel: 'Cancel',
  cancelled: 'Unlocking cancelled. Your original PDF is still available.',
  remove: 'Remove',
  invalidPdf: "Can't read this file as a PDF.",
  fileSizeLimit: 'This PDF is larger than 100 MB. Try a smaller file so your browser has enough memory to process it.',
  incorrectPassword: "That password didn't unlock this PDF. Check the password and try again.",
  unsupportedEncryption:
    "This PDF uses an encryption method this browser tool can't read. Try the current Acrobat desktop app.",
  timeoutError: 'This PDF took longer than 5 minutes to unlock. Try again after closing other busy tabs.',
  memoryError: 'Your browser ran out of room while processing this PDF. Close other tabs or try a smaller file.',
  unlockFailed: "Couldn't remove this PDF's protection. The file may be damaged or use an unsupported PDF feature.",
  complete: 'Unlocked copy downloaded. The password field has been cleared.',
  permissionNote: 'Use only a PDF you own or are authorized to modify. This tool does not guess or recover passwords.',
  privacyNote:
    'Your PDF and password stay in this browser tab. Nothing is uploaded or stored after the unlocked copy downloads.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Unlock PDF — Remove a Known Password, No Upload',
    description:
      'Remove a PDF password you already know in your browser. Your document and password stay on your device, with no upload, account, or watermark.',
    h1: 'Unlock PDF',
    tagline: 'Remove a password you know from a PDF — locally, with no upload.',
    name: 'Unlock PDF',
    keywords: [
      'unlock pdf',
      'remove pdf password',
      'pdf password remover',
      'decrypt pdf',
      'remove password from pdf',
      'pdf unlocker',
    ],
    howTo: [
      'Drop in a PDF or choose one from your device.',
      'Enter the password currently used to open the PDF. Leave it empty only if you know it has no open password.',
      'Select “Unlock and download.”',
      'Open the downloaded _unlocked.pdf copy; it no longer asks for that password.',
    ],
    sections: [
      {
        heading: 'This removes a password you know — it does not crack one',
        body: 'A PDF can have a document-open password, which a reader requests before showing the file, and separate owner permissions for printing, copying, or editing. This tool asks qpdf, an open-source PDF processor, to decrypt the file using the password you supply and save a new, unencrypted copy. It does not try password lists, guesses, or recovery attacks. If you no longer know the opening password, ask the person or organization that issued the document.',
      },
      {
        heading: 'The file and password do not leave your device',
        body: 'iLovePDF shows an upload stage before unlocking. Smallpdf’s instructions likewise start by uploading the PDF; its Korean page says uploaded files are deleted after 1 hour. Here, qpdf WebAssembly runs in a browser worker: it receives the selected file and password in this tab, creates the unlocked copy, then the worker is discarded. The password field is cleared after a successful download and is never saved to local storage.',
      },
      {
        heading: 'Compatibility and 100 MB browser limit',
        body: 'This tool supports ordinary password-encrypted PDFs that qpdf can decrypt with the supplied password. It accepts one PDF up to 100 MB because browser-based processing holds the source and result in device memory. Progress remains visible during longer work, and Cancel stops the worker without changing the original. The copy preserves the PDF’s pages and content; it removes encryption rather than rasterizing every page. Digital signatures may become invalid whenever a PDF is changed, so keep the original if signature validation matters.',
      },
    ],
    faq: [
      {
        q: 'Can I unlock a PDF if I forgot the password?',
        a: 'No. This tool removes protection only when you provide the current password, and it does not use guessing, brute force, or password recovery. Ask the document sender for the password or another copy.',
      },
      {
        q: 'Are my PDF and password uploaded?',
        a: 'No. The PDF bytes and password are processed in a Web Worker inside your browser tab, and no file or password is sent to a Betterbit server. The password is cleared after a successful download and is not saved in browser storage.',
      },
      {
        q: 'Will the unlocked PDF keep its quality?',
        a: 'Yes. qpdf writes a decrypted PDF copy instead of converting pages to images, so text remains selectable and embedded images are not rasterized. Keep the original too, because modifying a signed PDF can invalidate its digital signature.',
      },
      {
        q: 'Why does the password field allow an empty value?',
        a: 'Some PDFs do not need a password to open but have owner permission restrictions. An empty password lets qpdf try that case; a PDF with an open password still needs its correct password.',
      },
      {
        q: 'Is there a PDF file size limit?',
        a: 'Yes. This tool accepts one PDF up to 100 MB so it can safely hold the source and decrypted output in browser memory. There is no daily usage limit or account requirement.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF 암호 제거 — 비밀번호를 아는 파일, 업로드 없음',
    description:
      '알고 있는 PDF 비밀번호를 브라우저에서 제거하세요. 파일과 비밀번호는 기기에만 남고, 업로드·가입·워터마크가 없습니다.',
    h1: 'PDF 암호 제거',
    tagline: '알고 있는 PDF 비밀번호를 업로드 없이 내 기기에서 제거합니다.',
    name: 'PDF 암호 제거',
    keywords: ['pdf 암호 제거', 'pdf 비밀번호 해제', 'pdf 잠금 해제', 'pdf 비번 풀기', 'pdf 보안 해제', 'unlock pdf'],
    howTo: [
      '잠긴 PDF를 끌어다 놓거나 기기에서 선택합니다.',
      'PDF를 열 때 쓰는 현재 비밀번호를 입력합니다. 열기 비밀번호가 없는 파일만 빈칸으로 시도합니다.',
      '“잠금 해제 및 다운로드”를 선택합니다.',
      '다운로드된 _unlocked.pdf 사본을 열면 기존 비밀번호를 묻지 않습니다.',
    ],
    sections: [
      {
        heading: '아는 비밀번호만 제거합니다',
        body: 'PDF에는 파일을 열 때 묻는 열기 비밀번호와, 인쇄·복사·편집을 제한하는 소유자 권한이 따로 있을 수 있습니다. 이 도구는 사용자가 입력한 비밀번호로 오픈 소스 PDF 처리기 qpdf가 파일을 복호화한 뒤, 암호화 없는 새 사본을 저장하게 합니다. 비밀번호 목록 대입, 추측, 복구 공격은 하지 않습니다. 열기 비밀번호를 모른다면 문서를 보낸 사람이나 기관에 재발급 또는 비밀번호를 요청해야 합니다.',
      },
      {
        heading: '파일과 비밀번호가 기기 밖으로 나가지 않습니다',
        body: 'iLovePDF는 잠금 해제 전에 업로드 단계를 표시합니다. Smallpdf도 PDF를 업로드한 다음 비밀번호를 입력하라고 안내하며, 한국어 페이지에서 업로드한 파일을 1시간 뒤에 삭제한다고 밝힙니다. 이 도구는 브라우저의 WebAssembly 작업자 안에서만 선택한 파일과 비밀번호를 처리하고, 잠금 해제 사본을 만든 뒤 작업자를 종료합니다. 비밀번호는 다운로드에 성공하면 입력란에서 지워지며 로컬 저장소에도 저장하지 않습니다.',
      },
      {
        heading: '호환성 및 100MB 제한',
        body: '입력한 비밀번호로 qpdf가 복호화할 수 있는 일반적인 암호화 PDF를 지원합니다. 브라우저 안에서 원본과 결과 파일을 함께 메모리에 올려야 하므로 한 파일은 100MB까지 받습니다. 처리가 길어져도 진행 단계를 표시하며, 취소하면 원본을 바꾸지 않고 작업자를 종료합니다. 페이지를 이미지로 다시 만드는 방식이 아니라 PDF 내용을 유지한 채 암호화만 제거합니다. PDF를 바꾸면 디지털 서명이 무효가 될 수 있으므로 서명 검증이 중요하다면 원본을 보관하세요.',
      },
    ],
    faq: [
      {
        q: 'PDF 비밀번호를 잊어버렸는데 잠금을 해제할 수 있나요?',
        a: '아니요. 이 도구는 현재 비밀번호를 입력한 경우에만 보호를 제거하며, 비밀번호 추측·무차별 대입·복구를 하지 않습니다. 문서를 보낸 사람에게 비밀번호나 새 사본을 요청하세요.',
      },
      {
        q: 'PDF와 비밀번호가 서버에 업로드되나요?',
        a: '아니요. PDF 바이트와 비밀번호는 브라우저 탭 안의 Web Worker에서 처리되며 Betterbit 서버로 전송되지 않습니다. 잠금 해제 사본을 다운로드하면 비밀번호 입력란은 비워지고 브라우저 저장소에도 저장되지 않습니다.',
      },
      {
        q: '잠금 해제하면 PDF 화질이 떨어지나요?',
        a: '아니요. qpdf는 페이지를 이미지로 변환하지 않고 복호화된 PDF 사본을 쓰므로 텍스트 선택과 포함된 이미지가 유지됩니다. 다만 PDF를 수정하면 디지털 서명이 무효가 될 수 있으니 원본도 보관하세요.',
      },
      {
        q: '비밀번호를 비워 둬도 되는 이유는 무엇인가요?',
        a: '열기 비밀번호는 없지만 소유자 권한 제한만 있는 PDF가 있기 때문입니다. 빈 비밀번호로 그 경우를 시도할 수 있지만, 열 때 비밀번호를 묻는 PDF는 올바른 비밀번호가 반드시 필요합니다.',
      },
      {
        q: 'PDF 파일 크기 제한이 있나요?',
        a: '네. 브라우저 메모리에 원본과 복호화 결과를 함께 처리할 수 있도록 PDF 1개를 100MB까지 지원합니다. 일일 사용 횟수나 계정 요구는 없습니다.',
      },
    ],
    ui: {
      dropTitle: '잠긴 PDF를 끌어다 놓거나 클릭해서 선택하세요',
      dropHint: 'PDF 1개 · 최대 100MB · 내 기기에서만 처리',
      passwordLabel: '현재 PDF 비밀번호',
      passwordHint: '열기 비밀번호 없이 권한만 제한된 파일이면 비워 둔 채 시도하세요.',
      showPassword: '표시',
      hidePassword: '숨기기',
      unlock: '잠금 해제 및 다운로드',
      progressReading: '기기에서 잠금 해제 중: PDF 읽는 중…',
      progressChecking: '기기에서 잠금 해제 중: PDF와 비밀번호 확인 중…',
      progressLoading: '기기에서 잠금 해제 중: PDF 처리 엔진 불러오는 중…',
      progressDecrypting: '기기에서 잠금 해제 중: 암호화 제거 중…',
      progressFinishing: '기기에서 잠금 해제 중: 다운로드 준비 중…',
      cancel: '취소',
      cancelled: '잠금 해제를 취소했습니다. 원본 PDF는 그대로 남아 있습니다.',
      remove: '삭제',
      invalidPdf: 'PDF 파일로 읽을 수 없습니다.',
      fileSizeLimit: 'PDF가 100MB보다 큽니다. 브라우저 메모리에서 처리할 수 있도록 더 작은 파일을 사용하세요.',
      incorrectPassword: '이 비밀번호로 PDF를 열 수 없습니다. 비밀번호를 확인한 뒤 다시 시도하세요.',
      unsupportedEncryption:
        '이 PDF의 암호화 방식은 브라우저 도구에서 읽을 수 없습니다. 최신 Acrobat 데스크톱 앱을 사용해 보세요.',
      timeoutError: '5분 안에 PDF 잠금 해제가 끝나지 않았습니다. 다른 작업 중인 탭을 닫고 다시 시도하세요.',
      memoryError: 'PDF를 처리하는 동안 브라우저 메모리가 부족해졌습니다. 다른 탭을 닫거나 더 작은 파일을 사용하세요.',
      unlockFailed: 'PDF 보호를 제거하지 못했습니다. 파일이 손상되었거나 지원하지 않는 PDF 기능을 쓸 수 있습니다.',
      complete: '잠금 해제 사본을 다운로드했습니다. 비밀번호 입력란은 비워졌습니다.',
      permissionNote:
        '본인이 소유하거나 수정 권한이 있는 PDF만 사용하세요. 이 도구는 비밀번호를 추측하거나 복구하지 않습니다.',
      privacyNote:
        'PDF와 비밀번호는 이 브라우저 탭 안에만 머뭅니다. 잠금 해제 사본을 내려받은 뒤 어디에도 업로드하거나 저장하지 않습니다.',
    },
  },
};
