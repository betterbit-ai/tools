import { describe, expect, it } from 'vitest';
import { applyIssues, checkText, findIssues } from './logic';

describe('checkText', () => {
  it('corrects a mix of high-confidence spelling, loanword and spacing mistakes', () => {
    const result = checkText('몇일 뒤에 메세지를 보낼수있어요.');
    expect(result.correctedText).toBe('며칠 뒤에 메시지를 보낼 수 있어요.');
    expect(result.issues.map((issue) => issue.rule)).toEqual(['myeochil', 'message', 'spacing-halsu']);
  });

  it('removes spaces before punctuation without touching spaces after punctuation', () => {
    expect(checkText('안녕하세요 ! 다음 문장입니다.').correctedText).toBe('안녕하세요! 다음 문장입니다.');
  });

  it('handles empty text and leaves text without listed mistakes untouched', () => {
    expect(checkText('')).toEqual({ issues: [], correctedText: '' });
    expect(checkText('한글, English, 漢字, 👍🏽')).toEqual({
      issues: [],
      correctedText: '한글, English, 漢字, 👍🏽',
    });
  });

  it('does not make context-dependent corrections', () => {
    expect(checkText('왠지 모르겠지만 바래지는 색도 있다.').correctedText).toBe('왠지 모르겠지만 바래지는 색도 있다.');
  });

  it('handles large input while preserving every repeated correction', () => {
    const input = '되요 '.repeat(2_000);
    const result = checkText(input);
    expect(result.issues).toHaveLength(2_000);
    expect(result.correctedText.startsWith('돼요 돼요')).toBe(true);
  });
});

describe('applyIssues', () => {
  it('applies an individual issue and ignores stale issue locations safely', () => {
    const [issue] = findIssues('되요');
    expect(applyIssues('되요', [issue])).toBe('돼요');
    expect(applyIssues('이미 바뀜', [issue])).toBe('이미 바뀜');
  });

  it('does not let overlapping issues corrupt Unicode text', () => {
    const issues = findIssues('메세지 👍🏽 되요');
    expect(applyIssues('메세지 👍🏽 되요', issues)).toBe('메시지 👍🏽 돼요');
  });
});
