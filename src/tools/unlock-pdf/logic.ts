/** Pure, browser-independent decisions for removing a known PDF password. */

/** qpdf runs in a Web Worker and needs room for both input and output in memory. */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;

export function isPdfFile(fileName: string, mimeType: string): boolean {
  return mimeType === 'application/pdf' || /\.pdf$/i.test(fileName.trim());
}

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes <= 0 || bytes > MAX_FILE_BYTES;
}

/** Keep the original name, including Unicode, while making the new copy obvious. */
export function unlockedPdfFileName(fileName: string): string {
  const base = fileName.trim().replace(/\.pdf$/i, '') || 'document';
  return `${base}_unlocked.pdf`;
}

/** qpdf receives argv items directly, so spaces and Unicode never need shell escaping. */
export function unlockArgs(password: string): string[] {
  return [`--password=${password}`, '--decrypt', '--', 'input.pdf', 'output.pdf'];
}

export type UnlockFailure = 'password' | 'unsupported' | 'invalid' | 'memory' | 'failed';

/** Maps qpdf's technical diagnostics to a useful, non-secret-bearing UI state. */
export function classifyUnlockFailure(message: string): UnlockFailure {
  const lower = message.toLowerCase();
  if (lower.includes('invalid password') || lower.includes('password is incorrect')) return 'password';
  if (lower.includes('not a pdf') || lower.includes('damaged') || lower.includes('unable to find')) return 'invalid';
  if (lower.includes('encryption') || lower.includes('unsupported') || lower.includes('not supported'))
    return 'unsupported';
  if (lower.includes('memory') || lower.includes('out of bounds') || lower.includes('timeout')) return 'memory';
  return 'failed';
}
