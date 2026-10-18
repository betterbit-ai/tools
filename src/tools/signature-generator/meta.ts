import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'signature-generator',
  category: 'generator',
  icon: 'signature',
  added: '2026-10-18',
  updated: '2026-10-18',
  edges: ['privacy', 'usability'],
  competitors: [
    {
      name: 'Signatures Generator',
      url: 'https://signaturesgenerator.com/',
      weakness:
        'Its opened English page includes Type, AI and Draw workflows plus a large guide and links to five separate signature tools; changing modes exposes distinct controls and pages. (Strength: it offers six styles, AI suggestions, and dedicated signature-for-PDF and email-signature tools.) This focused tool keeps typed and drawn creation, live preview, local saved work, cropping and transparent PNG download in one compact panel.',
    },
    {
      name: 'DocuSign Signature Generator',
      url: 'https://www.docusign.com/signature-generator',
      weakness:
        'Its opened page offers a client-side PNG/JPG generator, but also repeatedly directs users to a DocuSign account, a free trial, document sending, tracking and record storage. (Strength: those paid workflows provide audit trails and legally binding e-signature features that a PNG-only tool does not claim.) This tool remains focused on immediately making a local signature image.',
    },
    {
      name: 'CertSeal Signature Generator',
      url: 'https://www.certseal.com/tools/signature-generator/',
      weakness:
        'Its current search result offers 12 handwriting styles, drawing, and a transparent PNG, but presents a separate photo-to-PNG workflow for an existing paper signature. (Strength: that photo cleanup route is useful when a scan already exists.) This tool instead makes a typed or drawn signature immediately and crops the transparent PNG to visible ink without a file-upload step.',
    },
    {
      name: '후니소프트 전자서명 이미지 만들기',
      url: 'https://www.jhnsoft.co.kr/electronic-signature-maker/',
      weakness:
        'Its opened Korean result places direct signing and name-based signing in separate settings flows and asks the user to choose output background, margin and output size before downloading. (Strength: it exposes 2× output and several export controls.) This tool keeps a live result visible while settings change, then automatically trims the PNG around the ink.',
    },
    {
      name: 'mycalc 전자서명 & 도장 생성기',
      url: 'https://mycalc.co.kr/tools/signature/',
      weakness:
        'Its opened Korean page combines direct signing, text signatures and stamp creation in one broad tool. (Strength: it can create round or square stamps, which are intentionally outside this signature-only tool.) This page reduces the choice to typed or handwritten signatures and shows the downloadable result as it changes.',
    },
    {
      name: '나두아이오 전자서명 생성기',
      url: 'https://home.nadoo.io/ko/tools/signature-maker',
      weakness:
        'Its opened Korean page initially displays “불러오는 중...” and promotes a separate electronic-contract product with a free trial and stored audit records. (Strength: its contract service supports PDF placement, multiple signers and audit trails.) This tool has no signing-service funnel and makes only a local PNG image.',
    },
  ],
  related: ['sign-pdf', 'image-watermark', 'image-resizer'],
};
