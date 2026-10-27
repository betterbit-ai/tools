import { describe, expect, it } from 'vitest';
import { parseRecentToolSlugs, RECENT_TOOLS_MAX, recordRecentTool } from './recentTools';

describe('recent tools storage', () => {
  it('keeps only unique strings, in order, up to the maximum', () => {
    const stored = JSON.stringify(['timer', 'word-counter', 'timer', 12, null, 'image-resizer']);

    expect(parseRecentToolSlugs(stored)).toEqual(['timer', 'word-counter', 'image-resizer']);
  });

  it('treats malformed and non-list values as an empty history', () => {
    expect(parseRecentToolSlugs('{')).toEqual([]);
    expect(parseRecentToolSlugs(JSON.stringify({ slug: 'timer' }))).toEqual([]);
  });

  it('moves the opened tool first and retains no more than eight entries', () => {
    const existing = Array.from({ length: RECENT_TOOLS_MAX }, (_, index) => `tool-${index}`);

    expect(recordRecentTool(existing, 'tool-4')).toEqual([
      'tool-4',
      'tool-0',
      'tool-1',
      'tool-2',
      'tool-3',
      'tool-5',
      'tool-6',
      'tool-7',
    ]);
    expect(recordRecentTool(existing, 'new-tool')).toHaveLength(RECENT_TOOLS_MAX);
  });
});
