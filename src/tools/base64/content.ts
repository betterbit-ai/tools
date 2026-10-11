import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  modeLabel: 'Mode',
  modeEncode: 'Encode',
  modeDecode: 'Decode',
  variantLabel: 'Alphabet',
  variantStandard: 'Standard (+/)',
  variantUrl: 'URL-safe (-_)',
  paddingLabel: 'Padding (=)',
  inputLabelEncode: 'Text or file to encode',
  inputLabelDecode: 'Base64 to decode',
  openFileEncode: 'Open a file to encode',
  openFileDecode: 'Open a .txt file to decode',
  openFileHint: 'Drop a file, click to browse, or paste with Ctrl/Cmd+V',
  clear: 'Clear',
  placeholderEncode: 'Type or paste text to encode…',
  placeholderDecode: 'Paste Base64 to decode…',
  autosaved: 'Saved in this browser only',
  outputLabel: 'Result',
  copy: 'Copy',
  copied: 'Copied',
  downloadText: 'Download .txt',
  downloadFile: 'Download file',
  errorInvalidCharacter: 'Invalid character "{char}" at position {index} — it isn’t part of the Base64 alphabet.',
  errorInvalidLength:
    "This Base64 is the wrong length — one leftover character can't be decoded (6 bits isn't enough for a byte).",
  errorInvalidPadding:
    'Invalid padding at position {index} — "=" may only appear at the end, at most twice, with nothing after it but more "=".',
  errorInvalidUtf8: "These bytes aren't valid UTF-8 text.",
  notUtf8: "Decoded successfully, but the result isn't valid UTF-8 text — download it as a file instead.",
  emptyOutput: 'The result will appear here.',
  statInputSize: 'Input size',
  statOutputSize: 'Output size',
  statOverhead: 'Size change',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Base64 Encode & Decode — URL-Safe, Files Supported',
    description:
      'Encode or decode Base64 text and files in your browser. URL-safe (-_) is auto-detected on decode, with the exact error position if input is invalid. No uploads, no ads.',
    h1: 'Base64 Encode & Decode',
    tagline: 'Convert text and files to Base64 and back — URL-safe, offline-capable, nothing leaves your browser.',
    name: 'Base64 Encode/Decode',
    keywords: ['base64 decode', 'base64 encode', 'base64 to text', 'base64 to file', 'url safe base64', 'base64url'],
    howTo: [
      'Choose Encode to turn text or a file into Base64, or Decode to turn Base64 back into text or a file.',
      "Paste text, or drop/click to open a file — up to 200,000 characters of text are saved in this browser so you don't lose your place.",
      'For encoding, pick Standard (+/) or URL-safe (-_) output, and toggle padding (=) on or off.',
      'Decoding accepts standard and URL-safe Base64 automatically, even mixed together or wrapped across multiple lines.',
      'Copy the result, or download it as a .txt (encode) or decoded file (decode).',
    ],
    sections: [
      {
        heading: 'Standard vs. URL-safe Base64',
        body: 'RFC 4648 defines two alphabets. Standard Base64 (section 4) uses + and / for its last two characters and is the form used in email (MIME) and most data: URIs. URL-safe Base64 (section 5), often called base64url, swaps those for - and _ so the output can go straight into a URL path, query string, filename or JSON Web Token (JWT) without percent-encoding.\n\nPadding with = is optional in both, and many URL-safe contexts — JWTs included — omit it entirely because = has a reserved meaning in URLs. This tool lets you choose either alphabet when encoding, and decodes both automatically, even mixed together, without asking you to pick one first.',
      },
      {
        heading: "Why decoding here won't silently fail",
        body: "Base64 input is invalid in exactly a few ways: a character outside the 64-symbol alphabet (plus - and _ for URL-safe), a '=' padding character followed by anything other than more '=' signs, more than two padding characters, or a length that leaves a single leftover character — 6 bits, which can never form a full byte.\n\nMany online decoders either show a generic \"invalid input\" message or silently return garbled bytes. This tool checks for each of these cases and reports the exact character and position that broke decoding, and tells you plainly if the decoded bytes aren't valid UTF-8 text, so you know to download them as a file instead of reading them as text.",
      },
      {
        heading: 'Files, not just text',
        body: 'Dropping a file while encoding reads its raw bytes — any file type, not only images — and Base64-encodes them exactly like a data: URI or an email attachment would. Decoding always produces a byte-for-byte result you can download, whether or not it happens to be valid UTF-8 text; when it is, you can also read and copy it as text.\n\nNothing is uploaded anywhere: encoding and decoding both run in this tab using the File and TextDecoder APIs built into your browser.',
      },
    ],
    faq: [
      {
        q: "What's the difference between Base64 and URL-safe Base64?",
        a: 'Standard Base64 uses + and / as its last two symbols, which both have special meaning inside a URL and need percent-encoding there. URL-safe Base64 (base64url, RFC 4648 section 5) replaces them with - and _, which are safe in URLs, filenames and JWTs as-is.',
      },
      {
        q: 'Does decoding need me to know if the input is standard or URL-safe?',
        a: "No — this tool's decoder accepts both alphabets in the same input, including a mix of the two, so you never have to pick a mode before pasting a Base64 string.",
      },
      {
        q: 'Can I Base64-encode a file, not just text?',
        a: 'Yes. Drop any file onto the encode panel and it is read as raw bytes and encoded directly, the same way a browser encodes an image into a data: URI. The file never leaves your browser.',
      },
      {
        q: 'Why does Base64 make my data about 33% bigger?',
        a: 'Base64 packs 3 bytes (24 bits) of input into 4 output characters (6 bits each), so the output is always 4/3 — about 33% — longer than the input, before any padding.',
      },
      {
        q: "What does the '=' padding at the end of a Base64 string mean?",
        a: "Padding fills the last group of 4 characters when the input length isn't a multiple of 3 bytes. One '=' means the last group encoded 2 bytes; two '=' means it encoded 1 byte. Padding is optional and often omitted in URL-safe contexts like JWTs.",
      },
      {
        q: "Why did decoding say the result isn't valid text?",
        a: "The bytes you decoded aren't valid UTF-8 — most likely because the original data was a binary file (an image, a ZIP, etc.), not plain text. Use the download button to save the decoded bytes as a file instead.",
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'Base64 인코딩·디코딩 — URL-safe, 파일 지원',
    description:
      '텍스트와 파일을 브라우저에서 바로 Base64로 인코딩·디코딩합니다. URL-safe(-_) 포함 디코딩 시 알파벳을 자동 감지하고, 잘못된 입력은 정확한 위치까지 알려줍니다. 서버 업로드와 광고가 없습니다.',
    h1: 'Base64 인코딩·디코딩',
    tagline:
      '텍스트와 파일을 Base64로 바꾸고 되돌립니다. URL-safe 지원, 오프라인 동작, 브라우저 밖으로 나가지 않습니다.',
    name: 'Base64 인코더·디코더',
    keywords: ['base64 디코딩', 'base64 인코딩', 'base64 변환', 'url safe base64', 'base64 파일 변환', 'base64 디코더'],
    howTo: [
      '인코딩은 텍스트나 파일을 Base64로, 디코딩은 Base64를 다시 텍스트나 파일로 바꿉니다. 위에서 모드를 고르세요.',
      '텍스트를 붙여넣거나 파일을 끌어다 놓으세요. 최대 20만 자까지는 이 브라우저에만 저장되어 새로고침해도 남아 있습니다.',
      '인코딩할 때는 표준(+/) 또는 URL-safe(-_) 출력을 고르고, 패딩(=) 포함 여부를 켜고 끌 수 있습니다.',
      '디코딩은 표준과 URL-safe Base64를 자동으로 구분해 처리하므로, 줄바꿈이 섞여 있거나 두 방식이 섞여 있어도 그대로 디코딩됩니다.',
      '결과는 복사하거나 .txt(인코딩) 또는 디코딩된 파일로 저장할 수 있습니다.',
    ],
    sections: [
      {
        heading: '표준 Base64와 URL-safe Base64의 차이',
        body: 'RFC 4648은 두 가지 Base64 알파벳을 정의합니다. 표준 Base64(4장)는 마지막 두 글자로 +와 /를 쓰며 이메일(MIME)과 data: URI에서 흔히 쓰입니다. URL-safe Base64(5장, base64url)는 이 두 글자를 -와 _로 바꿔서 URL 경로, 쿼리 문자열, 파일명, JWT(JSON Web Token)에 퍼센트 인코딩 없이 그대로 넣을 수 있게 합니다.\n\n끝에 붙는 =패딩은 선택 사항이며, URL에서 =가 특별한 의미를 가질 수 있어 JWT 등에서는 보통 생략합니다. 이 도구는 인코딩할 때 두 알파벳 중 하나를 고를 수 있고, 디코딩할 때는 어느 쪽인지 묻지 않고 섞여 있어도 그대로 처리합니다.',
      },
      {
        heading: '왜 디코딩이 조용히 실패하지 않을까',
        body: "Base64 입력이 잘못되는 경우는 몇 가지로 정해져 있습니다. 64개 알파벳(및 URL-safe의 -, _)에 없는 문자가 섞였거나, '=' 패딩 뒤에 '=' 아닌 문자가 더 있거나, 패딩이 2개보다 많거나, 한 글자가 남아 6비트로는 1바이트조차 만들 수 없는 길이인 경우입니다.\n\n많은 온라인 디코더는 그냥 '잘못된 입력'이라고만 말하거나, 조용히 깨진 바이트를 돌려줍니다. 이 도구는 각 경우를 구분해 어떤 글자가 몇 번째 위치에서 문제인지 알려주고, 디코딩된 바이트가 UTF-8 텍스트로 읽을 수 없을 때도 명확히 알려줘서 파일로 내려받아야 한다는 걸 바로 알 수 있습니다.",
      },
      {
        heading: '텍스트뿐 아니라 파일도',
        body: '인코딩 중 파일을 끌어다 놓으면 이미지뿐 아니라 어떤 종류의 파일이든 원본 바이트를 그대로 읽어 Base64로 바꿉니다. data: URI나 이메일 첨부파일이 내부적으로 쓰는 방식과 같습니다.\n\n디코딩은 항상 바이트 그대로의 파일로 내려받을 수 있고, 그 바이트가 UTF-8 텍스트로도 유효하다면 화면에서 바로 읽고 복사할 수도 있습니다. 모든 처리는 이 탭 안에서 브라우저의 File·TextDecoder API로 이루어지며 서버로 전송되지 않습니다.',
      },
    ],
    faq: [
      {
        q: 'Base64와 URL-safe Base64(Base64URL)는 뭐가 다른가요?',
        a: '표준 Base64는 마지막 두 글자로 +와 /를 쓰는데, 이 둘은 URL 안에서 특별한 의미가 있어 그대로 쓰면 퍼센트 인코딩이 필요합니다. URL-safe Base64(RFC 4648 5장)는 이를 -와 _로 바꿔서 URL, 파일명, JWT에 그대로 써도 안전합니다.',
      },
      {
        q: '디코딩할 때 표준인지 URL-safe인지 미리 알아야 하나요?',
        a: '아니요. 이 도구의 디코더는 두 알파벳을 동시에 인식하므로, 섞여 있어도 모드를 고르지 않고 그냥 붙여넣으면 됩니다.',
      },
      {
        q: '텍스트가 아니라 파일도 Base64로 인코딩할 수 있나요?',
        a: '네. 인코딩 패널에 어떤 파일이든 끌어다 놓으면 원본 바이트를 읽어 그대로 인코딩합니다. 파일은 브라우저 밖으로 나가지 않습니다.',
      },
      {
        q: 'Base64로 변환하면 왜 용량이 33%쯡 커지나요?',
        a: 'Base64는 입력 3바이트(24비트)를 6비트씩 4개의 문자로 표현하므로, 패딩을 빼더라도 결과가 원본보다 약 4/3, 즉 33% 정도 커집니다.',
      },
      {
        q: "Base64 끝에 붙는 '=' 기호는 무슨 뜻인가요?",
        a: "입력 길이가 3바이트의 배수가 아닐 때 마지막 4글자 묶음을 채우는 패딩입니다. '=' 1개는 마지막에 2바이트가 인코딩됐다는 뜻이고, 2개는 1바이트라는 뜻입니다. JWT처럼 URL에 쓰이는 경우에는 보통 생략합니다.",
      },
      {
        q: "디코딩했는데 '유효한 텍스트가 아니다'라고 나오는 이유는요?",
        a: '디코딩된 바이트가 UTF-8 텍스트로 유효하지 않다는 뜻으로, 원본이 이미지나 ZIP 같은 바이너리 파일이었을 가능성이 높습니다. 복사 대신 다운로드 버튼으로 파일로 저장하세요.',
      },
    ],
    ui: {
      modeLabel: '모드',
      modeEncode: '인코딩',
      modeDecode: '디코딩',
      variantLabel: '알파벳',
      variantStandard: '표준 (+/)',
      variantUrl: 'URL-safe (-_)',
      paddingLabel: '패딩 (=)',
      inputLabelEncode: '인코딩할 텍스트 또는 파일',
      inputLabelDecode: '디코딩할 Base64',
      openFileEncode: '인코딩할 파일 열기',
      openFileDecode: '디코딩할 .txt 파일 열기',
      openFileHint: '파일을 끌어다 놓거나 클릭해서 선택하고, Ctrl/Cmd+V로 붙여넣을 수 있습니다',
      clear: '지우기',
      placeholderEncode: '인코딩할 텍스트를 입력하거나 붙여넣으세요…',
      placeholderDecode: '디코딩할 Base64를 붙여넣으세요…',
      autosaved: '이 브라우저에만 저장됨',
      outputLabel: '결과',
      copy: '복사',
      copied: '복사됨',
      downloadText: '.txt로 다운로드',
      downloadFile: '파일로 다운로드',
      errorInvalidCharacter: '{index}번째 위치의 문자 "{char}"는 Base64 알파벳에 없습니다.',
      errorInvalidLength:
        'Base64 길이가 올바르지 않습니다 — 한 글자만 남으면(6비트) 1바이트도 만들 수 없어 디코딩할 수 없습니다.',
      errorInvalidPadding:
        '{index}번째 위치의 패딩이 올바르지 않습니다 — "="는 끝에서 최대 2개까지만, 그 뒤에는 "=" 외의 문자가 올 수 없습니다.',
      errorInvalidUtf8: '이 바이트는 유효한 UTF-8 텍스트가 아닙니다.',
      notUtf8: '디코딩은 됐지만 결과가 유효한 UTF-8 텍스트가 아닙니다 — 파일로 다운로드하세요.',
      emptyOutput: '결과가 여기에 표시됩니다.',
      statInputSize: '입력 크기',
      statOutputSize: '출력 크기',
      statOverhead: '크기 변화',
    },
  },
};
