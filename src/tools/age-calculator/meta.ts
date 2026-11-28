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

    const timeline = [0, 1, 2, 3, 4].map((offset) => {
      const year = BIRTH_YEAR_REFERENCE_YEAR + offset;
      const range = birthYearAgeRange(birthYear, year);
      return { year, before: range.beforeBirthday, from: range.fromBirthday, yearAge: range.yearAge };
    });
    const elementaryEntry = birthYear + 7;
    const highSchoolGraduation = birthYear + 19;
    const sixtyFive = birthYear + 65;
    const before = ages.beforeBirthday;
    const after = ages.fromBirthday;

    return {
      slug: `${birthYear}-born`,
      preset: { birthDate: `${birthYear}-01-01` },
      content: {
        en: {
          title: `Born in ${birthYear}: Age in ${BIRTH_YEAR_REFERENCE_YEAR} — ${ages.beforeBirthday}–${ages.fromBirthday}, ${zodiac.en} Zodiac`,
          description: `Someone born in ${birthYear} is ${ages.beforeBirthday} before their birthday and ${ages.fromBirthday} from it in ${BIRTH_YEAR_REFERENCE_YEAR}; Korean year age ${ages.yearAge}, ${zodiac.en} zodiac${enSchool ? `, typically ${enSchool}` : ''}.`,
          h1: `Born in ${birthYear}: Age in ${BIRTH_YEAR_REFERENCE_YEAR}`,
          intro: `A person born in ${birthYear} is ${ages.beforeBirthday} before their birthday and ${ages.fromBirthday} from their birthday in ${BIRTH_YEAR_REFERENCE_YEAR}; their Korean year age is ${ages.yearAge}, and their zodiac animal is ${zodiac.en}.${enSchool ? ` With normal progression, a ${birthYear}-born student is in Korean ${enSchool} during the ${BIRTH_YEAR_REFERENCE_YEAR} school year.` : ''} The age range uses the Ministry of Government Legislation's official “Korean Age Unification” formula. School grades follow Articles 13, 24, 39, 42 and 46 of the Elementary and Secondary Education Act in force in ${BIRTH_YEAR_REFERENCE_YEAR}; early or delayed entry and grade retention can change the actual grade. Enter the birthday below for today's exact age.`,
          sections: [
            {
              heading: `${birthYear} born: the same age year by year`,
              body: `A single age only answers the question for one calendar year, so the table carries the ${birthYear} cohort through ${BIRTH_YEAR_REFERENCE_YEAR}–${BIRTH_YEAR_REFERENCE_YEAR + 4}. Subtract the birth year from the calendar year to get the age on or after the birthday, and one less before it; the Korean year age is simply that subtraction and does not wait for the birthday.

The same birth year also fixes the school timeline. Under Article 13 of the Elementary and Secondary Education Act a child starts elementary school on 1 March of the year after turning six, so a ${birthYear} birth normally enters in March ${elementaryEntry} and graduates high school in February ${highSchoolGraduation} after twelve years in the 6-3-3 system. The ${birthYear} cohort reaches 65 in ${sixtyFive}. Early or delayed entry, retention and study abroad shift the school dates but not the age arithmetic.`,
              table: {
                caption: `Age and Korean year age by calendar year for a ${birthYear} birth`,
                head: ['Calendar year', 'Before birthday', `From birthday`, 'Korean year age'],
                rows: timeline.map((row) => [
                  String(row.year),
                  String(row.before),
                  String(row.from),
                  String(row.yearAge),
                ]),
              },
            },
          ],
          faq: [
            {
              q: `How old is someone born in ${birthYear} in ${BIRTH_YEAR_REFERENCE_YEAR}?`,
              a: `They are ${before} before their birthday and ${after} from their birthday onwards in ${BIRTH_YEAR_REFERENCE_YEAR}. The Korean year age is ${ages.yearAge} for the whole calendar year, and in ${BIRTH_YEAR_REFERENCE_YEAR + 1} the same person is ${before + 1} or ${after + 1}.`,
            },
            {
              q: `When did someone born in ${birthYear} start and finish school in Korea?`,
              a: `On the ordinary timeline, elementary school starts in March ${elementaryEntry} and high school ends with graduation in February ${highSchoolGraduation}. Early or delayed entry, repeating a year and studying abroad change the dates, so a school record is the only exact source.`,
            },
            {
              q: `What is the Korean zodiac animal for ${birthYear}?`,
              a: `${birthYear} is the year of the ${zodiac.en} on the plain solar calendar. A birth in January or early February can fall under the previous animal when the lunar new year or the solar term 입춘 (around 3–5 February) is used as the cutoff.`,
            },
          ],
        },
        ko: {
          title: `${birthYear}년생 나이 — ${BIRTH_YEAR_REFERENCE_YEAR}년 만 ${ages.beforeBirthday}~${ages.fromBirthday}세·${zodiac.ko}${koSchool ? `·${koSchool}` : ''}`,
          description: `${BIRTH_YEAR_REFERENCE_YEAR}년 기준 ${birthYear}년생은 생일 전 만 ${ages.beforeBirthday}세, 생일부터 만 ${ages.fromBirthday}세이며 연 나이는 ${ages.yearAge}세입니다. ${zodiac.ko}${koSchool ? `이며 통상 ${koSchool}` : ''}입니다. 법제처·초중등교육법 기준입니다.`,
          h1: `${birthYear}년생 나이`,
          intro: `${BIRTH_YEAR_REFERENCE_YEAR}년 ${birthYear}년생은 생일 전 만 ${ages.beforeBirthday}세, 생일부터 만 ${ages.fromBirthday}세이고 연 나이는 ${ages.yearAge}세이며 ${zodiac.ko}입니다.${koSchool ? ` 통상 ${koSchool}입니다.` : ''} 만 나이는 법제처 「만 나이 통일」 공식 계산식을 적용했습니다.${school ? ` 학년은 국가법령정보센터의 ${BIRTH_YEAR_REFERENCE_YEAR}년 시행 「초·중등교육법」 제13조·제24조·제39조·제42조·제46조에 따른 통상 입학과 6·3·3년 수업연한 기준이며, 조기입학·입학연기·유급이면 달라질 수 있습니다.` : ''} 띠는 대한민국 정책브리핑의 2026년 병오년(말띠) 자료와 12지 순환을 기준으로 계산했습니다. 아래에 생일을 넣으면 오늘 기준 정확한 나이를 확인할 수 있습니다.`,
          sections: [
            {
              heading: `${birthYear}년생, 해마다 나이는 이렇게 바뀝니다`,
              body: `한 해 기준 나이만으로는 다음 해 질문에 답할 수 없어서, 표에 ${birthYear}년생의 ${BIRTH_YEAR_REFERENCE_YEAR}~${BIRTH_YEAR_REFERENCE_YEAR + 4}년 나이를 함께 정리했습니다. 연도에서 출생연도를 빼면 생일이 지난 뒤의 나이가 되고, 생일 전에는 거기서 1을 뺍니다. 연 나이는 이 뺄셈 값 그대로여서 생일과 상관없이 1월 1일에 바뀝니다.

같은 출생연도로 학제 일정도 정해집니다. 「초·중등교육법」 제13조에 따라 만 6세가 된 다음 해 3월 1일에 초등학교에 입학하므로, ${birthYear}년생은 통상 ${elementaryEntry}년 3월에 입학해 6·3·3년 과정을 마치고 ${highSchoolGraduation}년 2월에 고등학교를 졸업합니다. 만 65세가 되는 해는 ${sixtyFive}년입니다. 조기입학·입학연기·유급·유학이 있으면 학교 일정은 달라지지만 나이 계산은 그대로입니다.`,
              table: {
                caption: `${birthYear}년생의 연도별 만 나이와 연 나이`,
                head: ['연도', '생일 전 만 나이', '생일부터 만 나이', '연 나이(1월 1일 기준)'],
                rows: timeline.map((row) => [
                  String(row.year),
                  String(row.before),
                  String(row.from),
                  String(row.yearAge),
                ]),
              },
            },
          ],
          faq: [
            {
              q: `${birthYear}년생은 ${BIRTH_YEAR_REFERENCE_YEAR}년에 몇 살인가요?`,
              a: `${BIRTH_YEAR_REFERENCE_YEAR}년에 생일 전이면 만 ${before}세, 생일부터는 만 ${after}세입니다. 연 나이는 한 해 내내 ${ages.yearAge}세이고, ${BIRTH_YEAR_REFERENCE_YEAR + 1}년에는 만 ${before + 1}세 또는 ${after + 1}세가 됩니다.`,
            },
            {
              q: `${birthYear}년생은 초등학교를 언제 입학하고 고등학교를 언제 졸업하나요?`,
              a: `통상 ${elementaryEntry}년 3월에 초등학교에 입학하고, ${highSchoolGraduation}년 2월에 고등학교를 졸업합니다. 조기입학·입학연기·유급·유학이 있으면 달라지므로 정확한 학력은 학교생활기록부로 확인해야 합니다.`,
            },
            {
              q: `${birthYear}년생 띠는 무엇인가요?`,
              a: `${birthYear}년은 양력 기준 ${zodiac.ko}입니다. 1월이나 2월 초에 태어났다면 음력 설이나 절기 입춘(2월 3~5일경)을 기준으로 앞 해의 띠가 될 수 있습니다.`,
            },
          ],
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
  updated: '2026-11-28',
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
