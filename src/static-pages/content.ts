import { CONTACT_EMAIL, ORG_NAME, SITE_NAME } from '../config/site';
import type { StaticPageId, StaticPageModule } from './types';

export const STATIC_PAGE_IDS: StaticPageId[] = ['about', 'privacy', 'terms', 'contact'];

/**
 * Content for the trust pages (About, Privacy, Terms, Contact). Kept factual and
 * specific to what the code actually does — see CLAUDE.md rule 2 and docs/VISION.md.
 * Bump `updated` whenever the text changes; it drives the sitemap lastmod.
 */
export const STATIC_PAGES: Record<StaticPageId, StaticPageModule> = {
  about: {
    en: {
      title: `About ${SITE_NAME}`,
      description: `${SITE_NAME} is a growing collection of small, fast, private web tools. No sign-up, no uploads — everything runs in your browser.`,
      h1: `About ${SITE_NAME}`,
      intro: 'Simple tools, done right — fast, private, and built to actually be better than the alternative.',
      updated: '2026-11-28',
      sections: [
        {
          heading: 'Our mission',
          body: `${SITE_NAME} exists to replace the cluttered, slow, upload-your-file-to-a-stranger's-server tools that dominate search results for everyday tasks — resizing an image, counting characters, running a timer. We build one focused tool at a time, aim to make each one faster and more private than what it replaces, and keep adding more.`,
        },
        {
          heading: 'How we build and verify each tool',
          body: `Before building a tool, we open the top competing tools and write down where they fall short — a forced upload, an intrusive ad, a missing feature, a slow or confusing interface. Every tool on this site has to beat that competition on at least one concrete point, and we note what that point is on the tool's page.\n\nThe logic behind each tool is covered by automated tests, including edge cases like empty input or unusual characters. A full verification pass (formatting, type checks, tests, and a build-output audit for broken links and SEO basics) has to pass before anything ships.`,
        },
        {
          heading: 'Who publishes this site',
          body: `${SITE_NAME} is published by ${ORG_NAME}. The site has no accounts. It is free to use, and advertising from Google AdSense in the content area below each tool pays part of what it costs to run; the Privacy Policy describes exactly what the site collects, ads included.`,
        },
        {
          heading: 'Where the Korean tools and numbers come from',
          body: `A large part of this site exists because Korean practice differs from the English-language tools that dominate search results. The salary calculator uses the 2026 employee rates — national pension 4.75%, health insurance 3.595%, long-term care 13.14% of the health premium and employment insurance 0.9% — rather than the older 4.5% and 3.545%. The age calculator separates 만 나이, 세는 나이 and 연 나이 as they stand after the June 2023 age-unification law. The pyeong converter uses the exact 400/121 ㎡ factor, the gold converter the 3.75 g 돈, and the lunar converter the Korea Astronomy and Space Science Institute's calendar data for its month lengths.

Each Korean tool names the law, notice or dataset behind its numbers on the page itself, with the date the source was checked, so a figure can be verified instead of taken on trust. Where a rule changes yearly — minimum wage, social-insurance rates, income-tax withholding — the page states which year it applies to.`,
        },
        {
          heading: 'What happens when a number is wrong',
          body: `Bugs are corrected in the code and covered by a test so the same mistake cannot return, then the page is rebuilt and the "Updated" date at the bottom of the page changes. If you report a wrong result, include the page, the inputs you entered and the figure you expected, plus the source you are comparing against — with nothing uploaded to a server, that is the only way the calculation can be reproduced.

Corrections are not announced as news, but a change that alters a result people rely on — a new tax year, a new minimum wage — is described in the page's own text rather than made silently.`,
        },
        {
          heading: 'Why nothing is uploaded, and what that costs you',
          body: `Every tool runs as JavaScript in the browser, which is why a PDF, a photo or a recording never leaves the device and why there are no file-size quotas or daily limits. The trade-off is support: the site cannot see the file or text that produced a problem, so a screenshot or the exact input is what makes a bug reproducible.

It also means the tools stop working when the browser's own features do — a locked phone can delay a timer alarm, and a very large PDF can exceed the memory a tab is allowed. The page for each tool states that limit rather than letting you discover it halfway through the job.`,
        },
      ],
    },
    ko: {
      title: `${SITE_NAME} 소개`,
      description: `${SITE_NAME}는 가입과 업로드 없이 브라우저에서 바로 실행되는 단순하고 빠른 웹 도구 모음입니다.`,
      h1: `${SITE_NAME} 소개`,
      intro: '단순한 도구를 제대로 만듭니다 — 빠르고, 안전하고, 기존 도구보다 실제로 나은 것만 올립니다.',
      updated: '2026-11-28',
      sections: [
        {
          heading: '미션',
          body: `${SITE_NAME}는 이미지 리사이즈, 글자 수 세기, 타이머처럼 매일 쓰는 단순한 작업에서 파일을 낯선 서버에 업로드하게 하거나, 느리고 광고로 뒤덮인 기존 도구들을 대체하기 위해 만들어졌습니다. 한 번에 하나씩, 기존 도구보다 빠르고 안전한 도구를 만들어 계속 늘려갑니다.`,
        },
        {
          heading: '도구를 만들고 검증하는 방법',
          body: `도구를 만들기 전에 경쟁 도구 상위 몇 개를 직접 써보고 약점을 적습니다 — 강제 업로드, 거슬리는 광고, 빠진 기능, 느리거나 불편한 화면 같은 것들입니다. 이 사이트의 모든 도구는 그 경쟁 도구보다 최소 한 가지 구체적인 지점에서 더 나아야 하고, 그 지점을 도구 페이지에 명시합니다.\n\n각 도구의 핵심 로직은 빈 입력값이나 특수 문자 같은 예외 상황을 포함한 자동 테스트로 검증합니다. 포맷·타입 검사·테스트·빌드 결과물의 SEO/링크 점검까지 모두 통과해야 배포합니다.`,
        },
        {
          heading: '운영 주체',
          body: `${SITE_NAME}는 ${ORG_NAME}가 운영합니다. 이 사이트에는 회원가입이 없습니다. 누구나 무료로 쓰며, 운영 비용의 일부는 각 도구 아래 콘텐츠 영역에 표시되는 Google AdSense 광고로 충당합니다. 사이트가 수집하는 항목은 광고를 포함해 개인정보처리방침에 적혀 있습니다.`,
        },
        {
          heading: '한국 도구와 숫자의 출처',
          body: `이 사이트의 상당 부분은 검색 결과를 차지하는 영문 도구와 한국 관행이 달라서 만들어졌습니다. 연봉 계산기는 옛 4.5%·3.545%가 아니라 2026년 근로자 요율인 국민연금 4.75%, 건강보험 3.595%, 건강보험료의 13.14%인 장기요양, 고용보험 0.9%를 씁니다. 나이 계산기는 2023년 6월 만 나이 통일법 이후의 만 나이·세는 나이·연 나이를 구분하고, 평 계산기는 정확한 400/121㎡ 기준을, 금 무게는 3.75g의 돈을, 음력 변환기는 한국천문연구원의 달력 데이터를 월 길이에 사용합니다.

한국 도구는 각 페이지에 근거 법령·공고·데이터셋과 확인 날짜를 함께 적습니다. 신뢰해 달라고 요구하는 대신 직접 확인할 수 있게 하려는 것입니다. 최저임금, 사회보험 요율, 소득세 원천징수처럼 해마다 바뀌는 규정은 어느 연도 기준인지도 페이지에 표시합니다.`,
        },
        {
          heading: '숫자가 틀렸을 때 어떻게 고치나',
          body: `오류는 코드에서 고치고 같은 실수가 다시 생기지 않도록 테스트로 막은 뒤 페이지를 다시 빌드하며, 페이지 아래의 '업데이트' 날짜가 바뀝니다. 잘못된 결과를 알려 주실 때는 페이지 주소, 입력한 값, 기대한 값, 비교하신 출처를 함께 보내 주세요. 파일이 서버로 전송되지 않는 구조라 그 정보가 없으면 계산을 재현할 수 없습니다.

수정은 뉴스처럼 공지하지 않지만, 사람들이 의존하는 결과를 바꾸는 변경 — 새 과세연도, 새 최저임금 — 은 조용히 덮지 않고 해당 페이지 본문에 설명합니다.`,
        },
        {
          heading: '업로드가 없는 대신 생기는 제약',
          body: `모든 도구가 브라우저에서 자바스크립트로 실행되므로 PDF, 사진, 녹음 파일이 기기 밖으로 나가지 않고 파일 크기 할당량이나 하루 제한도 없습니다. 대신 지원에 제약이 있습니다. 문제를 만든 파일이나 텍스트를 사이트가 볼 수 없으므로, 스크린샷이나 정확한 입력값이 있어야 재현할 수 있습니다.

브라우저 기능이 멈추면 도구도 멈춘다는 뜻이기도 합니다. 잠긴 휴대폰은 타이머 알람을 늦출 수 있고, 아주 큰 PDF는 탭에 허용된 메모리를 넘을 수 있습니다. 각 도구 페이지에 그 한도를 적어 두어 작업 도중에 알게 되지 않도록 했습니다.`,
        },
      ],
    },
  },

  privacy: {
    en: {
      title: `Privacy Policy — ${SITE_NAME}`,
      description:
        'How Betterbit Tools handles your data: tools run locally in your browser with no accounts or uploads. See what Cloudflare, Google Analytics and AdSense collect.',
      h1: 'Privacy Policy',
      intro: 'In short: your files and text never leave your browser. We built the site this way on purpose.',
      updated: '2026-11-18',
      sections: [
        {
          heading: 'What we collect',
          body: `We don't collect your files, text, or any personal data through the tools themselves. Every tool on ${SITE_NAME} runs entirely as JavaScript in your browser. When you resize an image, count characters, or run a timer, that work happens on your device — nothing is uploaded to a server, because the tools have no server to upload to.`,
        },
        {
          heading: 'Accounts and cookies',
          body: `There is no sign-up and no account system. The tools themselves set no cookies. The cookies on ${SITE_NAME} come from Google Analytics and from Google AdSense, both described below. In the EU/EEA, the UK and Switzerland, Google Analytics runs without cookies and ads are personalized only after you consent.`,
        },
        {
          heading: 'Local storage',
          body: `Some tools save small conveniences — like your last input, a chosen setting, or timer state — using your browser's localStorage, so they're there when you come back. To show recently used tools on the home page, we also save a list of up to eight tool identifiers (their URL slugs). This data stays on your device, is never transmitted anywhere, and you can clear the recent list from the home page or clear it at any time through your browser's site settings.`,
        },
        {
          heading: 'Hosting and server logs',
          body: `${SITE_NAME} is a static site hosted on Cloudflare. Like any web host, Cloudflare's network generates standard server logs for requests (such as IP address, user agent, and requested URL) to keep the service running and secure. We don't run our own server-side tracking, and apart from the visit statistics described below we don't add anything to what Cloudflare logs by default.`,
        },
        {
          heading: 'Visit statistics (updated October 16, 2026)',
          body: `To learn which tools are actually useful, ${SITE_NAME} uses Cloudflare Web Analytics. It is privacy-first by design: it sets no cookies, uses no localStorage, and does not fingerprint or track individual visitors across sites or visits. It reports aggregate numbers only — pages viewed, referring site, browser and device type, country, and page-load performance. It never sees the files or text you use in our tools.\n\nSince October 16, 2026 we also use Google Analytics 4 to see how people find and use the site: which search engine or website sent a visit, which pages were viewed, and for how long. It sets first-party cookies (_ga and _ga_<ID>) holding a random identifier, so a returning browser can be counted once. Google receives your IP address to estimate your country and city; Google Analytics 4 does not log or store IP addresses. We have not turned on advertising features, Google signals, or user IDs, and the files and text you use in our tools are never sent. In the EU/EEA, the UK and Switzerland, Google Analytics runs in consent mode with analytics storage denied, so it sets no cookies there. You can opt out anywhere with Google's browser add-on (https://tools.google.com/dlpage/gaoptout) or by blocking cookies for this site.\n\nFor the cookies that come with advertising, see the next section.`,
        },
        {
          heading: 'Advertising (added November 18, 2026)',
          body: `${SITE_NAME} is free to use and paid for in part by advertising served by Google AdSense. The ad code loads on every page, and ads appear inside the content area below a tool — never over the tool, never as a pop-up or an interstitial, and never between you and a result. Because every tool runs in your browser, Google and its partners never see the files or text you process.\n\nGoogle and its partners use cookies and similar technologies to serve ads based on your visits to this site and to other sites. Third-party vendors, including Google, use advertising cookies to do this, which is what makes an ad personalized; Google's own explanation is at https://policies.google.com/technologies/ads. You can turn off personalized advertising in Google Ads Settings (https://adssettings.google.com) — you will still see ads, but they will not be based on your interests — and you can opt out of third-party vendors' use of cookies for personalized advertising at https://www.aboutads.info/choices.\n\nIn the EU/EEA, the UK and Switzerland, a Google-certified consent management platform asks for your consent before advertising cookies are used. If you decline, Google serves non-personalized ads only, or no ads at all. You can change that choice at any time through the consent message or the link shown with the ad.`,
        },
        {
          heading: 'Changes to this policy',
          body: `We may update this policy as the site grows. The date below reflects the last change; meaningful changes (like adding analytics or ads) get called out specifically, not buried in a silent edit.`,
        },
        {
          heading: 'Contact',
          body: `Questions about this policy? Email ${CONTACT_EMAIL}.`,
        },
      ],
    },
    ko: {
      title: `개인정보처리방침 — ${SITE_NAME}`,
      description:
        '도구는 브라우저에서 로컬로 동작하며 회원가입과 업로드가 없습니다. 방문 통계는 Cloudflare Web Analytics와 Google Analytics로, 광고는 Google AdSense로 제공합니다. Betterbit Tools의 개인정보 처리 방식을 설명합니다.',
      h1: '개인정보처리방침',
      intro: '요약하면 이렇습니다: 파일과 텍스트는 브라우저 밖으로 나가지 않습니다. 처음부터 그렇게 만들었습니다.',
      updated: '2026-11-18',
      sections: [
        {
          heading: '수집하는 정보',
          body: `도구 사용 과정에서 파일, 텍스트, 그 어떤 개인정보도 수집하지 않습니다. ${SITE_NAME}의 모든 도구는 브라우저 안에서 자바스크립트로 동작합니다. 이미지를 리사이즈하거나, 글자 수를 세거나, 타이머를 돌릴 때 그 작업은 사용자의 기기에서 이루어지며, 서버로 업로드되지 않습니다 — 업로드할 서버 자체가 없기 때문입니다.`,
        },
        {
          heading: '계정과 쿠키',
          body: `회원가입이나 계정 시스템이 없습니다. 도구 자체는 쿠키를 설치하지 않습니다. ${SITE_NAME}에서 쓰이는 쿠키는 아래에서 설명하는 Google Analytics와 Google AdSense의 쿠키입니다. EU/EEA·영국·스위스에서는 Google Analytics가 쿠키 없이 동작하고, 광고는 동의한 뒤에만 맞춤형으로 게재됩니다.`,
        },
        {
          heading: '로컬 저장소(localStorage)',
          body: `일부 도구는 마지막 입력값, 선택한 설정, 타이머 상태처럼 편의를 위한 작은 정보를 브라우저의 localStorage에 저장해, 다시 방문했을 때 이어서 쓸 수 있게 합니다. 홈에서 최근 사용한 도구를 보여 주기 위해 도구 식별자(URL 슬러그)를 최대 8개까지 함께 저장합니다. 이 데이터는 사용자의 기기에만 남고 외부로 전송되지 않으며, 홈에서 최근 목록을 지우거나 브라우저의 사이트 설정에서 언제든 삭제할 수 있습니다.`,
        },
        {
          heading: '호스팅과 서버 로그',
          body: `${SITE_NAME}는 Cloudflare에서 호스팅하는 정적 사이트입니다. 다른 웹 호스팅과 마찬가지로 Cloudflare 네트워크는 서비스 운영과 보안을 위해 요청에 대한 표준 서버 로그(IP 주소, 사용자 에이전트, 요청한 URL 등)를 생성합니다. 저희는 자체 서버 측 추적을 운영하지 않으며, 아래의 방문 통계를 제외하면 Cloudflare가 기본적으로 남기는 로그 외에 추가로 수집하는 것이 없습니다.`,
        },
        {
          heading: '방문 통계 (2026년 10월 16일 변경)',
          body: `어떤 도구가 실제로 쓸모 있는지 알기 위해 ${SITE_NAME}는 Cloudflare Web Analytics를 사용합니다. 개인정보 보호를 우선하도록 설계된 도구로, 쿠키나 localStorage를 사용하지 않고, 개별 방문자를 식별하거나 사이트·방문 간에 추적하지 않습니다. 조회된 페이지, 유입 경로, 브라우저와 기기 종류, 국가, 페이지 로딩 성능 같은 집계 수치만 보고하며, 도구에서 사용하는 파일이나 텍스트는 전혀 보지 못합니다.\n\n2026년 10월 16일부터는 사람들이 사이트를 어떻게 찾아오고 쓰는지 알기 위해 Google Analytics 4도 함께 사용합니다. 어떤 검색엔진이나 웹사이트를 통해 들어왔는지, 어떤 페이지를 얼마나 오래 봤는지를 수집합니다. 다시 방문한 브라우저를 한 번으로 세기 위해 무작위 식별자가 담긴 자사 쿠키(_ga, _ga_<ID>)를 설치합니다. Google은 국가와 도시를 추정하기 위해 IP 주소를 받지만, Google Analytics 4는 IP 주소를 기록하거나 저장하지 않습니다. 광고 기능, Google 신호, 사용자 ID 기능은 켜지 않았고, 도구에서 사용하는 파일과 텍스트는 전송되지 않습니다. EU/EEA·영국·스위스에서는 분석 저장소가 거부된 동의 모드로 동작해 쿠키를 설치하지 않습니다. 어디서든 Google의 브라우저 부가기능(https://tools.google.com/dlpage/gaoptout)이나 이 사이트의 쿠키 차단으로 수집을 거부할 수 있습니다.\n\n광고와 함께 쓰이는 쿠키는 아래 섹션에서 설명합니다.`,
        },
        {
          heading: '광고 (2026년 11월 18일 추가)',
          body: `${SITE_NAME}는 무료로 제공되며, 그 비용의 일부를 Google AdSense가 게재하는 광고로 충당합니다. 광고 코드는 모든 페이지에 실리고, 광고는 도구 아래 콘텐츠 영역 안에만 나타납니다 — 도구를 덮거나, 팝업이나 전면 광고로 끼어들거나, 결과를 가리는 일은 없습니다. 모든 도구가 브라우저 안에서 동작하므로 Google과 그 파트너는 도구에서 처리하는 파일이나 텍스트를 볼 수 없습니다.\n\nGoogle과 그 파트너는 이 사이트와 다른 사이트의 방문 기록을 바탕으로 광고를 게재하기 위해 쿠키와 유사한 기술을 사용합니다. Google을 포함한 제3자 광고 사업자는 이러한 광고 쿠키를 사용하며, 이것이 광고가 맞춤형으로 표시되는 이유입니다. Google의 설명은 https://policies.google.com/technologies/ads 에서 확인할 수 있습니다. Google 광고 설정(https://adssettings.google.com)에서 맞춤형 광고를 끌 수 있고, 끄더라도 광고는 계속 표시되지만 관심사에 맞춰지지는 않습니다. 제3자 사업자의 맞춤형 광고 쿠키 사용은 https://www.aboutads.info/choices 에서 거부할 수 있습니다.\n\nEU/EEA·영국·스위스에서는 Google이 인증한 동의 관리 플랫폼이 광고 쿠키 사용 전에 동의를 요청합니다. 동의하지 않으면 Google은 맞춤형이 아닌 광고만 게재하거나 광고를 게재하지 않습니다. 이 선택은 동의 메시지나 광고에 함께 표시되는 링크에서 언제든 바꿀 수 있습니다.`,
        },
        {
          heading: '방침 변경',
          body: `사이트가 성장하면서 이 방침도 업데이트될 수 있습니다. 아래 날짜는 마지막 변경 시점을 나타내며, 애널리틱스나 광고 추가처럼 의미 있는 변경은 조용한 수정이 아니라 명시적으로 안내합니다.`,
        },
        {
          heading: '문의',
          body: `이 방침에 대해 궁금한 점이 있으면 ${CONTACT_EMAIL}로 문의해 주세요.`,
        },
      ],
    },
  },

  terms: {
    en: {
      title: `Terms of Use — ${SITE_NAME}`,
      description:
        'Terms for using Betterbit Tools: provided as-is with no warranty, you own your files and your output, and acceptable use rules.',
      h1: 'Terms of Use',
      intro: `By using ${SITE_NAME}, you agree to the terms below.`,
      updated: '2026-10-07',
      sections: [
        {
          heading: 'The service',
          body: `${SITE_NAME} provides free, browser-based tools "as is" and "as available," with no warranty of any kind, express or implied — including no guarantee that a tool will be error-free, uninterrupted, or fit for a particular purpose. Use the results at your own judgment, especially for anything important.`,
        },
        {
          heading: 'Your files and your responsibility',
          body: `Every tool runs entirely in your browser: we never receive, store, or have access to the files or text you process. That also means we can't back them up, recover them, or fix anything that goes wrong with them — you're responsible for your own data and for keeping copies of anything you can't afford to lose.`,
        },
        {
          heading: 'Acceptable use',
          body: `Don't use this site to break the law, infringe someone else's rights, or attempt to disrupt, scrape at scale, or attack the service.`,
        },
        {
          heading: 'Content and ownership',
          body: `The site's design, text, and code belong to ${ORG_NAME} unless stated otherwise, and you're welcome to link to any page. Please don't republish or scrape the site's content wholesale without permission. Anything a tool produces for you — a resized image, a word count, a timer — is entirely yours; we claim no rights over your output.`,
        },
        {
          heading: 'Changes',
          body: `We may update the service or these terms as the site evolves. Continuing to use ${SITE_NAME} after a change means you accept the updated terms. The date below reflects the last change.`,
        },
        {
          heading: 'Contact',
          body: `Questions about these terms? Email ${CONTACT_EMAIL}.`,
        },
      ],
    },
    ko: {
      title: `이용약관 — ${SITE_NAME}`,
      description:
        'Betterbit Tools 이용약관: 도구는 있는 그대로 제공되며 별도의 보증을 하지 않습니다. 파일과 결과물의 소유권, 이용 규칙을 안내합니다.',
      h1: '이용약관',
      intro: `${SITE_NAME}를 이용하면 아래 약관에 동의하는 것으로 간주합니다.`,
      updated: '2026-10-07',
      sections: [
        {
          heading: '서비스 제공',
          body: `${SITE_NAME}는 브라우저 기반의 무료 도구를 "있는 그대로", "제공되는 상태 그대로" 제공하며, 오류가 없거나 중단 없이 동작하거나 특정 목적에 적합함을 포함해 어떠한 보증도 하지 않습니다. 특히 중요한 작업일수록 결과물은 사용자 본인의 판단으로 확인해 주세요.`,
        },
        {
          heading: '파일과 책임',
          body: `모든 도구는 브라우저 안에서만 동작하므로, 처리하는 파일이나 텍스트를 저희가 받거나 저장하거나 들여다볼 수 없습니다. 반대로 말하면 문제가 생겼을 때 저희가 백업하거나 복구해 줄 수도 없습니다 — 자신의 데이터 관리와 중요한 자료의 백업은 사용자 본인의 책임입니다.`,
        },
        {
          heading: '이용 수칙',
          body: `이 사이트를 법을 위반하거나, 타인의 권리를 침해하거나, 서비스를 방해·대량 수집(스크래핑)·공격하는 목적으로 이용하지 마세요.`,
        },
        {
          heading: '콘텐츠와 소유권',
          body: `별도로 표시되지 않은 사이트의 디자인, 텍스트, 코드는 ${ORG_NAME}에 속합니다. 어떤 페이지로든 링크하는 것은 자유롭지만, 사이트 콘텐츠 전체를 허락 없이 재배포하거나 대량으로 수집하지 말아 주세요. 도구가 만들어 주는 결과물 — 리사이즈된 이미지, 글자 수, 타이머 설정 등 — 은 전부 사용자의 것이며, 저희는 그 결과물에 대해 어떠한 권리도 주장하지 않습니다.`,
        },
        {
          heading: '약관 변경',
          body: `사이트가 발전하면서 서비스나 이 약관이 업데이트될 수 있습니다. 변경 후에도 ${SITE_NAME}를 계속 이용하면 변경된 약관에 동의한 것으로 봅니다. 아래 날짜는 마지막 변경 시점입니다.`,
        },
        {
          heading: '문의',
          body: `이 약관에 대해 궁금한 점이 있으면 ${CONTACT_EMAIL}로 문의해 주세요.`,
        },
      ],
    },
  },

  contact: {
    en: {
      title: `Contact — ${SITE_NAME}`,
      description:
        'Reach Betterbit about a bug, a tool idea, or anything else — email hello@betterbit.org directly, no contact form.',
      h1: 'Contact',
      intro: `The fastest way to reach us is email — no contact form, no ticket system.`,
      updated: '2026-11-28',
      sections: [
        {
          heading: 'Bug reports and tool ideas',
          body: `Found something broken, or a tool you wish existed? Email us with the page URL, what you expected, and what happened instead — that's usually enough for us to reproduce it. Since nothing you process is sent to a server, we can't see your files or input ourselves, so a screenshot or the exact text helps a lot.`,
        },
        {
          heading: 'Response time',
          body: `${SITE_NAME} is a small, independent project, so replies may take a few days. We read every email.`,
        },
        {
          heading: 'Reporting a wrong calculation',
          body: `For a calculator, the page alone is not enough to reproduce a result: send the inputs you entered, the figure the page showed, the figure you expected, and the notice, payslip or official calculator you are comparing against. With the four together a rate, a cap or a rounding rule can be checked against its source and corrected in the code.

Because nothing you enter is transmitted while you use a tool, the site has no log of your calculation to look at. That is deliberate — it is the same reason a private document never leaves your device — and it is why the report has to come from you.`,
        },
        {
          heading: 'Business, licensing and press',
          body: `For licensing a tool, embedding one, or asking about advertising and partnerships, write to the same address with the subject line starting with the topic. The terms page states what the site claims over its own design, text and code, and confirms that anything a tool produces belongs to you.

${SITE_NAME} does not sell data, has no accounts, and does not run affiliate or sponsored content disguised as a tool; advertising is served by Google AdSense in the content area below each tool, as the Privacy Policy describes.`,
        },
        {
          heading: 'What we cannot help with',
          body: `The calculators estimate; they do not decide. A salary, severance or unemployment result is not a ruling on your case, and the site cannot give individual tax, labour or legal advice — the employment service, the tax office and a labour attorney are the authorities. Questions about a specific employer's payment belong with those offices rather than with this inbox.

Bugs, broken pages and tools that should exist are always in scope: a short email with the URL and what happened is enough to start.`,
        },
      ],
    },
    ko: {
      title: `문의 — ${SITE_NAME}`,
      description:
        '버그 제보, 도구 제안 등 Betterbit에 문의할 내용이 있다면 hello@betterbit.org로 이메일을 보내 주세요. 별도의 문의 양식은 없습니다.',
      h1: '문의',
      intro: '가장 빠른 연락 방법은 이메일입니다 — 별도의 문의 양식이나 티켓 시스템은 없습니다.',
      updated: '2026-11-28',
      sections: [
        {
          heading: '버그 제보와 도구 제안',
          body: `문제가 있거나, 있었으면 하는 도구가 있다면 페이지 주소와 기대했던 동작, 실제로 벌어진 일을 함께 이메일로 보내 주세요. 보통 그 정도면 재현이 가능합니다. 처리하는 내용이 서버로 전송되지 않는 구조라 저희도 사용자의 파일이나 입력값을 직접 볼 수 없으니, 스크린샷이나 원문 텍스트를 함께 보내 주시면 큰 도움이 됩니다.`,
        },
        {
          heading: '답장은 조금 걸릴 수 있어요',
          body: `${SITE_NAME}는 작은 독립 프로젝트라 답장이 며칠 걸릴 수 있습니다. 보내주신 메일은 모두 읽습니다.`,
        },
        {
          heading: '계산 결과가 틀렸을 때 알려 주는 방법',
          body: `계산기는 페이지 주소만으로는 결과를 재현할 수 없습니다. 입력한 값, 페이지가 보여 준 값, 기대한 값, 비교하신 공고·급여명세서·공식 계산기를 함께 보내 주세요. 네 가지가 있으면 요율·상한·반올림 규칙을 근거와 대조해 코드에서 고칠 수 있습니다.

도구를 쓰는 동안 입력값이 전송되지 않으므로 사이트에는 확인할 계산 기록이 없습니다. 사적인 문서가 기기 밖으로 나가지 않는 것과 같은 이유이며, 그래서 제보가 필요합니다.`,
        },
        {
          heading: '제휴·라이선스·보도 문의',
          body: `도구 라이선스, 다른 사이트에 넣기(임베드), 광고·제휴 문의는 같은 주소로 보내 주시고 제목 앞에 용도를 적어 주세요. 이용약관에는 사이트의 디자인·텍스트·코드에 대한 권리와, 도구가 만든 결과물이 전부 사용자 것이라는 점이 적혀 있습니다.

${SITE_NAME}는 데이터를 판매하지 않고, 회원 계정이 없으며, 도구로 위장한 제휴·광고 콘텐츠를 싣지 않습니다. 광고는 개인정보처리방침에 적힌 대로 각 도구 아래 콘텐츠 영역의 Google AdSense로만 게재됩니다.`,
        },
        {
          heading: '도와드릴 수 없는 것',
          body: `계산기는 추정치이고 판정이 아닙니다. 연봉·퇴직금·실업급여 결과는 개별 사안에 대한 결정이 아니며, 이 사이트는 세무·노동·법률 상담을 하지 않습니다. 고용센터, 세무서, 노무사가 기준입니다. 특정 회사의 지급 문제는 그 기관에 문의하셔야 합니다.

반대로 버그, 깨진 페이지, 있었으면 하는 도구는 언제나 환영입니다. 주소와 어떤 일이 있었는지 적은 짧은 메일이면 충분합니다.`,
        },
      ],
    },
  },
};
