/**
 * The character catalog and search functions for Character Map. Everything here
 * is pure so the catalog can be searched and the recent list can be tested
 * without a browser or clipboard.
 */

export const KEYBOARD_GROUP_IDS = [
  'giyok',
  'nieun',
  'digeut',
  'rieul',
  'mieum',
  'bieup',
  'siot',
  'ieung',
  'jieut',
  'chieut',
  'hieut',
] as const;
export type KeyboardGroupId = (typeof KEYBOARD_GROUP_IDS)[number];
export type CharacterGroupId = 'all' | 'popular' | KeyboardGroupId;

export interface CharacterEntry {
  character: string;
  group: KeyboardGroupId;
  name: string;
  /** Search words include common English and Korean names. */
  keywords: string[];
}

type RawEntry = readonly [character: string, name: string, keywords: string];

function entries(group: KeyboardGroupId, rows: RawEntry[]): CharacterEntry[] {
  return rows.map(([character, name, keywords]) => ({
    character,
    group,
    name,
    keywords: keywords.split(' '),
  }));
}

const GIYOK = entries('giyok', [
  ['!', 'Exclamation mark', '느낌표 exclamation'],
  ['?', 'Question mark', '물음표 question'],
  ['…', 'Horizontal ellipsis', '말줄임표 ellipsis'],
  ['·', 'Middle dot', '가운뎃점 middle dot'],
  ['―', 'Horizontal bar', '가로줄 bar'],
  ['~', 'Tilde', '물결표 tilde'],
  ['※', 'Reference mark', '참고표 mark'],
  ['§', 'Section sign', '절 section'],
  ['¶', 'Pilcrow', '단락 pilcrow'],
  ['†', 'Dagger', '단검 dagger'],
  ['‡', 'Double dagger', '이중 단검 double dagger'],
  ['°', 'Degree sign', '도 degree'],
]);

const NIEUN = entries('nieun', [
  ['(', 'Left parenthesis', '소괄호 parenthesis'],
  [')', 'Right parenthesis', '소괄호 parenthesis'],
  ['[', 'Left square bracket', '대괄호 bracket'],
  [']', 'Right square bracket', '대괄호 bracket'],
  ['{', 'Left curly bracket', '중괄호 brace'],
  ['}', 'Right curly bracket', '중괄호 brace'],
  ['〈', 'Left angle bracket', '홑낫표 angle'],
  ['〉', 'Right angle bracket', '홑낫표 angle'],
  ['《', 'Left double angle bracket', '겹낫표 double angle'],
  ['》', 'Right double angle bracket', '겹낫표 double angle'],
  ['「', 'Left corner bracket', '모서리 bracket'],
  ['」', 'Right corner bracket', '모서리 bracket'],
  ['“', 'Left double quotation mark', '큰따옴표 quote'],
  ['”', 'Right double quotation mark', '큰따옴표 quote'],
  ['‘', 'Left single quotation mark', '작은따옴표 quote'],
  ['’', 'Right single quotation mark', '작은따옴표 quote'],
]);

const DIGEUT = entries('digeut', [
  ['±', 'Plus-minus sign', '플러스마이너스 plus minus'],
  ['×', 'Multiplication sign', '곱하기 multiply times'],
  ['÷', 'Division sign', '나누기 divide'],
  ['≠', 'Not equal to', '같지않음 not equal'],
  ['≤', 'Less-than or equal to', '작거나같음 less equal'],
  ['≥', 'Greater-than or equal to', '크거나같음 greater equal'],
  ['∞', 'Infinity', '무한 infinity'],
  ['√', 'Square root', '제곱근 root'],
  ['∑', 'N-ary summation', '시그마 합 summation sigma'],
  ['∏', 'N-ary product', '파이 곱 product'],
  ['∫', 'Integral', '적분 integral'],
  ['∂', 'Partial differential', '편미분 partial'],
  ['∈', 'Element of', '원소 element'],
  ['∩', 'Intersection', '교집합 intersection'],
  ['∪', 'Union', '합집합 union'],
  ['∴', 'Therefore', '그러므로 therefore'],
]);

const RIEUL = entries('rieul', [
  ['$', 'Dollar sign', '달러 dollar'],
  ['€', 'Euro sign', '유로 euro'],
  ['£', 'Pound sign', '파운드 pound'],
  ['¥', 'Yen sign', '엔 yen'],
  ['₩', 'Won sign', '원 won'],
  ['¢', 'Cent sign', '센트 cent'],
  ['₹', 'Indian rupee sign', '루피 rupee'],
  ['₽', 'Ruble sign', '루블 ruble'],
  ['℃', 'Degree Celsius', '섭씨 celsius'],
  ['℉', 'Degree Fahrenheit', '화씨 fahrenheit'],
  ['‰', 'Per mille sign', '퍼밀 per mille'],
  ['㎡', 'Square metre', '제곱미터 square meter'],
  ['㎠', 'Square centimetre', '제곱센티미터 square centimeter'],
  ['㎏', 'Kilogram', '킬로그램 kilogram'],
  ['㎞', 'Kilometre', '킬로미터 kilometer'],
  ['ℓ', 'Litre', '리터 litre'],
]);

const MIEUM = entries('mieum', [
  ['●', 'Black circle', '검은원 원 circle'],
  ['○', 'White circle', '흰원 원 circle'],
  ['★', 'Black star', '별 star'],
  ['☆', 'White star', '별 star'],
  ['◆', 'Black diamond', '마름모 diamond'],
  ['◇', 'White diamond', '마름모 diamond'],
  ['■', 'Black square', '사각형 square'],
  ['□', 'White square', '사각형 square'],
  ['▲', 'Black up-pointing triangle', '삼각형 triangle'],
  ['△', 'White up-pointing triangle', '삼각형 triangle'],
  ['▼', 'Black down-pointing triangle', '삼각형 triangle'],
  ['▽', 'White down-pointing triangle', '삼각형 triangle'],
  ['→', 'Rightwards arrow', '오른쪽 화살표 arrow'],
  ['←', 'Leftwards arrow', '왼쪽 화살표 arrow'],
  ['↑', 'Upwards arrow', '위 화살표 arrow'],
  ['↓', 'Downwards arrow', '아래 화살표 arrow'],
  ['↔', 'Left right arrow', '양방향 화살표 arrow'],
  ['⇒', 'Rightwards double arrow', '오른쪽 이중 화살표 arrow'],
  ['⇐', 'Leftwards double arrow', '왼쪽 이중 화살표 arrow'],
  ['↕', 'Up down arrow', '상하 화살표 arrow'],
  ['☎', 'Telephone', '전화 telephone'],
  ['☏', 'Telephone location sign', '전화 telephone'],
  ['☜', 'White left pointing index', '손가락 pointing hand'],
  ['☞', 'White right pointing index', '손가락 pointing hand'],
]);

const BIEUP = entries('bieup', [
  ['─', 'Box drawings light horizontal', '선 line horizontal'],
  ['│', 'Box drawings light vertical', '선 line vertical'],
  ['┌', 'Box drawings light down and right', '선 line corner'],
  ['┐', 'Box drawings light down and left', '선 line corner'],
  ['└', 'Box drawings light up and right', '선 line corner'],
  ['┘', 'Box drawings light up and left', '선 line corner'],
  ['├', 'Box drawings light vertical and right', '선 line tee'],
  ['┤', 'Box drawings light vertical and left', '선 line tee'],
  ['┬', 'Box drawings light down and horizontal', '선 line tee'],
  ['┴', 'Box drawings light up and horizontal', '선 line tee'],
  ['┼', 'Box drawings light vertical and horizontal', '선 line cross'],
  ['═', 'Box drawings double horizontal', '이중선 double line'],
  ['║', 'Box drawings double vertical', '이중선 double line'],
  ['╔', 'Box drawings double down and right', '이중선 double line'],
  ['╗', 'Box drawings double down and left', '이중선 double line'],
  ['╚', 'Box drawings double up and right', '이중선 double line'],
  ['╝', 'Box drawings double up and left', '이중선 double line'],
]);

const SIOT = entries('siot', [
  ['①', 'Circled digit one', '동그라미 숫자 circled number one'],
  ['②', 'Circled digit two', '동그라미 숫자 circled number two'],
  ['③', 'Circled digit three', '동그라미 숫자 circled number three'],
  ['④', 'Circled digit four', '동그라미 숫자 circled number four'],
  ['⑤', 'Circled digit five', '동그라미 숫자 circled number five'],
  ['⑥', 'Circled digit six', '동그라미 숫자 circled number six'],
  ['⑦', 'Circled digit seven', '동그라미 숫자 circled number seven'],
  ['⑧', 'Circled digit eight', '동그라미 숫자 circled number eight'],
  ['⑨', 'Circled digit nine', '동그라미 숫자 circled number nine'],
  ['⑩', 'Circled number ten', '동그라미 숫자 circled number ten'],
  ['㉠', 'Circled Hangul kiyeok', '동그라미 한글 기역 circled hangul'],
  ['㉡', 'Circled Hangul nieun', '동그라미 한글 니은 circled hangul'],
  ['㉢', 'Circled Hangul tikeut', '동그라미 한글 디귿 circled hangul'],
  ['㉣', 'Circled Hangul rieul', '동그라미 한글 리을 circled hangul'],
]);

const IEUNG = entries('ieung', [
  ['ⓐ', 'Circled Latin small letter a', '동그라미 알파벳 a circled latin'],
  ['ⓑ', 'Circled Latin small letter b', '동그라미 알파벳 b circled latin'],
  ['ⓒ', 'Circled Latin small letter c', '동그라미 알파벳 c circled latin'],
  ['ⓓ', 'Circled Latin small letter d', '동그라미 알파벳 d circled latin'],
  ['ⓔ', 'Circled Latin small letter e', '동그라미 알파벳 e circled latin'],
  ['ⓕ', 'Circled Latin small letter f', '동그라미 알파벳 f circled latin'],
  ['ⓖ', 'Circled Latin small letter g', '동그라미 알파벳 g circled latin'],
  ['ⓗ', 'Circled Latin small letter h', '동그라미 알파벳 h circled latin'],
  ['ⓘ', 'Circled Latin small letter i', '동그라미 알파벳 i circled latin'],
  ['ⓙ', 'Circled Latin small letter j', '동그라미 알파벳 j circled latin'],
  ['ⓚ', 'Circled Latin small letter k', '동그라미 알파벳 k circled latin'],
  ['ⓛ', 'Circled Latin small letter l', '동그라미 알파벳 l circled latin'],
  ['ⓜ', 'Circled Latin small letter m', '동그라미 알파벳 m circled latin'],
  ['ⓩ', 'Circled Latin small letter z', '동그라미 알파벳 z circled latin'],
]);

const JIEUT = entries('jieut', [
  ['Ⅰ', 'Roman numeral one', '로마 숫자 roman one'],
  ['Ⅱ', 'Roman numeral two', '로마 숫자 roman two'],
  ['Ⅲ', 'Roman numeral three', '로마 숫자 roman three'],
  ['Ⅳ', 'Roman numeral four', '로마 숫자 roman four'],
  ['Ⅴ', 'Roman numeral five', '로마 숫자 roman five'],
  ['Ⅵ', 'Roman numeral six', '로마 숫자 roman six'],
  ['Ⅶ', 'Roman numeral seven', '로마 숫자 roman seven'],
  ['Ⅷ', 'Roman numeral eight', '로마 숫자 roman eight'],
  ['Ⅸ', 'Roman numeral nine', '로마 숫자 roman nine'],
  ['Ⅹ', 'Roman numeral ten', '로마 숫자 roman ten'],
  ['ⅰ', 'Small Roman numeral one', '소문자 로마 숫자 roman one'],
  ['ⅱ', 'Small Roman numeral two', '소문자 로마 숫자 roman two'],
  ['ⅲ', 'Small Roman numeral three', '소문자 로마 숫자 roman three'],
  ['ⅳ', 'Small Roman numeral four', '소문자 로마 숫자 roman four'],
]);

const CHIEUT = entries('chieut', [
  ['½', 'Vulgar fraction one half', '분수 half one two'],
  ['⅓', 'Vulgar fraction one third', '분수 third one three'],
  ['⅔', 'Vulgar fraction two thirds', '분수 third two three'],
  ['¼', 'Vulgar fraction one quarter', '분수 quarter one four'],
  ['¾', 'Vulgar fraction three quarters', '분수 quarter three four'],
  ['⅛', 'Vulgar fraction one eighth', '분수 eighth one eight'],
  ['¹', 'Superscript one', '위첨자 superscript one'],
  ['²', 'Superscript two', '위첨자 superscript two'],
  ['³', 'Superscript three', '위첨자 superscript three'],
  ['⁴', 'Superscript four', '위첨자 superscript four'],
  ['ⁿ', 'Superscript n', '위첨자 superscript n'],
  ['₁', 'Subscript one', '아래첨자 subscript one'],
  ['₂', 'Subscript two', '아래첨자 subscript two'],
  ['₃', 'Subscript three', '아래첨자 subscript three'],
  ['₄', 'Subscript four', '아래첨자 subscript four'],
  ['ₙ', 'Subscript n', '아래첨자 subscript n'],
]);

const HIEUT = entries('hieut', [
  ['α', 'Greek small letter alpha', '그리스 문자 greek alpha'],
  ['β', 'Greek small letter beta', '그리스 문자 greek beta'],
  ['γ', 'Greek small letter gamma', '그리스 문자 greek gamma'],
  ['δ', 'Greek small letter delta', '그리스 문자 greek delta'],
  ['ε', 'Greek small letter epsilon', '그리스 문자 greek epsilon'],
  ['θ', 'Greek small letter theta', '그리스 문자 greek theta'],
  ['λ', 'Greek small letter lambda', '그리스 문자 greek lambda'],
  ['μ', 'Greek small letter mu', '그리스 문자 greek mu'],
  ['π', 'Greek small letter pi', '그리스 문자 greek pi'],
  ['σ', 'Greek small letter sigma', '그리스 문자 greek sigma'],
  ['φ', 'Greek small letter phi', '그리스 문자 greek phi'],
  ['ω', 'Greek small letter omega', '그리스 문자 greek omega'],
  ['Δ', 'Greek capital letter delta', '그리스 문자 greek delta'],
  ['Ω', 'Greek capital letter omega', '그리스 문자 greek omega'],
]);

export const CHARACTERS: CharacterEntry[] = [
  ...GIYOK,
  ...NIEUN,
  ...DIGEUT,
  ...RIEUL,
  ...MIEUM,
  ...BIEUP,
  ...SIOT,
  ...IEUNG,
  ...JIEUT,
  ...CHIEUT,
  ...HIEUT,
];

const POPULAR_CHARACTERS = new Set([
  '★',
  '☆',
  '✓',
  '✔',
  '→',
  '←',
  '↑',
  '↓',
  '♥',
  '♡',
  '©',
  '®',
  '™',
  '℃',
  '㎡',
  '①',
  '±',
  '∞',
]);
const EXTRA_POPULAR = entries('mieum', [
  ['✓', 'Check mark', '체크 check tick'],
  ['✔', 'Heavy check mark', '체크 check tick'],
  ['♥', 'Black heart suit', '하트 heart'],
  ['♡', 'White heart suit', '하트 heart'],
  ['©', 'Copyright sign', '저작권 copyright'],
  ['®', 'Registered sign', '등록 trademark registered'],
  ['™', 'Trade mark sign', '상표 trademark'],
]);
const ALL_CHARACTERS = [...CHARACTERS, ...EXTRA_POPULAR];

/** Formats one Unicode scalar value as the familiar U+XXXX label. */
export function codePointOf(character: string): string {
  const point = character.codePointAt(0);
  return point === undefined ? '' : `U+${point.toString(16).toUpperCase().padStart(4, '0')}`;
}

/** Search the catalog by character, Unicode code point, English name, or Korean keyword. */
export function filterCharacters(query: string, group: CharacterGroupId): CharacterEntry[] {
  const normalized = query.trim().toLocaleLowerCase();
  const candidates =
    group === 'popular'
      ? ALL_CHARACTERS.filter((entry) => POPULAR_CHARACTERS.has(entry.character))
      : group === 'all'
        ? ALL_CHARACTERS
        : ALL_CHARACTERS.filter((entry) => entry.group === group);

  if (!normalized) return candidates;
  const code = normalized.replace(/^u\+?/u, '').replace(/^0x/u, '');
  return candidates.filter((entry) => {
    const haystack = [entry.character, entry.name, ...entry.keywords, codePointOf(entry.character)]
      .join(' ')
      .toLocaleLowerCase();
    return (
      haystack.includes(normalized) ||
      (/^[0-9a-f]+$/u.test(code) && codePointOf(entry.character).slice(2).toLocaleLowerCase().includes(code))
    );
  });
}

/** Adds a copied character to the front of a deduplicated, bounded recent list. */
export function rememberRecent(recent: string[], character: string, limit = 24): string[] {
  const safeLimit = Math.max(0, Math.floor(limit));
  if (!character || safeLimit === 0) return [];
  return [character, ...new Set(recent.filter((item) => item !== character))].slice(0, safeLimit);
}
