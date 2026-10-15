import { render } from 'preact-render-to-string';
import { describe, expect, it } from 'vitest';
import { content } from './content';
import LoanCalculator from './Tool';

describe('LoanCalculator', () => {
  it('keeps cents visible for the English default estimate', () => {
    const html = render(<LoanCalculator locale="en" ui={content.en.ui} />);

    expect(html).toContain('860.66');
    expect(html).toContain('10,327.97');
  });

  it('offers a reset control for browser-saved inputs', () => {
    const html = render(<LoanCalculator locale="ko" ui={content.ko.ui} />);

    expect(html).toContain('초기화');
  });
});
