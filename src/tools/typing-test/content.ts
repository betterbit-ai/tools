import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  language: 'Language',
  languageEn: 'English',
  languageKo: '한글',
  duration: 'Duration',
  secondsShort: '{n}s',
  inputLabel: 'Type the text above',
  inputPlaceholder: 'Click here and start typing…',
  timeLeft: 'Time left',
  speedWpm: 'WPM',
  speedCpm: 'CPM',
  accuracyLabel: 'Accuracy',
  personalBest: 'Personal best',
  newBest: 'New personal best!',
  restart: 'Restart',
  restartHint: 'restarts',
  privacyHint:
    'Everything happens in your browser. Nothing you type is uploaded — your personal best is saved only in this browser.',
  tierEnBeginner: 'Beginner — most adults land around 40 WPM for everyday typing.',
  tierEnAverage: 'Average — a solid, everyday typing speed.',
  tierEnGood: 'Good — 60+ WPM is considered a strong typist.',
  tierEnFast: 'Fast — 80+ WPM puts you ahead of most typists.',
  tierKoBeginner: 'Beginner — Korean typing averages around 200–300 keystrokes per minute for most adults.',
  tierKoAverage: 'Average — a typical adult Korean typing speed.',
  tierKoFast: 'Fast — around clerical/certification-exam level (350–450 keystrokes per minute).',
  tierKoExpert: 'Expert — among the faster typists.',
  tierKoMaster: 'Master — 600+ keystrokes per minute, professional-typist level.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Typing Test — Free WPM Speed Test, No Sign-Up',
    description:
      'Test your typing speed in WPM with live accuracy, 15/30/60s runs and a personal best saved on this device. No ads, no account, nothing uploaded.',
    h1: 'Typing Test',
    tagline: 'Type the sample text and see your words-per-minute and accuracy update live.',
    name: 'Typing Test',
    keywords: ['wpm test', 'typing speed test', 'words per minute', 'keyboard speed test', 'type test'],
    howTo: [
      'Choose English or 한글, and a test length of 15, 30 or 60 seconds.',
      'Click the text box and start typing the sample shown above it — the timer starts on your first keystroke.',
      'Watch WPM (or 타수 for Korean) and accuracy update live as you type.',
      'When the time runs out, see your result, tier and personal best for this test length.',
      'Press Restart or Esc to try again with a fresh sample.',
    ],
    sections: [
      {
        heading: 'How WPM and accuracy are calculated',
        body: 'Words per minute uses the standard convention: one "word" equals five typed characters, so "a 25-character line" counts as 5 words regardless of actual word boundaries. Only correctly typed characters count toward speed — a typo does not inflate your score, but it is still counted against accuracy, which is correct characters divided by all characters you typed (correct and incorrect). Characters you have not reached yet are ignored entirely. If you finish the sample text before time runs out, your result is still calculated from the time you actually spent, so very fast typists are scored fairly too.',
      },
      {
        heading: 'Why pasting is blocked and Korean input just works',
        body: 'Pasting the sample defeats the point of a typing test, so paste is disabled in the input box — you have to actually type it. For Korean, the box reads the native input value the browser already assembles from your IME, instead of intercepting individual keydown events. That avoids a known class of bugs where fast jamo composition (e.g. ㅘ, ㄺ, ㅆ) gets dropped or miscounted by typing tests that try to rebuild Hangul composition themselves.',
      },
      {
        heading: 'What counts as a good typing speed',
        body: 'For English, casual typing is usually around 40 WPM, 60 WPM or higher is considered a strong typist, and 80+ WPM is fast for most people — professional typists can exceed 100 WPM. These are the benchmarks the tier shown after each test is based on.',
      },
    ],
    faq: [
      {
        q: 'What is a good WPM score?',
        a: 'Around 40 WPM is typical for everyday typing. 60 WPM or higher is a strong typist, and 80+ WPM is fast — professional typists and transcriptionists often type 100+ WPM.',
      },
      {
        q: 'Does this typing test save or upload anything I type?',
        a: 'No. The sample text and your keystrokes are never sent anywhere — everything is scored in your browser. Only your personal-best number (not the text) is saved in this browser so you can track progress across visits.',
      },
      {
        q: 'Why is my WPM lower than other typing test sites?',
        a: 'Sites differ in whether typos reduce your WPM directly or only your accuracy. Here, speed is based only on characters you typed correctly, so a few mistakes you don’t go back and fix will show up as lower accuracy rather than a lower WPM — which can read differently from a site that penalizes speed for every error.',
      },
      {
        q: 'Can I practice typing in Korean here?',
        a: 'Yes — switch Language to 한글 to type Korean sentences. Korean results are shown as 타수 (keystrokes per minute), counted at the jamo level the way Korean typing software does, not simply by syllable count.',
      },
      {
        q: 'Why is pasting disabled in the typing box?',
        a: 'Pasting the sample text would let you "finish" instantly without typing anything, which defeats the purpose of measuring typing speed. You need to type the characters yourself for a result to be recorded.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '타자 연습 — 무료 타자 속도 테스트, 회원가입 없음',
    description:
      '한글 타수와 영문 WPM을 15·30·60초 동안 실시간으로 측정합니다. 개인 최고 기록은 이 브라우저에만 저장되고, 광고와 회원가입이 없습니다.',
    h1: '타자 연습',
    tagline: '예문을 따라 입력하면 타수(또는 WPM)와 정확도가 실시간으로 올라갑니다.',
    name: '타자 연습',
    keywords: ['타자 연습', '타자 속도 테스트', '분당 타수', '한글 타자', 'wpm 테스트'],
    howTo: [
      '영문 또는 한글을 선택하고, 15초·30초·60초 중 테스트 시간을 고릅니다.',
      '입력창을 클릭하고 위에 보이는 예문을 그대로 입력합니다. 첫 글자를 입력하면 타이머가 시작됩니다.',
      '타수(영문은 WPM)와 정확도가 입력하는 즉시 올라갑니다.',
      '시간이 끝나면 결과와 등급, 이 테스트 길이의 개인 최고 기록을 확인합니다.',
      '다시 하기 버튼이나 Esc 키를 누르면 새 예문으로 다시 시작합니다.',
    ],
    sections: [
      {
        heading: '분당 타수는 어떻게 계산하나요',
        body: '한글 분당 타수는 글자 수가 아니라 2벌식 자판 기준 키 입력 횟수(자소)로 계산합니다. 받침 없는 "가"는 2타(ㄱ+ㅏ), 받침 있는 "각"은 3타(ㄱ+ㅏ+ㄱ)입니다. ㅘ·ㅙ·ㅚ·ㅝ·ㅞ·ㅟ·ㅢ 같은 복합모음은 자판에 따로 키가 없어 두 모음을 이어 쳐야 하므로 2타로 계산하고("왜"는 ㅇ+ㅗ+ㅐ로 3타), ㄳ·ㄵ·ㄶ·ㄺ·ㄻ·ㄼ·ㄽ·ㄾ·ㄿ·ㅀ·ㅄ 같은 겹받침도 2타입니다. 쌍자음(ㄲㄸㅃㅆㅉ)은 1타로 계산합니다. 정확히 입력한 글자만 속도에 반영되고, 오타는 정확도에만 반영됩니다.',
      },
      {
        heading: '복사 붙여넣기를 막고 한글 조합을 그대로 믿는 이유',
        body: '예문을 복사해서 붙여넣으면 타자 연습의 의미가 없어지므로 입력창에서 붙여넣기를 막았습니다. 한글 입력은 키 입력을 하나하나 가로채 직접 조합하지 않고, 브라우저와 내 입력기(IME)가 조합한 결과값을 그대로 읽습니다. 그래서 ㅘ·ㄺ처럼 빠르게 조합되는 글자도 깨지거나 누락되지 않습니다.',
      },
      {
        heading: '내 타수는 어느 정도 수준일까',
        body: '일반적으로 성인 평균 타자 속도는 분당 200~300타, 사무직이나 자격증(워드프로세서·ITQ 등) 응시자는 350~450타, 전문 타이피스트는 600타 이상으로 알려져 있습니다. 영문은 분당 40단어(WPM) 정도가 평균, 60 WPM 이상이면 빠른 편, 80 WPM 이상이면 상당히 빠른 수준입니다. 테스트가 끝나면 이 기준에 맞춰 등급을 보여줍니다.',
      },
    ],
    faq: [
      {
        q: '분당 타수(CPM)와 WPM은 어떻게 다른가요?',
        a: '타수는 한글 자소(초성·중성·종성) 입력 횟수를 분당으로 환산한 값이고, WPM은 영어 기준으로 5글자를 한 단어로 보고 분당 단어 수를 계산한 값입니다. 이 도구는 한글 모드에서는 타수를, 영문 모드에서는 WPM을 보여줍니다.',
      },
      {
        q: '입력한 내용이 서버에 저장되거나 전송되나요?',
        a: '아니요. 예문과 입력 내용은 어디로도 전송되지 않고 브라우저 안에서만 채점됩니다. 진행 상황을 기억하기 위해 개인 최고 기록(숫자)만 이 브라우저에 저장됩니다.',
      },
      {
        q: '일반 성인의 평균 타자 속도는 몇 타인가요?',
        a: '일반적으로 분당 200~300타가 평균이며, 사무직이나 워드프로세서·ITQ 같은 자격증 응시자는 350~450타, 전문 타이피스트는 600타 이상인 것으로 알려져 있습니다.',
      },
      {
        q: '쌍자음이나 겹받침도 타수에 반영되나요?',
        a: '네. 복합모음(ㅘㅙㅚㅝㅞㅟㅢ)과 겹받침(ㄳㄵㄶㄺㄻㄼㄽㄾㄿㅀㅄ)은 2타로, 쌍자음(ㄲㄸㅃㅆㅉ)은 1타로 계산해 2벌식 자판의 실제 입력 횟수에 가깝게 측정합니다.',
      },
      {
        q: '예문을 복사해서 붙여넣으면 안 되나요?',
        a: '네, 입력창에서는 붙여넣기가 동작하지 않습니다. 붙여넣으면 타이핑 없이 바로 끝나버려서 속도를 측정하는 의미가 없기 때문입니다. 직접 입력해야 기록이 남습니다.',
      },
    ],
    ui: {
      language: '언어',
      languageEn: 'English',
      languageKo: '한글',
      duration: '시간',
      secondsShort: '{n}초',
      inputLabel: '위 예문을 입력하세요',
      inputPlaceholder: '여기를 클릭하고 입력을 시작하세요…',
      timeLeft: '남은 시간',
      speedWpm: 'WPM',
      speedCpm: '타수(분당)',
      accuracyLabel: '정확도',
      personalBest: '개인 최고 기록',
      newBest: '개인 최고 기록 경신!',
      restart: '다시 하기',
      restartHint: '다시 시작',
      privacyHint:
        '모든 계산은 브라우저 안에서 이루어집니다. 입력 내용은 전송되지 않고, 개인 최고 기록만 이 브라우저에 저장됩니다.',
      tierEnBeginner: '초급 — 일반적인 영문 타이핑은 평균 분당 40단어(WPM) 정도입니다.',
      tierEnAverage: '평균 — 무난한 영문 타자 속도입니다.',
      tierEnGood: '좋음 — 분당 60단어 이상이면 빠른 편입니다.',
      tierEnFast: '빠름 — 분당 80단어 이상으로 대부분의 타이피스트보다 빠릅니다.',
      tierKoBeginner: '초급 — 일반 성인 평균은 분당 200~300타입니다.',
      tierKoAverage: '평균 — 일반적인 성인 타자 속도입니다.',
      tierKoFast: '빠름 — 사무직·자격증 응시자 수준(분당 350~450타)입니다.',
      tierKoExpert: '전문가 — 상위권 타이피스트 수준입니다.',
      tierKoMaster: '마스터 — 분당 600타 이상, 전문 타이피스트 수준입니다.',
    },
  },
};
