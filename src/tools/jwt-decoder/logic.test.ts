import { describe, expect, it } from 'vitest';
import { MAX_TOKEN_LENGTH, decodeJwt, formatClaimDistance, getJwtTimeStatus, normalizeToken } from './logic';

const VALID_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiLtmY3quLjrj5kiLCJpYXQiOjE3MDQwNjcyMDAsIm5iZiI6MTcwNDA2NzE0MCwiZXhwIjoxNzA0MDY3MjYwfQ.signature';

describe('JWT decoding', () => {
  it('decodes a compact JWS with Unicode claims and standard time claims', () => {
    const result = decodeJwt(`Bearer ${VALID_TOKEN}`);
    expect(result.status).toBe('decoded');
    if (result.status !== 'decoded') return;
    expect(result.value.header).toMatchObject({ alg: 'HS256', typ: 'JWT' });
    expect(result.value.payload).toMatchObject({ sub: '홍길동', exp: 1_704_067_260 });
    expect(result.value.timeClaims).toEqual([
      { name: 'exp', value: 1_704_067_260, milliseconds: 1_704_067_260_000 },
      { name: 'iat', value: 1_704_067_200, milliseconds: 1_704_067_200_000 },
      { name: 'nbf', value: 1_704_067_140, milliseconds: 1_704_067_140_000 },
    ]);
  });

  it('recognizes active, expired, not-yet-active, and no-expiration states at exact boundaries', () => {
    const decoded = decodeJwt(VALID_TOKEN);
    expect(decoded.status).toBe('decoded');
    if (decoded.status !== 'decoded') return;
    expect(getJwtTimeStatus(decoded.value.timeClaims, 1_704_067_200_000)).toBe('active');
    expect(getJwtTimeStatus(decoded.value.timeClaims, 1_704_067_260_000)).toBe('expired');
    expect(getJwtTimeStatus(decoded.value.timeClaims, 1_704_067_139_999)).toBe('not-active');
    expect(getJwtTimeStatus([], 0)).toBe('no-expiration');
  });

  it('rejects empty, malformed, encrypted, padded, non-canonical, and oversized inputs clearly', () => {
    expect(decodeJwt('')).toEqual({ status: 'empty' });
    expect(decodeJwt('header.payload')).toEqual({ status: 'invalid', reason: 'segments' });
    expect(decodeJwt('a.b.c.d.e')).toEqual({ status: 'invalid', reason: 'encrypted' });
    expect(decodeJwt('eyJhbGciOiJIUzI1NiJ9=.eyJzdWIiOiJhIn0.sig')).toEqual({ status: 'invalid', reason: 'base64' });
    expect(decodeJwt('AB.eyJzdWIiOiJhIn0.sig')).toEqual({ status: 'invalid', reason: 'base64' });
    expect(decodeJwt(`a.${'a'.repeat(MAX_TOKEN_LENGTH)}.c`)).toEqual({ status: 'invalid', reason: 'too-long' });
  });

  it('rejects non-JSON, non-object, invalid UTF-8 payloads and invalid NumericDate values', () => {
    expect(decodeJwt('bm90LWpzb24.eyJzdWIiOiJhIn0.sig')).toEqual({ status: 'invalid', reason: 'json' });
    expect(decodeJwt('W10.eyJzdWIiOiJhIn0.sig')).toEqual({ status: 'invalid', reason: 'object' });
    expect(decodeJwt('_w.eyJzdWIiOiJhIn0.sig')).toEqual({ status: 'invalid', reason: 'utf8' });
    const result = decodeJwt('eyJhbGciOiJIUzI1NiJ9.eyJleHAiOiIxNzA0MDY3MjYwIn0.sig');
    expect(result.status).toBe('decoded');
    if (result.status === 'decoded')
      expect(result.value.timeClaims).toEqual([{ name: 'exp', value: null, milliseconds: null }]);
  });
});

describe('JWT token normalization', () => {
  it('trims whitespace and removes Bearer without altering token characters', () => {
    expect(normalizeToken('  BEARER a.b.c  ')).toBe('a.b.c');
    expect(normalizeToken('bearer-token.a.b')).toBe('bearer-token.a.b');
    expect(normalizeToken('토큰.a.b')).toBe('토큰.a.b');
  });

  it('joins a token that was pasted over several lines by a YAML file or a chat window', () => {
    expect(normalizeToken('Bearer abc.def\n  ghi\njkl')).toBe('abc.defghijkl');
    expect(decodeJwt('Bearer eyJhbGciOiJIUzI1NiJ9\n.eyJzdWIiOiJhIn0\n.sig').status).toBe('decoded');
  });
});

describe('claim distance wording', () => {
  it('uses the largest unit that keeps the distance readable', () => {
    expect(formatClaimDistance(604_800_000, 'en')).toBe('in 1 week');
    expect(formatClaimDistance(-259_200_000, 'en')).toBe('3 days ago');
    expect(formatClaimDistance(3_600_000, 'en')).toBe('in 1 hour');
    expect(formatClaimDistance(-45_000, 'en')).toBe('45 seconds ago');
    expect(formatClaimDistance(2_592_000_000, 'en')).toBe('in 1 month');
  });

  it('localizes the wording instead of printing raw seconds', () => {
    expect(formatClaimDistance(-259_200_000, 'ko')).toContain('3일');
    expect(formatClaimDistance(604_800_000, 'ko')).not.toContain('초');
  });
});
