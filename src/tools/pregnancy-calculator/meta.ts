import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'pregnancy-calculator',
  category: 'calculator',
  icon: 'calendar',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['privacy', 'no-ads', 'usability', 'features'],
  competitors: [
    {
      name: 'NHS — Due date calculator',
      url: 'https://www.nhs.uk/pregnancy/finding-out/due-date-calculator/',
      weakness:
        'The form uses separate day, month, and year fields and requires a “show your estimated due date” action. It has no conception-date or IVF-transfer option, or a dated trimester and term-milestone timeline. Betterbit recalculates immediately and shows those calendar milestones. (Strength: it is a public-health source with clear NHS antenatal-care guidance.)',
    },
    {
      name: 'Clearblue — Due Date Calculator',
      url: 'https://www.clearblue.com/am-i-pregnant/due-date-calculator',
      weakness:
        'The calculator requires a Calculate action after the LMP and cycle-length controls, and the page says it uses cookies, pixels, and similar technologies for traffic analysis and personalized advertising, including health-condition-related data. Betterbit calculates locally with no ads or tracking and adds IVF-transfer dating with dated trimester milestones. (Strength: it offers a separate “how many weeks pregnant” path and related educational articles.)',
    },
    {
      name: 'DueDateLab — Due Date Calculator',
      url: 'https://duedatelab.com/',
      weakness:
        'The tool supports LMP, conception, and a known due date, but its result requires a dedicated “Calculate due date” click and the page includes affiliate disclosures and Amazon book links. Betterbit updates with each valid input and keeps the due date, current gestational age, and six key calendar milestones in a compact ad-free panel. (Strength: it has a richer week-by-week reading library and a known-due-date reverse calculation.)',
    },
    {
      name: 'MomCalc — 출산예정일 계산기',
      url: 'https://momcalc.kr/due-date',
      weakness:
        '마지막 생리 시작일 또는 수정일을 고른 뒤 “계산하기”를 눌러야 하며, 페이지는 일반적인 28일 생리주기 기준이라고만 안내한다. 평균 주기를 입력해 예정일을 조정하거나, 결과와 함께 임신 주수·삼분기·만삭 시작일을 달력으로 보는 기능은 없다. Betterbit은 입력 즉시 이 정보를 함께 계산한다. (장점: 마지막 생리일과 수정일 두 기준을 간단하게 제공한다.)',
    },
    {
      name: '머니셈 — 출산예정일 계산기',
      url: 'https://money-sem.com/due-date/',
      weakness:
        '검색 결과의 도구 설명은 마지막 생리 시작일에서 D+280과 현재 임신 주수를 계산한다고 밝히며, 기본값은 28일 주기라고 안내한다. 공개된 입력 흐름에는 수정일·시험관 배아 이식일과 배아 일수 선택이 없고, 결과에 14·28·37·39주 경계 날짜를 함께 제시하지 않는다. Betterbit은 세 가지 기준과 주차별 달력 일정을 한 화면에서 제공한다. (장점: 국내 임신 관련 검사·지원 제도 안내를 함께 제공한다.)',
    },
    {
      name: '몇이지? — 출산 예정일 계산기',
      url: 'https://myeotiji.kr/due-date',
      weakness:
        '마지막 생리 시작일과 수정일, 평균 생리주기는 지원하지만 검색 결과에 보이는 계산 화면은 예정일과 현재 임신 주수를 중심으로 구성되어 있으며 IVF 이식일·3일/5일 배아별 표준 오프셋을 입력하는 경로가 없다. Betterbit은 ACOG의 263일·261일 이식 기준과 삼분기·만삭 시작 날짜를 결과에 바로 표시한다. (장점: ACOG 산과 기준을 설명 콘텐츠에서 명시하고 수정일 입력을 제공한다.)',
    },
  ],
  related: ['age-calculator', 'date-calculator', 'countdown'],
};
