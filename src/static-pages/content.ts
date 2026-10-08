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
      description: `${SITE_NAME} is a growing collection of small, fast, private web tools. No sign-up, no uploads, no ads — everything runs in your browser.`,
      h1: `About ${SITE_NAME}`,
      intro: 'Simple tools, done right — fast, private, and built to actually be better than the alternative.',
      updated: '2026-10-08',
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
          body: `${SITE_NAME} is published by ${ORG_NAME}. The site has no accounts and no advertising. We use Cloudflare Web Analytics — cookieless, aggregate page-view statistics — to learn which tools people find useful; see our Privacy Policy for exactly what that means.`,
        },
      ],
    },
    ko: {
      title: `${SITE_NAME} 소개`,
      description: `${SITE_NAME}는 가입·업로드·광고 없이 브라우저에서 바로 실행되는 단순하고 빠른 웹 도구 모음입니다.`,
      h1: `${SITE_NAME} 소개`,
      intro: '단순한 도구를 제대로 만듭니다 — 빠르고, 안전하고, 기존 도구보다 실제로 나은 것만 올립니다.',
      updated: '2026-10-08',
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
          body: `${SITE_NAME}는 ${ORG_NAME}가 운영합니다. 이 사이트에는 회원가입과 광고가 없습니다. 어떤 도구가 실제로 쓰이는지 알기 위해 쿠키를 쓰지 않는 집계형 방문 통계인 Cloudflare Web Analytics를 사용하며, 자세한 내용은 개인정보처리방침에서 확인할 수 있습니다.`,
        },
      ],
    },
  },

  privacy: {
    en: {
      title: `Privacy Policy — ${SITE_NAME}`,
      description:
        'How Betterbit Tools handles your data: tools run locally in your browser, no accounts, no cookies, no ads — only cookieless, aggregate visit statistics.',
      h1: 'Privacy Policy',
      intro: 'In short: your files and text never leave your browser. We built the site this way on purpose.',
      updated: '2026-10-08',
      sections: [
        {
          heading: 'What we collect',
          body: `We don't collect your files, text, or any personal data through the tools themselves. Every tool on ${SITE_NAME} runs entirely as JavaScript in your browser. When you resize an image, count characters, or run a timer, that work happens on your device — nothing is uploaded to a server, because the tools have no server to upload to.`,
        },
        {
          heading: 'Accounts and cookies',
          body: `There is no sign-up and no account system. ${SITE_NAME} does not set any cookies.`,
        },
        {
          heading: 'Local storage',
          body: `Some tools save small conveniences — like your last input, a chosen setting, or timer state — using your browser's localStorage, so they're there when you come back. This data stays on your device, is never transmitted anywhere, and you can clear it at any time through your browser's site settings.`,
        },
        {
          heading: 'Hosting and server logs',
          body: `${SITE_NAME} is a static site hosted on Cloudflare. Like any web host, Cloudflare's network generates standard server logs for requests (such as IP address, user agent, and requested URL) to keep the service running and secure. We don't run our own server-side tracking, and apart from the visit statistics described below we don't add anything to what Cloudflare logs by default.`,
        },
        {
          heading: 'Visit statistics (added October 8, 2026)',
          body: `To learn which tools are actually useful, ${SITE_NAME} uses Cloudflare Web Analytics. It is privacy-first by design: it sets no cookies, uses no localStorage, and does not fingerprint or track individual visitors across sites or visits. It reports aggregate numbers only — pages viewed, referring site, browser and device type, country, and page-load performance. It never sees the files or text you use in our tools.\n\n${SITE_NAME} shows no advertising. If that ever changes, we will update this page first and say plainly what is being added and why — before it goes live, not after.`,
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
        '도구는 브라우저에서 로컬로 동작하며 회원가입·쿠키·광고가 없습니다. 쿠키 없는 집계형 방문 통계만 사용합니다. Betterbit Tools의 개인정보 처리 방식을 설명합니다.',
      h1: '개인정보처리방침',
      intro: '요약하면 이렇습니다: 파일과 텍스트는 브라우저 밖으로 나가지 않습니다. 처음부터 그렇게 만들었습니다.',
      updated: '2026-10-08',
      sections: [
        {
          heading: '수집하는 정보',
          body: `도구 사용 과정에서 파일, 텍스트, 그 어떤 개인정보도 수집하지 않습니다. ${SITE_NAME}의 모든 도구는 브라우저 안에서 자바스크립트로 동작합니다. 이미지를 리사이즈하거나, 글자 수를 세거나, 타이머를 돌릴 때 그 작업은 사용자의 기기에서 이루어지며, 서버로 업로드되지 않습니다 — 업로드할 서버 자체가 없기 때문입니다.`,
        },
        {
          heading: '계정과 쿠키',
          body: `회원가입이나 계정 시스템이 없습니다. ${SITE_NAME}는 어떤 쿠키도 설치하지 않습니다.`,
        },
        {
          heading: '로컬 저장소(localStorage)',
          body: `일부 도구는 마지막 입력값, 선택한 설정, 타이머 상태처럼 편의를 위한 작은 정보를 브라우저의 localStorage에 저장해, 다시 방문했을 때 이어서 쓸 수 있게 합니다. 이 데이터는 사용자의 기기에만 남고 외부로 전송되지 않으며, 브라우저의 사이트 설정에서 언제든 삭제할 수 있습니다.`,
        },
        {
          heading: '호스팅과 서버 로그',
          body: `${SITE_NAME}는 Cloudflare에서 호스팅하는 정적 사이트입니다. 다른 웹 호스팅과 마찬가지로 Cloudflare 네트워크는 서비스 운영과 보안을 위해 요청에 대한 표준 서버 로그(IP 주소, 사용자 에이전트, 요청한 URL 등)를 생성합니다. 저희는 자체 서버 측 추적을 운영하지 않으며, 아래의 방문 통계를 제외하면 Cloudflare가 기본적으로 남기는 로그 외에 추가로 수집하는 것이 없습니다.`,
        },
        {
          heading: '방문 통계 (2026년 10월 8일 추가)',
          body: `어떤 도구가 실제로 쓸모 있는지 알기 위해 ${SITE_NAME}는 Cloudflare Web Analytics를 사용합니다. 개인정보 보호를 우선하도록 설계된 도구로, 쿠키나 localStorage를 사용하지 않고, 개별 방문자를 식별하거나 사이트·방문 간에 추적하지 않습니다. 조회된 페이지, 유입 경로, 브라우저와 기기 종류, 국가, 페이지 로딩 성능 같은 집계 수치만 보고하며, 도구에서 사용하는 파일이나 텍스트는 전혀 보지 못합니다.\n\n${SITE_NAME}에는 광고가 없습니다. 앞으로 광고를 추가하게 된다면, 적용 전에 먼저 이 페이지를 업데이트해 무엇을 왜 추가하는지 명확히 밝히겠습니다.`,
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
      updated: '2026-10-07',
      sections: [
        {
          heading: 'Bug reports and tool ideas',
          body: `Found something broken, or a tool you wish existed? Email us with the page URL, what you expected, and what happened instead — that's usually enough for us to reproduce it. Since nothing you process is sent to a server, we can't see your files or input ourselves, so a screenshot or the exact text helps a lot.`,
        },
        {
          heading: 'Response time',
          body: `${SITE_NAME} is a small, independent project, so replies may take a few days. We read every email.`,
        },
      ],
    },
    ko: {
      title: `문의 — ${SITE_NAME}`,
      description:
        '버그 제보, 도구 제안 등 Betterbit에 문의할 내용이 있다면 hello@betterbit.org로 이메일을 보내 주세요. 별도의 문의 양식은 없습니다.',
      h1: '문의',
      intro: '가장 빠른 연락 방법은 이메일입니다 — 별도의 문의 양식이나 티켓 시스템은 없습니다.',
      updated: '2026-10-07',
      sections: [
        {
          heading: '버그 제보와 도구 제안',
          body: `문제가 있거나, 있었으면 하는 도구가 있다면 페이지 주소와 기대했던 동작, 실제로 벌어진 일을 함께 이메일로 보내 주세요. 보통 그 정도면 재현이 가능합니다. 처리하는 내용이 서버로 전송되지 않는 구조라 저희도 사용자의 파일이나 입력값을 직접 볼 수 없으니, 스크린샷이나 원문 텍스트를 함께 보내 주시면 큰 도움이 됩니다.`,
        },
        {
          heading: '답장은 조금 걸릴 수 있어요',
          body: `${SITE_NAME}는 작은 독립 프로젝트라 답장이 며칠 걸릴 수 있습니다. 보내주신 메일은 모두 읽습니다.`,
        },
      ],
    },
  },
};
