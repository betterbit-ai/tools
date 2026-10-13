import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Enter courses once to compare their credit-weighted GPA on three common scales.',
  autosaved: 'Saved in this browser',
  coursesHeading: 'Courses',
  coursesHint: 'P grades count as completed credits but are excluded from GPA.',
  courseName: 'Course',
  courseNameAria: 'Course name',
  courseNamePlaceholder: 'Optional',
  credits: 'Credits',
  creditsAria: 'Course credits',
  grade: 'Grade',
  gradeAria: 'Course grade',
  removeCourse: 'Remove course',
  addCourse: 'Add course',
  reset: 'Reset',
  resultHeading: 'Your GPA',
  copy: 'Copy results',
  copied: 'Copied',
  gpa45: '4.5 scale',
  gpa43: '4.3 scale',
  gpa40: '4.0 scale',
  gpaCredits: 'GPA credits',
  passCredits: 'Pass credits',
  qualityPoints: 'Quality points (4.5)',
  invalidInput: 'Enter credits greater than 0 and no more than 100 for every course.',
  noGpa: 'Add at least one letter-graded course to calculate a GPA.',
  formula: 'GPA = total of (grade point × credits) ÷ GPA credits',
  scaleNotice:
    'Grade tables differ by school. Confirm your registrar’s table before using a result for an application or official record.',
  privacyNotice: 'Courses and grades stay in this browser; nothing is sent to a server.',
  copySummary: 'GPA (4.5): {gpa45}\nGPA (4.3): {gpa43}\nGPA (4.0): {gpa40}\nGPA credits: {credits}',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'GPA Calculator — 4.5, 4.3 & 4.0 Scales',
    description:
      'Calculate a credit-weighted GPA from course grades and compare 4.5, 4.3, and 4.0 scales at once. Results update instantly and stay in your browser.',
    h1: 'GPA Calculator',
    tagline:
      'Enter each course once, then compare its weighted GPA on 4.5, 4.3, and 4.0 scales side by side—without sending grades anywhere.',
    name: 'GPA Calculator',
    keywords: [
      'gpa calculator',
      'grade point average calculator',
      'weighted GPA',
      '4.0 GPA calculator',
      '4.3 GPA calculator',
      '4.5 GPA calculator',
    ],
    howTo: [
      'Enter the credit value and letter grade for each course.',
      'Use Add course for every additional class; a course name is optional.',
      'Choose P for a pass/fail course when it should not affect your GPA.',
      'Compare the credit-weighted 4.5, 4.3, and 4.0 results as they update.',
      'Confirm your school’s grade table before using the result on an official application.',
    ],
    sections: [
      {
        heading: 'The credit-weighted GPA formula',
        body: 'A GPA is not an ordinary average of course grades. Multiply every grade point by that course’s credits, add those quality points, then divide by the credits that count toward GPA: GPA = Σ(grade point × credits) ÷ Σ(GPA credits). For example, on a 4.5 scale, a 3-credit A+ and a 2-credit B+ produce (3 × 4.5 + 2 × 3.5) ÷ 5 = 4.10. A 4-credit course therefore affects the result twice as much as a 2-credit course.',
      },
      {
        heading: 'Why 4.5, 4.3, and 4.0 are not one universal conversion',
        body: 'Schools set their own grade tables. A common Korean 4.5 table maps A+ to 4.5, A0 to 4.0, and B+ to 3.5; a common 4.3 table maps those grades to 4.3, 4.0, and 3.3. On the common 4.0 table used here, A+ and A0 are both 4.0. This calculator recalculates every entered course against each table instead of simply multiplying a final GPA by a maximum-scale ratio. An institution can use a different table, so its registrar’s published rule always takes priority.',
      },
      {
        heading: 'Pass/fail and repeated courses',
        body: 'This calculator treats P as completed credit that does not enter the GPA denominator or quality-point total, a common convention. F is different: it contributes 0 grade points and its credits remain in the GPA denominator. Schools vary on whether a repeated course replaces the original grade, keeps both attempts, or applies another rule. Enter only the attempts that your own school says belong in the official calculation.',
      },
    ],
    faq: [
      {
        q: 'How do I calculate my GPA?',
        a: 'Calculate GPA by adding every course’s grade point multiplied by its credits, then dividing by the total credits that count toward GPA. For example, 3 credits at 4.5 and 2 credits at 3.5 equal 20 quality points; 20 ÷ 5 gives a 4.00 GPA.',
      },
      {
        q: 'Can I convert a 4.5 GPA directly to a 4.0 GPA?',
        a: 'A direct multiplier is only an estimate because the grade tables can differ. A more defensible conversion recalculates every course under the destination scale; for example, common 4.0 tables cap both A+ and A0 at 4.0 while a common 4.5 table gives A+ 4.5.',
      },
      {
        q: 'Do pass/fail courses count in GPA?',
        a: 'Pass/fail treatment depends on the institution. This calculator excludes P courses from GPA while listing their credits separately, and it includes F as 0 grade points with its credits in the GPA denominator. Check your registrar’s policy for the official result.',
      },
      {
        q: 'Are higher-credit courses more important for GPA?',
        a: 'Yes. GPA is credit-weighted, so a 4-credit course contributes twice as many quality points as the same grade in a 2-credit course. Averaging the visible course grades without credits can give the wrong GPA.',
      },
      {
        q: 'Are my grades sent to a server?',
        a: 'No. This GPA calculator runs in the browser and saves its course list only in this browser’s local storage. Grades and course names are not sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '학점 계산기 — 4.5·4.3·4.0 만점 동시 계산',
    description:
      '과목별 이수학점과 등급으로 평점평균을 계산하고 4.5·4.3·4.0 만점 결과를 한 번에 비교하세요. 입력 즉시 계산되며 성적은 브라우저 밖으로 나가지 않습니다.',
    h1: '학점 계산기',
    tagline: '과목을 한 번만 입력하면 4.5·4.3·4.0 만점 평점을 나란히 계산합니다. 성적은 내 브라우저에서만 처리됩니다.',
    name: '학점 계산기',
    keywords: [
      '학점 계산기',
      '평점 계산기',
      '평점평균 계산기',
      'GPA 계산기',
      '4.5 만점 학점 계산',
      '4.3 만점 환산',
      '4.0 만점 환산',
    ],
    howTo: [
      '과목마다 이수학점과 성적 등급을 입력하세요.',
      '과목 추가를 눌러 수강한 과목을 모두 입력하세요. 과목명은 입력하지 않아도 됩니다.',
      '평점에 넣지 않는 P/F 과목은 성적에서 P를 선택하세요.',
      '입력 즉시 나오는 4.5·4.3·4.0 만점 평점을 비교하세요.',
      '지원서나 성적증명서에 쓸 때는 학교 학칙의 성적 환산표를 다시 확인하세요.',
    ],
    sections: [
      {
        heading: '학점 계산식: 이수학점 가중 평균',
        body: '평점평균은 과목 성적을 단순 평균한 값이 아닙니다. 각 과목의 평점에 이수학점을 곱해 합산한 뒤, 평점에 반영되는 총 이수학점으로 나눕니다. 계산식은 평점평균 = Σ(과목 평점 × 이수학점) ÷ Σ(평점 반영 이수학점)입니다. 예를 들어 4.5 만점에서 3학점 A+(4.5)와 2학점 B+(3.5)를 들었다면 (3 × 4.5 + 2 × 3.5) ÷ 5 = 4.10입니다. 따라서 4학점 과목은 같은 등급의 2학점 과목보다 결과에 두 배 크게 반영됩니다.',
      },
      {
        heading: '4.5·4.3·4.0 만점은 단순 비율 환산이 아닙니다',
        body: '대학마다 등급별 평점표가 다릅니다. 국내에서 흔히 쓰는 4.5 만점 표는 A+=4.5, A0=4.0, B+=3.5이고, 4.3 만점 표는 A+=4.3, A0=4.0, B+=3.3입니다. 이 도구의 일반적인 4.0 만점 표에서는 A+와 A0가 모두 4.0입니다. 그래서 최종 평점에 만점 비율만 곱하는 대신, 입력한 각 과목을 세 평점표로 다시 계산합니다. 다만 대학별 규정이 우선이므로 학교의 학사 안내에서 공식 환산표를 반드시 확인해야 합니다.',
      },
      {
        heading: 'P/F와 재수강 성적 처리',
        body: '이 도구는 P를 이수학점으로는 따로 표시하되 평점과 평점 반영 학점에서는 제외합니다. 이는 흔히 쓰이는 방식이지만 학교마다 다를 수 있습니다. F는 0점으로 계산하며 해당 이수학점은 평점 반영 학점에 남습니다. 재수강은 기존 성적을 대체하는지, 두 성적을 모두 남기는지에 따라 결과가 달라지므로 소속 대학의 학칙에 따라 평점에 반영되는 과목만 입력하세요.',
      },
    ],
    faq: [
      {
        q: '학점은 어떻게 계산하나요?',
        a: '학점은 각 과목의 평점에 이수학점을 곱해 모두 더한 뒤 평점 반영 이수학점으로 나눠 계산합니다. 예를 들어 3학점 4.5와 2학점 3.5는 평점 합계 20점이며, 20 ÷ 5 = 4.00입니다.',
      },
      {
        q: '4.5 만점 평점을 4.0 만점으로 바로 환산해도 되나요?',
        a: '만점 비율을 곱한 값은 추정치일 뿐입니다. 더 정확하게 비교하려면 과목별 등급을 목적 대학의 평점표로 다시 계산해야 합니다. 일반적인 4.0 만점 표는 A+와 A0를 모두 4.0으로 처리하지만 4.5 만점 표는 A+를 4.5로 처리합니다.',
      },
      {
        q: 'P/F 과목은 평점에 포함되나요?',
        a: 'P/F 과목 처리 방식은 대학마다 다릅니다. 이 계산기는 P 과목을 평점에서 제외하고 이수학점만 따로 표시하며, F는 0점과 해당 이수학점을 평점 계산에 포함합니다. 공식 평점은 학교 학칙을 기준으로 확인해야 합니다.',
      },
      {
        q: '이수학점이 큰 과목이 평점에 더 크게 반영되나요?',
        a: '네. 평점은 이수학점 가중 평균이므로 4학점 과목은 같은 등급의 2학점 과목보다 평점 합계에 두 배 크게 반영됩니다. 과목 등급만 단순 평균하면 실제 평점과 달라질 수 있습니다.',
      },
      {
        q: '입력한 성적이 서버로 전송되나요?',
        a: '아니요. 이 학점 계산기는 브라우저에서만 실행되며 입력한 과목 목록은 이 브라우저의 로컬 저장소에만 보관됩니다. 성적과 과목명은 서버로 전송되지 않습니다.',
      },
    ],
    ui: {
      intro: '과목을 한 번 입력하면 세 가지 만점 기준의 이수학점 가중 평점을 비교할 수 있습니다.',
      autosaved: '이 브라우저에 저장됨',
      coursesHeading: '수강 과목',
      coursesHint: 'P는 이수학점에만 포함되고 평점 계산에서는 제외됩니다.',
      courseName: '과목명',
      courseNameAria: '과목명',
      courseNamePlaceholder: '선택 입력',
      credits: '이수학점',
      creditsAria: '과목 이수학점',
      grade: '성적',
      gradeAria: '과목 성적',
      removeCourse: '과목 삭제',
      addCourse: '과목 추가',
      reset: '초기화',
      resultHeading: '계산 결과',
      copy: '결과 복사',
      copied: '복사됨',
      gpa45: '4.5 만점',
      gpa43: '4.3 만점',
      gpa40: '4.0 만점',
      gpaCredits: '평점 반영 학점',
      passCredits: 'P 이수학점',
      qualityPoints: '평점 합계 (4.5)',
      invalidInput: '모든 과목의 이수학점은 0보다 크고 100 이하여야 합니다.',
      noGpa: '평점을 계산하려면 등급이 있는 과목을 한 개 이상 입력하세요.',
      formula: '평점평균 = Σ(과목 평점 × 이수학점) ÷ 평점 반영 학점',
      scaleNotice:
        '대학마다 성적 환산표가 다릅니다. 지원서나 공식 증명서에 쓰기 전에는 학교 학사 안내의 평점표를 확인하세요.',
      privacyNotice: '입력한 과목과 성적은 이 브라우저에만 남으며 서버로 전송되지 않습니다.',
      copySummary:
        '평점 (4.5 만점): {gpa45}\n평점 (4.3 만점): {gpa43}\n평점 (4.0 만점): {gpa40}\n평점 반영 학점: {credits}',
    },
  },
};
