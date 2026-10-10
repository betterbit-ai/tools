import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  intro: 'Type an expression or tap the keys. Results update live, and your last calculations are saved.',
  autosaved: 'Autosaved',
  expressionLabel: 'Expression',
  angleModeLabel: 'Angle unit',
  degreeLabel: 'DEG',
  radianLabel: 'RAD',
  memoryIndicator: 'M',
  errorSyntax: "Can't parse this — check for unmatched parentheses, a trailing operator, or an unknown name.",
  errorDomain:
    "That's not mathematically defined for these inputs (divide by zero, a negative-number square root, an inverse-trig value outside [-1, 1], or a negative base with a fractional exponent).",
  errorOverflow: 'The result is too large to display.',
  historyHeading: 'History',
  historyEmpty: 'No calculations yet.',
  historyHint: 'Tap a line to load its result back in.',
  clearHistory: 'Clear',
  kbdEquals: 'calculates',
  kbdClear: 'clears everything',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Scientific Calculator — Keyboard Input, Deg/Rad, History',
    description:
      'A free scientific calculator with sin/cos/tan, log/ln, powers and factorials. Type full expressions on your keyboard and reuse any past result from history — no ads.',
    h1: 'Scientific Calculator',
    tagline: 'Trig, logs, powers and more — type the whole expression or tap the keys, your choice.',
    name: 'Scientific Calculator',
    keywords: [
      'scientific calculator online',
      'sin cos tan calculator',
      'log calculator',
      'trigonometry calculator',
      'calculator with history',
      'degrees radians calculator',
    ],
    howTo: [
      'Type an expression directly into the display, e.g. sin(30)+sqrt(16), or build it by tapping the keys.',
      'Switch DEG/RAD before using any trig function — it changes how sin, cos, tan, asin, acos and atan read and return angles.',
      'Press Enter or "=" to calculate.',
      'Open History on the right and tap any past line to load that result back into the display and keep calculating.',
      'Use MC/MR/M+/M- to store a running value in memory across several calculations.',
    ],
    sections: [
      {
        heading: 'What this calculator supports',
        body: 'Arithmetic (+ − × ÷ ^ %), trigonometry (sin, cos, tan and their inverses asin, acos, atan) in degrees or radians, natural and base-10 logarithms (ln, log), square and cube roots (√, ∛), factorials up to 170! (171! overflows a standard double-precision float, so it is reported as an error instead of a wrong number), and the constants π and e.\n\nOperations with no defined result — dividing by zero, the square root of a negative number, an inverse-trig argument outside [-1, 1], tan at 90°/270° (and every odd multiple of 90°), or a negative base raised to a fractional power — are reported as errors instead of silently returning Infinity or a non-numeric result.',
      },
      {
        heading: 'Degrees or radians',
        body: 'The DEG/RAD switch above the display changes how sin, cos, tan, asin, acos and atan treat their input and output. In DEG mode, sin(90) = 1. In RAD mode, the same button computes sin(π/2) = 1 — type pi or tap the π key for the constant. Switching modes does not change what is already written in the display; it only changes how trig functions in it are read on the next calculation.',
      },
      {
        heading: 'Typing full expressions',
        body: 'The display is a real text field, not a fixed set of button slots, so you can type an entire expression — including function names like sin(, sqrt( or log( — directly on a physical or on-screen keyboard, move the cursor, and edit any part of it, the same way you would in a text editor. The % key divides the current value by 100 (so 50% is 0.5); it does not add a percentage to a preceding number.',
      },
    ],
    faq: [
      {
        q: 'Does this scientific calculator save my calculation history?',
        a: 'Yes. Every calculation you run is added to the History panel, newest first, up to the last 30 entries. It is saved to your browser (localStorage), so it is still there after you reload the page — but it never leaves your device.',
      },
      {
        q: 'Can I type a full expression instead of tapping buttons?',
        a: 'Yes. The display is a normal text field, so you can type expressions such as sin(30)+sqrt(16)^2 or 2^10 directly on your keyboard, including function names, and press Enter to calculate.',
      },
      {
        q: 'Why does tan(90) show an error instead of a huge number?',
        a: 'Mathematically, tangent has no defined value at 90° (and 270°, and every odd multiple of 90°) because it is a division by zero in disguise. Floating-point math would otherwise show a huge, meaningless finite number there (since 90° cannot be represented as an exactly exact fraction of π in binary) — this calculator detects that case and reports an error instead.',
      },
      {
        q: 'What is the largest factorial this calculator can compute?',
        a: '170! is the largest factorial that fits in standard double-precision floating point (about 7.26 × 10³⁰⁶). 171! and above overflow that format, so the calculator reports an error rather than an incorrect number.',
      },
      {
        q: 'How does the % key work here?',
        a: 'Pressing % divides the number immediately before it by 100. For example, 50% becomes 0.5, and 200+10% evaluates as 200 + (10/100) = 200.1 — the percent only applies to the number next to it, not to the whole expression.',
      },
      {
        q: 'Is my data private?',
        a: "Yes. Every calculation runs in your browser; nothing is sent to a server, and the saved history lives only in your browser's local storage on this device.",
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '공학용 계산기 — 키보드 입력, 도(DEG)/라디안(RAD), 계산 기록',
    description:
      'sin·cos·tan, log·ln, 거듭제곱, 계승(!)까지 지원하는 무료 온라인 공학용 계산기. 수식을 키보드로 직접 입력할 수 있고, 지난 계산 기록을 저장해 다시 불러올 수 있습니다. 광고 없음.',
    h1: '공학용 계산기',
    tagline: '삼각함수·로그·거듭제곱까지. 버튼으로 눌러도 되고, 수식을 통째로 타이핑해도 됩니다.',
    name: '공학용 계산기',
    keywords: [
      '공학용 계산기',
      '사인 코사인 탄젠트 계산기',
      '로그 계산기',
      '삼각함수 계산기',
      '계산 기록 계산기',
      '도 라디안 계산기',
    ],
    howTo: [
      '입력창에 sin(30)+sqrt(16)처럼 수식을 바로 타이핑하거나, 버튼을 눌러 만듭니다.',
      '삼각함수를 쓰기 전에 DEG/RAD를 먼저 맞춥니다 — sin, cos, tan, asin, acos, atan이 각도를 읽고 돌려주는 방식이 달라집니다.',
      'Enter 또는 "=" 버튼으로 계산합니다.',
      '오른쪽 기록(History)에서 지난 줄을 탭하면 그 결과를 입력창에 다시 불러와 이어서 계산할 수 있습니다.',
      'MC/MR/M+/M-로 여러 계산에 걸쳐 값을 메모리에 저장해 둘 수 있습니다.',
    ],
    sections: [
      {
        heading: '지원하는 계산',
        body: '사칙연산(+ − × ÷ ^ %), 삼각함수(sin, cos, tan과 역함수 asin, acos, atan)를 도(DEG)와 라디안(RAD) 단위로, 자연로그와 상용로그(ln, log), 제곱근·세제곱근(√, ∛), 170!까지의 계승(171!부터는 배정밀도 부동소수점 범위를 넘어서므로 틀린 숫자 대신 오류로 표시), 원주율 π와 자연상수 e를 계산할 수 있습니다.\n\n0으로 나누기, 음수의 제곱근, [-1, 1] 범위를 벗어난 역삼각함수 입력, 90°·270°(및 90°의 모든 홀수배)에서의 탄젠트, 분수 지수를 가진 음수 밑처럼 수학적으로 정의되지 않은 계산은 Infinity나 정의되지 않은 값을 그대로 보여주는 대신 오류로 알려줍니다.',
      },
      {
        heading: 'DEG(도)와 RAD(라디안)',
        body: '입력창 위의 DEG/RAD 전환 버튼은 sin, cos, tan, asin, acos, atan이 입력과 결과를 해석하는 방식을 바꿉니다. DEG 모드에서는 sin(90) = 1입니다. RAD 모드에서 같은 결과를 보려면 sin(π/2) = 1처럼 입력합니다 — π는 pi를 타이핑하거나 π 버튼을 눌러 입력할 수 있습니다. 모드를 바꿔도 이미 입력창에 쓴 내용은 바뀌지 않고, 다음 계산부터 그 안의 삼각함수를 새 모드로 해석합니다.',
      },
      {
        heading: '수식을 통째로 입력하기',
        body: '입력창은 정해진 버튼 칸이 아니라 실제 텍스트 입력란이라서, sin(, sqrt(, log(처럼 함수 이름까지 포함한 수식 전체를 물리 키보드나 화면 키보드로 바로 타이핑하고, 커서를 옮기고, 원하는 부분만 고칠 수 있습니다 — 일반 텍스트 편집기를 쓰는 것과 같습니다. % 키는 바로 앞의 숫자를 100으로 나눕니다(50%는 0.5). 앞의 숫자에 퍼센트를 더하는 방식이 아닙니다.',
      },
    ],
    faq: [
      {
        q: '공학용 계산기에 계산 기록이 저장되나요?',
        a: '네. 계산할 때마다 오른쪽 기록(History)에 최신 항목이 맨 위로 추가되고, 최근 30개까지 보관됩니다. 이 기록은 브라우저의 로컬 저장소에 저장되어 새로고침해도 남아 있지만, 기기 밖으로는 전송되지 않습니다.',
      },
      {
        q: '버튼을 누르지 않고 수식을 통째로 입력할 수 있나요?',
        a: '네. 입력창은 일반 텍스트 입력란이라서 sin(30)+sqrt(16)^2나 2^10 같은 수식을 함수 이름까지 포함해 키보드로 바로 입력하고 Enter로 계산할 수 있습니다.',
      },
      {
        q: 'tan(90)을 누르면 왜 큰 숫자가 아니라 오류가 나오나요?',
        a: '탄젠트는 90°(그리고 270°, 90°의 모든 홀수배)에서 수학적으로 정의되지 않습니다 — 사실상 0으로 나누는 것과 같기 때문입니다. 90°는 π의 정확한 분수로 2진 부동소수점에 표현되지 않아서, 그대로 계산하면 의미 없는 거대한 숫자가 나옵니다. 이 계산기는 이 경우를 감지해 오류로 표시합니다.',
      },
      {
        q: '이 계산기로 계산할 수 있는 가장 큰 계승은 얼마인가요?',
        a: '170!(약 7.26 × 10³⁰⁶)이 배정밀도 부동소수점으로 표현할 수 있는 가장 큰 계승입니다. 171! 이상은 이 범위를 넘어서므로, 틀린 숫자 대신 오류로 표시됩니다.',
      },
      {
        q: '% 키는 어떻게 계산되나요?',
        a: '% 키는 바로 앞의 숫자를 100으로 나눕니다. 예를 들어 50%는 0.5가 되고, 200+10%는 200 + (10/100) = 200.1로 계산됩니다 — 퍼센트는 수식 전체가 아니라 바로 앞의 숫자에만 적용됩니다.',
      },
      {
        q: '입력한 내용이 외부로 전송되나요?',
        a: '아니요. 모든 계산은 브라우저 안에서 이루어지며 서버로 전송되지 않고, 저장된 기록도 이 기기의 브라우저 로컬 저장소에만 남습니다.',
      },
    ],
    ui: {
      intro: '수식을 타이핑하거나 버튼을 눌러 계산하세요. 결과는 입력하는 즉시 보이고, 최근 계산은 저장됩니다.',
      autosaved: '자동 저장됨',
      expressionLabel: '계산식',
      angleModeLabel: '각도 단위',
      degreeLabel: 'DEG',
      radianLabel: 'RAD',
      memoryIndicator: 'M',
      errorSyntax: '수식을 해석할 수 없습니다 — 괄호 짝이나 끝에 남은 연산자, 알 수 없는 이름을 확인하세요.',
      errorDomain:
        '이 입력값에서는 정의되지 않은 계산입니다(0으로 나누기, 음수의 제곱근, [-1, 1] 범위 밖의 역삼각함수, 분수 지수를 가진 음수 밑 등).',
      errorOverflow: '결과가 너무 커서 표시할 수 없습니다.',
      historyHeading: '계산 기록',
      historyEmpty: '아직 계산 기록이 없습니다.',
      historyHint: '줄을 탭하면 결과를 다시 불러옵니다.',
      clearHistory: '지우기',
      kbdEquals: '계산합니다',
      kbdClear: '전체를 지웁니다',
    },
  },
};
