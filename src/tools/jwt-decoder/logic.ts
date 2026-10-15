/** Pure JWT compact-serialization parsing. No browser or UI APIs are used here. */

export const MAX_TOKEN_LENGTH = 100_000;

export type JwtErrorReason = 'segments' | 'encrypted' | 'too-long' | 'base64' | 'utf8' | 'json' | 'object';
export type TimeClaimName = 'exp' | 'iat' | 'nbf';

export interface JwtTimeClaim {
  name: TimeClaimName;
  value: number | null;
  milliseconds: number | null;
}

export interface DecodedJwt {
  token: string;
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  headerText: string;
  payloadText: string;
  signature: string;
  timeClaims: JwtTimeClaim[];
}

export type JwtDecodeResult =
  { status: 'empty' } | { status: 'invalid'; reason: JwtErrorReason } | { status: 'decoded'; value: DecodedJwt };

export type JwtTimeStatus = 'expired' | 'not-active' | 'active' | 'no-expiration';

const BASE64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Removes an Authorization header's optional Bearer scheme before decoding. */
export function normalizeToken(input: string): string {
  const trimmed = input.trim();
  return /^bearer\s+/i.test(trimmed) ? trimmed.replace(/^bearer\s+/i, '').trim() : trimmed;
}

/**
 * Decodes the header and claims set of a compact JWS JWT. A five-part JWE is
 * intentionally identified rather than treated as a malformed JWS: its claims
 * are encrypted and cannot be decoded without the recipient key.
 */
export function decodeJwt(input: string): JwtDecodeResult {
  const token = normalizeToken(input);
  if (!token) return { status: 'empty' };
  if (token.length > MAX_TOKEN_LENGTH) return { status: 'invalid', reason: 'too-long' };

  const segments = token.split('.');
  if (segments.length === 5) return { status: 'invalid', reason: 'encrypted' };
  if (segments.length !== 3 || !segments[0] || !segments[1]) return { status: 'invalid', reason: 'segments' };

  const headerResult = decodeJsonObject(segments[0]);
  if (!headerResult.ok) return { status: 'invalid', reason: headerResult.reason };
  const payloadResult = decodeJsonObject(segments[1]);
  if (!payloadResult.ok) return { status: 'invalid', reason: payloadResult.reason };

  return {
    status: 'decoded',
    value: {
      token,
      header: headerResult.value,
      payload: payloadResult.value,
      headerText: JSON.stringify(headerResult.value, null, 2),
      payloadText: JSON.stringify(payloadResult.value, null, 2),
      signature: segments[2],
      timeClaims: readTimeClaims(payloadResult.value),
    },
  };
}

/** Returns the current time validity state, without making any trust decision about the signature. */
export function getJwtTimeStatus(timeClaims: JwtTimeClaim[], nowMilliseconds = Date.now()): JwtTimeStatus {
  const exp = timeClaims.find((claim) => claim.name === 'exp')?.milliseconds;
  const nbf = timeClaims.find((claim) => claim.name === 'nbf')?.milliseconds;
  if (exp !== null && exp !== undefined && nowMilliseconds >= exp) return 'expired';
  if (nbf !== null && nbf !== undefined && nowMilliseconds < nbf) return 'not-active';
  return exp === null || exp === undefined ? 'no-expiration' : 'active';
}

function decodeJsonObject(
  segment: string,
): { ok: true; value: Record<string, unknown> } | { ok: false; reason: JwtErrorReason } {
  const bytes = decodeBase64Url(segment);
  if (!bytes) return { ok: false, reason: 'base64' };

  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return { ok: false, reason: 'utf8' };
  }

  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'json' };
  }
  if (!isJsonObject(value)) return { ok: false, reason: 'object' };
  return { ok: true, value };
}

/** Strict, unpadded base64url decoder as required by JWS compact serialization. */
function decodeBase64Url(value: string): Uint8Array | undefined {
  if (!value || value.length % 4 === 1) return undefined;
  const output: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const character of value) {
    const index = BASE64URL.indexOf(character);
    if (index < 0) return undefined;
    buffer = (buffer << 6) | index;
    bits += 6;
    while (bits >= 8) {
      bits -= 8;
      output.push((buffer >> bits) & 0xff);
    }
  }
  if (bits > 0 && (buffer & ((1 << bits) - 1)) !== 0) return undefined;
  return new Uint8Array(output);
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readTimeClaims(payload: Record<string, unknown>): JwtTimeClaim[] {
  const claims: JwtTimeClaim[] = [];
  for (const name of ['exp', 'iat', 'nbf'] as const) {
    if (!(name in payload)) continue;
    const value = payload[name];
    if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isSafeInteger(value)) {
      claims.push({ name, value: null, milliseconds: null });
      continue;
    }
    const milliseconds = value * 1000;
    if (!Number.isSafeInteger(milliseconds) || Number.isNaN(new Date(milliseconds).getTime())) {
      claims.push({ name, value, milliseconds: null });
      continue;
    }
    claims.push({ name, value, milliseconds });
  }
  return claims;
}
