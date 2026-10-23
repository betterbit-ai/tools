import type { ToolMeta, ToolVariant } from '../types';
import {
  birthYearAgeRange,
  BIRTH_YEAR_REFERENCE_YEAR,
  koreanSchoolGrade,
  zodiacAnimal,
  type KoreanSchoolGrade,
  type ZodiacAnimal,
} from './logic';

const BIRTH_YEAR_START = 1960;
const BIRTH_YEAR_END = 2015;

const ZODIAC_LABELS: Record<ZodiacAnimal, { en: string; ko: string }> = {
  rat: { en: 'Rat', ko: '쥐띠' },
  ox: { en: 'Ox', ko: '소띠' },
  tiger: { en: 'Tiger', ko: '호랑이띠' },
  rabbit: { en: 'Rabbit', ko: '토끼띠' },
  dragon: { en: 'Dragon', ko: '용띠' },
  snake: { en: 'Snake', ko: '뱀띠' },
  horse: { en: 'Horse', ko: '말띠' },
  goat: { en: 'Goat', ko: '양띠' },
  monkey: { en: 'Monkey', ko: '원숭이띠' },
  rooster: { en: 'Rooster', ko: '닭띠' },
  dog: { en: 'Dog', ko: '개띠' },
  pig: { en: 'Pig', ko: '돼지띠' },
};

function koSchoolLabel(school: KoreanSchoolGrade): string {
  const level = school.level === 'elementary' ? '초등학교' : school.level === 'middle' ? '중학교' : '고등학교';
  return `${level} ${school.grade}학년`;
}

function enSchoolLabel(school: KoreanSchoolGrade): string {
  const level =
    school.level === 'elementary' ? 'elementary school' : school.level === 'middle' ? 'middle school' : 'high school';
  return `${level} grade ${school.grade}`;
}

/**
 * One substantive landing page per searched birth year. All answers come from logic.ts so the
 * title, snippet, intro and calculator preset cannot drift apart when the reference year changes.
 */
const variants: ToolVariant[] = Array.from(
  { length: BIRTH_YEAR_END - BIRTH_YEAR_START + 1 },
  (_, index): ToolVariant => {
    const birthYear = BIRTH_YEAR_START + index;
    const ages = birthYearAgeRange(birthYear, BIRTH_YEAR_REFERENCE_YEAR);
    const zodiac = ZODIAC_LABELS[zodiacAnimal(birthYear)];
    const school = koreanSchoolGrade(birthYear, BIRTH_YEAR_REFERENCE_YEAR);
    const koSchool = school ? koSchoolLabel(school) : null;
    const enSchool = school ? enSchoolLabel(school) : null;

    return {
      slug: `${birthYear}-born`,
      preset: { birthDate: `${birthYear}-01-01` },
      content: {
        en: {
          title: `Born in ${birthYear}: Age in ${BIRTH_YEAR_REFERENCE_YEAR} — ${ages.beforeBirthday}–${ages.fromBirthday}, ${zodiac.en} Zodiac`,
          description: `Someone born in ${birthYear} is ${ages.beforeBirthday} before their birthday and ${ages.fromBirthday} from it in ${BIRTH_YEAR_REFERENCE_YEAR}; Korean year age ${ages.yearAge}, ${zodiac.en} zodiac${enSchool ? `, typically ${enSchool}` : ''}.`,
          h1: `Born in ${birthYear}: Age in ${BIRTH_YEAR_REFERENCE_YEAR}`,
          intro: `A person born in ${birthYear} is ${ages.beforeBirthday} before their birthday and ${ages.fromBirthday} from their birthday in ${BIRTH_YEAR_REFERENCE_YEAR}; their Korean year age is ${ages.yearAge}, and their zodiac animal is ${zodiac.en}.${enSchool ? ` With normal progression, a ${birthYear}-born student is in Korean ${enSchool} during the ${BIRTH_YEAR_REFERENCE_YEAR} school year.` : ''} The age range uses the Ministry of Government Legislation's official “Korean Age Unification” formula. School grades follow Articles 13, 24, 39, 42 and 46 of the Elementary and Secondary Education Act in force in ${BIRTH_YEAR_REFERENCE_YEAR}; early or delayed entry and grade retention can change the actual grade. Enter the birthday below for today's exact age.`,
        },
        ko: {
          title: `${birthYear}년생 나이 — ${BIRTH_YEAR_REFERENCE_YEAR}년 만 ${ages.beforeBirthday}~${ages.fromBirthday}세·${zodiac.ko}${koSchool ? `·${koSchool}` : ''}`,
          description: `${BIRTH_YEAR_REFERENCE_YEAR}년 기준 ${birthYear}년생은 생일 전 만 ${ages.beforeBirthday}세, 생일부터 만 ${ages.fromBirthday}세이며 연 나이는 ${ages.yearAge}세입니다. ${zodiac.ko}${koSchool ? `이며 통상 ${koSchool}` : ''}입니다. 법제처·초중등교육법 기준입니다.`,
          h1: `${birthYear}년생 나이`,
          intro: `${BIRTH_YEAR_REFERENCE_YEAR}년 ${birthYear}년생은 생일 전 만 ${ages.beforeBirthday}세, 생일부터 만 ${ages.fromBirthday}세이고 연 나이는 ${ages.yearAge}세이며 ${zodiac.ko}입니다.${koSchool ? ` 통상 ${koSchool}입니다.` : ''} 만 나이는 법제처 「만 나이 통일」 공식 계산식을 적용했습니다.${school ? ` 학년은 국가법령정보센터의 ${BIRTH_YEAR_REFERENCE_YEAR}년 시행 「초·중등교육법」 제13조·제24조·제39조·제42조·제46조에 따른 통상 입학과 6·3·3년 수업연한 기준이며, 조기입학·입학연기·유급이면 달라질 수 있습니다.` : ''} 띠는 대한민국 정책브리핑의 2026년 병오년(말띠) 자료와 12지 순환을 기준으로 계산했습니다. 아래에 생일을 넣으면 오늘 기준 정확한 나이를 확인할 수 있습니다.`,
        },
      },
    };
  },
);

export const meta: ToolMeta = {
  slug: 'age-calculator',
  category: 'time',
  icon: 'cake',
  added: '2026-10-11',
  updated: '2026-10-23',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'Cuemath Age Calculator',
      url: 'https://www.cuemath.com/calculators/age-calculator/',
      weakness:
        'Requires entering both dates and pressing “Calculate”; its result is a years/months/days age span and does not show Korean counting age, year age, zodiac or star sign. Betterbit updates as either date changes and shows those Korean age conventions together. (Strength: it supports a chosen comparison date.)',
    },
    {
      name: 'Omni Calculator — Age Calculator',
      url: 'https://www.omnicalculator.com/everyday-life/age',
      weakness:
        'Its age calculator focuses on elapsed time and does not show Korean counting age, year age, Chinese zodiac or a star sign next to the result. Betterbit makes those Korean conventions and date-based facts visible at once. (Strength: it can include a time of birth and express the result in units from milliseconds through years.)',
    },
    {
      name: 'Calculator.net Age Calculator',
      url: 'https://www.calculator.net/age-calculator.html',
      weakness:
        'Requires a calculation action and presents a dense, ad-supported result page without Korean counting age, year age, Chinese zodiac or star sign. Betterbit updates immediately and keeps those Korean age conventions in a single panel. (Strength: it reports elapsed weeks, hours, minutes and seconds in addition to calendar years, months and days.)',
    },
  ],
  related: ['date-calculator', 'countdown', 'bmi-calculator', 'pregnancy-calculator', 'lunar-converter'],
  variants,
};
