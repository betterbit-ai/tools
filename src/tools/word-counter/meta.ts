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
      sections: [
        {
          heading: `Planning a ${limit}-character answer`,
          body: `A ${limit}-character limit is a budget, not a target: Korean application forms usually count spaces, so roughly 12–15% of the limit disappears into spaces before any content arrives. A workable split for one answer is about 15% for the opening two sentences, 65% for the evidence, and 20% for the closing link to the company — at ${limit} characters that is roughly ${Math.round(limit * 0.15)}, ${Math.round(limit * 0.65)} and ${Math.round(limit * 0.2)} characters.

Read the form's own rule before editing. If it says 공백 제외, switch the counter's rule instead of deleting spaces from the draft; the same text then reports a different remaining count. The counter measures length only, so leave room for one revision rather than filling the limit with the first draft.`,
          table: {
            caption: `A ${limit}-character answer split across its parts`,
            head: ['Part of the answer', 'Share', 'Characters'],
            rows: [
              ['Opening (2 sentences)', '15%', String(Math.round(limit * 0.15))],
              ['Evidence and experience (5–6 sentences)', '65%', String(Math.round(limit * 0.65))],
              ['Motivation and closing (2 sentences)', '20%', String(Math.round(limit * 0.2))],
              ['Spaces inside that text', 'about 12–15%', `${Math.round(limit * 0.12)}–${Math.round(limit * 0.15)}`],
            ],
          },
        },
      ],
      faq: [
        {
          q: `Does the ${limit}-character limit include spaces?`,
          a: `Most Korean application forms count spaces, so the ${limit} characters in this preset include them. If the form says 공백 제외, switch the rule below instead of editing the text; the same draft then reports a different remaining count.`,
        },
        {
          q: `How many sentences fit in ${limit} characters?`,
          a: `A sentence in a Korean application answer averages around 50 characters including spaces, so ${limit} characters hold roughly ${Math.round(limit / 50)} sentences. Sentences with clauses and long job titles run longer and fit fewer.`,
        },
        {
          q: `What happens if the draft goes over ${limit} characters?`,
          a: 'The application form normally refuses the extra text or cuts it at the limit, and the cut usually lands mid-sentence. Keep the remaining count positive and re-read the final sentence before submitting.',
        },
      ],
    },
    ko: {
      title: `자소서 ${limit}자 글자수 세기 — 공백 포함·제외`,
      description: `자소서 ${limit}자 제한을 공백 포함 기준으로 바로 셉니다. 채용 양식이 공백 제외를 요구하면 기준만 바꿔 남은 글자와 초과 글자를 확인하세요.`,
      h1: `자소서 ${limit}자 글자수 세기`,
      intro: `공백 포함 ${limit}자를 기준으로 열리며 입력 전에는 ${limit}자 남음으로 표시됩니다. 자기소개서 글자수 규칙은 기업마다 다르므로 입력란에 “공백 제외”가 적혀 있을 때만 아래 기준을 공백 제외로 바꾸세요. 작성한 글은 그대로 두고 두 기준을 즉시 비교할 수 있습니다.`,
      sections: [
        {
          heading: `${limit}자 답안의 분량 배분`,
          body: `${limit}자는 목표가 아니라 예산입니다. 한국 자기소개서 양식은 보통 공백을 포함해 세므로, 내용을 쓰기도 전에 한도의 12~15%가 공백으로 사라집니다. 한 문항 기준으로 도입 두 문장에 15%, 근거와 경험에 65%, 지원동기와 마무리에 20%를 두면 ${limit}자에서는 대략 ${Math.round(limit * 0.15)}자, ${Math.round(limit * 0.65)}자, ${Math.round(limit * 0.2)}자가 됩니다.

수정 전에 양식의 기준부터 확인하세요. "공백 제외"라고 적혀 있다면 초안의 공백을 지우지 말고 아래 기준을 바꾸면 되고, 같은 글이 다른 남은 글자 수로 표시됩니다. 이 계산기는 길이만 재므로, 첫 초안으로 한도를 꽉 채우기보다 한 번 고칠 여지를 남기는 편이 좋습니다.`,
          table: {
            caption: `${limit}자 답안의 구성별 분량 예시`,
            head: ['구성', '비중', '글자 수'],
            rows: [
              ['도입 (2문장)', '15%', String(Math.round(limit * 0.15))],
              ['근거·경험 (5~6문장)', '65%', String(Math.round(limit * 0.65))],
              ['지원동기·마무리 (2문장)', '20%', String(Math.round(limit * 0.2))],
              ['본문 안의 공백', '약 12~15%', `${Math.round(limit * 0.12)}~${Math.round(limit * 0.15)}`],
            ],
          },
        },
      ],
      faq: [
        {
          q: `${limit}자는 공백을 포함한 글자수인가요?`,
          a: `한국 자기소개서 양식은 대부분 공백을 포함해 세므로 이 프리셋의 ${limit}자도 공백을 포함합니다. 양식이 "공백 제외"를 요구하면 글자를 지우지 말고 아래 기준을 바꾸세요.`,
        },
        {
          q: `${limit}자면 문장 몇 개를 쓸 수 있나요?`,
          a: `한국어 자기소개서 문장 하나가 공백 포함 평균 50자 안팎이므로 ${limit}자면 대략 ${Math.round(limit / 50)}문장입니다. 절이 많거나 긴 문장은 더 길어져 개수가 줄어듭니다.`,
        },
        {
          q: `${limit}자를 넘기면 어떻게 되나요?`,
          a: '지원 양식이 초과분을 받지 않거나 한도에서 잘라내며, 보통 문장 중간이 잘립니다. 남은 글자를 양수로 유지하고 제출 전 마지막 문장을 다시 읽어야 합니다.',
        },
      ],
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
        sections: [
          {
            heading: 'What 80 bytes holds in Hangul and ASCII',
            body: `EUC-KR gives Hangul two bytes and ASCII one, so the mix decides how much text fits: 40 Hangul characters, 80 ASCII characters, or any combination that adds up to 80 bytes. A space is one byte and a digit is one, so a Korean message of 35 syllables with 10 spaces is already 80 bytes and anything else turns it into a long message.

The threshold belongs to the sender rather than to the alphabet. KT's product page defines LMS as anything above 80 bytes up to 2,000 bytes, while NAVER Cloud allows 90-byte SMS on its own service. Emoji and several special symbols cannot be encoded in EUC-KR at all, so those messages are rejected or re-encoded and the byte count changes.`,
            table: {
              caption: 'Byte use by character type in EUC-KR',
              head: ['Character type', 'Bytes each'],
              rows: [
                ['Hangul syllable', '2'],
                ['Latin letter, digit', '1'],
                ['Space, newline', '1'],
                ['Hangul punctuation (。 or ·)', '2'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many Hangul characters fit in 80 bytes?',
            a: 'Forty, at two bytes each. Mixed text uses the remaining budget: 20 Hangul characters (40 bytes) plus 40 ASCII characters and no spaces still totals 80 bytes.',
          },
          {
            q: 'Do spaces and line breaks use bytes?',
            a: 'Yes, one byte each in EUC-KR. Ten spaces inside a 35-character Hangul message make exactly 80 bytes, which is why a message that looks short can switch to LMS.',
          },
          {
            q: 'What happens above 80 bytes?',
            a: 'It becomes an LMS, which KT documents as up to 2,000 bytes, and the sender bills it as a long message. NAVER Cloud also offers 90-byte SMS, so confirm your provider threshold.',
          },
        ],
      },
      ko: {
        title: `문자 80바이트 계산기 — 한글 ${SMS_80.characters}자·영문 80자`,
        description: `SMS 80바이트는 EUC-KR 기준 한글 최대 ${SMS_80.characters}자, 영문 최대 80자입니다. 입력 즉시 남은 바이트와 LMS 전환 여부를 확인하세요.`,
        h1: '문자 80바이트 계산기',
        intro: `영문·숫자는 1바이트, 한글은 2바이트로 세면 80바이트에 한글 ${SMS_80.characters}자 또는 영문 80자가 들어갑니다. KT AI 전화 공식 안내는 80바이트 초과부터 2,000바이트까지를 LMS로 정의합니다. NAVER Cloud SENS는 EUC-KR 인코딩을 쓰지만 SMS 한도는 90바이트이므로 실제 발송 서비스 기준도 확인하세요.`,
        sections: [
          {
            heading: '80바이트에 들어가는 한글·영문 조합',
            body: `EUC-KR에서 한글은 2바이트, 영문·숫자는 1바이트입니다. 그래서 80바이트에는 한글 40자, 영문 80자, 또는 합쳐서 80바이트가 되는 조합이 들어갑니다. 공백도 1바이트이므로 한글 35자에 공백 10개를 넣으면 이미 80바이트이고, 한 글자만 더 써도 장문(LMS)으로 넘어갑니다.

기준은 발신 서비스마다 다릅니다. KT 상품 안내는 80바이트 초과부터 2,000바이트까지를 LMS로 정의하고, NAVER Cloud는 자사 서비스에서 90바이트 SMS를 허용합니다. 이모지와 일부 특수문자는 EUC-KR로 표현할 수 없어 발송이 거부되거나 다른 인코딩으로 바뀌면서 바이트 수가 달라집니다.`,
            table: {
              caption: 'EUC-KR 문자 종류별 바이트',
              head: ['문자 종류', '글자당 바이트'],
              rows: [
                ['한글 한 글자', '2'],
                ['영문·숫자', '1'],
                ['공백·줄바꿈', '1'],
                ['한글 문장부호(·, 。)', '2'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '80바이트는 한글 몇 자인가요?',
            a: '한 글자에 2바이트이므로 40자입니다. 한글 20자(40바이트)에 영문 40자를 섞으면 공백 없이 정확히 80바이트가 됩니다.',
          },
          {
            q: '공백과 줄바꿈도 바이트로 계산하나요?',
            a: '네, EUC-KR에서 각각 1바이트입니다. 한글 35자에 공백 10개를 넣으면 정확히 80바이트가 되어, 짧아 보이는 문자가 LMS로 넘어갑니다.',
          },
          {
            q: '80바이트를 넘으면 어떻게 되나요?',
            a: 'LMS로 발송되며 KT 안내 기준 최대 2,000바이트까지 담을 수 있고 요금도 장문으로 부과됩니다. NAVER Cloud처럼 90바이트 SMS를 허용하는 서비스도 있으니 발신 기준을 확인하세요.',
          },
        ],
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
        sections: [
          {
            heading: 'What a 2,000-byte LMS body holds',
            body: `At two bytes per Hangul character, the LMS body fits 1,000 Hangul characters, 2,000 ASCII characters, or a mix that totals 2,000 bytes. Line breaks and spaces are one byte each, so a message written in short paragraphs loses part of the budget to formatting before any words arrive.

Both KT and NAVER Cloud publish a 2,000-byte LMS ceiling, and NAVER Cloud states that content is encoded on an EUC-KR basis. Anything longer needs MMS, which is billed per 2,000-byte block rather than as one long message. Emoji are not representable in EUC-KR, so a message containing them is either rejected or sent under a different encoding with a different length.`,
            table: {
              caption: 'How 2,000 bytes divides by character type',
              head: ['Content', 'Characters', 'Bytes'],
              rows: [
                ['Hangul only', '1,000', '2,000'],
                ['ASCII only', '2,000', '2,000'],
                ['Half Hangul, half ASCII', '1,500', '2,000'],
                ['Hangul with 100 line breaks', '950', '2,000'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many Korean characters fit in 2,000 bytes?',
            a: 'Up to 1,000, at two bytes per syllable. Spaces and line breaks also cost one byte each, so a well-formatted 900-character message can already be near the ceiling.',
          },
          {
            q: 'Is an LMS the same as an MMS?',
            a: 'No. LMS covers text up to 2,000 bytes; longer content or attached media is MMS and is billed per block. A message that just fits 2,000 bytes is still one LMS.',
          },
          {
            q: 'Why can an emoji break a 2,000-byte message?',
            a: 'EUC-KR cannot encode most emoji, so the sender rejects the message or re-encodes it, which changes both the byte count and the segment. Test the exact text with the sending service before a campaign.',
          },
        ],
      },
      ko: {
        title: `LMS 2000바이트 계산기 — 한글 ${LMS_2000.characters.toLocaleString('ko-KR')}자`,
        description: `LMS 2,000바이트는 EUC-KR 기준 한글 최대 ${LMS_2000.characters.toLocaleString('ko-KR')}자입니다. 영문 1바이트·한글 2바이트로 남은 용량을 바로 계산합니다.`,
        h1: 'LMS 2000바이트 계산기',
        intro: `한글 1자를 2바이트로 계산하면 LMS 2,000바이트에는 한글 최대 ${LMS_2000.characters.toLocaleString('ko-KR')}자가 들어가고 영문·숫자는 1바이트씩 씁니다. KT와 NAVER Cloud 공식 문서는 모두 LMS 본문 한도를 2,000바이트로 안내하며, NAVER Cloud는 EUC-KR 기준 인코딩과 미지원 이모지의 발송 실패 가능성을 명시합니다.`,
        sections: [
          {
            heading: 'LMS 2,000바이트에 들어가는 분량',
            body: `한글을 2바이트로 계산하면 LMS 본문 2,000바이트에는 한글 1,000자, 영문·숫자 2,000자, 또는 합쳐서 2,000바이트가 되는 조합이 들어갑니다. 공백과 줄바꿈도 1바이트씩 차지하므로, 짧은 문단으로 나눠 쓴 문자는 글자를 채우기도 전에 용량을 잃습니다.

KT와 NAVER Cloud 모두 LMS 본문 한도를 2,000바이트로 안내하고, NAVER Cloud는 EUC-KR 기준 인코딩을 명시합니다. 2,000바이트를 넘거나 사진을 붙이면 MMS가 되어 2,000바이트 단위로 요금이 부과됩니다. 이모지는 EUC-KR로 표현할 수 없어 발송이 거부되거나 다른 인코딩으로 바뀌면서 길이가 달라집니다.`,
            table: {
              caption: '2,000바이트의 문자 종류별 분량',
              head: ['내용', '글자 수', '바이트'],
              rows: [
                ['한글만', '1,000자', '2,000'],
                ['영문만', '2,000자', '2,000'],
                ['한글·영문 절반씩', '1,500자', '2,000'],
                ['한글 + 줄바꿈 100개', '950자', '2,000'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'LMS 2,000바이트는 한글 몇 자인가요?',
            a: '한 글자에 2바이트이므로 최대 1,000자입니다. 공백과 줄바꿈도 1바이트씩 들어가므로 900자 안팎에서 이미 한도에 가까워질 수 있습니다.',
          },
          {
            q: 'LMS와 MMS는 무엇이 다른가요?',
            a: 'LMS는 2,000바이트까지의 문자 메시지이고, 이를 넘거나 사진·동영상을 붙이면 MMS가 되어 2,000바이트 단위로 요금이 매겨집니다.',
          },
          {
            q: '이모지를 넣으면 왜 문자가 깨지나요?',
            a: 'EUC-KR은 대부분의 이모지를 표현할 수 없습니다. 발송 서비스가 거부하거나 다른 인코딩으로 바꾸면서 바이트 수와 세그먼트가 달라지므로, 발송 전에 실제 문구로 시험하는 편이 안전합니다.',
          },
        ],
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
        sections: [
          {
            heading: 'What the 2,200 characters are actually spent on',
            body: `The 2,200-character caption limit counts every character, including line breaks, hashtags and @mentions. Hashtags are the expensive part in practice: thirty tags averaging ten characters plus a separator are about 350 characters, so a caption that looks like a full post plus a tag block can come out well over the limit.

Meta's IG User Media API reference allows up to 30 hashtags and 20 @ tags per caption, and both count toward the same 2,200. Leave the hashtag block to the end, keep it on one or two lines, and check the counter after pasting the tags rather than after writing the text.`,
            table: {
              caption: 'Typical Instagram caption budget',
              head: ['Part', 'Characters'],
              rows: [
                ['Caption limit (everything)', '2,200'],
                ['30 hashtags, about 11 each with a space', 'about 330'],
                ['Left for the caption text and mentions', 'about 1,870'],
                ['20 @mentions, about 10 each', 'about 200'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'Do hashtags count toward the 2,200-character caption limit?',
            a: 'Yes. Every hashtag, mention, space and line break is part of the same 2,200. Thirty hashtags typically take about 350 characters before the caption text begins.',
          },
          {
            q: 'Can I write a 2,200-character Korean caption?',
            a: 'Yes. The limit is counted in characters, not bytes, so 2,200 Hangul characters fit exactly as 2,200 Latin characters would. Emoji count as characters too, and complex emoji may count as more than one.',
          },
          {
            q: 'What happens when a caption goes over 2,200 characters?',
            a: 'The app stops accepting text at the limit, and text pasted from elsewhere is truncated, often mid-sentence or mid-hashtag. Check the counter after the hashtag block is pasted, not only after the body text.',
          },
        ],
      },
      ko: {
        title: '인스타 글자수 세기 — 캡션 2,200자 제한',
        description:
          '인스타그램 캡션 2,200자 제한을 공백·줄바꿈·해시태그까지 포함해 셉니다. 남은 글자와 초과 글자를 입력 즉시 확인하세요.',
        h1: '인스타 글자수 세기',
        intro: `인스타그램 캡션 한도는 2,200자입니다. Meta 공식 IG User Media API 문서는 API로 게시하는 캡션에 해시태그 최대 30개와 @ 태그 최대 20개도 함께 명시하며, 해시태그와 멘션의 글자도 2,200자에 포함됩니다.`,
        sections: [
          {
            heading: '2,200자에서 해시태그가 차지하는 몫',
            body: `인스타그램 캡션 2,200자에는 줄바꿈, 해시태그, @멘션이 모두 포함됩니다. 실제로 부담이 큰 쪽은 해시태그입니다. 평균 10자짜리 태그 30개에 띄어쓰기를 더하면 350자 안팎이 되어, 본문을 충분히 쓴 뒤 태그를 붙이면 한도를 넘기기 쉽습니다.

Meta의 IG User Media API 문서는 캡션당 해시태그 최대 30개, @ 태그 최대 20개를 허용하며, 두 가지 모두 같은 2,200자에 포함됩니다. 태그 묶음은 마지막에 한두 줄로 정리하고, 본문을 다 쓴 뒤가 아니라 태그까지 붙인 뒤에 남은 글자를 확인하세요.`,
            table: {
              caption: '인스타그램 캡션 분량 배분 예시',
              head: ['구성', '글자 수'],
              rows: [
                ['캡션 전체 한도', '2,200자'],
                ['해시태그 30개(공백 포함 개당 약 11자)', '약 330자'],
                ['본문·멘션에 남는 분량', '약 1,870자'],
                ['@멘션 20개(개당 약 10자)', '약 200자'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '해시태그도 2,200자에 포함되나요?',
            a: '네. 해시태그, 멘션, 공백, 줄바꿈이 모두 같은 2,200자에 들어갑니다. 해시태그 30개면 본문을 쓰기 전에 350자 안팎이 먼저 소모됩니다.',
          },
          {
            q: '한글로 2,200자까지 쓸 수 있나요?',
            a: '가능합니다. 한도가 바이트가 아니라 글자 수이므로 한글 2,200자도 영문 2,200자와 똑같이 들어갑니다. 이모지도 글자로 세지만 일부 복합 이모지는 두 글자 이상으로 계산될 수 있습니다.',
          },
          {
            q: '2,200자를 넘기면 어떻게 되나요?',
            a: '앱이 한도에서 입력을 막고, 다른 곳에서 붙여넣은 글은 문장이나 해시태그 중간에서 잘립니다. 본문을 쓴 직후가 아니라 태그까지 붙인 뒤 남은 글자를 확인하세요.',
          },
        ],
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
        sections: [
          {
            heading: 'Why a Hangul post fits half as much as a Latin one',
            body: `X counts a post in weighted units, not characters. The official twitter-text v3 configuration gives most Latin letters, digits and punctuation a weight of 1, Hangul and other CJK characters a weight of 2, and every web URL a fixed weight of 23 regardless of its real length. That is why 280 units hold 280 Latin characters but only about 140 Hangul characters.

The URL rule is the one people miss. Twenty links of any length still cost 20 × 23 = 460 units, so a link-heavy post runs out long before it looks long. Emoji are counted like CJK characters at weight 2, and a sequence built from several code points can cost more.`,
            table: {
              caption: 'Weights used by the official X character count',
              head: ['Content', 'Weight'],
              rows: [
                ['Latin letter, digit, punctuation', '1'],
                ['Hangul, CJK, emoji', '2'],
                ['Web URL', '23'],
                ['Line break', '1'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many Korean characters fit in an X post?',
            a: 'About 140. Hangul counts as weight 2 against the 280-unit limit, so a post with no links holds roughly half the Latin character count.',
          },
          {
            q: 'Why does a link cost 23 characters?',
            a: 'X shortens every URL for counting purposes to a fixed 23-unit weight, whatever its real length. Two links therefore cost 46 units before any text, and t.co still shows a shortened address.',
          },
          {
            q: 'Does X Premium change the 280 limit?',
            a: 'Yes. Premium accounts can post longer text, which is outside this preset. The 280-unit figure applies to a standard account, and the weights above still decide how much of any longer limit a Hangul post uses.',
          },
        ],
      },
      ko: {
        title: `X(트위터) 글자수 세기 — 280점·한글 ${X_280.characters}자`,
        description: `X 일반 게시물 280점 제한을 공식 가중치로 계산합니다. 한글·CJK·이모지는 2점, 대부분의 영문은 1점, 웹 주소는 23점입니다.`,
        h1: 'X(트위터) 글자수 세기',
        intro: `X 일반 게시물 한도는 280점입니다. X의 공식 twitter-text v3 설정에서 대부분의 영문은 1점, 한글·CJK·이모지는 2점, 웹 주소는 길이와 관계없이 23점이므로 한글만 쓰면 최대 ${X_280.characters}자입니다. X Premium 장문 게시물은 이 프리셋의 대상이 아닙니다.`,
        sections: [
          {
            heading: '한글 게시물이 영문의 절반만 들어가는 이유',
            body: `X는 글자 수가 아니라 가중치로 게시물 길이를 셉니다. 공식 twitter-text v3 설정에서 대부분의 영문·숫자·문장부호는 1점, 한글과 CJK 문자는 2점, 웹 주소는 실제 길이와 관계없이 23점입니다. 그래서 280점에는 영문 280자, 한글은 약 140자가 들어갑니다.

가장 많이 놓치는 부분이 주소입니다. 길이에 상관없이 주소 하나가 23점이므로 링크 20개면 본문을 쓰기 전에 460점이 사라집니다. 이모지도 한글과 같이 2점으로 계산되고, 여러 코드 포인트를 합친 복합 이모지는 더 높게 계산될 수 있습니다.`,
            table: {
              caption: 'X 공식 글자수 계산의 가중치',
              head: ['내용', '가중치'],
              rows: [
                ['영문·숫자·문장부호', '1점'],
                ['한글·CJK·이모지', '2점'],
                ['웹 주소(URL)', '23점'],
                ['줄바꿈', '1점'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'X 게시물에 한글은 몇 자까지 들어가나요?',
            a: '약 140자입니다. 한글이 280점 한도에서 2점씩 계산되기 때문에, 링크가 없는 게시물은 영문의 절반 정도만 들어갑니다.',
          },
          {
            q: '링크는 왜 23자로 계산되나요?',
            a: 'X가 주소 길이와 관계없이 모든 웹 주소를 23점으로 환산해 세기 때문입니다. 링크 두 개면 본문 전에 46점이 빠지고, 표시될 때는 t.co 단축 주소로 보입니다.',
          },
          {
            q: 'X 프리미엄도 같은 기준인가요?',
            a: '프리미엄 계정은 더 긴 글을 쓸 수 있어 이 프리셋의 대상이 아닙니다. 280점은 일반 계정 기준이며, 한글 게시물이 한도에서 차지하는 비중은 같은 가중치로 계산됩니다.',
          },
        ],
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
        sections: [
          {
            heading: 'How a YouTube title is counted',
            body: `The 100-character maximum counts visible characters, so spaces, punctuation and emoji all consume part of it. Google's YouTube Data API permits valid UTF-8 except the angle brackets < and >, which means a title with those characters is rejected rather than shortened.

Practical titles rarely approach 100 characters: a Korean title that names the subject and the payoff usually lands between 25 and 45 characters. Length is limited, but the first characters are what a viewer sees in a feed, so put the subject before the qualifier rather than padding the tail to the limit.`,
          },
        ],
        faq: [
          {
            q: 'Do spaces count toward the 100-character YouTube title limit?',
            a: 'Yes. Spaces, punctuation and emoji are all characters in the same 100, so a title padded with separator bars uses the budget faster than the words suggest.',
          },
          {
            q: 'Which characters are not allowed in a YouTube title?',
            a: 'Angle brackets < and > are rejected by the YouTube Data API. Other valid UTF-8 characters, including Hangul and emoji, are accepted within the 100-character limit.',
          },
          {
            q: 'Is a 100-character title a good idea?',
            a: 'Usually not. A viewing surface shows only the beginning of a title, so a long title hides its point. Keep the subject in the first few words and use the extra characters only if they add information.',
          },
        ],
      },
      ko: {
        title: '유튜브 제목 글자수 세기 — 100자 제한',
        description:
          '유튜브 영상 제목의 공식 최대 길이 100자를 공백 포함으로 셉니다. 남은 글자와 초과 글자를 입력 즉시 확인하세요.',
        h1: '유튜브 제목 글자수 세기',
        intro: `유튜브 영상 제목은 최대 100자입니다. Google 공식 YouTube Data API Videos 문서는 <와 >를 제외한 유효한 UTF-8 문자를 허용한다고 명시하므로, 공백과 문장부호도 같은 100자 한도에 포함해 계산합니다.`,
        sections: [
          {
            heading: '유튜브 제목은 이렇게 셉니다',
            body: `제목 최대 길이 100자는 화면에 보이는 글자를 세는 값이라 공백과 문장부호, 이모지도 모두 한도에 들어갑니다. Google의 YouTube Data API는 <와 >를 제외한 유효한 UTF-8 문자를 허용하므로, 이 두 문자를 넣으면 제목이 줄어드는 것이 아니라 거부됩니다.

실제 제목은 100자를 거의 쓰지 않습니다. 무엇을 다루는지와 무엇을 얻는지 담은 한국어 제목은 보통 25~45자에서 끝납니다. 길이보다 중요한 것은 앞부분입니다. 피드와 추천 영역에서는 제목 앞부분만 보이므로, 한도를 채우기보다 핵심 단어를 앞에 두세요.`,
          },
        ],
        faq: [
          {
            q: '유튜브 제목 100자에 공백도 포함되나요?',
            a: '네. 공백과 문장부호, 이모지가 모두 같은 100자에 들어갑니다. 구분 기호로 제목을 꾸미면 단어보다 한도를 빨리 씁니다.',
          },
          {
            q: '유튜브 제목에 쓸 수 없는 문자는 무엇인가요?',
            a: 'YouTube Data API는 꺾쇠괄호 <와 >를 허용하지 않습니다. 한글과 이모지를 포함한 다른 UTF-8 문자는 100자 안에서 사용할 수 있습니다.',
          },
          {
            q: '제목을 100자까지 길게 쓰는 게 좋은가요?',
            a: '대체로 좋지 않습니다. 피드와 검색 결과에서는 제목 앞부분만 보이므로 긴 제목은 핵심을 가립니다. 첫 단어에 주제를 두고, 남는 글자는 정보를 더할 때만 쓰세요.',
          },
        ],
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
        sections: [
          {
            heading: 'Five thousand bytes, not five thousand characters',
            body: `YouTube description limits are measured in UTF-8 bytes, so the language decides the length. ASCII text fits 5,000 characters, Hangul fits 1,666 because each syllable is three bytes, and an emoji takes four bytes or more. A bilingual description therefore runs out at a different point from a Korean-only one.

Links and timestamps are ordinary characters in the same byte count; only the API's rejection of < and > is separate. If the description is assembled from a template with chapters and links, count the finished text rather than estimating, because three-byte Hangul makes a Korean template roughly three times as expensive as an English one of the same character count.`,
            table: {
              caption: 'What 5,000 UTF-8 bytes holds',
              head: ['Content', 'Characters'],
              rows: [
                ['ASCII letters, digits, spaces', '5,000'],
                ['Hangul (3 bytes each)', '1,666'],
                ['Emoji (4 bytes each)', '1,250'],
                ['Mixed Korean and English', 'between 1,666 and 5,000'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'How many Korean characters fit in a YouTube description?',
            a: 'About 1,666. Each Hangul syllable is three bytes in UTF-8 against the 5,000-byte limit, which is why a Korean description looks much shorter than the byte ceiling suggests.',
          },
          {
            q: 'Do links and timestamps count toward the 5,000 bytes?',
            a: 'Yes. Every character of a link or timestamp uses bytes like any other text. Only the angle brackets < and > are rejected outright rather than counted.',
          },
          {
            q: 'What happens when a description goes over 5,000 bytes?',
            a: 'The editor stops accepting text or the API rejects the update, and pasted text is cut at the limit. Count the finished description after adding chapters and links, not before.',
          },
        ],
      },
      ko: {
        title: `유튜브 설명 글자수 — 5,000바이트·한글 ${YOUTUBE_DESCRIPTION.characters.toLocaleString('ko-KR')}자`,
        description: `유튜브 영상 설명의 공식 5,000바이트 한도를 UTF-8로 계산합니다. 한글만 쓰면 최대 ${YOUTUBE_DESCRIPTION.characters.toLocaleString('ko-KR')}자이고 ${YOUTUBE_DESCRIPTION.remaining}바이트가 남습니다.`,
        h1: '유튜브 설명 5000바이트 계산기',
        intro: `Google 공식 YouTube Data API에서 영상 설명 한도는 5,000자가 아니라 5,000바이트입니다. UTF-8에서 영문은 보통 1바이트, 한글은 3바이트이므로 한글만 쓰면 ${YOUTUBE_DESCRIPTION.characters.toLocaleString('ko-KR')}자(${YOUTUBE_DESCRIPTION.used.toLocaleString('ko-KR')}바이트)까지 입력하고 ${YOUTUBE_DESCRIPTION.remaining}바이트가 남습니다. <와 > 문자는 사용할 수 없습니다.`,
        sections: [
          {
            heading: '5,000자리가 아니라 5,000바이트입니다',
            body: `유튜브 설명 한도는 UTF-8 바이트로 재기 때문에 언어에 따라 들어가는 분량이 달라집니다. 영문은 한 글자에 1바이트라 5,000자까지 들어가고, 한글은 한 글자에 3바이트여서 1,666자에서 한도가 됩니다. 이모지는 4바이트 이상을 차지합니다.

링크와 타임스탬프도 같은 바이트에 포함되고, <와 >만 별도로 거부됩니다. 챕터와 링크를 넣은 템플릿으로 설명을 작성한다면 어림하지 말고 완성된 문구를 재야 합니다. 같은 글자 수라도 한글 설명은 영문 설명보다 약 3배의 바이트를 씁니다.`,
            table: {
              caption: '5,000바이트에 들어가는 문자 수',
              head: ['내용', '글자 수'],
              rows: [
                ['영문·숫자·공백', '5,000자'],
                ['한글(글자당 3바이트)', '1,666자'],
                ['이모지(글자당 4바이트)', '1,250자'],
                ['한글·영문 혼합', '1,666~5,000자 사이'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '유튜브 설명에는 한글 몇 자까지 쓸 수 있나요?',
            a: '약 1,666자입니다. 한글은 UTF-8에서 3바이트이고 한도가 5,000바이트이기 때문에, 5,000자처럼 보이는 한도보다 실제 분량이 훨씬 적습니다.',
          },
          {
            q: '링크와 타임스탬프도 5,000바이트에 포함되나요?',
            a: '네. 링크와 타임스탬프의 글자도 다른 텍스트와 똑같이 바이트를 씁니다. 꺾쇠괄호 <와 >만 계산되지 않고 아예 거부됩니다.',
          },
          {
            q: '설명이 5,000바이트를 넘으면 어떻게 되나요?',
            a: '편집기가 입력을 막거나 API가 저장을 거부하며, 붙여넣은 글은 한도에서 잘립니다. 챕터와 링크를 모두 넣은 뒤 완성된 설명으로 확인하세요.',
          },
        ],
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
        sections: [
          {
            heading: 'Counting a Naver Blog title',
            body: `NAVER Blog Help states that a post title accepts up to 100 characters, and the counter here treats every visible character as one: spaces, punctuation and emoji included. A title with a bracketed category prefix loses that prefix's characters before the actual subject begins.

Titles in the 30–50 character range are the practical working length, because a long title is truncated in lists and previews where the blog is discovered. Put the subject first, keep the category prefix short, and check the count after adding hashtags or emoji at the end.`,
          },
        ],
        faq: [
          {
            q: 'Does the 100-character Naver Blog title limit include spaces?',
            a: 'Yes. Spaces and punctuation count as characters toward the 100, so a title built with separator bars or a long bracket prefix reaches the limit sooner than the word count suggests.',
          },
          {
            q: 'What happens if a Naver Blog title is too long?',
            a: 'The editor stops accepting text at 100 characters. Longer titles are also truncated in lists and previews, so the end of the title may never be seen even when it fits.',
          },
          {
            q: 'Should the title keyword come first?',
            a: 'Yes, put the subject in the first few characters. Blog titles are shown cut short in feeds and search results, and the beginning is what a reader sees before deciding to open the post.',
          },
        ],
      },
      ko: {
        title: '네이버 블로그 제목 글자수 — 최대 100자',
        description:
          '네이버 블로그 제목의 공식 최대 길이 100자를 공백 포함으로 셉니다. 제목을 붙여넣고 남은 글자와 초과 글자를 바로 확인하세요.',
        h1: '네이버 블로그 제목 글자수',
        intro: `네이버 블로그 고객센터의 ‘제목과 제목 배경 사진 안내’는 제목을 최대 100자까지 입력할 수 있다고 안내합니다. 이 프리셋은 공백과 문장부호를 포함한 제목 전체를 100자 기준으로 계산합니다.`,
        sections: [
          {
            heading: '네이버 블로그 제목 글자수 세기',
            body: `네이버 블로그 고객센터는 제목을 최대 100자까지 입력할 수 있다고 안내합니다. 이 계산기는 공백과 문장부호, 이모지를 모두 한 글자로 세므로, 대괄호로 카테고리를 붙이는 습관이 있으면 주제가 시작되기도 전에 글자를 씁니다.

실제로 쓰는 제목은 30~50자 안팎입니다. 블로그가 노출되는 목록과 미리보기에서는 긴 제목이 잘려 보이기 때문에, 주제를 앞에 두고 카테고리 표기는 짧게 유지하는 편이 좋습니다. 끝에 해시태그나 이모지를 붙였다면 붙인 뒤에 남은 글자를 확인하세요.`,
          },
        ],
        faq: [
          {
            q: '네이버 블로그 제목 100자에 공백도 포함되나요?',
            a: '네. 공백과 문장부호가 모두 100자에 포함됩니다. 구분 기호나 긴 대괄호 머리말을 쓰면 단어 수보다 빨리 한도에 닿습니다.',
          },
          {
            q: '제목이 100자를 넘으면 어떻게 되나요?',
            a: '편집기가 100자에서 입력을 막습니다. 또한 목록과 미리보기에서는 제목이 잘려 표시되므로, 한도 안에 들어가도 뒷부분은 보이지 않을 수 있습니다.',
          },
          {
            q: '제목 앞에 핵심 단어를 두는 게 좋은가요?',
            a: '그렇습니다. 블로그 제목은 피드와 검색 결과에서 앞부분만 보이므로, 읽는 사람이 글을 열지 결정하기 전에 보는 부분에 주제를 두어야 합니다.',
          },
        ],
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
        sections: [
          {
            heading: 'One SMS is 160 characters only in GSM-7',
            body: `A single SMS holds 160 characters when every character is in the GSM-7 alphabet, which covers Latin letters, digits and common punctuation. As soon as one character needs UCS-2 — Hangul, Cyrillic, or an emoji — the whole message switches encoding and one segment drops to 70 characters.

Longer messages are split into segments of 153 (GSM-7) or 67 (UCS-2) characters, because each segment needs a header. That is why a 200-character Korean message costs three segments rather than two. Check the encoding the sending service will use before budgeting characters.`,
            table: {
              caption: 'Segment limits by SMS encoding',
              head: ['Encoding', 'Single segment', 'Multipart segments'],
              rows: [
                ['GSM-7 (Latin text)', '160', '153 each'],
                ['UCS-2 (Hangul, emoji)', '70', '67 each'],
                ['GSM-7 with extension characters (^ { } [ ] ~ | €)', '160, two per character', '153 each'],
              ],
            },
          },
        ],
        faq: [
          {
            q: 'Why did my Korean SMS drop to 70 characters?',
            a: 'One non-GSM-7 character switches the whole message to UCS-2, where a single segment holds 70 characters. Hangul and emoji both trigger the switch, even a single one.',
          },
          {
            q: 'How many segments does a long text use?',
            a: 'Messages longer than one segment are split into 153-character (GSM-7) or 67-character (UCS-2) parts, each carrying a header. A 200-character Korean message becomes four UCS-2 segments, not two.',
          },
          {
            q: 'Is the 160 limit the same in every country?',
            a: 'The GSM-7 figure of 160 characters is the international baseline for one segment, and operators bill per segment. Unicode text always uses the shorter UCS-2 limits, whatever the country.',
          },
        ],
      },
      ko: {
        title: 'SMS 160자 글자수 세기 — GSM-7 기준',
        description:
          '글로벌 SMS 한 세그먼트의 GSM-7 160자 제한을 셉니다. 한글·이모지가 섞이면 UCS-2로 바뀌어 70자로 줄어드는 점도 확인하세요.',
        h1: 'SMS 160자 글자수 세기',
        intro: `AWS End User Messaging 공식 문서에서 SMS 한 건은 GSM-7이면 160자, 한글·이모지 등으로 UCS-2가 필요하면 70자입니다. 여러 세그먼트로 나뉘면 각각 153자와 67자로 줄어듭니다. 이 160자 프리셋은 GSM-7 영문 문자용입니다.`,
        sections: [
          {
            heading: '문자 한 건이 160자인 것은 GSM-7일 때입니다',
            body: `문자 메시지 한 건이 160자인 것은 모든 글자가 GSM-7 문자 집합에 들어갈 때입니다. GSM-7에는 영문, 숫자, 일반 문장부호가 포함됩니다. 한글이나 이모지, 키릴 문자처럼 한 글자라도 UCS-2가 필요하면 메시지 전체의 인코딩이 바뀌면서 한 세그먼트가 70자로 줄어듭니다.

한 건을 넘는 문자는 세그먼트로 나뉘며 GSM-7은 153자, UCS-2는 67자씩 담습니다. 세그먼트마다 헤더가 붙기 때문입니다. 그래서 한글 200자는 두 건이 아니라 네 건으로 계산될 수 있습니다. 발송 전에 서비스가 어떤 인코딩을 쓰는지 확인하세요.`,
            table: {
              caption: 'SMS 인코딩별 세그먼트 한도',
              head: ['인코딩', '한 건', '여러 건으로 나뉠 때'],
              rows: [
                ['GSM-7 (영문)', '160자', '세그먼트당 153자'],
                ['UCS-2 (한글·이모지)', '70자', '세그먼트당 67자'],
                ['GSM-7 확장 문자(^ { } [ ] ~ | €)', '문자당 2칸 사용', '세그먼트당 153자'],
              ],
            },
          },
        ],
        faq: [
          {
            q: '한글 문자는 왜 70자로 줄어드나요?',
            a: 'GSM-7에 없는 글자가 하나라도 있으면 메시지 전체가 UCS-2로 바뀌고, UCS-2에서는 한 세그먼트가 70자입니다. 한글과 이모지 모두 이 전환을 일으킵니다.',
          },
          {
            q: '긴 문자는 몇 건으로 나뉘나요?',
            a: '한 세그먼트를 넘으면 GSM-7은 153자, UCS-2는 67자씩 나뉘고 각 세그먼트에 헤더가 붙습니다. 한글 200자는 UCS-2 기준 네 건으로 계산됩니다.',
          },
          {
            q: '160자 한도는 모든 나라에서 같은가요?',
            a: 'GSM-7 기준 160자는 국제 공통 기준이고, 통신사는 세그먼트 단위로 요금을 매깁니다. 유니코드 문자가 섞이면 국가와 관계없이 더 짧은 UCS-2 한도가 적용됩니다.',
          },
        ],
      },
    },
  },
];

export const meta: ToolMeta = {
  slug: 'word-counter',
  category: 'text',
  icon: 'count',
  added: '2026-10-07',
  updated: '2026-11-28',
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
