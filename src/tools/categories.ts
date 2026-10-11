import type { Locale } from '../i18n/locales';

/**
 * Categories double as hub pages (/c/<id>) for internal linking.
 * Order here is the display order on the home page.
 */
export const CATEGORIES = {
  image: {
    icon: 'image',
    name: { en: 'Image tools', ko: '이미지 도구' },
    description: {
      en: 'Resize, compress, crop and convert images right in your browser. Batch processing, social-media presets, and nothing is ever uploaded.',
      ko: '이미지 크기 조절, 용량 줄이기, 자르기, 형식 변환을 브라우저에서 바로. 여러 장 한번에 처리하고, 파일은 어디에도 업로드되지 않습니다.',
    },
  },
  text: {
    icon: 'text',
    name: { en: 'Text tools', ko: '텍스트 도구' },
    description: {
      en: 'Count words and characters, change case, clean up formatting and compare text — instant results that stay on your device.',
      ko: '자기소개서 글자수 세기, 대소문자 변환, 공백 정리, 텍스트 비교까지. 입력한 글은 내 기기 밖으로 나가지 않습니다.',
    },
  },
  time: {
    icon: 'clock',
    name: { en: 'Time & date', ko: '시간·날짜' },
    description: {
      en: 'Online timers, stopwatches, countdowns and date calculators that stay accurate in background tabs and work without ads.',
      ko: '온라인 타이머, 스톱워치, 디데이 카운트다운, 날짜 계산기. 백그라운드 탭에서도 정확하고 광고가 없습니다.',
    },
  },
  calculator: {
    icon: 'calculator',
    name: { en: 'Calculators', ko: '계산기' },
    description: {
      en: 'Everyday math, finance and health calculators with the formula shown, so you can see exactly how each result is worked out.',
      ko: '퍼센트, 대출 이자, 연봉 실수령액, BMI 등 생활 계산기. 계산식을 함께 보여줘 결과를 바로 확인할 수 있습니다.',
    },
  },
  converter: {
    icon: 'convert',
    name: { en: 'Unit converters', ko: '단위 변환' },
    description: {
      en: 'Convert length, weight, temperature, area, speed and data size instantly, with common values in a quick reference table.',
      ko: '길이, 무게, 온도, 넓이(평·㎡), 속도, 데이터 크기를 바로 변환하고 자주 쓰는 값은 표로 확인하세요.',
    },
  },
  pdf: {
    icon: 'file',
    name: { en: 'PDF tools', ko: 'PDF 도구' },
    description: {
      en: 'Merge, split, compress and convert PDFs entirely in your browser — private documents never leave your computer.',
      ko: 'PDF 합치기, 나누기, 압축, 변환을 브라우저 안에서. 중요한 문서가 서버로 전송되지 않습니다.',
    },
  },
  developer: {
    icon: 'code',
    name: { en: 'Developer tools', ko: '개발자 도구' },
    description: {
      en: 'Format, validate, encode and generate: JSON, Base64, URL encoding, UUIDs, hashes, regex testing and more, all client-side.',
      ko: 'JSON 포맷터, Base64·URL 인코딩, UUID, 해시, 정규식 테스트 등 개발자 도구. 모든 처리는 브라우저에서 이루어집니다.',
    },
  },
  generator: {
    icon: 'sparkle',
    name: { en: 'Generators', ko: '생성기' },
    description: {
      en: 'Generate QR codes, strong passwords, random numbers and team picks — free, unlimited and without sign-up or watermarks.',
      ko: 'QR 코드, 안전한 비밀번호, 랜덤 숫자, 제비뽑기·팀 나누기 생성기. 무료, 무제한, 회원가입과 워터마크 없음.',
    },
  },
  device: {
    icon: 'microphone',
    name: { en: 'Device tests', ko: '기기 테스트' },
    description: {
      en: 'Check your microphone, camera, keyboard and other device inputs in the browser before a call, class or recording — no install or account needed.',
      ko: '화상 회의, 수업, 녹음 전에 마이크·카메라·키보드 등 기기 입력을 브라우저에서 바로 점검합니다. 설치와 회원가입이 필요 없습니다.',
    },
  },
} as const satisfies Record<
  string,
  { icon: string; name: Record<Locale, string>; description: Record<Locale, string> }
>;

export type CategoryId = keyof typeof CATEGORIES;
export const CATEGORY_IDS = Object.keys(CATEGORIES) as CategoryId[];
