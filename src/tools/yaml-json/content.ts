import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  inputLabel: 'Input',
  inputPlaceholder: 'Paste YAML or JSON here…',
  outputLabel: 'Converted output',
  outputPlaceholder: 'The converted document appears here.',
  directionLabel: 'Direction',
  toJson: 'YAML → JSON',
  toYaml: 'JSON → YAML',
  indentLabel: 'Indent',
  indent2: '2 spaces',
  indent4: '4 spaces',
  sortKeys: 'Sort keys alphabetically',
  clear: 'Clear',
  copy: 'Copy result',
  copied: 'Copied',
  download: 'Download',
  swap: 'Use output as input',
  converting: 'Converting…',
  documents: 'Documents',
  keys: 'Keys',
  depth: 'Max depth',
  autosaved: 'Saved in this browser only',
  errorTitle: 'Line {line}, column {column}: {message}',
  errorTitleNoLine: 'Could not parse the input: {message}',
  noteComments: '{count} comment line(s) were dropped — JSON has no comments.',
  noteMerge: '{count} merge key(s) were applied; keys written directly win.',
  noteMultiDocument: '{count} documents were read and written as one JSON array.',
  noteBinary: 'A binary value was written as base64 text.',
  noteUnsafeInteger:
    'Line {line}: an integer is larger than 2^53 and lost digits as a JavaScript number. Quote it to keep every digit.',
  noteUnsafeIntegerPlain: 'An integer is larger than 2^53 and lost digits as a JavaScript number.',
};

export type UI = typeof uiEn;

const uiKo = {
  inputLabel: '입력',
  inputPlaceholder: 'YAML 또는 JSON을 붙여넣으세요…',
  outputLabel: '변환 결과',
  outputPlaceholder: '변환된 문서가 여기에 표시됩니다.',
  directionLabel: '변환 방향',
  toJson: 'YAML → JSON',
  toYaml: 'JSON → YAML',
  indentLabel: '들여쓰기',
  indent2: '공백 2칸',
  indent4: '공백 4칸',
  sortKeys: '키를 가나다·알파벳 순으로 정렬',
  clear: '지우기',
  copy: '결과 복사',
  copied: '복사됨',
  download: '내려받기',
  swap: '결과를 입력으로',
  converting: '변환 중…',
  documents: '문서 수',
  keys: '키 개수',
  depth: '최대 깊이',
  autosaved: '이 브라우저에만 저장됩니다',
  errorTitle: '{line}행 {column}열: {message}',
  errorTitleNoLine: '입력을 읽지 못했습니다: {message}',
  noteComments: '주석 {count}줄은 사라졌습니다. JSON에는 주석 문법이 없습니다.',
  noteMerge: '병합 키 {count}개를 적용했습니다. 직접 쓴 키가 우선합니다.',
  noteMultiDocument: '문서 {count}개를 읽어 JSON 배열 하나로 썼습니다.',
  noteBinary: '바이너리 값은 base64 텍스트로 썼습니다.',
  noteUnsafeInteger:
    '{line}행: 2^53보다 큰 정수가 자바스크립트 숫자로 바뀌며 끝자리를 잃었습니다. 모든 자리를 지키려면 따옴표로 감싸세요.',
  noteUnsafeIntegerPlain: '2^53보다 큰 정수가 자바스크립트 숫자로 바뀌며 끝자리를 잃었습니다.',
};

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'YAML to JSON Converter — Both Directions, YAML 1.2',
    description:
      'Convert YAML to JSON or JSON to YAML as you type. Dates stay as written, merge keys resolve, several documents become one array and big integers are flagged.',
    h1: 'YAML ↔ JSON Converter',
    tagline: 'Convert either direction while keeping date text, anchor merges and multi-document files intact.',
    name: 'YAML ↔ JSON',
    keywords: ['yaml to json', 'json to yaml', 'yaml converter', 'yaml parser', 'convert yaml', 'yaml json 변환'],
    howTo: [
      'Choose a direction: YAML → JSON or JSON → YAML.',
      'Paste the document into the input box; the result is written as you type.',
      'Pick 2 or 4 spaces of indentation, and sort keys if the output should diff cleanly.',
      'Copy the result or download it as a .json or .yaml file.',
    ],
    sections: [
      {
        heading: 'YAML is not JSON with fewer braces',
        body: 'This converter reads YAML with the 1.2 core schema, which is what Kubernetes, GitHub Actions and Compose examples assume. Only true and false are booleans, so yes, no, on and off stay the strings they look like unless they are quoted. 010 becomes 10 and 1.10 becomes 1.1, so versions and postal codes need quotes to survive: write "1.10" and "0812" when the digits matter.\n\nDates are the other common surprise. A YAML 1.1 parser turns 2026-03-01 into a timestamp object, and the JSON then holds a different string from the one you wrote. This converter drops the timestamp type on purpose, so 2026-03-01 comes out as "2026-03-01" and a Kubernetes manifest or a changelog keeps its dates exactly.',
      },
      {
        heading: 'Anchors, merge keys and several documents',
        body: 'JSON has no references, so &anchor and *alias are expanded into the full value at each use. The << merge key used by Docker Compose and GitLab CI is applied too, with keys written directly winning over merged ones: in a service that merges a base mapping and then sets port: 8080, the JSON shows 8080.\n\nA YAML stream can hold several documents separated by ---, which is normal for a multi-resource Kubernetes file. The converter reads every document and writes one JSON array with one element per document, in order. A single document becomes a plain object, exactly as its YAML shape suggests.',
      },
      {
        heading: 'What JSON cannot hold, and what this converter does about it',
        body: 'Comments are dropped, because JSON has no comment syntax — the result panel says how many lines went. Duplicate keys are an error rather than a silent last-one-wins, because two keys with one name usually mean a merge mistake. Binary values written with !!binary become base64 text.\n\nNumbers are the one loss that cannot be repaired: JavaScript stores every number as a double, so an integer beyond 2^53 (9007199254740991) loses its last digits — a 19-digit order or account id is a typical casualty. The converter finds those values in the source and tells you the line, so you can quote them and keep every digit instead of discovering the loss in production.',
      },
    ],
    faq: [
      {
        q: 'Does converting YAML to JSON change my data?',
        a: 'Only where JSON cannot represent YAML: comments disappear, anchors become copies of their values, several documents become one array, and numbers above 2^53 lose precision unless they are quoted. Dates, including 2026-03-01, stay the exact string that was written because the timestamp type is not applied.',
      },
      {
        q: 'Why do yes, no and on stay strings in the JSON?',
        a: 'YAML 1.2 keeps only true and false as booleans, and this converter follows that schema, which is what current Kubernetes, GitHub Actions and Compose tooling expects. YAML 1.1 parsers read yes, no, on and off as booleans; if a file is also read by one of those, quote those words or write true and false.',
      },
      {
        q: 'How are multiple documents in one file handled?',
        a: 'Every document between --- markers is read, and the JSON output is one array with one element per document in file order. A file with a single document produces a plain object rather than a one-element array, so the output matches the shape of the input.',
      },
      {
        q: 'What happens to anchors, aliases and << merge keys?',
        a: 'They are resolved before the JSON is written: an *alias is replaced by a full copy of its anchor value, and a << merge copies the anchor mapping keys into the target mapping. Keys written directly in the mapping win over merged ones. The JSON therefore contains values, never references.',
      },
      {
        q: 'Why is a big number different after converting?',
        a: 'JavaScript numbers are doubles with 53 bits of integer precision, so 9007199254740993 cannot be held exactly and becomes 9007199254740992. The converter flags that line in the source. Quote the value in the YAML or JSON ("9007199254740993") to keep it as text, which is also what most APIs expect for ids.',
      },
      {
        q: 'Is my configuration file uploaded?',
        a: 'No. The YAML parser runs in this tab and the document is only stored in this browser so a refresh keeps your work. No request carries the file, which matters for manifests that contain hostnames, image names or secret references.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: 'YAML JSON 변환기 — 양방향, 날짜·병합 키 보존',
    description:
      'YAML을 JSON으로, JSON을 YAML로 입력하는 즉시 변환합니다. 날짜는 쓴 그대로 두고, 병합 키와 다중 문서를 처리하며, 2^53보다 큰 정수는 따로 알려 줍니다. 입력은 서버로 전송되지 않습니다.',
    h1: 'YAML ↔ JSON 변환기',
    tagline: '날짜 표기와 앵커 병합, --- 로 나뉜 여러 문서를 그대로 살려 양방향으로 변환합니다.',
    name: 'YAML ↔ JSON',
    keywords: [
      'yaml to json',
      'yaml json 변환',
      'json to yaml',
      '야믈 변환',
      '쿠버네티스 yaml json',
      'docker compose json',
    ],
    howTo: [
      '방향을 고릅니다. YAML → JSON 또는 JSON → YAML.',
      '입력 칸에 문서를 붙여넣으면 입력하는 동안 결과가 바로 바뀝니다.',
      '들여쓰기를 2칸 또는 4칸으로 고르고, 비교(diff)가 필요하면 키 정렬을 켭니다.',
      '결과를 복사하거나 .json·.yaml 파일로 내려받습니다.',
    ],
    sections: [
      {
        heading: 'YAML은 중괄호만 뺀 JSON이 아닙니다',
        body: '이 변환기는 YAML 1.2 코어 스키마로 읽습니다. 쿠버네티스, GitHub Actions, Docker Compose 예제가 기대하는 규칙입니다. 불리언은 true와 false뿐이라서 yes, no, on, off는 따옴표가 없으면 글자 그대로 문자열로 남습니다. 010은 10, 1.10은 1.1이 되므로 버전·우편번호처럼 숫자 모양이 중요한 값은 "1.10", "0812"처럼 따옴표로 감싸야 합니다.\n\n날짜도 자주 걸리는 부분입니다. YAML 1.1 파서는 2026-03-01을 타임스탬프 객체로 바꾸고, JSON에는 원문과 다른 문자열이 들어갑니다. 이 변환기는 타임스탬프 타입을 일부러 빼두었기 때문에 2026-03-01은 "2026-03-01" 그대로 남고, 배포 일정이나 체인지로그의 날짜가 바뀌지 않습니다.',
      },
      {
        heading: '앵커, 병합 키, 여러 문서',
        body: 'JSON에는 참조가 없으므로 &앵커와 *별칭은 쓰인 자리마다 값 전체로 펼쳐집니다. Docker Compose나 GitLab CI가 쓰는 << 병합 키도 적용되며, 직접 쓴 키가 병합된 키를 이깁니다. 기본 매핑을 병합한 뒤 port: 8080을 따로 적었다면 JSON에는 8080이 들어갑니다.\n\nYAML 한 파일에는 --- 로 구분된 여러 문서가 들어갈 수 있고, 리소스가 여러 개인 쿠버네티스 파일이 대표적입니다. 이 변환기는 모든 문서를 읽어 문서마다 요소 하나인 JSON 배열로 씁니다. 문서가 하나뿐이면 배열이 아니라 그 값 자체가 나와서 입력의 모양과 결과가 어긋나지 않습니다.',
      },
      {
        heading: 'JSON이 담지 못하는 것과 이 변환기의 처리',
        body: '주석은 사라집니다. JSON에 주석 문법이 없기 때문이고, 결과 아래에 몇 줄이 사라졌는지 표시합니다. 같은 이름의 키가 두 번 나오면 마지막 값만 남기는 대신 오류로 알립니다. 이름이 같은 키 두 개는 대개 병합 실수이기 때문입니다. !!binary로 쓴 값은 base64 텍스트로 바뀝니다.\n\n숫자는 되돌릴 수 없는 유일한 손실입니다. 자바스크립트는 모든 수를 더블로 저장하므로 2^53(9007199254740991)을 넘는 정수는 끝자리를 잃습니다. 19자리 주문번호나 계좌번호가 전형적인 피해입니다. 이 변환기는 그런 값을 원문에서 찾아 해당 줄을 알려 주므로, 운영에서 손실을 발견하는 대신 따옴표로 감싸 모든 자리를 지킬 수 있습니다.',
      },
    ],
    faq: [
      {
        q: 'YAML을 JSON으로 바꾸면 데이터가 달라지나요?',
        a: 'JSON이 표현하지 못하는 부분에서만 달라집니다. 주석은 사라지고, 앵커는 값으로 펼쳐지고, 여러 문서는 배열 하나가 되고, 2^53을 넘는 정수는 따옴표가 없으면 정밀도를 잃습니다. 날짜는 타임스탬프 타입을 적용하지 않으므로 2026-03-01 같은 값이 쓴 그대로 남습니다.',
      },
      {
        q: 'yes, no, on이 왜 문자열로 남나요?',
        a: 'YAML 1.2에서는 true와 false만 불리언이고, 이 변환기는 그 스키마를 따릅니다. 쿠버네티스·GitHub Actions·Compose 최신 도구가 기대하는 규칙입니다. YAML 1.1 파서는 yes, no, on, off를 불리언으로 읽으므로 그런 도구와 함께 쓴다면 해당 단어를 따옴표로 감싸거나 true·false로 적으세요.',
      },
      {
        q: '--- 로 나뉜 여러 문서는 어떻게 변환되나요?',
        a: '--- 구분자 사이의 문서를 모두 읽어, 문서마다 요소 하나인 JSON 배열로 파일 순서대로 씁니다. 문서가 하나뿐인 파일은 요소가 하나인 배열이 아니라 값 자체로 나오므로 입력과 결과의 구조가 같습니다.',
      },
      {
        q: '앵커와 별칭, << 병합 키는 어떻게 처리되나요?',
        a: 'JSON을 쓰기 전에 모두 풀립니다. *별칭은 앵커 값 전체로 바뀌고, << 병합은 앵커 매핑의 키를 대상 매핑으로 복사합니다. 같은 매핑에 직접 쓴 키가 병합된 키를 이깁니다. 따라서 결과 JSON에는 참조가 아니라 값만 들어갑니다.',
      },
      {
        q: '큰 숫자가 변환 후 달라지는 이유는 무엇인가요?',
        a: '자바스크립트 숫자는 53비트 정수까지만 정확히 담는 더블이라 9007199254740993은 9007199254740992가 됩니다. 이 변환기는 해당 줄을 알려 줍니다. 값을 YAML이나 JSON에서 "9007199254740993"처럼 따옴표로 감싸면 텍스트로 유지되며, 대부분의 API도 아이디를 문자열로 받습니다.',
      },
      {
        q: '설정 파일이 서버로 업로드되나요?',
        a: '아니요. YAML 파서가 이 탭에서 실행되고, 문서는 새로고침해도 남도록 이 브라우저에만 저장됩니다. 호스트 이름이나 이미지 이름, 시크릿 참조가 든 매니페스트를 붙여넣어도 파일이 전송되지 않습니다.',
      },
    ],
    ui: uiKo,
  },
};
