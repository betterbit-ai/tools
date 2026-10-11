import type { Locale } from './locales';

/**
 * Site-chrome strings (header, footer, shared sections).
 * Tool-specific strings live in each tool's `content.ts`, never here.
 */
const en = {
  'site.tagline': 'Fast, private, ad-free tools that just work.',
  'site.description':
    'Free online tools that run entirely in your browser. No sign-up, no uploads, no ads — just fast tools for images, text, time and more.',
  'nav.allTools': 'All tools',
  'nav.language': 'Language',
  'nav.skip': 'Skip to content',
  'home.h1': 'Simple tools, done right.',
  'home.searchPlaceholder': 'Search tools…',
  'home.searchLabel': 'Search tools',
  'home.noResults': 'No tools match your search.',
  'home.toolCount': '{count} tools',
  'home.popular': 'Popular',
  'home.viewAll': 'View all {count}',
  'home.categoryCount': '{count} tools',
  'tool.howTo': 'How to use',
  'tool.faq': 'Frequently asked questions',
  'tool.related': 'Related tools',
  'tool.variants': 'Quick presets',
  'tool.whyBetter': 'Why this tool',
  'tool.updated': 'Updated {date}',
  'edge.privacy': 'Runs in your browser — files never leave your device',
  'edge.no-ads': 'No ads, no pop-ups',
  'edge.performance': 'Instant — no waiting, no queue',
  'edge.usability': 'Fewer clicks, keyboard friendly',
  'edge.design': 'Clean, readable, works on any screen',
  'edge.features': 'Features others lock behind paywalls',
  'edge.accuracy': 'More accurate results',
  'edge.offline': 'Works offline once loaded',
  'edge.no-signup': 'No sign-up, no limits',
  'footer.privacy': 'Everything runs locally in your browser. We never see your files or text.',
  'footer.rights': '© {year} {name}',
  'footer.legalNav': 'About & legal',
  'footer.about': 'About',
  'footer.privacyLink': 'Privacy Policy',
  'footer.terms': 'Terms of Use',
  'footer.contact': 'Contact',
  'breadcrumb.home': 'Home',
  'page.moreLinks': 'More pages',
  'page.email': 'Email us',
};

export type UiKey = keyof typeof en;

const ko: Record<UiKey, string> = {
  'site.tagline': '빠르고, 안전하고, 광고 없는 도구.',
  'site.description':
    '브라우저에서 바로 실행되는 무료 온라인 도구 모음. 회원가입·업로드·광고 없이 이미지, 텍스트, 시간 도구를 빠르게 사용하세요.',
  'nav.allTools': '전체 도구',
  'nav.language': '언어',
  'nav.skip': '본문으로 건너뛰기',
  'home.h1': '단순한 도구, 제대로 만들었습니다.',
  'home.searchPlaceholder': '도구 검색…',
  'home.searchLabel': '도구 검색',
  'home.noResults': '검색 결과가 없습니다.',
  'home.toolCount': '도구 {count}개',
  'home.popular': '인기 도구',
  'home.viewAll': '{count}개 모두 보기',
  'home.categoryCount': '도구 {count}개',
  'tool.howTo': '사용 방법',
  'tool.faq': '자주 묻는 질문',
  'tool.related': '관련 도구',
  'tool.variants': '빠른 프리셋',
  'tool.whyBetter': '이 도구가 다른 점',
  'tool.updated': '{date} 업데이트',
  'edge.privacy': '브라우저에서 처리 — 파일이 기기 밖으로 나가지 않습니다',
  'edge.no-ads': '광고·팝업 없음',
  'edge.performance': '즉시 처리 — 대기열 없음',
  'edge.usability': '더 적은 클릭, 키보드 지원',
  'edge.design': '깔끔하고 읽기 쉬운 화면, 모든 기기 지원',
  'edge.features': '다른 곳에선 유료인 기능을 무료로',
  'edge.accuracy': '더 정확한 결과',
  'edge.offline': '한 번 열면 오프라인에서도 동작',
  'edge.no-signup': '회원가입·사용 제한 없음',
  'footer.privacy': '모든 처리는 브라우저 안에서 이루어집니다. 파일과 텍스트는 서버로 전송되지 않습니다.',
  'footer.rights': '© {year} {name}',
  'footer.legalNav': '소개 및 법적 정보',
  'footer.about': '소개',
  'footer.privacyLink': '개인정보처리방침',
  'footer.terms': '이용약관',
  'footer.contact': '문의',
  'breadcrumb.home': '홈',
  'page.moreLinks': '다른 페이지',
  'page.email': '이메일 보내기',
};

const dictionaries: Record<Locale, Record<UiKey, string>> = { en, ko };

export function t(locale: Locale, key: UiKey, vars?: Record<string, string | number>): string {
  let s = dictionaries[locale][key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}
