import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  dropTitle: 'Drop a PDF here, or click to choose',
  dropHint: 'One PDF up to 100 MB · encrypted only on this device',
  passwordLabel: 'Password to open the PDF',
  passwordHint: 'Choose a password you can share separately with recipients.',
  confirmPasswordLabel: 'Confirm password',
  confirmPasswordHint: 'Enter the exact same password again.',
  passwordMismatch: 'The passwords do not match.',
  showPassword: 'Show',
  hidePassword: 'Hide',
  protect: 'Protect and download',
  progressReading: 'Encrypting locally: reading PDF…',
  progressChecking: 'Encrypting locally: checking PDF…',
  progressLoading: 'Encrypting locally: loading encryption engine…',
  progressEncrypting: 'Encrypting locally: protecting PDF…',
  progressFinishing: 'Encrypting locally: preparing download…',
  cancel: 'Cancel',
  cancelled: 'Encryption cancelled. Your original PDF is still available.',
  remove: 'Remove',
  invalidPdf: "Can't read this file as a PDF.",
  fileSizeLimit: 'This PDF is larger than 100 MB. Try a smaller file so your browser has enough memory to protect it.',
  encryptedPdf:
    'This PDF already needs a password to open. Remove its existing password first, then protect the new copy.',
  memoryError: 'Your browser ran out of room while processing this PDF. Close other tabs or try a smaller file.',
  timeoutError: 'Encryption took longer than 5 minutes. Keep the original PDF and try again after closing other tabs.',
  protectFailed: "Couldn't protect this PDF. The file may be damaged or use an unsupported PDF feature.",
  complete: 'Password-protected copy downloaded. Both password fields have been cleared.',
  compatibilityNote: 'Creates an AES-256 password required to open the downloaded copy.',
  privacyNote:
    'Your PDF and password stay in this browser tab. Nothing is uploaded or saved after the protected copy downloads.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Password Protect PDF — AES-256, No Upload',
    description:
      'Password-protect a PDF with AES-256 encryption in your browser. Your file and password stay on your device, with no upload or account.',
    h1: 'Password Protect PDF',
    tagline: 'Add an opening password to one PDF locally — no upload or account needed.',
    name: 'Protect PDF',
    keywords: [
      'password protect pdf',
      'protect pdf',
      'lock pdf',
      'add password to pdf',
      'encrypt pdf',
      'pdf password protector',
    ],
    howTo: [
      'Drop in a PDF or choose one from your device.',
      'Enter the password people must use to open the downloaded copy, then enter it again exactly.',
      'Select “Protect and download.”',
      'Share the password separately from the _protected.pdf file.',
    ],
    sections: [
      {
        heading: 'This sets a password to open the PDF',
        body: 'The downloaded copy asks for the password before a compatible PDF reader displays its contents. This tool uses qpdf WebAssembly to create AES-256 encryption, the encryption choice qpdf recommends instead of legacy 40-bit or non-AES 128-bit protection. It does not add “do not print” or “do not copy” controls: reader-enforced permission restrictions are not reliable content protection, while an opening password encrypts the document itself.',
      },
      {
        heading: 'Your document and password do not leave this browser tab',
        body: 'Adobe’s online tool says files are handled by Adobe servers. iLovePDF shows upload speed and a “Protecting PDF…” server-processing stage; Smallpdf’s Korean page says uploaded files are deleted after 1 hour. Here, the selected PDF and the password are sent only to a Web Worker in this browser. They are never uploaded to Betterbit, the password fields are cleared after download, and neither value is stored in browser storage.',
      },
      {
        heading: 'AES-256 compatibility and the 100 MB limit',
        body: 'AES-256 PDF encryption requires a reader that supports PDF 1.7 with extension level 8 or newer PDF encryption. Current Acrobat and modern browser or desktop PDF readers are usually suitable; very old readers may not open the protected copy. One PDF up to 100 MB is accepted because browser processing holds both the source and encrypted result in device memory. The visible stages continue in a Web Worker if you switch tabs, and Cancel stops that worker without discarding the original. Keep the original: creating a protected copy changes the file and can invalidate an existing digital signature.',
      },
    ],
    faq: [
      {
        q: 'Are my PDF and password uploaded?',
        a: 'No. This tool encrypts the selected PDF in a Web Worker inside your browser tab. No PDF bytes or password are sent to a Betterbit server, and the password is not saved in browser storage.',
      },
      {
        q: 'What encryption does this password-protect PDF tool use?',
        a: 'The downloaded copy uses AES-256 PDF encryption and asks for the password before its contents are displayed. AES-256 encrypted PDFs require a reader that supports PDF 1.7 extension level 8 or a newer compatible PDF encryption format.',
      },
      {
        q: 'Can I stop someone from printing or copying a protected PDF?',
        a: 'This tool protects opening the document with a password; it does not add printing or copying restrictions. PDF readers do not consistently enforce those restrictions, so they should not be treated as a way to prevent recipients from copying content they can view.',
      },
      {
        q: 'What happens if I forget the password?',
        a: 'The password is required to open the encrypted copy and is not stored by this tool, so keep it in a password manager or another secure place. Keep the unprotected original in a secure location if you may need to create a new protected copy later.',
      },
      {
        q: 'Can I protect a PDF that already has a password?',
        a: 'This tool accepts an unprotected PDF. If the file already asks for a password, first use the PDF password removal tool with the current password, then protect the resulting copy with the new password.',
      },
      {
        q: 'Is there a PDF file size limit?',
        a: 'Yes. This tool accepts one PDF up to 100 MB so the browser can safely keep both the source and encrypted output in memory. There is no account requirement or daily usage limit.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'PDF 암호 설정 — AES-256, 업로드 없음',
    description:
      '브라우저에서 PDF에 AES-256 비밀번호를 설정하세요. 파일과 비밀번호는 기기에만 남으며 업로드·가입이 없습니다.',
    h1: 'PDF 암호 설정',
    tagline: 'PDF 1개에 열기 비밀번호를 설정하고 바로 내려받습니다. 파일은 업로드하지 않습니다.',
    name: 'PDF 암호 설정',
    keywords: ['pdf 암호 설정', 'pdf 비밀번호 설정', 'pdf 잠금', 'pdf 비번 설정', 'pdf 암호화', 'password protect pdf'],
    howTo: [
      'PDF를 끌어다 놓거나 기기에서 선택합니다.',
      '다운로드할 사본을 열 때 사용할 비밀번호를 입력하고 똑같이 한 번 더 입력합니다.',
      '“암호 설정 및 다운로드”를 선택합니다.',
      '_protected.pdf 파일과 비밀번호는 서로 다른 방법으로 전달합니다.',
    ],
    sections: [
      {
        heading: 'PDF를 열 때 필요한 비밀번호를 설정합니다',
        body: '다운로드한 사본은 호환되는 PDF 뷰어에서 내용을 표시하기 전에 비밀번호를 묻습니다. 이 도구는 qpdf WebAssembly로 AES-256 암호화를 적용합니다. qpdf는 오래된 40비트 방식이나 AES가 아닌 128비트 방식 대신 256비트 암호화를 권장합니다. 인쇄 금지나 복사 금지 옵션은 넣지 않았습니다. PDF 뷰어가 권한 제한을 항상 지키는 것은 아니지만, 열기 비밀번호는 문서 내용을 암호화합니다.',
      },
      {
        heading: '파일과 비밀번호는 이 브라우저 탭 밖으로 나가지 않습니다',
        body: 'Adobe 온라인 도구는 파일을 Adobe 서버에서 처리한다고 안내합니다. iLovePDF는 업로드 속도와 “PDF 보호 중” 처리 단계를 표시하고, Smallpdf 한국어 페이지는 업로드한 파일을 1시간 뒤에 삭제한다고 밝힙니다. 이 도구는 선택한 PDF와 비밀번호를 이 브라우저의 Web Worker 안에서만 처리합니다. Betterbit 서버로 업로드하지 않으며, 다운로드가 끝나면 비밀번호 입력란을 비우고 브라우저 저장소에도 남기지 않습니다.',
      },
      {
        heading: 'AES-256 호환성 및 100MB 제한',
        body: 'AES-256으로 암호화한 PDF를 열려면 PDF 1.7 확장 레벨 8 이상 암호화를 지원하는 뷰어가 필요합니다. 최신 Acrobat과 최신 브라우저·데스크톱 PDF 뷰어는 대체로 적합하지만, 오래된 뷰어에서는 열리지 않을 수 있습니다. 브라우저 메모리에 원본과 암호화 결과를 함께 올리므로 PDF 1개는 100MB까지 받습니다. 진행 단계는 다른 탭으로 이동해도 Web Worker에서 계속되며, 취소하면 원본을 버리지 않고 작업 Worker만 종료합니다. 암호화 사본을 만들면 파일이 바뀌어 기존 디지털 서명이 무효가 될 수 있으니 원본을 보관하세요.',
      },
    ],
    faq: [
      {
        q: 'PDF와 비밀번호가 서버에 업로드되나요?',
        a: '아니요. 선택한 PDF는 브라우저 탭 안의 Web Worker에서 암호화하며 PDF 바이트와 비밀번호를 Betterbit 서버로 전송하지 않습니다. 비밀번호는 브라우저 저장소에도 저장하지 않습니다.',
      },
      {
        q: '이 PDF 암호 설정 도구는 어떤 암호화를 사용하나요?',
        a: '다운로드한 사본에는 AES-256 PDF 암호화가 적용되며 내용을 표시하기 전에 비밀번호를 묻습니다. AES-256 PDF는 PDF 1.7 확장 레벨 8 이상 또는 호환되는 최신 PDF 암호화를 지원하는 뷰어에서 열 수 있습니다.',
      },
      {
        q: '암호를 걸면 인쇄나 복사를 막을 수 있나요?',
        a: '이 도구는 문서를 열 때 필요한 비밀번호를 설정하며 인쇄·복사 제한은 추가하지 않습니다. PDF 뷰어가 그런 권한 제한을 일관되게 강제하지 않으므로, 내용을 볼 수 있는 사람이 복사하지 못하게 하는 수단으로 믿으면 안 됩니다.',
      },
      {
        q: 'PDF 비밀번호를 잊어버리면 어떻게 하나요?',
        a: '이 도구는 비밀번호를 저장하지 않으므로 비밀번호 관리자 등 안전한 곳에 보관해야 합니다. 나중에 새 암호화 사본이 필요할 수 있으므로 암호를 설정하지 않은 원본도 안전한 위치에 보관하세요.',
      },
      {
        q: '이미 비밀번호가 걸린 PDF에도 새 비밀번호를 설정할 수 있나요?',
        a: '이 도구는 암호가 설정되지 않은 PDF를 받습니다. 이미 열기 비밀번호가 있는 파일은 현재 비밀번호를 알고 있을 때 PDF 암호 제거 도구로 먼저 해제한 후, 새 비밀번호로 다시 설정하세요.',
      },
      {
        q: 'PDF 파일 크기 제한이 있나요?',
        a: '네. 브라우저 메모리에서 원본과 암호화 결과를 안전하게 함께 처리할 수 있도록 PDF 1개를 100MB까지 지원합니다. 계정이나 일일 사용 횟수 제한은 없습니다.',
      },
    ],
    ui: {
      dropTitle: 'PDF를 끌어다 놓거나 클릭해서 선택하세요',
      dropHint: 'PDF 1개 · 최대 100MB · 내 기기에서만 암호화',
      passwordLabel: 'PDF 열기 비밀번호',
      passwordHint: '받는 사람에게 별도로 전달할 비밀번호를 정하세요.',
      confirmPasswordLabel: '비밀번호 확인',
      confirmPasswordHint: '같은 비밀번호를 한 번 더 정확히 입력하세요.',
      passwordMismatch: '비밀번호가 서로 다릅니다.',
      showPassword: '표시',
      hidePassword: '숨기기',
      protect: '암호 설정 및 다운로드',
      progressReading: '기기에서 암호화 중: PDF 읽는 중…',
      progressChecking: '기기에서 암호화 중: PDF 확인하는 중…',
      progressLoading: '기기에서 암호화 중: 암호화 엔진 불러오는 중…',
      progressEncrypting: '기기에서 암호화 중: PDF 보호하는 중…',
      progressFinishing: '기기에서 암호화 중: 다운로드 준비 중…',
      cancel: '취소',
      cancelled: '암호화를 취소했습니다. 원본 PDF는 그대로 사용할 수 있습니다.',
      remove: '삭제',
      invalidPdf: 'PDF 파일로 읽을 수 없습니다.',
      fileSizeLimit: 'PDF가 100MB보다 큽니다. 브라우저 메모리에서 처리할 수 있도록 더 작은 파일을 사용하세요.',
      encryptedPdf: '이미 열기 비밀번호가 설정된 PDF입니다. 기존 비밀번호를 먼저 제거한 뒤 새 사본을 보호하세요.',
      memoryError: 'PDF를 처리하는 동안 브라우저 메모리가 부족해졌습니다. 다른 탭을 닫거나 더 작은 파일을 사용하세요.',
      timeoutError: '암호화가 5분 안에 끝나지 않았습니다. 원본 PDF를 보관하고 다른 탭을 닫은 뒤 다시 시도하세요.',
      protectFailed: 'PDF에 암호를 설정하지 못했습니다. 파일이 손상되었거나 지원하지 않는 PDF 기능을 쓸 수 있습니다.',
      complete: '비밀번호가 설정된 사본을 다운로드했습니다. 두 비밀번호 입력란은 비워졌습니다.',
      compatibilityNote: '다운로드한 사본을 열 때 필요한 AES-256 비밀번호를 만듭니다.',
      privacyNote:
        'PDF와 비밀번호는 이 브라우저 탭 안에만 머뭅니다. 암호화 사본을 내려받은 뒤 어디에도 업로드하거나 저장하지 않습니다.',
    },
  },
};
