import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  expressionLabel: 'Cron expression',
  expressionPlaceholder: '0 9 * * 1-5',
  errorTooFew: 'A cron expression needs five fields (six with seconds): minute hour day month weekday.',
  errorTooMany: 'Seven fields are not supported. Use five fields, or six to add seconds at the front.',
  errorOutOfRange: 'The value in the {field} field is outside its range.',
  errorBadValue: 'The {field} field has a value that is not a number, a range, a list or a step: “{value}”.',
  errorBadRange: 'The {field} field has a range that runs backwards: “{value}”.',
  errorStepZero: 'The {field} field uses a step of 0, which never moves.',
  errorUnknownMacro: '“{value}” is not a known shortcut. Use @hourly, @daily, @weekly, @monthly or @yearly.',
  errorReboot: '@reboot runs once when the daemon starts, so it has no next run time to show.',
  fieldSecond: 'second',
  fieldMinute: 'minute',
  fieldHour: 'hour',
  fieldDayOfMonth: 'day of month',
  fieldMonth: 'month',
  fieldDayOfWeek: 'day of week',
  presetsLabel: 'Examples',
  presetEveryMinute: 'Every minute',
  presetQuarter: 'Every 15 minutes',
  presetWeekdays: 'Weekdays 09:00',
  presetMonthly: 'Monthly, 1st',
  presetEverySixHours: 'Every 6 hours',
  zoneLabel: 'Time zone',
  zoneLocal: 'This device',
  zoneUtc: 'UTC',
  nextTitle: 'Next 10 runs',
  nextInZone: 'Calculated in {zone}.',
  noRuns: 'This expression never fires in the next five years. A date such as 30 February cannot occur.',
  secondsNote: 'Six fields read the first one as seconds.',
  breakdownTitle: 'What each field means',
  everyValue: 'every',
  fieldLabel: 'Field',
  valueLabel: 'Values',
  ruleNote: 'When day of month and day of week are both set, cron runs on either one, not both.',
  autosaved: 'Saved in this browser only',
};

export type UI = typeof uiEn;

const uiKo = {
  expressionLabel: '크론 표현식',
  expressionPlaceholder: '0 9 * * 1-5',
  errorTooFew: '크론 표현식은 다섯 칸(초를 넣으면 여섯 칸)이 필요합니다. 분 시 일 월 요일 순서입니다.',
  errorTooMany: '일곱 칸은 지원하지 않습니다. 다섯 칸으로 쓰거나, 맨 앞에 초를 넣어 여섯 칸으로 쓰세요.',
  errorOutOfRange: '{field} 칸의 값이 범위를 벗어났습니다.',
  errorBadValue: '{field} 칸에 숫자·범위·목록·간격이 아닌 값 “{value}”이 있습니다.',
  errorBadRange: '{field} 칸의 범위가 거꾸로입니다: “{value}”.',
  errorStepZero: '{field} 칸의 간격이 0이라 값이 늘지 않습니다.',
  errorUnknownMacro: '“{value}”은(는) 알려진 단축어가 아닙니다. @hourly, @daily, @weekly, @monthly, @yearly를 쓰세요.',
  errorReboot: '@reboot은 데몬이 시작할 때 한 번 실행되므로 다음 실행 시각을 계산할 수 없습니다.',
  fieldSecond: '초',
  fieldMinute: '분',
  fieldHour: '시',
  fieldDayOfMonth: '일',
  fieldMonth: '월',
  fieldDayOfWeek: '요일',
  presetsLabel: '예시',
  presetEveryMinute: '매분',
  presetQuarter: '15분마다',
  presetWeekdays: '평일 09:00',
  presetMonthly: '매월 1일',
  presetEverySixHours: '6시간마다',
  zoneLabel: '시간대',
  zoneLocal: '이 기기',
  zoneUtc: 'UTC',
  nextTitle: '다음 실행 10회',
  nextInZone: '{zone} 기준으로 계산했습니다.',
  noRuns: '앞으로 5년 안에 실행되는 시각이 없습니다. 2월 30일처럼 없는 날짜는 실행되지 않습니다.',
  secondsNote: '여섯 칸이면 맨 앞을 초로 읽습니다.',
  breakdownTitle: '칸별 해석',
  everyValue: '매',
  fieldLabel: '칸',
  valueLabel: '값',
  ruleNote: '일과 요일을 모두 지정하면 둘 중 하나만 맞아도 실행됩니다(AND가 아니라 OR).',
  autosaved: '이 브라우저에만 저장됩니다',
};

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Cron Expression Parser — Next Run Times, 5 or 6 Fields',
    description:
      'Turn a cron expression into a sentence and its next ten run times, in your zone or UTC. Follows real Vixie cron rules, day-of-month OR weekday included.',
    h1: 'Cron Expression Parser',
    tagline: 'Read a crontab line as a sentence and see the next ten times it fires, with the real cron rules.',
    name: 'Cron Parser',
    keywords: ['cron expression', 'crontab generator', 'cron parser', 'cron next run', '크론 표현식', '크론탭'],
    howTo: [
      'Type or paste an expression such as 0 9 * * 1-5, or pick an example.',
      'Read the sentence above the list to check the schedule in words.',
      'Check the next ten run times in your device zone or in UTC.',
      'Look at the field table when a field is not doing what you expected.',
    ],
    sections: [
      {
        heading: 'Five fields, and the rule everyone forgets',
        body: 'The fields are minute (0–59), hour (0–23), day of month (1–31), month (1–12) and day of week (0–7, where both 0 and 7 are Sunday). Each accepts *, a value, a list (1,15), a range (1-5), a step (*/15) and combinations such as 9-17/2. Month and weekday names such as JAN and MON-FRI work too, and @hourly, @daily, @weekly, @monthly and @yearly are expanded to their five-field form.\n\nThe rule that catches people is the two day fields: when both day of month and day of week are restricted, cron runs the job when either matches, not both. 0 0 13 * 5 does not mean "Friday the 13th"; it fires on every 13th and on every Friday, four to six times a month. A field that starts with * counts as unrestricted, so 0 0 */2 * 1 fires every other day and on every Monday.',
      },
      {
        heading: 'Why the next run times are the fastest check',
        body: "An expression can be syntactically valid and still not do what you meant. 0 */6 * * * and */6 0 * * * differ by one position: the first runs at 00:00, 06:00, 12:00 and 18:00, the second runs every six minutes from 00:00 to 00:54. Reading the next ten times shows which one you wrote before it reaches production.\n\nTimes are computed in the zone you choose. A crontab runs in the server's local zone, while GitHub Actions schedules and many cloud schedulers run in UTC, so a job meant for 09:00 in Seoul needs 0 0 * * * on a UTC scheduler — nine hours earlier, and a weekday earlier when the time is before 09:00 KST.",
      },
      {
        heading: 'Seconds, and what is not standard cron',
        body: 'A sixth field at the front adds seconds: */10 * * * * * fires every ten seconds. That is the Spring @Scheduled and Quartz order, not the crontab order, and Quartz also numbers weekdays from 1 (Sunday), so a Quartz expression copied unchanged into a crontab runs a day late.\n\nL, W, # and @reboot belong to Quartz or to the cron daemon rather than to the five-field time syntax, so this tool does not evaluate them: @reboot has no next run time, and an expression with L or # is reported as an error instead of being guessed at.',
      },
    ],
    faq: [
      {
        q: 'What does 0 9 * * 1-5 mean?',
        a: 'At 09:00, Monday through Friday: minute 0, hour 9, every day of the month, every month, and weekdays 1 to 5. In the next run list it appears as five times a week, one per weekday, and never on Saturday or Sunday.',
      },
      {
        q: 'Why does 0 0 13 * 5 run more than once a month?',
        a: 'Because the two day fields are ORed. With both day of month (13) and day of week (Friday) restricted, cron fires on every 13th and on every Friday, which is four to six times in a month. To get only Friday the 13th, run a daily job and check both conditions inside the script.',
      },
      {
        q: 'What time zone are the next run times in?',
        a: 'Whichever you choose above the list. This device calculates in its own zone, and UTC is available for schedulers such as GitHub Actions, EventBridge and most Kubernetes controllers. Cron itself runs in the time zone of the machine or scheduler, so check the server setting before trusting a schedule.',
      },
      {
        q: 'Can I use six fields for seconds?',
        a: 'Yes. Six fields read the first one as seconds, so */10 * * * * * fires every ten seconds and 0 30 9 * * 1-5 fires at 09:30:00 on weekdays. That is the Spring and Quartz order; standard crontab has no seconds field.',
      },
      {
        q: 'Why is */7 not every seven minutes evenly?',
        a: 'A step starts at the beginning of the field and adds the step, so */7 in the minute field gives 0, 7, 14, 21, 28, 35, 42, 49 and 56, then restarts at 0 of the next hour. The gap between 56 and the next 0 is four minutes, not seven. Steps that divide 60 evenly — 2, 3, 4, 5, 6, 10, 12, 15, 20, 30 — stay even.',
      },
      {
        q: 'Is my expression uploaded?',
        a: 'No. The expression is parsed and the run times are computed in this tab, and the text is only stored in this browser so a refresh keeps it. A crontab line can name internal jobs, so nothing is sent to a server.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '크론 표현식 해석기 — 다음 실행 시각, 5·6칸 지원',
    description:
      '크론 표현식을 문장으로 풀고 다음 실행 시각을 이 기기 시간대 또는 UTC로 보여 줍니다. 일·요일 OR 규칙까지 실제 크론 규칙대로 계산하고, 입력은 전송되지 않습니다.',
    h1: '크론 표현식 해석기',
    tagline: 'crontab 한 줄을 문장으로 읽고, 앞으로 실행될 열 번의 시각을 실제 크론 규칙대로 보여 줍니다.',
    name: '크론 해석기',
    keywords: ['크론 표현식', '크론탭', 'cron 표현식', '다음 실행 시간', 'crontab', 'cron parser'],
    howTo: [
      '0 9 * * 1-5 같은 표현식을 입력하거나 예시 버튼을 누릅니다.',
      '목록 위의 문장을 읽어 일정이 의도대로인지 확인합니다.',
      '이 기기 시간대 또는 UTC 기준으로 다음 실행 열 번을 확인합니다.',
      '칸별 해석 표에서 어느 칸이 예상과 다른지 확인합니다.',
    ],
    sections: [
      {
        heading: '다섯 칸, 그리고 모두가 잊는 규칙',
        body: '칸은 분(0~59), 시(0~23), 일(1~31), 월(1~12), 요일(0~7, 0과 7 모두 일요일) 순서입니다. 각 칸에는 *, 값, 목록(1,15), 범위(1-5), 간격(*/15), 그리고 9-17/2 같은 조합을 쓸 수 있습니다. JAN이나 MON-FRI 같은 이름도 되고, @hourly·@daily·@weekly·@monthly·@yearly는 다섯 칸 형태로 풀립니다.\n\n가장 많이 걸리는 규칙이 두 날짜 칸입니다. 일과 요일을 모두 지정하면 둘 중 하나만 맞아도 실행됩니다. 0 0 13 * 5는 “13일이면서 금요일”이 아니라 “매월 13일 또는 매주 금요일”이라 한 달에 4~6번 실행됩니다. *로 시작하는 칸은 제한이 없는 것으로 보므로 0 0 */2 * 1은 이틀마다 그리고 매주 월요일에 실행됩니다.',
      },
      {
        heading: '다음 실행 시각이 가장 빠른 확인인 이유',
        body: '문법이 맞아도 의도와 다른 표현식이 많습니다. 0 */6 * * *와 */6 0 * * *는 한 칸 차이지만, 앞은 00시·06시·12시·18시에, 뒤는 00시 00분부터 54분까지 6분마다 실행됩니다. 배포 전에 다음 열 번을 보면 어느 쪽을 썼는지 바로 드러납니다.\n\n시각은 선택한 시간대로 계산합니다. crontab은 서버의 로컬 시간대를 따르고, GitHub Actions 스케줄과 많은 클라우드 스케줄러는 UTC를 씁니다. 한국 시간 오전 9시에 돌리려면 UTC 스케줄러에는 0 0 * * *를 적어야 하고, 오전 9시 이전 시각이면 요일도 하루 앞당겨야 합니다.',
      },
      {
        heading: '초 칸과 표준 크론이 아닌 것',
        body: '맨 앞에 여섯 번째 칸을 넣으면 초입니다. */10 * * * * *는 10초마다 실행됩니다. 이는 crontab이 아니라 Spring @Scheduled와 Quartz의 순서이고, Quartz는 요일을 1(일요일)부터 세므로 Quartz 표현식을 그대로 crontab에 옮기면 하루씩 어긋납니다.\n\nL, W, #, @reboot은 다섯 칸 시간 문법이 아니라 Quartz나 cron 데몬의 기능입니다. 이 도구는 이를 추측해서 계산하지 않습니다. @reboot은 다음 실행 시각이 없다고 알리고, L이나 #이 들어간 표현식은 오류로 알립니다.',
      },
    ],
    faq: [
      {
        q: '0 9 * * 1-5는 무슨 뜻인가요?',
        a: '평일(월~금) 오전 9시입니다. 분 0, 시 9, 일은 매일, 월은 매월, 요일은 1~5(월~금)라는 뜻입니다. 다음 실행 목록에는 주 5회, 평일마다 한 번씩 나오고 토·일요일에는 나오지 않습니다.',
      },
      {
        q: '0 0 13 * 5가 왜 한 달에 여러 번 실행되나요?',
        a: '두 날짜 칸이 OR로 묶이기 때문입니다. 일(13)과 요일(금요일)을 모두 지정하면 매월 13일과 매주 금요일 모두에 실행되어 한 달에 4~6번이 됩니다. 13일이면서 금요일인 날에만 돌리려면 매일 실행하고 스크립트 안에서 두 조건을 확인해야 합니다.',
      },
      {
        q: '다음 실행 시각은 어느 시간대 기준인가요?',
        a: '목록 위에서 고른 시간대입니다. 이 기기의 시간대와 UTC 중에 고를 수 있고, UTC는 GitHub Actions·EventBridge·대부분의 쿠버네티스 컨트롤러에 맞습니다. 크론 자체는 서버나 스케줄러의 시간대를 따르므로 배포 전에 서버 설정을 확인하세요.',
      },
      {
        q: '초까지 지정하는 여섯 칸도 되나요?',
        a: '네. 여섯 칸이면 맨 앞을 초로 읽습니다. */10 * * * * *는 10초마다, 0 30 9 * * 1-5는 평일 09:30:00에 실행됩니다. 이는 Spring과 Quartz의 순서이며 표준 crontab에는 초 칸이 없습니다.',
      },
      {
        q: '*/7은 왜 7분마다 균등하지 않나요?',
        a: '간격은 칸의 시작값부터 더하기 때문입니다. 분 칸의 */7은 0, 7, 14, 21, 28, 35, 42, 49, 56분에 실행되고 다음 시각 0분으로 돌아갑니다. 56분과 다음 0분 사이는 7분이 아니라 4분입니다. 60을 나누어떨어지게 하는 2, 3, 4, 5, 6, 10, 12, 15, 20, 30은 균등합니다.',
      },
      {
        q: '표현식이 서버로 전송되나요?',
        a: '아니요. 표현식 해석과 시각 계산이 이 탭에서 실행되고, 입력은 새로고침해도 남도록 이 브라우저에만 저장됩니다. crontab 한 줄에는 내부 작업 이름이 들어가므로 서버로 보내지 않는 것이 중요합니다.',
      },
    ],
    ui: uiKo,
  },
};
