import type { Locale } from '../i18n/locales';
import type { CategoryId } from './categories';

export interface CategoryHubContent {
  sections: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
}

/**
 * Hub copy for /c/<category> pages. Each category explains what its tools cover and the
 * fact people usually need before choosing one, so a hub is more than a list of links.
 */
export const CATEGORY_HUB_CONTENT: Record<CategoryId, Record<Locale, CategoryHubContent>> = {
  image: {
    en: {
      sections: [
        {
          heading: 'What the image tools on this page do',
          body: 'Twenty-one tools cover the jobs people actually search for: resizing a photo for an upload form, compressing it under a size limit, converting between HEIC, JPG, PNG, WebP and SVG, cropping to a ratio, watermarking, making a passport photo or a meme, and turning images into a PDF or text.\n\nEvery one of them runs in the browser tab. No file is uploaded, so a 40 MB photo never leaves the phone or laptop, and the tools keep working after the page has loaded even if the connection drops.',
        },
        {
          heading: 'Which format to pick, and what conversion cannot fix',
          body: 'JPG is for photographs where a small file matters, PNG for screenshots, logos and transparency, and WebP for the web — it is smaller than JPG at similar quality but some older editors refuse it. An iPhone saves photos as HEIC, which many upload forms cannot read, so converting to JPG is usually the first step.\n\nConversion cannot add information. Turning a JPG into a PNG keeps exactly the pixels the JPG stored and usually makes the file larger, because PNG is lossless. Resizing down and back up does not restore detail, and EXIF data such as GPS location survives some conversions — the EXIF tool here removes it.',
        },
      ],
      faq: [
        {
          q: 'Are my images uploaded to a server?',
          a: 'No. Every image tool here processes the file inside the browser tab, so nothing is uploaded and no copy is stored. That is why large batches take as long as your device takes to compute them.',
        },
        {
          q: 'How do I convert iPhone HEIC photos to JPG?',
          a: 'Use the HEIC to JPG tool, or the image converter with JPG as the target. The photo is decoded in the browser, so a private picture never leaves the phone or laptop.',
        },
        {
          q: 'Does converting JPG to PNG improve the quality?',
          a: 'No. It preserves the pixels the JPG already has and prevents further loss, but it cannot restore what the JPG compression removed. Converting back to JPG adds another lossy step.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '이미지 도구로 할 수 있는 일',
          body: '업로드 양식에 맞춰 사진 크기 줄이기, 용량 제한에 맞춰 압축하기, HEIC·JPG·PNG·WebP·SVG 사이 변환, 비율에 맞춘 자르기, 워터마크 넣기, 여권사진이나 짤 만들기, 이미지를 PDF나 텍스트로 바꾸기가 한곳에 모여 있습니다.\n\n모든 처리는 브라우저 탭 안에서 이루어집니다. 40MB 사진도 휴대폰이나 노트북 밖으로 나가지 않고, 페이지를 한 번 열어 두면 연결이 끊겨도 도구가 계속 동작합니다.',
        },
        {
          heading: '어떤 형식을 고를지, 변환으로 해결되지 않는 것',
          body: '사진은 용량이 중요한 경우 JPG, 스크린샷·로고·투명 배경은 PNG, 웹은 WebP가 적합합니다. WebP는 같은 화질에서 JPG보다 작지만 오래된 편집기에서는 열리지 않습니다. 아이폰 사진은 HEIC로 저장되어 업로드 양식이 읽지 못하는 경우가 많으므로 JPG로 바꾸는 것이 첫 단계입니다.\n\n변환은 정보를 더하지 못합니다. JPG를 PNG로 바꾸면 JPG가 저장한 픽셀 그대로이며 PNG가 무손실이라 파일은 보통 더 커집니다. 줄였다가 다시 늘려도 세부 정보는 돌아오지 않고, GPS 위치 같은 EXIF 정보는 일부 변환에서 그대로 남습니다.',
        },
      ],
      faq: [
        {
          q: '이미지는 서버로 업로드되나요?',
          a: '아니요. 모든 이미지 도구는 브라우저 탭 안에서 파일을 처리하므로 업로드도, 저장도 없습니다. 그래서 대량 작업 시간은 기기 성능에 따릅니다.',
        },
        {
          q: '아이폰 HEIC 사진은 어떻게 JPG로 바꾸나요?',
          a: 'HEIC to JPG 도구나 이미지 변환기에서 JPG를 대상으로 고르면 됩니다. 사진은 브라우저에서 디코딩되므로 사적인 사진이 기기 밖으로 나가지 않습니다.',
        },
        {
          q: 'JPG를 PNG로 바꾸면 화질이 좋아지나요?',
          a: '아니요. JPG가 이미 가진 픽셀을 유지하고 추가 손실을 막을 뿐, 압축으로 사라진 정보를 되살리지는 못합니다.',
        },
      ],
    },
  },
  media: {
    en: {
      sections: [
        {
          heading: 'Audio and video work that fits in a browser tab',
          body: 'This category handles the media jobs that do not need a desktop editor: compressing a video under a messaging-app limit, turning a clip into a GIF, extracting the audio track as MP3, converting audio formats, cutting a 30-second ringtone, and recording the screen or the microphone.\n\nVideo compression is the slowest job on the site because it re-encodes frames, and its speed depends entirely on the device — a phone will take several times longer than a laptop for the same clip. Audio conversion and cutting are fast because they work on existing compressed frames.',
        },
        {
          heading: 'What stays local, and what a browser cannot do',
          body: "Recording and editing happen in the tab: the microphone or screen stream is captured locally and the file is written with the browser's own encoder. Nothing is uploaded, which also means there is no cloud queue and no per-day export limit.\n\nThe limits come from the browser, not from a quota. A phone browser can run out of memory on a long 4K recording, and a tab that is closed mid-export loses the work. Save long recordings in parts, and keep a copy of the original file before compressing.",
        },
      ],
      faq: [
        {
          q: 'Is my video uploaded when I compress it?',
          a: 'No. The file is decoded and re-encoded in the browser tab, so it never leaves the device. That is also why compression speed depends on the phone or laptop rather than on a server queue.',
        },
        {
          q: 'How do I make a GIF from a video?',
          a: 'Use the video-to-GIF tool: pick the start and end of the clip, choose the frame rate and width, and the GIF is built in the tab. Shorter clips and lower frame rates keep the file small.',
        },
        {
          q: 'Can I record the screen without installing anything?',
          a: 'Yes. The screen recorder uses the browser screen-capture permission, and on a phone it records the screen or a single app depending on the platform. The recording stays on the device.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '브라우저에서 끝나는 오디오·비디오 작업',
          body: '데스크톱 편집기가 필요 없는 작업을 모았습니다. 메신저 용량 제한에 맞춘 동영상 압축, 영상의 GIF 변환, 오디오만 MP3로 추출, 오디오 형식 변환, 30초 벨소리 자르기, 화면·마이크 녹음입니다.\n\n동영상 압축은 프레임을 다시 인코딩하므로 사이트에서 가장 느린 작업이고, 속도는 전적으로 기기 성능에 달려 있습니다. 같은 영상이라도 휴대폰은 노트북보다 몇 배 오래 걸립니다. 오디오 변환과 자르기는 이미 압축된 프레임을 다루므로 빠릅니다.',
        },
        {
          heading: '기기 안에서 처리되는 것과 브라우저가 못 하는 것',
          body: '녹음과 편집은 탭 안에서 이루어집니다. 마이크나 화면 스트림을 로컬에서 받아 브라우저 자체 인코더로 파일을 만듭니다. 업로드가 없으니 클라우드 대기열도, 하루 내보내기 제한도 없습니다.\n\n제한은 할당량이 아니라 브라우저에서 옵니다. 긴 4K 녹음은 휴대폰 브라우저의 메모리를 소진할 수 있고, 내보내기 도중 탭을 닫으면 작업이 사라집니다. 긴 녹음은 나눠서 저장하고, 압축 전에 원본을 보관하세요.',
        },
      ],
      faq: [
        {
          q: '동영상을 압축하면 서버로 업로드되나요?',
          a: '아니요. 브라우저 탭에서 디코딩과 재인코딩을 하므로 파일이 기기 밖으로 나가지 않습니다. 압축 속도가 서버 대기열이 아니라 기기 성능에 달려 있는 이유이기도 합니다.',
        },
        {
          q: '동영상으로 GIF를 어떻게 만드나요?',
          a: '동영상 GIF 변환 도구에서 구간의 시작과 끝, 프레임 속도와 너비를 고르면 탭 안에서 GIF가 만들어집니다. 구간이 짧고 프레임 속도가 낮을수록 파일이 작습니다.',
        },
        {
          q: '설치 없이 화면 녹화가 되나요?',
          a: '됩니다. 화면 녹화 도구는 브라우저의 화면 캡처 권한을 사용하고, 휴대폰에서는 플랫폼에 따라 화면 전체나 앱 하나를 녹화합니다. 녹화 파일은 기기에 남습니다.',
        },
      ],
    },
  },
  text: {
    en: {
      sections: [
        {
          heading: 'Counting, cleaning and converting text',
          body: "Fifteen tools work on text you paste: counting words, characters and bytes for a cover letter, SMS or X post, changing case, removing duplicate lines or line breaks, reversing or sorting lines, comparing two versions, and finding and replacing.\n\nThe Korean-specific tools go further: a spell check that flags spacing and common errors, Hangul romanisation, and a character map for symbols that a keyboard cannot type. Speech-to-text and text-to-speech use the browser's own engines, so the audio never goes to a server.",
        },
        {
          heading: 'Why the byte counts differ from the character counts',
          body: 'A character count and a byte count answer different questions. Korean SMS is limited in bytes with two bytes per Hangul character under EUC-KR, YouTube descriptions are limited to 5,000 bytes in UTF-8 where a Hangul character takes three, and X counts weighted units where Hangul costs two. The same paragraph can be under one limit and over another.\n\nPaste the real text instead of estimating: spaces, line breaks, emoji and hashtags all spend part of the budget, and the counter shows the remaining amount for the rule you select.',
        },
      ],
      faq: [
        {
          q: 'Which limit applies to a Korean cover letter?',
          a: "Korean application forms usually count characters with spaces, and some specify 공백 제외. The counter can switch between the two rules on the same draft, so check the form's wording before editing the text.",
        },
        {
          q: 'Why does my Korean SMS drop to 70 characters?',
          a: 'One character outside the GSM-7 alphabet — Hangul, an emoji — switches the whole message to UCS-2, where a single segment holds 70 characters. The byte counter shows where that happens.',
        },
        {
          q: 'Is the text I paste stored anywhere?',
          a: 'No. Counting, case changes and comparisons run in the tab and the text is not sent to a server. Only an explicit download action writes a file, and it is created on your device.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '텍스트 세기, 정리하기, 변환하기',
          body: '붙여넣은 텍스트로 작업하는 도구 15개가 있습니다. 자기소개서·문자·X 게시물의 글자 수와 바이트 세기, 대소문자 변환, 중복 줄이나 줄바꿈 제거, 줄 뒤집기와 정렬, 두 문서 비교, 찾아 바꾸기입니다.\n\n한국어 특화 도구도 있습니다. 띄어쓰기와 흔한 오류를 짚는 맞춤법 검사, 한글 로마자 표기, 키보드로 칠 수 없는 기호를 찾는 문자표입니다. 음성-텍스트와 텍스트-음성은 브라우저 자체 엔진을 쓰므로 오디오가 서버로 가지 않습니다.',
        },
        {
          heading: '글자 수와 바이트 수가 다른 이유',
          body: '글자 수와 바이트 수는 다른 질문에 답합니다. 한국 SMS는 EUC-KR 기준 한글 2바이트로 제한되고, 유튜브 설명은 UTF-8 5,000바이트라 한글이 3바이트이며, X는 한글을 2점으로 세는 가중치 방식입니다. 같은 문단이 어떤 기준에서는 한도 안이고 다른 기준에서는 넘을 수 있습니다.\n\n어림하지 말고 실제 문구를 붙여넣으세요. 공백, 줄바꿈, 이모지, 해시태그가 모두 분량을 차지하므로, 선택한 기준의 남은 양을 그대로 확인하는 편이 정확합니다.',
        },
      ],
      faq: [
        {
          q: '자기소개서는 어떤 기준으로 세나요?',
          a: '한국 지원 양식은 보통 공백 포함 글자 수로 세고, 일부는 공백 제외를 요구합니다. 계산기에서 같은 초안을 두 기준으로 바꿔 볼 수 있으니, 글자를 지우기 전에 양식 문구를 확인하세요.',
        },
        {
          q: '한글 문자는 왜 70자로 줄어드나요?',
          a: 'GSM-7에 없는 글자가 하나라도 있으면 메시지 전체가 UCS-2로 바뀌고 한 세그먼트가 70자입니다. 바이트 계산기에서 어느 지점에서 바뀌는지 확인할 수 있습니다.',
        },
        {
          q: '붙여넣은 텍스트가 어딘가에 저장되나요?',
          a: '아니요. 세기, 대소문자 변환, 비교는 탭 안에서 실행되고 텍스트는 서버로 전송되지 않습니다. 다운로드를 직접 눌렀을 때만 기기에서 파일이 만들어집니다.',
        },
      ],
    },
  },
  time: {
    en: {
      sections: [
        {
          heading: 'Timers, clocks and date arithmetic that survive a background tab',
          body: 'The time tools answer the questions people type most: set a five-minute timer, run a 25/5 Pomodoro cycle, time a Tabata set, check the date 100 days from now, work out an exact age in Korean age systems, convert a lunar birthday, or see the time in two cities.\n\nThe timers share one design decision: they store the moment they should finish and compare it against the device clock, instead of counting one-second ticks. Browsers throttle background tabs, so a tick-counting timer drifts by seconds or minutes; this one catches up after a background tab, a phone lock or a refresh.',
        },
        {
          heading: 'Korea-specific time and calendar tools',
          body: 'Several tools here exist because Korean conventions differ. The age calculator shows 만 나이, 세는 나이 and 연 나이 side by side after the 2023 age-unification law, the lunar converter maps Korean lunar dates to Gregorian ones with leap-month handling, and the date calculator reports business days rather than only calendar days.\n\nA browser timer is not a safety device: a locked phone can delay or mute the alarm, so use the device clock app for anything critical. What the browser timer gives you instead is a large display, keyboard shortcuts, and a countdown that is still correct when you come back.',
        },
      ],
      faq: [
        {
          q: 'Will a browser timer keep running if I switch tabs?',
          a: 'Yes. The timer stores its end time, so switching tabs, locking the phone or refreshing the page shows the correct remaining time when you return. The alarm itself may be delayed while the device is asleep.',
        },
        {
          q: 'How is Korean age different from international age?',
          a: '만 나이 counts from zero at birth and adds a year on each birthday. 세는 나이 starts at one and adds a year every January 1, and 연 나이 is simply the current year minus the birth year. Since June 2023 만 나이 is the legal default.',
        },
        {
          q: 'Can I set a timer for hours, not minutes?',
          a: 'Yes. The timer accepts hours, minutes and seconds up to 99:59:59, and the preset buttons cover the common lengths from one minute to an hour.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '백그라운드 탭에서도 정확한 타이머와 시계',
          body: '사람들이 가장 많이 찾는 시간 도구를 모았습니다. 5분 타이머 맞추기, 25/5 뽀모도로 돌리기, 타바타 세트 재기, 100일 뒤 날짜 확인, 만 나이·세는 나이·연 나이 계산, 음력 생일 변환, 두 도시 시각 비교입니다.\n\n타이머는 모두 같은 설계를 씁니다. 1초씩 세지 않고 끝나야 할 시각을 저장해 기기 시계와 비교합니다. 브라우저는 백그라운드 탭을 느리게 만들기 때문에 1초씩 세는 타이머는 몇 초에서 몇 분까지 밀리지만, 이 방식은 탭 전환·휴대폰 잠금·새로고침 뒤에도 남은 시간을 바로잡습니다.',
        },
        {
          heading: '한국 기준에 맞춘 시간·달력 도구',
          body: '한국 관습이 달라서 만든 도구도 있습니다. 나이 계산기는 2023년 만 나이 통일 이후의 만 나이·세는 나이·연 나이를 나란히 보여 주고, 음력 변환기는 윤달을 처리해 음력 생일을 양력으로 바꾸며, 날짜 계산기는 달력 일수뿐 아니라 영업일도 셉니다.\n\n브라우저 타이머는 안전 장치가 아닙니다. 잠긴 휴대폰은 알람을 늦추거나 소리를 막을 수 있으므로 중요한 일에는 기기 시계 앱을 쓰세요. 대신 브라우저 타이머는 큰 화면, 단축키, 돌아왔을 때도 정확한 남은 시간을 제공합니다.',
        },
      ],
      faq: [
        {
          q: '탭을 바꿔도 타이머가 계속 돌아가나요?',
          a: '네. 끝나는 시각을 저장하므로 탭 전환, 휴대폰 잠금, 새로고침 뒤에도 돌아왔을 때 정확한 남은 시간이 보입니다. 다만 기기가 잠든 동안 알람 소리는 늦춰질 수 있습니다.',
        },
        {
          q: '만 나이와 세는 나이는 어떻게 다른가요?',
          a: '만 나이는 태어날 때 0세에서 시작해 생일마다 한 살을 더합니다. 세는 나이는 태어난 해 1세로 시작해 1월 1일마다 한 살을 더하고, 연 나이는 현재 연도에서 출생연도를 뺀 값입니다. 2023년 6월부터 만 나이가 법적 기본입니다.',
        },
        {
          q: '분 단위 말고 시간 단위 타이머도 되나요?',
          a: '됩니다. 시·분·초를 99:59:59까지 넣을 수 있고, 프리셋 버튼으로 1분부터 1시간까지 바로 시작할 수 있습니다.',
        },
      ],
    },
  },
  calculator: {
    en: {
      sections: [
        {
          heading: 'Korean payroll, money and everyday calculators',
          body: 'This is the largest category, because Korean salary questions have many parts: annual salary to monthly take-home pay with the 2026 four-insurance rates, severance pay from the final three months of wages, job-seeker benefit days, weekly holiday pay, annual leave accrual, and the employer and employee share of social insurance.\n\nThe money tools are separate from those: loan repayment schedules, compound interest, exchange-rate conversion, VAT and simplified tax, rent conversion between 전세 and monthly rent, discounts and tips. Health calculators cover BMI, calories and pregnancy dating.',
        },
        {
          heading: 'Where the numbers come from',
          body: 'Each Korean payroll calculator names its rates, caps and legal basis on the page, and the 2026 social-insurance rates differ from older figures still circulating: national pension 4.75%, health insurance 3.595% and long-term care 13.14% of the health premium. A calculator that shows 4.5% and 3.545% is using the old rates.\n\nResults are estimates, not an entitlement decision. The severance and unemployment pages state the assumptions they use — a 90-day average-wage window, 40 weekly hours, no bonus or leave pay — and every field stays editable so your payslip can replace the defaults.',
        },
      ],
      faq: [
        {
          q: 'How much is taken out of a Korean salary?',
          a: 'For 2026 the employee pays national pension 4.75%, health insurance 3.595%, long-term care 13.14% of the health premium and employment insurance 0.9%, plus income tax and 10% local income tax. A ₩50M salary leaves roughly ₩3.48M a month.',
        },
        {
          q: 'Are these calculators official?',
          a: 'No. They are independent estimates that name their rates and assumptions. The employment service and the tax office remain the authority for an actual payment, and each page links to the rule it applies.',
        },
        {
          q: 'Why does my take-home differ from the calculator?',
          a: 'Usually because of non-taxable pay, dependents or the withholding rate. A meal allowance up to ₩200,000 a month is non-taxable and raises take-home; more dependents or an 80% withholding election lower the income tax.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '한국 급여·금융·생활 계산기',
          body: '가장 큰 분류입니다. 한국 급여 질문은 나눠 볼 부분이 많기 때문입니다. 2026년 4대보험 요율로 연봉에서 월 실수령액 계산하기, 퇴직 전 3개월 임금으로 퇴직금 계산하기, 실업급여 소정급여일수, 주휴수당, 연차 발생, 4대보험의 사업주·근로자 부담분이 여기에 있습니다.\n\n돈 관련 도구는 따로 있습니다. 대출 상환 스케줄, 복리, 환율, 부가세·간이과세, 전세와 월세 전환, 할인과 팁입니다. 건강 계산기는 BMI, 칼로리, 임신 주수를 다룹니다.',
        },
        {
          heading: '숫자의 근거',
          body: '한국 급여 계산기는 요율과 상한, 법적 근거를 페이지에 밝히고 있으며, 2026년 4대보험 요율은 아직 돌아다니는 옛 숫자와 다릅니다. 국민연금 4.75%, 건강보험 3.595%, 장기요양은 건강보험료의 13.14%입니다. 4.5%와 3.545%를 쓰는 계산기는 옛 요율입니다.\n\n결과는 확정이 아니라 추정입니다. 퇴직금·실업급여 페이지는 3개월 평균임금 기간, 주 40시간, 상여금·연차수당 없음 같은 가정을 밝히고, 모든 입력란을 바꿀 수 있어 급여명세서 값으로 대체할 수 있습니다.',
        },
      ],
      faq: [
        {
          q: '한국 급여에서 얼마가 빠지나요?',
          a: '2026년 근로자 부담은 국민연금 4.75%, 건강보험 3.595%, 건강보험료의 13.14%인 장기요양, 고용보험 0.9%에 소득세와 그 10%의 지방소득세입니다. 연봉 5,000만원이면 월 실수령액이 348만원 안팎입니다.',
        },
        {
          q: '이 계산기들은 공식인가요?',
          a: '아닙니다. 요율과 가정을 밝힌 독립적인 추정치입니다. 실제 지급액의 기준은 고용서비스와 세무 당국이며, 각 페이지는 적용한 규정을 함께 안내합니다.',
        },
        {
          q: '실수령액이 계산기와 다른 이유는 무엇인가요?',
          a: '보통 비과세 급여, 부양가족, 원천징수 비율 때문입니다. 월 20만원까지의 식대는 비과세로 실수령액을 높이고, 부양가족이 많거나 80% 원천징수를 선택하면 소득세가 줄어듭니다.',
        },
      ],
    },
  },
  converter: {
    en: {
      sections: [
        {
          heading: 'Units, including the Korean ones',
          body: 'Ten converters cover length, weight, area, volume, temperature, speed, data size, number bases, shoe sizes and Korean number reading. Each one updates as you type, shows a reference table for common values, and states the exact factor it uses rather than a rounded one.\n\nKorean units are part of the set: pyeong at 400/121 ㎡, 돈 at 3.75 g for gold, 냥 and 관, and the 만·억 reading of large Korean numbers. These do not map onto imperial units, so converting them with an English converter gives the wrong answer.',
        },
        {
          heading: 'Exact factors versus convenient ones',
          body: 'The difference between 3.3 ㎡ and 400/121 ㎡ is small for one measurement and visible over a whole apartment. The same is true of 2.2 lb per kilogram, 1.6 km per mile and 0.3937 inches per centimetre: each shortcut is a little off, and the error grows with the number.\n\nWhere the conversion also has a basis — pyeong against ㎡, GB against GiB, cups against millilitres — the page says which standard it uses, because the standard can change the answer by 7% (GB) or 18% (Korean measuring cups) even when the arithmetic is right.',
        },
      ],
      faq: [
        {
          q: 'How many pyeong is 84 square metres?',
          a: '84 ㎡ is 25.41 pyeong at the exact 400/121 factor. An advert may call the same flat a 33-pyeong type because that number counts supply area rather than exclusive area.',
        },
        {
          q: 'How many grams is one don of gold?',
          a: '3.75 g. One 냥 is ten 돈 (37.5 g) and one 관 is 100 냥 (3.75 kg). Jewellery prices usually quote metal weight, so the finished ring weighs more.',
        },
        {
          q: 'Why is 1 GB not 1,024 MB here?',
          a: 'Because storage and network sizes are decimal: 1 GB is 1,000 MB. The binary unit is the GiB at 1,024 MiB, and the converter shows both so a drive label and an operating-system figure can be compared.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '한국 단위까지 다루는 변환기',
          body: '길이, 무게, 넓이, 부피, 온도, 속도, 데이터 크기, 진법, 신발 사이즈, 한국어 숫자 읽기까지 10개 변환기가 있습니다. 모두 입력하는 즉시 결과가 바뀌고, 자주 쓰는 값의 참조표를 보여 주며, 반올림한 값이 아니라 실제 정의값을 씁니다.\n\n한국 단위도 포함됩니다. 400/121㎡인 평, 금 무게의 돈(3.75g), 냥과 관, 큰 숫자의 만·억 읽기입니다. 이런 단위는 야드파운드법과 대응하지 않으므로 영문 변환기로 바꾸면 답이 틀립니다.',
        },
        {
          heading: '정확한 값과 편한 값',
          body: '3.3㎡와 400/121㎡의 차이는 한 번 잴 때는 작지만 집 한 채를 통으로 비교하면 드러납니다. 킬로그램당 2.2파운드, 마일당 1.6km, 센티미터당 0.3937인치도 마찬가지입니다. 각각의 어림값은 조금씩 틀리고, 숫자가 커질수록 오차도 커집니다.\n\n평과 ㎡, GB와 GiB, 컵과 밀리리터처럼 기준이 함께 있는 변환은 페이지에 어떤 기준을 쓰는지 밝힙니다. 계산이 맞아도 기준에 따라 답이 7%(GB) 또는 18%(한국 계량컵)까지 달라지기 때문입니다.',
        },
      ],
      faq: [
        {
          q: '84㎡는 몇 평인가요?',
          a: '정확한 400/121 기준으로 25.41평입니다. 광고에서 33평형이라고 부르는 것은 전용면적이 아니라 공급면적을 기준으로 세기 때문입니다.',
        },
        {
          q: '금 한 돈은 몇 그램인가요?',
          a: '3.75g입니다. 1냥은 10돈(37.5g), 1관은 100냥(3.75kg)입니다. 보통 금값은 금속 무게 기준이라 완성된 반지 무게는 더 나갑니다.',
        },
        {
          q: '1GB가 왜 1,024MB가 아닌가요?',
          a: '저장장치와 통신 용량은 십진 기준이라 1GB가 1,000MB입니다. 2진 단위는 1,024MiB의 GiB이며, 변환기는 두 기준을 함께 보여 주어 드라이브 표기와 운영체제 표시를 비교할 수 있게 합니다.',
        },
      ],
    },
  },
  pdf: {
    en: {
      sections: [
        {
          heading: 'Twelve PDF tools, all inside the browser',
          body: 'The PDF tools cover the operations people need on documents they would rather not upload: merge several files, split or delete pages, reorder and rotate, compress, add page numbers or a watermark, turn pages into JPG or text, and protect, unlock or sign.\n\nDocuments are private by nature, and PDF24 and Adobe both process uploads on their servers, deleting files after a short period. Here the PDF is opened with a JavaScript parser in the tab, so a contract or a medical record is never transmitted.',
        },
        {
          heading: 'What browser processing means in practice',
          body: "Because nothing is uploaded, there is no file-size quota and no per-day limit, but the browser's memory is the real constraint: a 250 MB PDF with 500 pages is near the practical ceiling, and an encrypted file has to be unlocked before it can be read. The export is re-saved by a JavaScript library, so fonts embedded in the original stay embedded while a document that relies on system fonts may look slightly different.\n\nA signature added here is drawn or photographed and placed on the page; it is not a certified digital signature with a certificate, which a notary or a legal filing may require.",
        },
      ],
      faq: [
        {
          q: 'Is my PDF uploaded when I merge or compress it?',
          a: 'No. The PDF is parsed and re-saved inside the browser tab, so the document is never sent to a server. That is why there is no daily limit and no file-size quota.',
        },
        {
          q: 'How large a PDF can the tools handle?',
          a: "About 250 MB and 500 pages per file is the practical limit, set by the browser's memory rather than by a policy. Encrypted PDFs must be unlocked before they can be read.",
        },
        {
          q: 'Is the signature legally binding?',
          a: 'A drawn or photographed signature placed on the page is what most everyday documents expect, but it is not a certified digital signature. For notarisation or court filing, use a qualified signature service.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '브라우저 안에서 끝나는 PDF 도구 12가지',
          body: '업로드하기 꺼려지는 문서에 필요한 작업을 모았습니다. 여러 파일 합치기, 페이지 나누기·삭제, 순서 바꾸기·회전, 압축, 페이지 번호·워터마크 넣기, 페이지를 JPG나 텍스트로 바꾸기, 암호 설정·해제·서명입니다.\n\n문서는 원래 사적인 자료입니다. PDF24와 Adobe는 업로드한 파일을 서버에서 처리하고 일정 시간 뒤 삭제합니다. 이 사이트에서는 탭 안의 자바스크립트 파서로 PDF를 열기 때문에 계약서나 진료 기록이 전송되지 않습니다.',
        },
        {
          heading: '브라우저 처리에서 실제로 중요한 것',
          body: '업로드가 없으니 파일 크기 할당량도, 하루 제한도 없습니다. 대신 실제 제약은 브라우저 메모리입니다. 500페이지 250MB짜리 PDF가 현실적인 상한에 가깝고, 암호가 걸린 파일은 먼저 잠금을 풀어야 읽을 수 있습니다. 내보내기는 자바스크립트 라이브러리가 다시 저장하므로 원본에 포함된 글꼴은 유지되지만, 시스템 글꼴에 의존한 문서는 조금 달라 보일 수 있습니다.\n\n여기서 넣는 서명은 직접 그리거나 사진으로 찍어 페이지에 배치하는 방식입니다. 인증서가 붙은 공인 전자서명이 아니므로, 공증이나 법원 제출이 필요한 경우에는 별도의 서명 수단이 필요합니다.',
        },
      ],
      faq: [
        {
          q: 'PDF를 합치거나 압축하면 업로드되나요?',
          a: '아니요. 브라우저 탭 안에서 PDF를 읽고 다시 저장하므로 문서가 서버로 전송되지 않습니다. 하루 제한과 용량 할당량이 없는 이유입니다.',
        },
        {
          q: 'PDF는 얼마나 큰 파일까지 처리되나요?',
          a: '파일당 약 250MB, 500페이지가 현실적인 한도이며 정책이 아니라 브라우저 메모리가 정합니다. 암호가 걸린 PDF는 잠금을 먼저 풀어야 읽을 수 있습니다.',
        },
        {
          q: '넣은 서명에 법적 효력이 있나요?',
          a: '직접 그리거나 사진으로 넣은 서명은 일상 문서에서 기대하는 형태이지만 인증서 기반 전자서명은 아닙니다. 공증이나 법원 제출에는 공인 전자서명 서비스를 사용해야 합니다.',
        },
      ],
    },
  },
  developer: {
    en: {
      sections: [
        {
          heading: 'Format, decode and inspect developer data',
          body: 'Fifteen tools handle what a developer pastes or inspects: formatting and validating JSON and YAML, converting between JSON, YAML and CSV, decoding and encoding Base64 and URLs, generating UUIDs and hashes, decoding JWTs without sending the token anywhere, testing regular expressions, and formatting SQL and CSS.\n\nThe inspecting tools are deliberately local. A JWT often carries a live session, and pasting it into a server-side decoder exposes it; here the token is decoded in the tab and never transmitted. The hash generator reads files of any size in chunks instead of loading them into memory.',
        },
        {
          heading: 'Why the tools show the parser error, not a fix',
          body: 'JSON, YAML and SQL formatters report the line and column where parsing failed instead of guessing at a repair, because a silently "fixed" document hides the mistake that broke the build. The JSON formatter rejects trailing commas and comments the way the JSON specification does, and the YAML tool reports duplicate keys rather than silently keeping the last one.\n\nEverything runs on your machine: no request leaves the page, results are not logged, and a pasted API key or token stays in the tab.',
        },
      ],
      faq: [
        {
          q: 'Is it safe to paste a JWT into the decoder?',
          a: 'Yes, because the token is decoded in the browser and never sent anywhere. Decoding does not verify the signature, though: use the tool to read the claims, not to prove the token is valid.',
        },
        {
          q: 'Does the JSON formatter fix invalid JSON?',
          a: 'It reports the line and column of the first parse error instead of repairing it. Trailing commas, comments and single quotes are rejected the way the JSON specification requires.',
        },
        {
          q: 'Can the hash generator handle large files?',
          a: 'Yes. Files are read in chunks and hashed progressively, so a multi-gigabyte file does not have to fit in memory. The digest is computed locally and the file is not uploaded.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '개발자 데이터 포맷·디코딩·검사',
          body: '개발자가 붙여넣거나 확인하는 작업을 다루는 도구 15개입니다. JSON·YAML 포맷과 검증, JSON·YAML·CSV 변환, Base64와 URL 인코딩·디코딩, UUID와 해시 생성, 토큰을 어디로도 보내지 않는 JWT 디코딩, 정규식 테스트, SQL·CSS 포맷이 있습니다.\n\n검사 도구는 의도적으로 로컬에서 동작합니다. JWT에는 살아 있는 세션이 담기기도 해서 서버형 디코더에 붙여넣으면 토큰이 노출됩니다. 여기서는 탭 안에서 디코딩만 하고 전송하지 않으며, 해시 생성기는 큰 파일도 메모리에 통째로 올리지 않고 나눠 읽습니다.',
        },
        {
          heading: '고쳐 주지 않고 오류 위치를 보여 주는 이유',
          body: 'JSON·YAML·SQL 포맷터는 복구를 추측하지 않고 파싱이 실패한 줄과 열을 알려 줍니다. 조용히 "고친" 문서는 빌드를 깨뜨린 실수를 감추기 때문입니다. JSON 포맷터는 명세대로 후행 쉼표와 주석을 거부하고, YAML 도구는 중복 키를 마지막 값으로 덮지 않고 알려 줍니다.\n\n모든 처리는 사용자의 기기에서 이루어집니다. 요청이 페이지를 떠나지 않고 결과를 기록하지 않으므로, 붙여넣은 API 키나 토큰은 탭 안에만 남습니다.',
        },
      ],
      faq: [
        {
          q: 'JWT를 디코더에 붙여넣어도 안전한가요?',
          a: '네. 토큰이 브라우저에서 디코딩되고 어디로도 전송되지 않습니다. 다만 디코딩은 서명 검증이 아니므로, 유효성 증명이 아니라 내용 확인용으로 쓰세요.',
        },
        {
          q: 'JSON 포맷터가 잘못된 JSON을 고쳐 주나요?',
          a: '첫 파싱 오류의 줄과 열을 알려 줄 뿐 고치지 않습니다. 후행 쉼표, 주석, 작은따옴표는 JSON 명세대로 거부됩니다.',
        },
        {
          q: '해시 생성기로 큰 파일도 되나요?',
          a: '됩니다. 파일을 나눠 읽으며 점진적으로 해시하므로 수 GB 파일도 메모리에 올릴 필요가 없습니다. 해시는 로컬에서 계산되고 파일은 업로드되지 않습니다.',
        },
      ],
    },
  },
  generator: {
    en: {
      sections: [
        {
          heading: 'Generate, pick and draw without an account',
          body: 'Twelve tools produce something you can use immediately: QR codes and barcodes, strong passwords, random numbers and lottery sets, a spinning wheel, a ladder game (사다리타기), random teams from a name list, usernames, dice, coin flips and a drawn signature.\n\nNone of them requires an account or adds a watermark, and none sends the list of names or the password anywhere. QR codes are rendered as an image in the tab, so a URL containing a private link is not stored on a server.',
        },
        {
          heading: 'Randomness and password strength, honestly stated',
          body: "The random tools use the browser's cryptographic random generator, not Math.random, so the output is not predictable from earlier results. A draw is still a draw: picking six numbers from 45 does not improve the odds for anyone, and a password is only strong if it is unique and long — the generator makes length and character mix easy, but reuse is what breaks a password.\n\nThe wheel, ladder and team tools are for splitting people, not for proving fairness to an outside observer; the result screen shows the assignment so it can be screenshotted.",
        },
      ],
      faq: [
        {
          q: 'Are the random numbers really random?',
          a: "They come from the browser's cryptographic generator, so they are not predictable from previous results. That does not change any lottery odds — every combination stays equally unlikely.",
        },
        {
          q: 'How long should a generated password be?',
          a: 'Sixteen characters or more for an account that matters, and a different password for each site. Length matters more than symbol rules, which is why the generator defaults to a long string.',
        },
        {
          q: 'Is the name list I paste for a team draw stored?',
          a: 'No. The list stays in the tab, the draw happens locally, and nothing is uploaded. Refreshing the page clears it.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '가입 없이 만들고 뽑고 나누기',
          body: '바로 쓸 수 있는 결과를 만드는 도구 12개입니다. QR 코드와 바코드, 강한 비밀번호, 랜덤 숫자와 로또 번호, 돌림판, 사다리타기, 이름 목록으로 팀 나누기, 사용자 이름, 주사위, 동전 던지기, 손으로 그린 서명이 있습니다.\n\n어떤 도구도 계정을 요구하거나 워터마크를 넣지 않고, 이름 목록이나 비밀번호를 어디로도 보내지 않습니다. QR 코드는 탭 안에서 이미지로 그려지므로 비공개 링크가 서버에 저장되지 않습니다.',
        },
        {
          heading: '난수와 비밀번호 강도에 대해 정확히 말하면',
          body: '랜덤 도구는 Math.random이 아니라 브라우저의 암호학적 난수 생성기를 쓰므로 이전 결과로 다음 값을 예측할 수 없습니다. 그래도 추첨은 추첨입니다. 45개 중 6개를 뽑아도 누구의 당첨 확률도 올라가지 않고, 비밀번호는 길고 유일할 때만 강합니다. 생성기는 길이와 문자 조합을 쉽게 만들어 주지만, 재사용이 비밀번호를 무너뜨립니다.\n\n돌림판·사다리·팀 나누기는 사람을 나누는 도구이지 외부에 공정성을 증명하는 도구가 아닙니다. 결과 화면에 배정이 표시되므로 화면을 캡처해 남길 수 있습니다.',
        },
      ],
      faq: [
        {
          q: '랜덤 숫자는 정말 무작위인가요?',
          a: '브라우저의 암호학적 난수 생성기를 쓰므로 이전 결과로 예측할 수 없습니다. 다만 로또 당첨 확률은 달라지지 않으며, 모든 조합은 여전히 똑같이 어렵습니다.',
        },
        {
          q: '생성한 비밀번호는 얼마나 길어야 하나요?',
          a: '중요한 계정은 16자 이상, 사이트마다 다른 비밀번호를 쓰세요. 기호 규칙보다 길이가 중요하므로 생성기는 기본적으로 긴 문자열을 만듭니다.',
        },
        {
          q: '팀 나누기에 붙여넣은 이름 목록이 저장되나요?',
          a: '아니요. 목록은 탭 안에만 있고 추첨도 로컬에서 이루어지며 업로드되지 않습니다. 새로고침하면 사라집니다.',
        },
      ],
    },
  },
  device: {
    en: {
      sections: [
        {
          heading: 'Test the hardware before the call starts',
          body: "Ten tests check what a browser can see of the device: microphone level, webcam picture, keyboard keys, mouse buttons and polling rate, dead pixels on the display, refresh rate, speaker channel, reaction time, typing speed and clicks per second.\n\nThey are useful in the five minutes before a meeting, class or recording, when the question is whether the microphone is muted, the camera is covered, or a key is broken — not what the hardware's specifications are.",
        },
        {
          heading: 'What the browser can and cannot measure',
          body: 'Microphone and camera tests need a permission grant, and the stream is processed in the tab; no audio or video is recorded or uploaded unless you explicitly start a recording. Keyboard and mouse tests read events, not identities, and the results are not sent anywhere.\n\nSome numbers are approximate by nature. Browser refresh rate is inferred from animation frames and can under-report on a device that throttles, and polling rate for a mouse is limited by how often the browser delivers events. Treat the figures as comparisons between devices, not as specifications.',
        },
      ],
      faq: [
        {
          q: 'Why does the microphone test show no sound?',
          a: 'Either the browser permission was not granted for this page or the device input is muted at the system level. Check the site permission first, then the system sound settings.',
        },
        {
          q: 'Is my camera or microphone recorded during the test?',
          a: 'No. The stream is displayed and measured in the tab and is not recorded or uploaded. A recording only happens if you start the separate voice or screen recorder.',
        },
        {
          q: 'Why is the reported refresh rate lower than my monitor?',
          a: 'The figure comes from animation frames, which are throttled when the browser is not painting, on battery saver, or in a background tab. Keep the tab focused and the window visible for a closer reading.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '통화 전에 기기부터 확인하기',
          body: '브라우저가 볼 수 있는 기기 상태를 확인하는 테스트 10가지입니다. 마이크 음량, 웹캠 화면, 키보드 키, 마우스 버튼과 폴링레이트, 화면 불량 화소, 주사율, 스피커 채널, 반응 속도, 타자 속도, 초당 클릭 수입니다.\n\n회의나 수업, 녹음 직전 5분에 유용합니다. 하드웨어 사양을 아는 것이 아니라 마이크가 음소거됐는지, 카메라가 가려졌는지, 키가 고장 났는지를 확인하는 도구입니다.',
        },
        {
          heading: '브라우저가 잴 수 있는 것과 없는 것',
          body: '마이크와 카메라 테스트는 권한 허용이 필요하고 스트림은 탭 안에서 처리됩니다. 녹음을 직접 시작하지 않으면 오디오나 영상이 기록되거나 업로드되지 않습니다. 키보드·마우스 테스트는 이벤트를 읽을 뿐 신원을 수집하지 않고, 결과도 어디로 보내지 않습니다.\n\n일부 수치는 본질적으로 근사값입니다. 브라우저 주사율은 애니메이션 프레임으로 추정하므로 절전 상태의 기기에서는 낮게 나올 수 있고, 마우스 폴링레이트는 브라우저가 이벤트를 전달하는 빈도에 제한됩니다. 이 수치는 기기 간 비교로 쓰고 사양으로 단정하지 마세요.',
        },
      ],
      faq: [
        {
          q: '마이크 테스트에서 소리가 안 나오는 이유는?',
          a: '이 페이지에 브라우저 권한이 허용되지 않았거나 시스템에서 입력이 음소거된 경우입니다. 사이트 권한을 먼저 확인하고, 다음으로 운영체제 사운드 설정을 확인하세요.',
        },
        {
          q: '테스트 중 카메라나 마이크가 녹음되나요?',
          a: '아니요. 스트림은 탭에서 표시·측정될 뿐 기록되거나 업로드되지 않습니다. 별도의 음성·화면 녹음을 시작할 때만 파일이 만들어집니다.',
        },
        {
          q: '주사율이 모니터보다 낮게 나오는 이유는?',
          a: '애니메이션 프레임으로 추정하기 때문에 브라우저가 화면을 그리지 않거나, 절전 모드거나, 탭이 백그라운드일 때 값이 낮아집니다. 탭을 활성화하고 창을 보이게 두고 다시 재 보세요.',
        },
      ],
    },
  },
  color: {
    en: {
      sections: [
        {
          heading: 'Four colour tools for design work',
          body: 'Pick a colour from an uploaded image or a screen, check whether two colours meet the WCAG contrast ratio, build a palette from one base colour, and generate a CSS gradient with the code ready to copy.\n\nColour values are easy to get subtly wrong: a hex code pasted into CSS without the leading #, the same colour rendered differently on a wide-gamut display, or a text colour that looks fine but lands at 3.8:1 against its background when 4.5:1 is the AA requirement for body text.',
        },
        {
          heading: 'Contrast numbers that matter',
          body: 'WCAG AA asks for 4.5:1 for normal text, 3:1 for large text (18.66 px bold or 24 px regular) and 3:1 for interface components such as button outlines. AAA raises body text to 7:1. The checker reports the ratio and which level each pair passes, so a failing pair can be adjusted in the same screen rather than guessed at.\n\nThe colour tools do not send the image anywhere: sampling happens in the tab and the palette and gradient values are computed locally.',
        },
      ],
      faq: [
        {
          q: 'What contrast ratio do I need for body text?',
          a: '4.5:1 for normal-size text under WCAG AA, and 7:1 for AAA. Large text — 24 px regular or 18.66 px bold — needs only 3:1, and interface components such as outlines also need 3:1.',
        },
        {
          q: 'Is the image I upload for colour picking stored?',
          a: 'No. The image is drawn to a canvas in the tab and sampled there, so it is not uploaded. Closing the tab discards it.',
        },
        {
          q: 'Can I copy the CSS for the gradient directly?',
          a: 'Yes. The gradient generator shows the linear or radial gradient with its colour stops as CSS, ready to paste into a stylesheet.',
        },
      ],
    },
    ko: {
      sections: [
        {
          heading: '디자인 작업용 색상 도구 4가지',
          body: '업로드한 이미지나 화면에서 색 뽑기, 두 색이 WCAG 대비 기준을 넘는지 확인, 기준색 하나로 팔레트 만들기, CSS 그라디언트를 만들어 코드로 복사하기입니다.\n\n색상 값은 조금씩 틀리기 쉽습니다. 앞의 #을 빼고 CSS에 붙여넣은 헥스 코드, 광색역 디스플레이에서 다르게 보이는 같은 색, 배경과 대비가 3.8:1인데 본문 기준 4.5:1을 넘는다고 착각하는 텍스트 색이 그렇습니다.',
        },
        {
          heading: '실제로 중요한 대비 수치',
          body: 'WCAG AA는 일반 텍스트 4.5:1, 큰 텍스트(18.66px 굵게 또는 24px 보통) 3:1, 버튼 테두리 같은 인터페이스 요소 3:1을 요구합니다. AAA는 본문 7:1입니다. 검사기는 비율과 통과 수준을 함께 보여 주므로, 실패한 조합을 다른 화면으로 옮기지 않고 같은 화면에서 조정할 수 있습니다.\n\n색상 도구는 이미지를 어디로도 보내지 않습니다. 샘플링은 탭에서 하고 팔레트와 그라디언트 값은 로컬에서 계산합니다.',
        },
      ],
      faq: [
        {
          q: '본문 텍스트에 필요한 대비 비율은?',
          a: 'WCAG AA 기준 일반 크기 텍스트는 4.5:1, AAA는 7:1입니다. 큰 텍스트(24px 보통 또는 18.66px 굵게)는 3:1이면 되고, 테두리 같은 인터페이스 요소도 3:1이 필요합니다.',
        },
        {
          q: '색 추출에 올린 이미지가 저장되나요?',
          a: '아니요. 이미지를 탭의 캔버스에 그려 그 자리에서 샘플링하므로 업로드되지 않습니다. 탭을 닫으면 사라집니다.',
        },
        {
          q: '그라디언트 CSS를 바로 복사할 수 있나요?',
          a: '됩니다. 그라디언트 생성기가 색상 지점을 포함한 선형·원형 그라디언트를 CSS로 보여 주므로 스타일시트에 붙여넣으면 됩니다.',
        },
      ],
    },
  },
};
