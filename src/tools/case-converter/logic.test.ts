import { describe, expect, it } from 'vitest';
import { convertCase } from './logic';

describe('convertCase', () => {
  it('converts simple upper and lower case without altering punctuation', () => {
    expect(convertCase('Hello, World! 123', 'upper')).toBe('HELLO, WORLD! 123');
    expect(convertCase('Hello, World! 123', 'lower')).toBe('hello, world! 123');
  });

  it('uses sentence starts after punctuation and line breaks', () => {
    expect(convertCase('HELLO. "HOW ARE YOU?"\nFINE!', 'sentence')).toBe('Hello. "How are you?"\nFine!');
    expect(convertCase('  HELLO', 'sentence')).toBe('  Hello');
  });

  it('applies different AP and Chicago rules to long prepositions', () => {
    const input = 'learning about words with style';
    expect(convertCase(input, 'title-ap')).toBe('Learning About Words With Style');
    expect(convertCase(input, 'title-chicago')).toBe('Learning about Words with Style');
  });

  it('capitalizes first and final title words even when they are minor words', () => {
    expect(convertCase('the story of us', 'title-chicago')).toBe('The Story of Us');
  });

  it('converts identifier cases and recognizes existing camel-case acronyms', () => {
    expect(convertCase('XMLHttpRequest user ID', 'snake')).toBe('xml_http_request_user_id');
    expect(convertCase('hello world', 'camel')).toBe('helloWorld');
    expect(convertCase('hello world', 'pascal')).toBe('HelloWorld');
    expect(convertCase('hello world', 'kebab')).toBe('hello-world');
    expect(convertCase('hello world', 'constant')).toBe('HELLO_WORLD');
  });

  it('keeps separate identifiers on separate lines and supports CRLF input', () => {
    expect(convertCase('Order Date\r\nCustomer ID', 'camel')).toBe('orderDate\r\ncustomerId');
  });

  it('handles empty and Unicode input', () => {
    expect(convertCase('', 'title-ap')).toBe('');
    expect(convertCase('straße 안녕하세요 東京 👍🏽', 'upper')).toBe('STRASSE 안녕하세요 東京 👍🏽');
    expect(convertCase('über café', 'pascal')).toBe('ÜberCafé');
  });

  it('handles large inputs without truncating lines', () => {
    const input = Array.from({ length: 10_000 }, (_, index) => `field ${index}`).join('\n');
    const result = convertCase(input, 'snake');
    expect(result.split('\n')).toHaveLength(10_000);
    expect(result).toContain('field_9999');
  });
});
