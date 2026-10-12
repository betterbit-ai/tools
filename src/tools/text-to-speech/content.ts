import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  textLabel: 'Text to read aloud',
  textHint: 'Type or paste text. It is saved only in this browser until you clear it.',
  placeholder: 'Paste text to hear it read aloud.',
  sample: 'Use sample',
  sampleText: 'Welcome. This text is read with a local voice installed on your device.',
  copy: 'Copy text',
  copied: 'Copied',
  clear: 'Clear',
  saved: 'Saved in this browser only',
  voiceLabel: 'Local device voice',
  voiceHint: 'Only voices that your browser reports as local appear here.',
  rateLabel: 'Speed',
  pitchLabel: 'Pitch',
  volumeLabel: 'Volume',
  play: 'Play',
  pause: 'Pause',
  resume: 'Resume',
  stop: 'Stop',
  shortcut: 'Play or pause outside a text field:',
  shortcutKey: 'Space',
  stopKey: 'Esc',
  privacyNotice:
    'Private playback: this page offers only device voices reported as local. Your text is not uploaded to this site.',
  unsupported:
    'Speech synthesis is not available in this browser. Try a current browser with device text-to-speech voices.',
  noLocalVoices:
    'No local device voice is available. Install a voice in your operating-system accessibility or language settings, then reload this page.',
  playbackError: 'Playback stopped unexpectedly. Choose another local voice or shorten the text and try again.',
  characters: 'Characters',
  estimatedTime: 'Estimated time',
  noTime: '—',
  seconds: '{n} sec',
  minutes: '{n} min',
  progress: 'Reading part {current} of {total}',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Text to Speech — Local Device Voices',
    description:
      'Read text aloud with local voices already installed on your device. Adjust speed, pitch, and volume with no account, ads, text upload, or cloud-voice fallback.',
    h1: 'Text to Speech',
    tagline: 'Listen with local device voices, not a text-upload form.',
    name: 'Text to Speech',
    keywords: ['read text aloud', 'text reader', 'free text to speech', 'voice reader', 'text to voice'],
    howTo: [
      'Type or paste the text you want to hear.',
      'Choose a local device voice from the voice list.',
      'Set speed, pitch, and volume between the shown limits.',
      'Select Play to listen; use Pause, Resume, or Stop whenever needed.',
    ],
    sections: [
      {
        heading: 'What “local device voice” means',
        body: 'This reader uses the browser Web Speech API and lists only voices whose localService flag is true. That excludes browser voices advertised as online or network voices, which can route text to a browser vendor. The available list therefore differs by operating system, browser, and installed language packs. If the list is empty, install a text-to-speech voice in your device accessibility or language settings and reload the page. This tool does not send your text to Betterbit or a speech-generation API.',
      },
      {
        heading: 'Long text and playback controls',
        body: 'Browsers can stop unexpectedly when asked to speak one very long utterance. To reduce that problem, this reader normalizes spacing and queues text in short sentence-first parts, continuing automatically after each part ends. It leaves every character editable and saves the current draft only in this browser’s local storage. The controls expose speed and pitch from 0.5 to 2.0, plus volume from 0 to 1; 1.0 is the normal value for each setting.',
      },
      {
        heading: 'Choose a voice for the language you are reading',
        body: 'A voice has a language tag such as en-US or ko-KR. Select a voice whose tag matches the text whenever possible, especially for names, numbers, and Korean or other non-English scripts. The API lets a page set an utterance’s voice, language, rate, pitch, and volume, but voice quality and pronunciation come from your operating system. For important material, listen through once and correct abbreviations or punctuation in the editable text before playing it again.',
      },
    ],
    faq: [
      {
        q: 'Does this text-to-speech tool upload my text?',
        a: 'No. Betterbit does not receive the text entered here, and the voice list is restricted to voices that the browser reports as local rather than network speech services.',
      },
      {
        q: 'Why are there no voices in the menu?',
        a: 'The menu includes only local voices reported by your browser, so it can be empty when the device has no installed text-to-speech voice or the browser does not expose one. Install a language voice in your operating-system settings, then reload the page.',
      },
      {
        q: 'Can I save the speech as MP3 or WAV?',
        a: 'No. Browser speech synthesis sends sound directly to the device audio output and does not provide an audio file for a web page to download. This focused reader plays local voices only.',
      },
      {
        q: 'What speed, pitch, and volume can I use?',
        a: 'This reader offers speed and pitch from 0.5 to 2.0 and volume from 0 to 1. The default is 1.0 for all three controls; the exact sound still depends on the selected device voice.',
      },
      {
        q: 'Why is my long text read in several parts?',
        a: 'The reader breaks long text into short sentence-first parts because some browser speech engines stop during a single long utterance. The next part starts automatically after the previous part ends.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '텍스트 읽어주기 — 기기 내 음성으로 재생',
    description:
      '텍스트를 기기에 설치된 로컬 음성으로 읽어줍니다. 속도·음높이·볼륨을 조절하며 가입, 광고, 텍스트 업로드, 클라우드 음성 전환이 없습니다.',
    h1: '텍스트 읽어주기',
    tagline: '텍스트를 업로드하지 않고 기기에 설치된 음성으로 바로 듣습니다.',
    name: '텍스트 읽어주기',
    keywords: ['글 읽어주기', '텍스트 읽어주기', '텍스트 음성 변환', 'TTS', '음성 합성', '문장 읽어주기'],
    howTo: [
      '읽을 텍스트를 입력하거나 붙여넣습니다.',
      '로컬 기기 음성 목록에서 원하는 음성을 고릅니다.',
      '표시된 범위 안에서 속도, 음높이, 볼륨을 조절합니다.',
      '재생을 누르고 필요할 때 일시 정지, 이어 듣기, 중지를 사용합니다.',
    ],
    sections: [
      {
        heading: '로컬 기기 음성이란?',
        body: '이 도구는 브라우저 Web Speech API를 사용하되 localService 값이 true인 음성만 목록에 표시합니다. 브라우저 업체의 서버로 텍스트를 보낼 수 있는 온라인 또는 네트워크 음성은 제외합니다. 따라서 음성 목록은 운영체제, 브라우저, 설치한 언어 팩에 따라 달라집니다. 목록이 비어 있으면 기기의 손쉬운 사용 또는 언어 설정에서 텍스트 음성 변환 음성을 설치한 뒤 페이지를 새로고침하세요. 입력한 텍스트를 Betterbit이나 음성 생성 API로 보내지 않습니다.',
      },
      {
        heading: '긴 글도 끊기지 않게 읽는 방법',
        body: '브라우저는 지나치게 긴 문장을 한 번에 읽을 때 재생을 멈추기도 합니다. 이 도구는 공백을 정리한 뒤 문장 경계를 우선으로 짧은 부분으로 나누어 차례로 재생합니다. 각 부분이 끝나면 다음 부분을 자동으로 읽습니다. 편집한 원문은 이 브라우저의 로컬 저장소에만 보관하고 지우기를 누르면 삭제합니다. 속도와 음높이는 0.5부터 2.0까지, 볼륨은 0부터 1까지 조절할 수 있으며 기본값은 모두 1.0입니다.',
      },
      {
        heading: '읽는 언어에 맞는 음성 고르기',
        body: '각 음성에는 en-US나 ko-KR처럼 언어 태그가 있습니다. 특히 이름, 숫자, 한글처럼 영어가 아닌 문자를 읽을 때는 텍스트와 같은 언어 태그의 음성을 고르는 편이 좋습니다. Web Speech API에서는 음성, 언어, 속도, 음높이, 볼륨을 설정할 수 있지만 실제 발음과 음질은 기기에 설치한 음성이 결정합니다. 중요한 글은 먼저 한 번 들어 보고, 약어와 문장부호를 수정한 뒤 다시 재생하세요.',
      },
    ],
    faq: [
      {
        q: '입력한 텍스트가 서버로 전송되나요?',
        a: '아니요. 이 페이지에 입력한 텍스트는 Betterbit으로 전송되지 않으며, 브라우저가 로컬이라고 보고한 음성만 선택 목록에 표시합니다. 네트워크 음성 서비스는 사용하지 않습니다.',
      },
      {
        q: '음성 목록이 비어 있는 이유는 무엇인가요?',
        a: '이 도구는 브라우저가 로컬로 보고한 음성만 표시하므로 기기에 텍스트 음성 변환 음성이 없거나 브라우저가 음성을 제공하지 않으면 목록이 비어 있습니다. 운영체제 설정에서 언어 음성을 설치한 뒤 새로고침하세요.',
      },
      {
        q: '읽은 음성을 MP3나 WAV로 저장할 수 있나요?',
        a: '아니요. 브라우저 음성 합성은 소리를 기기 출력으로 바로 보내고 웹페이지가 내려받을 오디오 파일을 제공하지 않습니다. 이 도구는 로컬 음성을 재생하는 읽기 기능에 집중합니다.',
      },
      {
        q: '속도, 음높이, 볼륨은 어느 범위까지 조절할 수 있나요?',
        a: '이 도구에서는 속도와 음높이를 0.5부터 2.0까지, 볼륨을 0부터 1까지 조절할 수 있습니다. 세 설정의 기본값은 1.0이며 실제 들리는 소리는 선택한 기기 음성에 따라 달라집니다.',
      },
      {
        q: '긴 글을 여러 부분으로 나누어 읽는 이유는 무엇인가요?',
        a: '일부 브라우저 음성 엔진은 아주 긴 문장을 한 번에 재생하면 멈출 수 있습니다. 이 도구는 문장 경계를 우선으로 짧게 나눈 뒤 앞부분이 끝나면 다음 부분을 자동으로 읽습니다.',
      },
    ],
    ui: {
      textLabel: '읽을 텍스트',
      textHint: '입력하거나 붙여넣은 내용은 지울 때까지 이 브라우저에만 저장됩니다.',
      placeholder: '읽어 들을 텍스트를 붙여넣으세요.',
      sample: '예시 넣기',
      sampleText: '반갑습니다. 이 텍스트는 기기에 설치된 로컬 음성으로 읽어 줍니다.',
      copy: '텍스트 복사',
      copied: '복사됨',
      clear: '지우기',
      saved: '이 브라우저에만 저장됨',
      voiceLabel: '로컬 기기 음성',
      voiceHint: '브라우저가 로컬이라고 보고한 음성만 여기에 표시합니다.',
      rateLabel: '속도',
      pitchLabel: '음높이',
      volumeLabel: '볼륨',
      play: '재생',
      pause: '일시 정지',
      resume: '이어 듣기',
      stop: '중지',
      shortcut: '텍스트 입력창 밖에서 재생 또는 일시 정지:',
      shortcutKey: '스페이스',
      stopKey: 'Esc',
      privacyNotice:
        '개인정보 보호 재생: 이 페이지는 기기 내 로컬 음성만 표시합니다. 텍스트를 이 사이트에 업로드하지 않습니다.',
      unsupported:
        '이 브라우저에서는 음성 합성을 사용할 수 없습니다. 기기 내 텍스트 음성 변환을 지원하는 최신 브라우저에서 시도하세요.',
      noLocalVoices:
        '사용할 수 있는 로컬 기기 음성이 없습니다. 운영체제의 손쉬운 사용 또는 언어 설정에서 음성을 설치한 뒤 이 페이지를 새로고침하세요.',
      playbackError: '재생이 예기치 않게 멈췄습니다. 다른 로컬 음성을 선택하거나 텍스트를 짧게 나누어 다시 시도하세요.',
      characters: '글자수',
      estimatedTime: '예상 시간',
      noTime: '—',
      seconds: '{n}초',
      minutes: '{n}분',
      progress: '{total}개 중 {current}번째 부분 읽는 중',
    },
  },
};
