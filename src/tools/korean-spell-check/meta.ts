import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'korean-spell-check',
  category: 'text',
  icon: 'check',
  added: '2026-10-13',
  updated: '2026-10-13',
  edges: ['performance', 'usability'],
  competitors: [
    {
      name: 'BellRiver Korean Spell Checker',
      url: 'https://bellriver.kr/en/spell',
      weakness:
        'Its FAQ says text is not saved, so a refresh loses a draft; Betterbit restores the current text from local browser storage and presents its compact rule set without a separate 2.5 MB dictionary download. (Strength: it offers a much broader optional Hunspell dictionary, custom words and more rule categories.)',
    },
    {
      name: 'LikeApp Korean Spell Checker',
      url: 'https://likeapp.info/en/spell-checker/',
      weakness:
        'Its English result page documents a 10,000-character limit and a Check Spelling button before results; Betterbit checks its defined patterns as the text is entered with no submit step or character cap. (Strength: it presents a broader spelling-and-spacing result flow.)',
    },
    {
      name: 'CalcKorea Korean Spell Checker',
      url: 'https://calculkorea.com/en/spell-checker',
      weakness:
        'Its documented flow requires pressing Check Spelling and then fixing results; Betterbit shows its conservative suggestions and corrected text live while typing. (Strength: it advertises a larger set of 150+ rules.)',
    },
    {
      name: '바른한글 (구 부산대 맞춤법 검사기)',
      url: 'https://nara-speller.co.kr/speller/',
      weakness:
        'The opened page has a separate 검사하기 submission action and no visible live result or local draft-restore control; Betterbit displays its bounded, client-side checks immediately and restores the current browser draft. (Strength: it is a dedicated Korean spelling-and-grammar service with substantially deeper analysis.)',
    },
    {
      name: '다음 맞춤법검사기',
      url: 'https://alldic.daum.net/grammar_checker.do',
      weakness:
        'The opened form shows a 1,000-character input limit and a 검사하기 action; Betterbit has no character cap for its local rule set and updates before a submit click. (Strength: it offers a full-service Korean dictionary environment.)',
    },
    {
      name: '네이버 맞춤법 검사기',
      url: 'https://help.naver.com/service/5626/contents/18626?lang=ko&osType=COMMONOS',
      weakness:
        'Naver’s own help page states that its beta checker accepts text within 300 characters; Betterbit has no character cap for its explicit on-device rules and can retain a local draft after refresh. (Strength: Naver’s service can provide broader context-aware correction.)',
    },
  ],
  related: ['word-counter', 'remove-line-breaks', 'case-converter', 'text-diff'],
};
