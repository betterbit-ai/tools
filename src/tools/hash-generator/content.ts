import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  modeLabel: 'Input type',
  modeText: 'Text',
  modeFile: 'File',
  algorithmLabel: 'Algorithm',
  algorithmMd5: 'MD5',
  algorithmSha1: 'SHA-1',
  algorithmSha256: 'SHA-256',
  algorithmSha384: 'SHA-384',
  algorithmSha512: 'SHA-512',
  textLabel: 'Text to hash',
  textHint: 'UTF-8 bytes are hashed exactly as entered. Spaces and line endings change the result.',
  textPlaceholder: 'Type or paste text…',
  fileTitle: 'Drop a file here or choose one',
  fileHint: 'Any file type, up to 64 MB. The file stays in this browser tab.',
  clear: 'Clear',
  autosaved: 'Saved only in this browser',
  errorFileSize: 'Files larger than 64 MB are not read, so this tab does not run out of memory.',
  errorFileRead: 'This file could not be read. Check that it is still available, then try again.',
  errorWebCrypto: 'This browser does not provide the Web Crypto API required for this SHA algorithm.',
  md5Warning: 'MD5 is for legacy checksums only. Do not use it for passwords, signatures, or security decisions.',
  digestLabel: 'Hash digest',
  processing: 'Calculating…',
  emptyDigest: 'The hash will appear here.',
  copy: 'Copy',
  copied: 'Copied',
  expectedLabel: 'Expected hash (optional)',
  expectedHint: 'Paste hexadecimal with or without spaces or colon separators.',
  match: 'Match — the selected input has the expected hash.',
  mismatch: 'No match — check the algorithm, input bytes, and published checksum.',
  statInput: 'Input size',
  statDigest: 'Digest size',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'SHA-256 Generator — File & MD5 Hash Check',
    description:
      'Generate SHA-256, MD5, SHA-1, SHA-384, or SHA-512 hashes for text and files locally. Compare a published checksum without uploading it.',
    h1: 'Hash Generator',
    tagline: 'Create and compare text or file checksums locally, without uploading them.',
    name: 'Hash Generator',
    keywords: ['sha256 generator', 'md5 generator', 'file hash', 'checksum calculator', 'sha256 checksum'],
    howTo: [
      'Choose Text or File, then enter text or select the file to check.',
      'Choose the checksum algorithm required by the publisher; SHA-256 is the default.',
      'Copy the lowercase hexadecimal digest, or paste a published digest into Expected hash.',
      'Use the Match result to confirm the selected bytes and expected checksum agree.',
    ],
    sections: [
      {
        heading: 'What bytes are hashed?',
        body: 'A hash is calculated from bytes, not from what text looks like on screen. In Text mode this tool first encodes the exact input as UTF-8. It does not trim spaces, normalize Unicode, or add a final line break. Therefore `hello`, `hello `, and `hello\\n` have different digests. In File mode the original file bytes are read directly; an image, ZIP, or executable is not decoded as text. This distinction is why a downloaded file should be checked in File mode, while a configuration value or API payload is normally checked in Text mode.\n\nThe common hexadecimal form uses two characters per byte. SHA-256 is 32 bytes and therefore 64 hexadecimal characters; SHA-384 is 48 bytes (96 characters), SHA-512 is 64 bytes (128 characters), SHA-1 is 20 bytes (40 characters), and MD5 is 16 bytes (32 characters). The SHA output lengths are specified by NIST FIPS 180-4, while MD5’s 128-bit digest format is specified by RFC 1321.',
      },
      {
        heading: 'Choose a checksum algorithm deliberately',
        body: 'For a new file-integrity workflow, use the same algorithm that the publisher supplies; SHA-256 is the usual modern choice. Web Crypto natively provides SHA-1, SHA-256, SHA-384, and SHA-512, so this tool delegates those digests to the browser. MD5 is included only to match legacy manifests and systems that still publish a 32-character checksum. It is implemented locally because MD5 is intentionally not a Web Crypto digest algorithm.\n\nA matching checksum shows that the bytes you selected produce the same digest as the value you pasted. It does not prove who published that value. Obtain a checksum from an authenticated publisher page or a signed release manifest. Do not use MD5 or SHA-1 for passwords, digital signatures, or attacker-resistant verification: they are compatibility algorithms, not safe password storage methods.',
      },
    ],
    faq: [
      {
        q: 'Does this SHA-256 generator upload my text or file?',
        a: 'No. Text is encoded and hashed in the browser, and a selected file is read from the device by this browser tab. This tool has no server endpoint for the text, file, or checksum value.',
      },
      {
        q: 'Why does my SHA-256 hash differ from a command-line result?',
        a: 'Different bytes always produce a different SHA-256 digest. Check for a final newline added by `echo`, CRLF versus LF line endings, invisible spaces, a UTF-8 BOM, or a different text encoding. The 64-character hexadecimal SHA-256 value here is for the exact UTF-8 text shown.',
      },
      {
        q: 'How long is a SHA-256 hash?',
        a: 'A SHA-256 digest is always 256 bits, which is 32 bytes or 64 hexadecimal characters, whether the input is empty, one character, or a large file.',
      },
      {
        q: 'Can I use the MD5 generator for passwords?',
        a: 'No. MD5 produces a 128-bit, 32-character digest but has known collision weaknesses and is fast to guess. Use a password-hashing scheme designed for passwords, such as Argon2id, bcrypt, or scrypt, with a unique salt.',
      },
      {
        q: 'Can I compare an uppercase or colon-separated checksum?',
        a: 'Yes. The comparison ignores hexadecimal letter case, spaces, newlines, and colon separators, so a 64-character SHA-256 value copied as byte pairs can match the same lowercase uninterrupted digest.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'SHA-256 해시 생성기 — 파일·MD5 체크섬',
    description:
      '텍스트와 파일의 SHA-256·MD5·SHA-1·SHA-384·SHA-512 해시를 브라우저에서 생성하고, 업로드 없이 체크섬을 대조합니다.',
    h1: '해시 생성기',
    tagline: '텍스트·파일 체크섬을 브라우저에서 바로 만들고, 업로드 없이 비교합니다.',
    name: '해시 생성기',
    keywords: ['sha256 생성기', 'SHA-256 해시 생성기', 'md5 생성기', '파일 해시', '체크섬 확인'],
    howTo: [
      '텍스트 또는 파일을 고른 뒤 내용을 입력하거나 확인할 파일을 선택합니다.',
      '배포처가 알려 준 알고리즘을 선택합니다. 새 용도에는 기본값인 SHA-256을 사용합니다.',
      '소문자 16진수 해시를 복사하거나, 공개된 체크섬을 비교할 해시 칸에 붙여 넣습니다.',
      '일치 결과로 선택한 바이트와 체크섬 값이 같은지 확인합니다.',
    ],
    sections: [
      {
        heading: '무엇을 기준으로 해시가 달라지나요?',
        body: '해시는 화면에 보이는 글자가 아니라 바이트를 대상으로 계산합니다. 텍스트 모드에서는 입력한 문자열을 UTF-8 바이트로 바꾸며, 앞뒤 공백을 지우거나 유니코드를 정규화하거나 마지막 줄바꿈을 추가하지 않습니다. 따라서 `hello`, `hello `, `hello\\n`의 해시값은 모두 다릅니다. 파일 모드에서는 이미지·ZIP·실행 파일을 텍스트로 바꾸지 않고 원본 바이트 그대로 읽습니다. 내려받은 설치 파일이나 ISO의 체크섬은 반드시 파일 모드에서 확인해야 하는 이유입니다.\n\n보통 쓰는 16진수 표기는 1바이트를 2글자로 적습니다. SHA-256은 32바이트라 64자리, SHA-384는 48바이트라 96자리, SHA-512는 64바이트라 128자리입니다. SHA-1은 20바이트·40자리이고 MD5는 16바이트·32자리입니다. SHA 계열의 출력 길이는 NIST FIPS 180-4, MD5의 128비트 다이제스트 형식은 RFC 1321에 정의되어 있습니다.',
      },
      {
        heading: '알고리즘은 배포처의 값에 맞춥니다',
        body: '파일이 온전한지 확인할 때는 배포처가 공개한 알고리즘과 같은 알고리즘을 골라야 합니다. 새 무결성 확인에는 SHA-256이 일반적인 선택입니다. 이 도구는 브라우저의 Web Crypto API로 SHA-1·SHA-256·SHA-384·SHA-512를 계산합니다. MD5는 Web Crypto의 표준 다이제스트 목록에 없지만, 아직 32자리 MD5 체크섬을 배포하는 오래된 시스템과 대조할 수 있도록 기기 안에서 별도로 계산합니다.\n\n해시가 일치한다는 것은 선택한 바이트가 붙여 넣은 값과 같은 다이제스트를 만든다는 뜻입니다. 그 값의 게시자가 믿을 만하다는 사실까지 증명하지는 않으므로, HTTPS로 전달된 공식 배포 페이지나 서명된 릴리스 목록에서 체크섬을 가져와야 합니다. MD5와 SHA-1은 비밀번호·전자서명·공격 방지 검증에 사용하면 안 되며, 레거시 호환용 체크섬에만 사용해야 합니다.',
      },
    ],
    faq: [
      {
        q: '파일이나 텍스트가 서버로 업로드되나요?',
        a: '아니요. 텍스트는 현재 브라우저에서 UTF-8로 인코딩해 계산하고, 선택한 파일은 이 브라우저 탭이 기기에서 읽습니다. 이 도구에는 텍스트·파일·체크섬을 받는 서버 전송 기능이 없습니다.',
      },
      {
        q: 'SHA-256 값이 터미널 결과와 다른 이유는 무엇인가요?',
        a: 'SHA-256은 바이트가 한 글자만 달라도 전혀 다른 64자리 값을 만듭니다. `echo`가 넣은 마지막 줄바꿈, Windows CRLF와 LF 차이, 보이지 않는 공백, UTF-8 BOM, 인코딩 차이를 확인하십시오. 이 도구의 텍스트 결과는 화면 입력을 UTF-8로 바꾼 정확한 바이트의 값입니다.',
      },
      {
        q: 'SHA-256 해시값은 몇 자리인가요?',
        a: 'SHA-256 다이제스트는 입력 크기와 무관하게 항상 256비트, 즉 32바이트 또는 16진수 64자리입니다. 빈 입력과 수 GB 파일도 같은 알고리즘을 쓰면 출력 길이는 64자리입니다.',
      },
      {
        q: 'MD5 해시 생성기를 비밀번호에 써도 되나요?',
        a: '안 됩니다. MD5는 128비트·16진수 32자리 값을 만들지만 충돌 취약점이 알려져 있고 추측도 빠릅니다. 비밀번호에는 고유한 솔트와 Argon2id·bcrypt·scrypt처럼 비밀번호용으로 설계된 방식을 사용해야 합니다.',
      },
      {
        q: '대문자나 콜론(:)이 들어간 체크섬도 비교할 수 있나요?',
        a: '네. 비교할 해시에서는 대소문자, 공백, 줄바꿈, 콜론을 무시합니다. 그래서 바이트마다 콜론을 넣은 SHA-256 값도 같은 64자리 소문자 16진수 결과와 비교할 수 있습니다.',
      },
    ],
    ui: {
      modeLabel: '입력 종류',
      modeText: '텍스트',
      modeFile: '파일',
      algorithmLabel: '알고리즘',
      algorithmMd5: 'MD5',
      algorithmSha1: 'SHA-1',
      algorithmSha256: 'SHA-256',
      algorithmSha384: 'SHA-384',
      algorithmSha512: 'SHA-512',
      textLabel: '해시할 텍스트',
      textHint: '입력 그대로 UTF-8 바이트를 계산합니다. 공백과 줄바꿈도 결과에 영향을 줍니다.',
      textPlaceholder: '텍스트를 입력하거나 붙여 넣으세요…',
      fileTitle: '파일을 끌어다 놓거나 선택',
      fileHint: '모든 파일 형식, 최대 64MB. 파일은 이 브라우저 탭 안에서만 처리됩니다.',
      clear: '지우기',
      autosaved: '이 브라우저에만 저장됨',
      errorFileSize: '탭의 메모리 부족을 막기 위해 64MB보다 큰 파일은 읽지 않습니다.',
      errorFileRead: '파일을 읽을 수 없습니다. 파일이 아직 있는지 확인한 뒤 다시 시도하십시오.',
      errorWebCrypto: '이 브라우저에서는 선택한 SHA 알고리즘에 필요한 Web Crypto API를 사용할 수 없습니다.',
      md5Warning: 'MD5는 레거시 체크섬 대조용입니다. 비밀번호, 서명, 보안 판단에는 사용하지 마십시오.',
      digestLabel: '해시 다이제스트',
      processing: '계산 중…',
      emptyDigest: '해시값이 여기에 표시됩니다.',
      copy: '복사',
      copied: '복사됨',
      expectedLabel: '비교할 해시 (선택)',
      expectedHint: '공백이나 콜론으로 구분된 16진수도 붙여 넣을 수 있습니다.',
      match: '일치 — 선택한 입력의 해시가 비교 값과 같습니다.',
      mismatch: '불일치 — 알고리즘, 입력 바이트, 공개 체크섬을 확인하십시오.',
      statInput: '입력 크기',
      statDigest: '다이제스트 크기',
    },
  },
};
