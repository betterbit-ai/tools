import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  transcriptLabel: 'Transcript',
  transcriptHint: 'Edit the text at any time. It is saved only in this browser.',
  placeholder: 'Your dictated words will appear here. You can also type or paste text.',
  hearing: 'Hearing',
  copy: 'Copy text',
  copied: 'Copied',
  download: 'Download .txt',
  clear: 'Clear',
  saved: 'Saved in this browser only',
  languageLabel: 'Dictation language',
  languageHint: 'Choose the language you will speak before starting.',
  english: 'English (United States)',
  korean: 'Korean (South Korea)',
  start: 'Start dictation',
  stop: 'Stop dictation',
  preparing: 'Preparing the on-device language pack…',
  shortcut: 'Start or stop when focus is outside a text field:',
  shortcutKey: 'Space',
  privacyNotice:
    'Private mode: this tool only starts recognition when the browser confirms on-device processing. Audio and text are not sent to a recognition service.',
  unsupported:
    'Private on-device dictation is not available for this language or browser. This tool will not switch to cloud recognition. Try a current browser that supports on-device Web Speech API language packs.',
  permissionError:
    'Microphone permission was blocked. Allow microphone access in your browser settings, then try again.',
  noSpeechError: 'No speech was detected. Check that the microphone is connected and speak closer to it.',
  languageError:
    'The selected on-device language pack is not installed or supported. Try installing it again or switch languages.',
  genericError:
    'Dictation stopped before a transcript could be completed. Check the microphone permission and try again.',
  characters: 'Characters',
  words: 'Words',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Speech to Text — Private On-Device Dictation',
    description:
      'Speak and turn your voice into editable text with private on-device speech recognition. No ads, account, transcript upload, or cloud-recognition fallback.',
    h1: 'Speech to Text',
    tagline: 'Private live dictation when your browser supports on-device speech recognition.',
    name: 'Speech to Text',
    keywords: ['voice to text', 'dictation', 'voice typing', 'speech recognition', 'transcribe speech'],
    howTo: [
      'Choose the language you will speak.',
      'Select Start dictation and allow microphone access if your browser asks.',
      'Speak naturally; finalized phrases appear in the editable transcript.',
      'Select Stop dictation, then edit, copy, or download the text as a .txt file.',
    ],
    sections: [
      {
        heading: 'Why this tool requires on-device recognition',
        body: 'The usual Web Speech API setup can send microphone audio to a recognition service. This tool deliberately does not use that mode. Before recording, it asks the browser for an on-device dictation language pack and sets SpeechRecognition.processLocally to true. If the pack or API is unavailable, recording stays disabled instead of silently switching to cloud recognition. The first setup can download a language pack; after it is installed, recognition can work without sending audio or transcript text to a recognition service.',
      },
      {
        heading: 'Browser support and language packs',
        body: 'SpeechRecognition is not a Baseline web feature, so support differs by browser and device. The on-device version also needs a language pack for the selected language. The Web Speech API exposes available() to check a pack and install() to request it; this tool uses both before it starts. A browser that has only the older, cloud-backed or prefixed recognition API is intentionally shown as unsupported because this page keeps dictation private.',
      },
      {
        heading: 'Getting a cleaner transcript',
        body: 'Speak one thought at a time, keep the microphone close, and reduce music or overlapping voices. Dictation is best for notes, drafts, and short messages; review names, numbers, technical terms, and punctuation before sharing. The text area stays editable while you work. Your transcript is saved in this browser’s local storage for refresh recovery, and Clear removes that saved copy. Copy or download the final text when you are ready to use it elsewhere.',
      },
    ],
    faq: [
      {
        q: 'Does this speech-to-text tool upload my voice?',
        a: 'No. This page starts speech recognition only after the browser reports that it can process the selected language on-device. If it cannot, the tool refuses to record instead of using a cloud recognition service.',
      },
      {
        q: 'Why does the tool say private dictation is unavailable?',
        a: 'On-device Web Speech API recognition has limited browser support and requires a compatible language pack. The tool needs both the available() and install() browser features so it can guarantee local processing rather than sending microphone audio to a service.',
      },
      {
        q: 'Is my transcript saved after I refresh?',
        a: 'Yes. The editable transcript is stored only in this browser’s local storage after you stop or type. It is not uploaded, and selecting Clear removes the saved transcript from this browser.',
      },
      {
        q: 'Can I transcribe a recording or an audio file?',
        a: 'No. This tool is for private live dictation from your microphone. File transcription needs a speech-recognition model and can involve large local downloads, so it is intentionally kept out of this focused tool.',
      },
      {
        q: 'Why should I proofread dictated text?',
        a: 'Speech recognition can mishear names, numbers, accents, punctuation, and words spoken over background noise. Review the editable transcript before using it for an application, legal document, medical note, or other important record.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '음성 텍스트 변환 — 기기 내 처리 받아쓰기',
    description:
      '말하면 음성을 바로 텍스트로 바꾸는 무료 받아쓰기입니다. 기기 내 음성 인식만 사용하며 광고·가입·녹음 업로드·클라우드 처리 전환이 없습니다.',
    h1: '음성 텍스트 변환',
    tagline: '브라우저가 기기 내 음성 인식을 지원할 때만 안전하게 받아쓰기합니다.',
    name: '음성 텍스트 변환',
    keywords: ['받아쓰기', '음성 인식', '음성 텍스트 변환', '음성 받아쓰기', '말로 글쓰기', 'STT'],
    howTo: [
      '말할 언어를 선택합니다.',
      '받아쓰기 시작을 누르고 브라우저가 요청하면 마이크 사용을 허용합니다.',
      '자연스럽게 말하면 확정된 문장이 수정 가능한 입력창에 나타납니다.',
      '받아쓰기 중지를 누른 뒤 내용을 수정하고 복사하거나 .txt 파일로 내려받습니다.',
    ],
    sections: [
      {
        heading: '왜 기기 내 음성 인식만 사용할까?',
        body: '일반적인 Web Speech API 음성 인식은 마이크 음성을 외부 인식 서비스로 보낼 수 있습니다. 이 도구는 그 방식을 사용하지 않습니다. 녹음을 시작하기 전에 브라우저에 기기 내 받아쓰기용 언어 팩이 있는지 확인하고, SpeechRecognition.processLocally 값을 true로 설정합니다. 언어 팩이나 API를 사용할 수 없으면 클라우드 인식으로 몰래 전환하지 않고 시작할 수 없다는 안내를 보여 줍니다. 언어 팩을 처음 받을 때만 다운로드가 필요할 수 있으며, 설치 뒤에는 음성과 변환 텍스트를 인식 서비스에 보내지 않습니다.',
      },
      {
        heading: '브라우저와 언어 팩 지원',
        body: 'SpeechRecognition은 모든 주요 브라우저에서 같은 방식으로 제공되는 기능이 아닙니다. 기기 내 처리에는 선택한 언어의 언어 팩도 필요합니다. Web Speech API는 언어 팩 상태를 확인하는 available()과 설치를 요청하는 install()을 제공하며, 이 도구는 녹음 전에 두 기능을 사용합니다. 구형 또는 클라우드 기반 음성 인식만 제공하는 브라우저는 개인정보 보호를 위해 지원하지 않는 것으로 표시합니다.',
      },
      {
        heading: '받아쓰기 정확도를 높이는 방법',
        body: '한 문장이나 한 생각씩 또렷하게 말하고, 마이크를 가까이 두며 음악과 겹치는 목소리를 줄이세요. 받아쓰기는 메모, 초안, 긴 메시지를 빠르게 적을 때 적합하지만 이름, 숫자, 전문 용어, 문장부호는 반드시 다시 확인해야 합니다. 변환 결과는 입력창에서 언제든 고칠 수 있습니다. 새로고침해도 이어서 작업할 수 있도록 텍스트를 이 브라우저의 로컬 저장소에만 보관하며, 지우기를 누르면 함께 삭제합니다.',
      },
    ],
    faq: [
      {
        q: '음성이나 변환 텍스트가 서버로 전송되나요?',
        a: '아니요. 이 도구는 선택한 언어를 기기 안에서 처리할 수 있다고 브라우저가 확인한 경우에만 녹음을 시작합니다. 지원하지 않으면 클라우드 음성 인식으로 전환하지 않고 녹음을 시작하지 않습니다.',
      },
      {
        q: '왜 기기 내 받아쓰기를 사용할 수 없다고 나오나요?',
        a: '기기 내 Web Speech API 음성 인식은 브라우저와 기기별 지원 여부가 다르고 언어 팩이 필요합니다. 이 도구는 로컬 처리를 보장하려고 available()과 install() 기능을 모두 요구하므로, 둘 중 하나가 없으면 사용할 수 없다고 안내합니다.',
      },
      {
        q: '새로고침하면 받아쓴 내용이 사라지나요?',
        a: '아니요. 수정 가능한 변환 텍스트는 이 브라우저의 로컬 저장소에만 보관되어 새로고침 후에도 남습니다. 서버로 전송되지 않으며 지우기를 누르면 이 브라우저에 저장한 내용도 삭제됩니다.',
      },
      {
        q: '녹음 파일이나 음성 파일도 텍스트로 바꿀 수 있나요?',
        a: '아니요. 이 도구는 마이크로 말하는 실시간 받아쓰기에 집중합니다. 음성 파일 변환에는 큰 로컬 모델 다운로드가 필요할 수 있으므로, 개인정보 보호와 빠른 시작을 위해 이 도구 범위에 넣지 않았습니다.',
      },
      {
        q: '받아쓰기 결과를 왜 검토해야 하나요?',
        a: '음성 인식은 사람 이름, 숫자, 억양, 문장부호, 배경 소음이 있는 말소리를 잘못 알아들을 수 있습니다. 지원서, 계약서, 의료 기록처럼 중요한 문서에는 수정 가능한 결과를 반드시 검토한 뒤 사용해야 합니다.',
      },
    ],
    ui: {
      transcriptLabel: '변환 텍스트',
      transcriptHint: '언제든 내용을 고칠 수 있으며 이 브라우저에만 저장됩니다.',
      placeholder: '받아쓴 내용이 여기에 나타납니다. 직접 입력하거나 붙여넣을 수도 있습니다.',
      hearing: '인식 중',
      copy: '텍스트 복사',
      copied: '복사됨',
      download: '.txt 다운로드',
      clear: '지우기',
      saved: '이 브라우저에만 저장됨',
      languageLabel: '받아쓰기 언어',
      languageHint: '시작하기 전에 말할 언어를 선택하세요.',
      english: '영어 (미국)',
      korean: '한국어 (대한민국)',
      start: '받아쓰기 시작',
      stop: '받아쓰기 중지',
      preparing: '기기 내 언어 팩을 준비하는 중…',
      shortcut: '텍스트 입력창 밖에서 시작 또는 중지:',
      shortcutKey: '스페이스',
      privacyNotice:
        '개인정보 보호 모드: 브라우저가 기기 내 처리를 확인할 때만 인식을 시작합니다. 음성과 텍스트를 인식 서비스에 보내지 않습니다.',
      unsupported:
        '이 언어 또는 브라우저에서는 개인정보 보호를 위한 기기 내 받아쓰기를 사용할 수 없습니다. 이 도구는 클라우드 음성 인식으로 전환하지 않습니다. 기기 내 Web Speech API 언어 팩을 지원하는 최신 브라우저에서 시도하세요.',
      permissionError: '마이크 권한이 차단되었습니다. 브라우저 설정에서 마이크 사용을 허용한 뒤 다시 시도하세요.',
      noSpeechError: '음성이 감지되지 않았습니다. 마이크가 연결되어 있는지 확인하고 가까이에서 말해 보세요.',
      languageError:
        '선택한 기기 내 언어 팩이 설치되지 않았거나 지원되지 않습니다. 다시 설치하거나 언어를 바꿔 보세요.',
      genericError: '변환 텍스트가 완성되기 전에 받아쓰기가 멈췄습니다. 마이크 권한을 확인하고 다시 시도하세요.',
      characters: '글자수',
      words: '단어수',
    },
  },
};
