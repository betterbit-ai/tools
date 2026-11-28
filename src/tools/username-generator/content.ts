import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  styleLabel: 'Style',
  styleHint: 'Mix a describing word with a thing, or put a number on the end.',
  styleAdjectiveNoun: 'English word pair (QuietFalcon)',
  styleWordNumber: 'English word + number (quietfalcon42)',
  styleKoModifierNoun: 'Korean modifier + noun (말랑한감자)',
  styleKoNounTail: 'Korean noun + tail (감자장인)',
  platformLabel: 'Where will you use it?',
  platformHint: 'Sets the {limit}-character limit and the separators that platform accepts.',
  platformAnyHint: 'No platform limit applied; set your own length below.',
  platformAny: 'Anywhere / no limit',
  keywordLabel: 'Word you want inside (optional)',
  keywordHint: 'A name, hobby or word. Letters and digits only, up to 20 characters.',
  keywordPlaceholder: 'e.g. panda, 감자, minji',
  countLabel: 'How many',
  maxLengthLabel: 'Maximum length',
  maxLengthFixed: 'Maximum length ({limit})',
  maxLengthPlatformHint: 'Fixed by the platform you chose.',
  separatorLabel: 'Separator',
  separatorHint: 'Options this platform does not allow are hidden.',
  separatorNone: 'None',
  digitsLabel: 'Digits at the end',
  digitsHint: 'A short number makes a taken name more likely to be free.',
  digitsNone: 'No digits',
  digitsTwo: '2 digits',
  digitsThree: '3 digits',
  digitsFour: '4 digits',
  avoidLookalike: 'Avoid look-alike characters (l, I, 1, O, 0)',
  generateMore: 'Generate more',
  copyAll: 'Copy all',
  copied: 'Copied',
  keywordScriptNotice:
    'The keyword is written in Korean, so the English styles would produce a mixed-script handle that most sign-up forms reject. Choose a Korean style, or use a Latin keyword.',
  noResults: 'No name fits these settings. Raise the maximum length, clear the keyword, or pick another style.',
  favoriteFailed:
    'This browser blocked local storage, so favourites cannot be saved here. The names still copy normally.',
  resultsTitle: 'Suggestions',
  resultsHint: '{count} names, each checked against the length limit',
  copyOne: 'Copy',
  favorite: 'Save to favourites',
  unfavorite: 'Remove from favourites',
  favoritesTitle: 'Saved names',
  favoritesHint: 'Kept in this browser only, so you can compare a few before signing up.',
  favoritesEmpty: 'Press the star beside a name to keep it here.',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Username Generator — Random Handles and Korean Nicknames',
    description:
      'Generate English handles and Korean nicknames that fit a platform’s length and character rules. Filter by keyword and length, copy a batch — nothing is uploaded.',
    h1: 'Username Generator',
    tagline:
      'Get a batch of readable names in the form the site you are joining actually accepts, from English handles to Korean 닉네임.',
    name: 'Username Generator',
    keywords: [
      'username generator',
      'random username',
      'nickname generator',
      'handle generator',
      'gamer tag generator',
      'korean nickname generator',
      '닉네임 추천',
      'instagram username ideas',
    ],
    howTo: [
      'Choose a style: an English word pair, an English word with a number, or one of two Korean nickname patterns.',
      'Pick the platform you are joining so the length limit and separators follow its rules.',
      'Add a word you want inside the name, and set how many suggestions you need.',
      'Press Generate more until a name fits, then click it to copy.',
      'Star the names worth keeping, then try them on the platform’s sign-up form.',
    ],
    sections: [
      {
        heading: 'How the names are put together',
        body: 'The English word-pair style combines one of 40 adjectives (quiet, amber, midnight …) with one of 40 nouns (falcon, harbor, lantern …), which gives 1,600 base combinations before a separator or number is added; capitalising both words produces a handle such as QuietFalcon, while the word-number style lowercases it and always appends at least two digits. The Korean styles follow the pattern Korean nickname sites use: a modifier plus a noun (말랑한감자, literally “squishy potato”) from 30 modifiers and 30 nouns, or a noun plus a tail such as 장인 or 요정 from the same 30 nouns and 10 tails. Every result is de-duplicated inside the batch, so a list of 12 contains 12 different names rather than the same one twice.',
      },
      {
        heading: 'Platform limits the generator applies',
        body: 'Sign-up forms reject names for reasons that have nothing to do with taste, so the platform picker applies the documented rule before you copy anything. Instagram allows 1–30 characters using letters, numbers, periods and underscores, with no trailing period and no double period; X allows 1–15 with letters, numbers and underscore only; TikTok allows 2–24 with letters, numbers, period and underscore; Discord allows 2–32 in lowercase letters, numbers, period and underscore; GitHub allows 1–39 with letters, numbers and hyphens, but no double hyphen and no leading or trailing hyphen. Choosing a platform hides the separators it does not accept and fixes the maximum length, so a name that appears on this page can be pasted straight into that platform’s form.',
      },
      {
        heading: 'Vocabulary, remembering and privacy',
        body: 'A short, pronounceable name survives being read aloud in a voice chat, typed from memory and searched for later, which is why the lists here hold ordinary words rather than strings of consonants. A four-digit ending pushes the combination space into the millions and makes a taken name much more likely to be free, but the tool cannot check availability — that requires asking the platform, and doing so from here would send every name you are considering to a third party. Nothing you type or generate leaves this tab: the lists load with the page, favourites are kept in this browser’s local storage, and no account is needed. Avoid putting your real name, birthday, school or workplace into a public handle.',
      },
    ],
    faq: [
      {
        q: 'Are these usernames available on Instagram, X or TikTok?',
        a: 'This tool cannot know. Availability is decided by each platform, and checking it automatically would mean sending every candidate name to that platform before you choose one. The generator does apply the platform’s length and character rules, so a name it shows is at least allowed by the form; try your favourite on the sign-up screen and keep two or three backups from the batch.',
      },
      {
        q: 'Can I make a Korean nickname that is not a translation of an English one?',
        a: 'Yes — choose one of the two Korean styles. 말랑한감자 combines a modifier with a noun the way Korean community nicknames usually do, and 감자장인 puts a noun with a tail such as 장인, 요정 or 대장. Both use Hangul only, no spaces, so they fit Korean game and community forms that reject Latin letters or limit the name to two to eight characters.',
      },
      {
        q: 'Why does the generator refuse my keyword in an English style?',
        a: 'A Hangul keyword inside an English word pair produces a mixed-script handle such as Quiet감자, which most sign-up forms reject or display badly. The tool keeps the keyword and warns you instead of silently deleting it; switch to a Korean style to use it, or enter a Latin keyword for the English styles. Keywords are limited to letters and digits, up to 20 characters.',
      },
      {
        q: 'How many combinations are there?',
        a: 'The English word-pair style has 1,600 base combinations from 40 adjectives and 40 nouns, before a separator or a numeric ending is added. The Korean modifier-plus-noun style has 900 and the noun-plus-tail style has 300. Adding four digits multiplies any of those by 10,000; duplicates inside one batch are removed, so you never see the same name twice in a list.',
      },
      {
        q: 'Where are my saved names stored?',
        a: 'In this browser’s local storage under a single key on this site, not in an account or a server. They stay until you clear site data or press the star again to remove them. If a browser blocks storage in private mode, the names still generate and copy normally, and the tool tells you that saving failed.',
      },
      {
        q: 'Is a generated name unique or trademark-free?',
        a: 'No. These are ordinary dictionary words combined by rule, so another person can generate the same name, and no trademark search is performed. Treat the output as a shortlist: pick one that reads well, check it on the platform, and avoid names that impersonate a brand, a public figure or an official account, which most services prohibit.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '닉네임 생성기 — 한글·영문 아이디 추천',
    description:
      '영문 아이디와 한글 닉네임을 플랫폼 글자 수·허용 문자 규칙에 맞춰 만들어 줍니다. 키워드와 길이를 정하고 한 번에 복사하세요. 입력한 내용은 업로드되지 않습니다.',
    h1: '닉네임 생성기',
    tagline:
      '가입하려는 서비스가 실제로 받아 주는 형식으로 읽기 쉬운 후보를 한 번에 만들고, 마음에 드는 이름은 즐겨찾기에 모아 비교합니다.',
    name: '닉네임 생성기',
    keywords: [
      '닉네임 생성기',
      '닉네임 추천',
      '한글 닉네임',
      '랜덤 닉네임',
      '아이디 생성기',
      '영문 아이디 추천',
      '게임 닉네임',
      '인스타 아이디 추천',
    ],
    howTo: [
      '스타일을 고릅니다. 영문 꾸밈말+명사, 영문+숫자, 한글 꾸밈말+명사, 한글 명사+꼬리말 중 하나입니다.',
      '가입할 플랫폼을 고르면 그 서비스의 글자 수 제한과 허용 구분자가 자동으로 적용됩니다.',
      '넣고 싶은 단어와 만들 개수를 정합니다.',
      '다시 만들기를 눌러 후보를 바꾸고, 마음에 드는 이름을 눌러 복사합니다.',
      '별표로 후보를 저장해 두고 가입 화면에서 하나씩 확인합니다.',
    ],
    sections: [
      {
        heading: '이름이 만들어지는 방식',
        body: '영문 꾸밈말+명사 스타일은 형용사 40개(quiet, amber, midnight …)와 명사 40개(falcon, harbor, lantern …)를 짝지어 기본 1,600가지를 만들고, 두 단어를 모두 대문자로 시작하면 QuietFalcon 같은 아이디가 됩니다. 영문+숫자 스타일은 소문자로 쓰고 끝에 최소 두 자리 숫자를 붙입니다. 한글 스타일은 국내 커뮤니티 닉네임의 관행을 따릅니다. 꾸밈말 30개와 명사 30개를 붙여 말랑한감자처럼 만들거나, 같은 명사 30개에 장인·요정·대장 같은 꼬리말 10개를 붙여 감자장인처럼 만듭니다. 한 번에 만드는 목록 안에서는 같은 이름이 두 번 나오지 않도록 중복을 제거합니다.',
      },
      {
        heading: '플랫폼별 규칙을 미리 적용합니다',
        body: '가입 화면에서 거절되는 이유는 취향이 아니라 형식인 경우가 많아, 플랫폼을 고르면 복사하기 전에 규칙을 적용합니다. Instagram은 1~30자에 영문·숫자·마침표·밑줄을 허용하고 마침표로 끝나거나 두 번 연속 올 수 없습니다. X는 1~15자에 영문·숫자·밑줄만, TikTok은 2~24자에 영문·숫자·마침표·밑줄, Discord는 2~32자 소문자·숫자·마침표·밑줄, GitHub은 1~39자에 영문·숫자·하이픈을 허용하되 하이픈이 맨 앞·맨 뒤에 오거나 두 번 연속 올 수 없습니다. 플랫폼을 고르면 허용되지 않는 구분자는 숨겨지고 최대 길이가 고정되어, 화면에 나온 이름을 그대로 붙여 넣을 수 있습니다.',
      },
      {
        heading: '단어 선택, 기억하기, 개인정보',
        body: '짧고 발음하기 쉬운 이름은 음성 채팅에서 불리고, 기억으로 입력되고, 나중에 검색되기에 유리합니다. 그래서 단어 목록에는 자음 나열이 아니라 일상 낱말을 넣었습니다. 숫자 네 자리를 붙이면 조합 수가 수백만 가지로 늘어 이미 쓰이는 이름을 피할 가능성이 커지지만, 사용 가능 여부는 확인하지 않습니다. 확인하려면 플랫폼에 물어야 하고, 이 페이지에서 자동으로 하면 고민 중인 후보 전부를 제3자에게 보내게 되기 때문입니다. 입력한 내용과 만든 이름은 이 탭 밖으로 나가지 않으며, 즐겨찾기는 이 브라우저의 로컬 저장소에만 남습니다. 실명·생일·학교·직장은 공개 닉네임에 넣지 마세요.',
      },
    ],
    faq: [
      {
        q: '이 닉네임이 인스타·X·틱톡에서 사용 가능한가요?',
        a: '이 도구는 알 수 없습니다. 사용 가능 여부는 각 플랫폼이 정하고, 자동으로 확인하려면 후보 이름 전부를 그 플랫폼에 보내야 합니다. 대신 플랫폼의 글자 수와 허용 문자 규칙은 미리 적용하므로 화면에 나온 이름은 최소한 형식은 통과합니다. 마음에 드는 이름은 가입 화면에서 확인하고, 후보 두세 개를 함께 저장해 두세요.',
      },
      {
        q: '영문을 번역한 느낌이 아닌 한글 닉네임도 만들 수 있나요?',
        a: '한글 스타일 두 가지를 쓰면 됩니다. 꾸밈말+명사는 말랑한감자처럼 국내 커뮤니티에서 흔히 쓰는 방식으로 만들고, 명사+꼬리말은 감자장인·수달요정처럼 명사 뒤에 장인·요정·대장 같은 말을 붙입니다. 둘 다 한글만 쓰고 띄어쓰기가 없어, 영문을 막거나 2~8자로 제한하는 게임·커뮤니티 가입 양식에 맞습니다.',
      },
      {
        q: '영문 스타일에 한글 키워드를 넣으면 왜 경고가 나오나요?',
        a: '영문 단어 조합에 한글 키워드를 넣으면 Quiet감자처럼 문자 체계가 섞인 아이디가 되어 대부분의 가입 양식에서 거절되거나 깨져 보입니다. 도구는 키워드를 지우지 않고 그대로 두고 경고만 합니다. 한글 스타일로 바꾸거나 영문 키워드를 넣으세요. 키워드는 문자와 숫자만, 최대 20자까지 쓸 수 있습니다.',
      },
      {
        q: '조합은 모두 몇 가지인가요?',
        a: '영문 꾸밈말+명사는 형용사 40개와 명사 40개로 기본 1,600가지이고, 구분자나 숫자를 붙이면 더 늘어납니다. 한글 꾸밈말+명사는 900가지, 명사+꼬리말은 300가지입니다. 숫자 네 자리를 붙이면 어느 스타일이든 1만 배가 되고, 한 목록 안의 중복은 제거되어 같은 이름이 두 번 나오지 않습니다.',
      },
      {
        q: '저장한 이름은 어디에 보관되나요?',
        a: '이 브라우저의 로컬 저장소에 이 사이트의 키 하나로 저장되며, 계정이나 서버로는 전송되지 않습니다. 사이트 데이터를 지우거나 별표를 다시 누르면 사라집니다. 시크릿 모드처럼 저장이 막힌 브라우저에서도 이름 생성과 복사는 그대로 되고, 저장이 실패했다는 안내만 표시됩니다.',
      },
      {
        q: '만든 닉네임은 고유하거나 상표 문제가 없나요?',
        a: '아닙니다. 일상 낱말을 규칙으로 조합한 것이라 다른 사람에게 같은 이름이 나올 수 있고, 상표 조사도 하지 않습니다. 후보 목록으로만 쓰세요. 읽기 편한 이름을 골라 플랫폼에서 확인하고, 브랜드나 공인, 공식 계정을 흉내 내는 이름은 대부분의 서비스에서 이용 제한 대상이므로 피해야 합니다.',
      },
    ],
    ui: {
      styleLabel: '스타일',
      styleHint: '꾸밈말과 명사를 붙이거나, 끝에 숫자를 더합니다.',
      styleAdjectiveNoun: '영문 조합 (QuietFalcon)',
      styleWordNumber: '영문+숫자 (quietfalcon42)',
      styleKoModifierNoun: '한글 꾸밈말+명사 (말랑한감자)',
      styleKoNounTail: '한글 명사+꼬리말 (감자장인)',
      platformLabel: '어디에 쓸 닉네임인가요?',
      platformHint: '{limit}자 제한과 이 플랫폼이 허용하는 구분자를 적용합니다.',
      platformAnyHint: '플랫폼 제한 없이 아래에서 직접 길이를 정합니다.',
      platformAny: '제한 없음',
      keywordLabel: '넣고 싶은 단어 (선택)',
      keywordHint: '이름·취미·좋아하는 낱말. 문자와 숫자만, 최대 20자.',
      keywordPlaceholder: '예: 감자, panda, 민지',
      countLabel: '만들 개수',
      maxLengthLabel: '최대 길이',
      maxLengthFixed: '최대 길이 ({limit}자)',
      maxLengthPlatformHint: '선택한 플랫폼 규칙으로 고정됩니다.',
      separatorLabel: '구분자',
      separatorHint: '이 플랫폼이 허용하지 않는 구분자는 숨겨집니다.',
      separatorNone: '없음',
      digitsLabel: '끝에 붙일 숫자',
      digitsHint: '짧은 숫자를 붙이면 이미 쓰는 이름을 피할 가능성이 커집니다.',
      digitsNone: '숫자 없음',
      digitsTwo: '2자리',
      digitsThree: '3자리',
      digitsFour: '4자리',
      avoidLookalike: '헷갈리는 글자 피하기 (l, I, 1, O, 0)',
      generateMore: '다시 만들기',
      copyAll: '전체 복사',
      copied: '복사됨',
      keywordScriptNotice:
        '키워드가 한글이라 영문 스타일에서는 문자 체계가 섞인 아이디가 되어 대부분의 가입 양식에서 거절됩니다. 한글 스타일을 고르거나 영문 키워드를 입력하세요.',
      noResults: '이 설정에 맞는 이름이 없습니다. 최대 길이를 늘리거나 키워드를 지우거나 다른 스타일을 골라 보세요.',
      favoriteFailed:
        '이 브라우저가 로컬 저장소를 막아 즐겨찾기를 저장할 수 없습니다. 이름 생성과 복사는 그대로 됩니다.',
      resultsTitle: '추천 이름',
      resultsHint: '{count}개 · 글자 수 제한을 확인한 이름입니다',
      copyOne: '복사',
      favorite: '즐겨찾기에 저장',
      unfavorite: '즐겨찾기에서 제거',
      favoritesTitle: '저장한 이름',
      favoritesHint: '이 브라우저에만 보관되므로 가입 전에 몇 개를 모아 비교할 수 있습니다.',
      favoritesEmpty: '이름 옆 별표를 누르면 여기에 보관됩니다.',
    },
  },
};
