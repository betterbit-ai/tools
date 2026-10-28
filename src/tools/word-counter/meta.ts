import type { ToolMeta, ToolVariant } from '../types';
import { fitRepeatedText } from './logic';

const SMS_80 = fitRepeatedText(80, '가', 'bytesLegacy');
const LMS_2000 = fitRepeatedText(2000, '가', 'bytesLegacy');
const X_280 = fitRepeatedText(280, '가', 'xWeightedLength');
const YOUTUBE_DESCRIPTION = fitRepeatedText(5000, '가', 'bytesUtf8');
const SOURCES = {
  ktSms: { label: 'KT AI 전화', url: 'https://product.kt.com/wDic/productDetail.do?ItemCode=1553' },
  naverCloudSms: {
    label: 'NAVER Cloud SENS API',
    url: 'https://api.ncloud-docs.com/docs/ko/ai-application-service-sens-smsv2',
  },
  instagram: {
    label: 'Meta IG User Media',
    url: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media',
  },
  x: { label: 'X twitter-text v3', url: 'https://github.com/twitter/twitter-text/blob/master/config/v3.json' },
  youtube: {
    label: 'YouTube Data API',
    url: 'https://developers.google.com/youtube/data/reference/rest/v3/videos',
  },
  naverBlog: {
    label: 'NAVER 블로그 고객센터',
    url: 'https://help.naver.com/service/5593/contents/15514?lang=ko&osType=PC',
  },
  globalSms: {
    label: 'AWS SMS character limits',
    url: 'https://docs.aws.amazon.com/sms-voice/latest/userguide/sms-limitations-character.html',
  },
} as const;

const essayVariants: ToolVariant[] = [500, 1000, 1500].map((limit) => ({
  slug: `jasoseo-${limit}-characters`,
  preset: { limit, metric: 'characters', rule: 'selfIntroduction' },
  content: {
    en: {
      title: `Korean Cover Letter ${limit}-Character Counter — With or Without Spaces`,
      description: `Track a ${limit}-character Korean cover letter with spaces included, then switch to the no-space rule if the application says so. Both counts update live.`,
      h1: `Korean Cover Letter: ${limit} Characters`,
      intro: `The counter opens at ${limit} characters including spaces and shows ${limit} remaining before you type. Korean application forms set their own rule, so use the space-included count unless the field explicitly says “공백 제외”; the selector switches the same target to no-spaces without changing your draft.`,
    },
    ko: {
      title: `자소서 ${limit}자 글자수 세기 — 공백 포함·제외`,
      description: `자소서 ${limit}자 제한을 공백 포함 기준으로 바로 셉니다. 채용 양식이 공백 제외를 요구하면 기준만 바꿔 남은 글자와 초과 글자를 확인하세요.`,
      h1: `자소서 ${limit}자 글자수 세기`,
      intro: `공백 포함 ${limit}자를 기준으로 열리며 입력 전에는 ${limit}자 남음으로 표시됩니다. 자기소개서 글자수 규칙은 기업마다 다르므로 입력란에 “공백 제외”가 적혀 있을 때만 아래 기준을 공백 제외로 바꾸세요. 작성한 글은 그대로 두고 두 기준을 즉시 비교할 수 있습니다.`,
    },
  },
}));

const variants: ToolVariant[] = [
  ...essayVariants,
  {
    slug: 'sms-80-bytes',
    preset: { limit: 80, metric: 'bytesLegacy', rule: 'koreanSms', sources: [SOURCES.ktSms, SOURCES.naverCloudSms] },
    content: {
      en: {
        title: `Korean SMS 80-Byte Counter — ${SMS_80.characters} Hangul Characters`,
        description: `An 80-byte Korean SMS fits up to ${SMS_80.characters} Hangul characters or 80 ASCII characters under the legacy EUC-KR rule. Track the remaining bytes live.`,
        h1: 'Korean SMS 80-Byte Counter',
        intro: `At the legacy 1-byte ASCII and 2-byte Hangul rule, 80 bytes holds ${SMS_80.characters} Hangul characters or 80 ASCII characters. KT's current AI Phone product page defines LMS as over 80 through 2,000 bytes; NAVER Cloud documents EUC-KR encoding but permits 90-byte SMS, so confirm your sender's own threshold.`,
      },
      ko: {
        title: `문자 80바이트 계산기 — 한글 ${SMS_80.characters}자·영문 80자`,
        description: `SMS 80바이트는 EUC-KR 기준 한글 최대 ${SMS_80.characters}자, 영문 최대 80자입니다. 입력 즉시 남은 바이트와 LMS 전환 여부를 확인하세요.`,
        h1: '문자 80바이트 계산기',
        intro: `영문·숫자는 1바이트, 한글은 2바이트로 세면 80바이트에 한글 ${SMS_80.characters}자 또는 영문 80자가 들어갑니다. KT AI 전화 공식 안내는 80바이트 초과부터 2,000바이트까지를 LMS로 정의합니다. NAVER Cloud SENS는 EUC-KR 인코딩을 쓰지만 SMS 한도는 90바이트이므로 실제 발송 서비스 기준도 확인하세요.`,
      },
    },
  },
  {
    slug: 'lms-2000-bytes',
    preset: {
      limit: 2000,
      metric: 'bytesLegacy',
      rule: 'koreanLms',
      sources: [SOURCES.ktSms, SOURCES.naverCloudSms],
    },
    content: {
      en: {
        title: `Korean LMS 2,000-Byte Counter — ${LMS_2000.characters.toLocaleString('en-US')} Hangul Characters`,
        description: `A 2,000-byte Korean LMS fits up to ${LMS_2000.characters.toLocaleString('en-US')} Hangul characters under the legacy EUC-KR rule. See remaining or excess bytes live.`,
        h1: 'Korean LMS 2,000-Byte Counter',
        intro: `At 2 bytes per Hangul character, the 2,000-byte LMS body holds up to ${LMS_2000.characters.toLocaleString('en-US')} Hangul characters; ASCII uses 1 byte. KT and NAVER Cloud both publish a 2,000-byte LMS ceiling, and NAVER Cloud states that message content is encoded on an EUC-KR basis. Unsupported emoji can still fail at the sender.`,
      },
      ko: {
        title: `LMS 2000바이트 계산기 — 한글 ${LMS_2000.characters.toLocaleString('ko-KR')}자`,
        description: `LMS 2,000바이트는 EUC-KR 기준 한글 최대 ${LMS_2000.characters.toLocaleString('ko-KR')}자입니다. 영문 1바이트·한글 2바이트로 남은 용량을 바로 계산합니다.`,
        h1: 'LMS 2000바이트 계산기',
        intro: `한글 1자를 2바이트로 계산하면 LMS 2,000바이트에는 한글 최대 ${LMS_2000.characters.toLocaleString('ko-KR')}자가 들어가고 영문·숫자는 1바이트씩 씁니다. KT와 NAVER Cloud 공식 문서는 모두 LMS 본문 한도를 2,000바이트로 안내하며, NAVER Cloud는 EUC-KR 기준 인코딩과 미지원 이모지의 발송 실패 가능성을 명시합니다.`,
      },
    },
  },
  {
    slug: 'instagram-caption-2200',
    preset: { limit: 2200, metric: 'characters', rule: 'instagramCaption', sources: [SOURCES.instagram] },
    content: {
      en: {
        title: 'Instagram Caption Character Counter — 2,200 Limit',
        description:
          'Count an Instagram caption against the official 2,200-character limit. Spaces, line breaks, hashtags and @mentions all use the same live total.',
        h1: 'Instagram Caption Character Counter',
        intro: `Instagram's caption limit is 2,200 characters. Meta's official IG User Media API reference also allows up to 30 hashtags and 20 @ tags in API-published captions; those characters remain part of the 2,200 total.`,
      },
      ko: {
        title: '인스타 글자수 세기 — 캡션 2,200자 제한',
        description:
          '인스타그램 캡션 2,200자 제한을 공백·줄바꿈·해시태그까지 포함해 셉니다. 남은 글자와 초과 글자를 입력 즉시 확인하세요.',
        h1: '인스타 글자수 세기',
        intro: `인스타그램 캡션 한도는 2,200자입니다. Meta 공식 IG User Media API 문서는 API로 게시하는 캡션에 해시태그 최대 30개와 @ 태그 최대 20개도 함께 명시하며, 해시태그와 멘션의 글자도 2,200자에 포함됩니다.`,
      },
    },
  },
  {
    slug: 'x-post-280',
    preset: { limit: 280, metric: 'xWeightedLength', rule: 'xPost', sources: [SOURCES.x] },
    content: {
      en: {
        title: 'X Character Counter — Official 280 Weighted Limit',
        description:
          'Count an X post with the official weighted rule: most Latin text costs 1, Hangul/CJK and emoji cost 2, and each web URL costs 23.',
        h1: 'X Post 280-Character Counter',
        intro: `A standard X post has 280 weighted characters. X's official twitter-text v3 configuration gives most Latin characters weight 1, Hangul/CJK and emoji weight 2, and each web URL a transformed length of 23; therefore a post made only of Hangul fits ${X_280.characters} characters.`,
      },
      ko: {
        title: `X(트위터) 글자수 세기 — 280점·한글 ${X_280.characters}자`,
        description: `X 일반 게시물 280점 제한을 공식 가중치로 계산합니다. 한글·CJK·이모지는 2점, 대부분의 영문은 1점, 웹 주소는 23점입니다.`,
        h1: 'X(트위터) 글자수 세기',
        intro: `X 일반 게시물 한도는 280점입니다. X의 공식 twitter-text v3 설정에서 대부분의 영문은 1점, 한글·CJK·이모지는 2점, 웹 주소는 길이와 관계없이 23점이므로 한글만 쓰면 최대 ${X_280.characters}자입니다. X Premium 장문 게시물은 이 프리셋의 대상이 아닙니다.`,
      },
    },
  },
  {
    slug: 'youtube-title-100',
    preset: { limit: 100, metric: 'characters', rule: 'youtubeTitle', sources: [SOURCES.youtube] },
    content: {
      en: {
        title: 'YouTube Title Character Counter — 100-Character Limit',
        description:
          'Count a YouTube video title against its official 100-character maximum. Spaces count, and the title cannot contain angle brackets.',
        h1: 'YouTube Title Character Counter',
        intro: `A YouTube video title can be at most 100 characters. Google's official YouTube Data API Videos resource permits valid UTF-8 except the < and > characters, so this preset counts spaces and punctuation toward the same 100-character total.`,
      },
      ko: {
        title: '유튜브 제목 글자수 세기 — 100자 제한',
        description:
          '유튜브 영상 제목의 공식 최대 길이 100자를 공백 포함으로 셉니다. 남은 글자와 초과 글자를 입력 즉시 확인하세요.',
        h1: '유튜브 제목 글자수 세기',
        intro: `유튜브 영상 제목은 최대 100자입니다. Google 공식 YouTube Data API Videos 문서는 <와 >를 제외한 유효한 UTF-8 문자를 허용한다고 명시하므로, 공백과 문장부호도 같은 100자 한도에 포함해 계산합니다.`,
      },
    },
  },
  {
    slug: 'youtube-description-5000-bytes',
    preset: { limit: 5000, metric: 'bytesUtf8', rule: 'youtubeDescription', sources: [SOURCES.youtube] },
    content: {
      en: {
        title: 'YouTube Description Byte Counter — 5,000-Byte Limit',
        description: `Track YouTube's official 5,000-byte description limit in UTF-8. That is up to 5,000 ASCII characters or ${YOUTUBE_DESCRIPTION.characters.toLocaleString('en-US')} three-byte Hangul characters.`,
        h1: 'YouTube Description 5,000-Byte Counter',
        intro: `Google's official YouTube Data API sets video descriptions to a maximum of 5,000 bytes, not 5,000 characters. In UTF-8 that fits 5,000 ASCII characters or up to ${YOUTUBE_DESCRIPTION.characters.toLocaleString('en-US')} Hangul characters (${YOUTUBE_DESCRIPTION.used.toLocaleString('en-US')} bytes), with ${YOUTUBE_DESCRIPTION.remaining} bytes left; < and > are not allowed.`,
      },
      ko: {
        title: `유튜브 설명 글자수 — 5,000바이트·한글 ${YOUTUBE_DESCRIPTION.characters.toLocaleString('ko-KR')}자`,
        description: `유튜브 영상 설명의 공식 5,000바이트 한도를 UTF-8로 계산합니다. 한글만 쓰면 최대 ${YOUTUBE_DESCRIPTION.characters.toLocaleString('ko-KR')}자이고 ${YOUTUBE_DESCRIPTION.remaining}바이트가 남습니다.`,
        h1: '유튜브 설명 5000바이트 계산기',
        intro: `Google 공식 YouTube Data API에서 영상 설명 한도는 5,000자가 아니라 5,000바이트입니다. UTF-8에서 영문은 보통 1바이트, 한글은 3바이트이므로 한글만 쓰면 ${YOUTUBE_DESCRIPTION.characters.toLocaleString('ko-KR')}자(${YOUTUBE_DESCRIPTION.used.toLocaleString('ko-KR')}바이트)까지 입력하고 ${YOUTUBE_DESCRIPTION.remaining}바이트가 남습니다. <와 > 문자는 사용할 수 없습니다.`,
      },
    },
  },
  {
    slug: 'naver-blog-title-100',
    preset: { limit: 100, metric: 'characters', rule: 'naverBlogTitle', sources: [SOURCES.naverBlog] },
    content: {
      en: {
        title: 'Naver Blog Title Character Counter — 100-Character Limit',
        description:
          'Count a Naver Blog post title against the official 100-character maximum, including spaces and punctuation, with live remaining text.',
        h1: 'Naver Blog Title Counter',
        intro: `NAVER Blog Help's “Title and title background photo” guide says a post title accepts up to 100 characters. This preset counts the visible title, including spaces and punctuation, against that maximum.`,
      },
      ko: {
        title: '네이버 블로그 제목 글자수 — 최대 100자',
        description:
          '네이버 블로그 제목의 공식 최대 길이 100자를 공백 포함으로 셉니다. 제목을 붙여넣고 남은 글자와 초과 글자를 바로 확인하세요.',
        h1: '네이버 블로그 제목 글자수',
        intro: `네이버 블로그 고객센터의 ‘제목과 제목 배경 사진 안내’는 제목을 최대 100자까지 입력할 수 있다고 안내합니다. 이 프리셋은 공백과 문장부호를 포함한 제목 전체를 100자 기준으로 계산합니다.`,
      },
    },
  },
  {
    slug: 'sms-160-characters',
    preset: { limit: 160, metric: 'characters', rule: 'globalSms', sources: [SOURCES.globalSms] },
    content: {
      en: {
        title: 'SMS Character Counter — 160 GSM-7 Character Limit',
        description:
          'Count a single SMS against the 160-character GSM-7 limit. Unicode such as Hangul or emoji changes the encoding and lowers one segment to 70 characters.',
        h1: 'SMS 160-Character Counter',
        intro: `AWS End User Messaging documents one SMS as 160 GSM-7 characters or 70 characters when any text requires UCS-2; multipart segments hold 153 or 67 respectively. This 160-character preset is for GSM-7 text, so verify the encoding before sending Unicode or emoji.`,
      },
      ko: {
        title: 'SMS 160자 글자수 세기 — GSM-7 기준',
        description:
          '글로벌 SMS 한 세그먼트의 GSM-7 160자 제한을 셉니다. 한글·이모지가 섞이면 UCS-2로 바뀌어 70자로 줄어드는 점도 확인하세요.',
        h1: 'SMS 160자 글자수 세기',
        intro: `AWS End User Messaging 공식 문서에서 SMS 한 건은 GSM-7이면 160자, 한글·이모지 등으로 UCS-2가 필요하면 70자입니다. 여러 세그먼트로 나뉘면 각각 153자와 67자로 줄어듭니다. 이 160자 프리셋은 GSM-7 영문 문자용입니다.`,
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'word-counter',
  category: 'text',
  icon: 'count',
  added: '2026-10-07',
  updated: '2026-10-23',
  edges: ['accuracy', 'privacy', 'features'],
  competitors: [
    {
      name: 'WordCounter.net',
      url: 'https://wordcounter.net/',
      weakness:
        'The live page opens with sign-in prompts for autosave/goals and Grammarly upsell banners, then places a large editor toolbar ahead of the basic counts. (Strength: it offers document import/export, editing tools, custom goals and readability details that Betterbit does not.)',
    },
    {
      name: 'Saramin 글자수세기',
      url: 'https://www.saramin.co.kr/zf_user/tools/character-counter',
      weakness:
        'Its counter exposes only with/without-space character and byte totals, so it has no line-break-excluded count, word count or reading/speaking estimate; the desktop page is surrounded by the full job-portal navigation. (Strength: its mobile tool provides a character/byte limit, 10-minute autosave and result copying.)',
    },
    {
      name: 'WordCount.Online',
      url: 'https://wordcount.online/',
      weakness:
        'The current page combines its basic counter with readability, streak, writing-sprint and document panels; Betterbit keeps the core counts, byte modes and one character-limit control visible together. (Strength: it lets users choose hyphen, number, quote and bracket counting rules, and includes readability scoring.)',
    },
  ],
  related: [
    'remove-line-breaks',
    'case-converter',
    'sort-lines',
    'lorem-ipsum',
    'korean-spell-check',
    'find-and-replace',
    'pdf-to-text',
    'image-to-text',
  ],
  variants,
};
