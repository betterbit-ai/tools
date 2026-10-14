/**
 * Pure URL percent-encoding helpers. The component encoder follows RFC 3986;
 * the form encoder follows application/x-www-form-urlencoded conventions.
 */

export type UrlEncodingMode = 'component' | 'url' | 'form';
export type ConversionDirection = 'encode' | 'decode';

export type ConversionError = {
  code: 'invalid-percent-encoding' | 'invalid-utf8';
  index?: number;
};

export type ConversionResult = { ok: true; value: string } | { ok: false; error: ConversionError };

export type QueryParameter = {
  name: string;
  value: string;
  hasEquals: boolean;
};

export type QueryParts = {
  prefix: string;
  fragment: string;
  hasQuestionMark: boolean;
  parameters: QueryParameter[];
};

/** Encode one URI component, including the five reserved characters left by encodeURIComponent. */
export function encodeComponent(input: string): string {
  return encodeURIComponent(input).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

/** Encode a single HTML form value, where spaces are represented by + rather than %20. */
export function encodeFormValue(input: string): string {
  return encodeURIComponent(input)
    .replace(/[!'()~]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+');
}

export function convert(input: string, direction: ConversionDirection, mode: UrlEncodingMode): ConversionResult {
  try {
    if (direction === 'encode') {
      const value =
        mode === 'component' ? encodeComponent(input) : mode === 'url' ? encodeURI(input) : encodeFormValue(input);
      return { ok: true, value };
    }

    const invalidIndex = findInvalidPercentEncoding(input);
    if (invalidIndex !== undefined)
      return { ok: false, error: { code: 'invalid-percent-encoding', index: invalidIndex } };

    const value =
      mode === 'component'
        ? decodeURIComponent(input)
        : mode === 'url'
          ? decodeURI(input)
          : decodeURIComponent(input.replace(/\+/g, ' '));
    return { ok: true, value };
  } catch {
    // decodeURIComponent and decodeURI reject invalid UTF-8 byte sequences.
    return { ok: false, error: { code: 'invalid-utf8' } };
  }
}

/**
 * Splits a full URL or a bare query string into human-readable query rows.
 * A string with no ? and no query separator is intentionally not treated as a query.
 */
export function parseQuery(input: string): QueryParts | null {
  const hashIndex = input.indexOf('#');
  const beforeFragment = hashIndex === -1 ? input : input.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? '' : input.slice(hashIndex);
  const questionIndex = beforeFragment.indexOf('?');
  const hasQuestionMark = questionIndex !== -1;
  const isBareQuery = !hasQuestionMark && /[=&]/.test(beforeFragment);
  if (!hasQuestionMark && !isBareQuery) return null;

  const prefix = hasQuestionMark ? beforeFragment.slice(0, questionIndex) : '';
  const query = hasQuestionMark ? beforeFragment.slice(questionIndex + 1) : beforeFragment;
  const parameters = query
    .split('&')
    .filter(Boolean)
    .map((part) => {
      const equalsIndex = part.indexOf('=');
      const hasEquals = equalsIndex !== -1;
      const rawName = hasEquals ? part.slice(0, equalsIndex) : part;
      const rawValue = hasEquals ? part.slice(equalsIndex + 1) : '';
      return {
        name: decodeQueryPart(rawName),
        value: decodeQueryPart(rawValue),
        hasEquals,
      };
    });

  return { prefix, fragment, hasQuestionMark, parameters };
}

/** Rebuilds a URL or bare query using form-style query parameter encoding. */
export function buildQuery(parts: Omit<QueryParts, 'parameters'>, parameters: QueryParameter[]): string {
  const query = parameters
    .map((parameter) => {
      const name = encodeFormValue(parameter.name);
      if (!parameter.hasEquals && !parameter.value) return name;
      return `${name}=${encodeFormValue(parameter.value)}`;
    })
    .join('&');

  return `${parts.prefix}${parts.hasQuestionMark ? '?' : ''}${query}${parts.fragment}`;
}

function decodeQueryPart(value: string): string {
  const result = convert(value, 'decode', 'form');
  return result.ok ? result.value : value;
}

function findInvalidPercentEncoding(input: string): number | undefined {
  for (let index = 0; index < input.length; index += 1) {
    if (input[index] !== '%') continue;
    const pair = input.slice(index + 1, index + 3);
    if (!/^[0-9A-Fa-f]{2}$/.test(pair)) return index;
    index += 2;
  }
  return undefined;
}
