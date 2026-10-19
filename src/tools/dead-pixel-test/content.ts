import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  testArea: 'Colour preview',
  previewHint:
    'Choose a colour or start the full-screen test. Tap or click the field to advance, and look for a dot or small area that differs from it.',
  colors: 'Test colours',
  white: 'White',
  black: 'Black',
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
  gray: 'Gray',
  cyan: 'Cyan',
  magenta: 'Magenta',
  yellow: 'Yellow',
  startTest: 'Start full-screen test',
  exitTest: 'Exit test',
  autoCycle: 'Auto cycle colours',
  secondsPerColor: 'Seconds per colour',
  secondsOption: '{n} seconds',
  colorPosition: '{current} of {total}',
  fullScreenUnavailable: 'Full screen is unavailable, so the test is filling this browser window instead.',
  keyboardShortcuts: 'Keyboard controls',
  nextColor: 'next colour',
  previousColor: 'previous colour',
  toggleAuto: 'start or stop auto cycle',
  exitShortcut: 'exit the test',
  testActive: 'Full-screen colour test',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Dead Pixel Test — full-screen colour cycle',
    description:
      'Check a display for dead, stuck and weak sub-pixels with nine full-screen colour fields, adjustable auto cycling and keyboard controls.',
    h1: 'Dead Pixel Test',
    tagline: 'Run nine precise full-screen colour fields with arrow-key controls and an adjustable automatic cycle.',
    name: 'Dead Pixel Test',
    keywords: [
      'dead pixel test',
      'dead pixel checker',
      'stuck pixel test',
      'monitor pixel test',
      'screen test',
      'display test',
    ],
    howTo: [
      'Wipe the display and turn off Night Light, True Tone or other colour filters.',
      'Choose Start full-screen test; if the browser blocks it, the test still fills the browser window.',
      'Inspect every field slowly from edge to edge. Tap or click for the next colour, or use Right Arrow or Space; use Left Arrow for the previous one.',
      'Use A to turn automatic cycling on or off, then press Esc or Exit test when you are finished.',
    ],
    sections: [
      {
        heading: 'Why nine colour fields help',
        body: 'White makes permanently dark pixels easiest to see, while black makes always-lit red, green, blue or white pixels stand out. Red, green and blue isolate one sub-pixel at a time. Cyan, magenta and yellow light two sub-pixels together, helping reveal a weak channel that can blend into a primary field. Gray is useful for seeing broad brightness non-uniformity, although it does not diagnose a panel defect by itself.',
      },
      {
        heading: 'Dead, stuck and bright pixels are not the same',
        body: 'A dead pixel stays dark and is most visible on white. A stuck or bright pixel stays lit in one or more channels and is easiest to notice on black or on a contrasting colour. Dust, a smudge, and a mark on a screen protector can look similar, so clean the surface first and check whether the spot remains in the exact same display location on several fields. This visual test cannot repair a pixel or determine a manufacturer’s warranty decision.',
      },
      {
        heading: 'Use the right display conditions',
        body: 'Open the test on the display you want to inspect; for an external monitor, move the browser window onto that monitor before starting full screen. Use the panel’s native resolution where possible and temporarily disable operating-system colour filters. Dim room lighting for the black and gray fields, but do not judge ordinary IPS glow, OLED near-black behaviour or viewing-angle changes as a single bad pixel without comparing at a normal viewing position.',
      },
    ],
    faq: [
      {
        q: 'How do I find a dead pixel?',
        a: 'A dead pixel remains dark on every coloured field and is usually easiest to see as a black dot on the white field. Check red, green and blue as well because a failed individual sub-pixel can be less obvious on white.',
      },
      {
        q: 'What is the difference between a dead pixel and a stuck pixel?',
        a: 'A dead pixel does not light and stays dark, while a stuck pixel remains lit in one or more red, green or blue channels. A stuck red pixel can disappear into a red field but should stand out on black, green or blue.',
      },
      {
        q: 'Why does this test use cyan, magenta and yellow as well as RGB?',
        a: 'Cyan combines green and blue, magenta combines red and blue, and yellow combines red and green. These three two-channel fields complement the three RGB primary fields and can make a weak sub-pixel easier to distinguish from its neighbours.',
      },
      {
        q: 'Can a browser test every pixel on my monitor?',
        a: 'A full-screen browser field can visually cover the active display area, but browser and operating-system bars may remain on some mobile browsers. Inspect the visible field, use the browser’s own full-screen option when available, and move the window to each external display before testing it.',
      },
      {
        q: 'Will this fix a stuck pixel?',
        a: 'No. This page is a visual inspection tool that shows nine static colour fields and an automatic cycle. It does not attempt a flashing repair routine, and a browser test cannot guarantee that a pixel fault is repairable.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '불량화소 테스트 — 전체화면 색상 순환 검사',
    description:
      '9가지 전체화면 단색과 조절 가능한 자동 색상 순환으로 모니터·노트북·휴대폰의 불량화소와 고착화소를 확인하세요.',
    h1: '불량화소 테스트',
    tagline: '9가지 단색 화면을 전체화면으로 띄우고 방향키·자동 순환으로 불량화소를 꼼꼼히 확인합니다.',
    name: '불량화소 테스트',
    keywords: [
      '불량화소 테스트',
      '모니터 불량화소 테스트',
      '데드픽셀 테스트',
      '고착화소 테스트',
      '모니터 테스트',
      '화면 색상 테스트',
    ],
    howTo: [
      '화면을 닦고 야간 모드·색상 필터·True Tone 같은 색상 보정 기능을 잠시 끕니다.',
      '전체화면 테스트 시작을 누릅니다. 브라우저가 전체화면을 지원하지 않아도 브라우저 창 안에서 검사를 계속할 수 있습니다.',
      '각 색을 화면 가장자리까지 천천히 살핍니다. 화면을 누르거나 오른쪽 방향키·스페이스바를 사용하면 다음 색, 왼쪽 방향키를 사용하면 이전 색으로 이동합니다.',
      'A 키로 자동 순환을 켜거나 끈 뒤, 끝나면 Esc 또는 검사 종료를 누릅니다.',
    ],
    sections: [
      {
        heading: '9가지 색을 보는 이유',
        body: '흰색은 계속 꺼져 있는 검은 점을, 검정은 계속 켜져 있는 빨강·초록·파랑·흰 점을 찾기 쉽습니다. 빨강·초록·파랑은 서브픽셀 한 개씩을 따로 켭니다. 청록·자홍·노랑은 서브픽셀 두 개를 함께 켜므로 기본색 화면에서는 묻히는 약한 채널을 찾는 데 보탬이 됩니다. 회색은 넓은 면적의 밝기 불균일을 보기 좋지만, 그 자체만으로 패널 고장을 뜻하지는 않습니다.',
      },
      {
        heading: '데드픽셀·고착화소·휘점은 다릅니다',
        body: '데드픽셀은 계속 꺼져 있어 흰 화면에서 검은 점으로 잘 보입니다. 고착화소나 휘점은 한 가지 이상 채널이 계속 켜진 상태여서 검정 또는 대비되는 색에서 눈에 띕니다. 먼지, 얼룩, 보호필름 자국도 비슷해 보일 수 있으니 화면을 먼저 닦고 여러 색에서 같은 화면 위치에 남는지 확인하세요. 이 검사는 눈으로 확인하는 도구이며, 화소를 고치거나 제조사 교환 기준을 판정하지는 않습니다.',
      },
      {
        heading: '검사할 화면과 환경을 맞추세요',
        body: '외부 모니터는 먼저 브라우저 창을 해당 모니터로 옮긴 뒤 전체화면을 시작합니다. 가능하면 그 디스플레이의 기본 해상도로 보고 운영체제의 색상 필터를 잠시 끕니다. 검정·회색 화면은 실내 조명을 낮춰 보되, 일반적인 IPS 글로우·OLED의 저계조 특성·시야각 변화는 정면의 보통 시청 거리에서 다시 비교한 뒤 불량화소와 구분하세요.',
      },
    ],
    faq: [
      {
        q: '불량화소는 어떻게 찾나요?',
        a: '데드픽셀은 모든 색에서 어둡게 남고 특히 흰색 화면에서 검은 점으로 잘 보입니다. 빨강·초록·파랑 화면도 함께 확인하면 한 개의 서브픽셀만 고장 난 경우를 더 쉽게 찾을 수 있습니다.',
      },
      {
        q: '데드픽셀과 고착화소의 차이는 무엇인가요?',
        a: '데드픽셀은 빛나지 않아 계속 어둡고, 고착화소는 빨강·초록·파랑 중 한 가지 이상이 계속 켜져 있습니다. 빨강 고착화소는 빨간 화면에서는 묻힐 수 있지만 검정·초록·파랑 화면에서는 눈에 띕니다.',
      },
      {
        q: 'RGB 외에 청록·자홍·노랑도 확인하는 이유는 무엇인가요?',
        a: '청록은 초록과 파랑, 자홍은 빨강과 파랑, 노랑은 빨강과 초록을 함께 켠 색입니다. RGB 기본색 3가지와 이 2채널 색 3가지를 함께 보면 약한 서브픽셀을 주변과 더 쉽게 구분할 수 있습니다.',
      },
      {
        q: '브라우저로 모니터의 모든 화소를 검사할 수 있나요?',
        a: '전체화면 브라우저는 활성 디스플레이의 보이는 영역을 단색으로 채울 수 있지만, 일부 모바일 브라우저는 주소창이나 시스템 막대를 남깁니다. 보이는 검사 영역을 확인하고, 외부 모니터마다 창을 옮겨 각각 검사하세요.',
      },
      {
        q: '이 테스트로 고착화소를 고칠 수 있나요?',
        a: '아니요. 이 도구는 9가지 정적 단색과 자동 순환으로 눈으로 확인하는 검사 도구입니다. 빠른 점멸 방식의 복구를 시도하지 않으며, 브라우저 검사만으로 화소가 고쳐진다고 보장할 수는 없습니다.',
      },
    ],
    ui: {
      testArea: '색상 미리보기',
      previewHint:
        '색상을 고르거나 전체화면 테스트를 시작합니다. 화면을 누르면 다음 색으로 넘어가며, 바탕과 다른 작은 점이나 영역을 찾으세요.',
      colors: '검사 색상',
      white: '흰색',
      black: '검정',
      red: '빨강',
      green: '초록',
      blue: '파랑',
      gray: '회색',
      cyan: '청록',
      magenta: '자홍',
      yellow: '노랑',
      startTest: '전체화면 테스트 시작',
      exitTest: '검사 종료',
      autoCycle: '자동 색상 순환',
      secondsPerColor: '색상당 표시 시간',
      secondsOption: '{n}초',
      colorPosition: '{current} / {total}',
      fullScreenUnavailable: '전체화면을 사용할 수 없어 이 브라우저 창을 채워 검사합니다.',
      keyboardShortcuts: '키보드 조작',
      nextColor: '다음 색',
      previousColor: '이전 색',
      toggleAuto: '자동 순환 켜기 또는 끄기',
      exitShortcut: '검사 종료',
      testActive: '전체화면 색상 검사',
    },
  },
};
