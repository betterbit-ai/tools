import { describe, expect, it } from 'vitest';
import { defaultCompoundInterestState, restoreCompoundInterestState } from './state';

describe('restoreCompoundInterestState', () => {
  it('keeps intentionally cleared number fields after a browser-state restore', () => {
    const fallback = defaultCompoundInterestState('en');

    expect(
      restoreCompoundInterestState(
        {
          principal: '',
          monthlyContribution: '',
          annualRate: '',
          years: '',
          frequency: 'daily',
          contributionTiming: 'beginning',
        },
        fallback,
      ),
    ).toEqual({
      principal: '',
      monthlyContribution: '',
      annualRate: '',
      years: '',
      frequency: 'daily',
      contributionTiming: 'beginning',
    });
  });

  it('falls back for malformed saved values without discarding valid fields', () => {
    const fallback = defaultCompoundInterestState('en');

    expect(
      restoreCompoundInterestState(
        {
          principal: 2_000,
          monthlyContribution: Infinity,
          annualRate: '5',
          years: 10,
          frequency: 'weekly',
          contributionTiming: 'later',
        },
        fallback,
      ),
    ).toEqual({
      ...fallback,
      principal: 2_000,
      years: 10,
    });
  });
});
