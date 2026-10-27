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

export type UnlockFailure = 'password' | 'unsupported' | 'invalid' | 'timeout' | 'memory' | 'failed';

/** Preserve qpdf's useful stderr without coupling the UI to qpdf-run's error class. */
export function unlockFailureDiagnostic(caught: unknown): string {
  if (!(caught instanceof Error)) return String(caught);
  const detailed = caught as Error & { code?: unknown; stdout?: unknown; stderr?: unknown; warnings?: unknown };
  const lines = [
    caught.message,
    typeof detailed.code === 'string' ? detailed.code : '',
    ...(Array.isArray(detailed.stdout)
      ? detailed.stdout.filter((line): line is string => typeof line === 'string')
      : []),
    ...(Array.isArray(detailed.stderr)
      ? detailed.stderr.filter((line): line is string => typeof line === 'string')
      : []),
    ...(Array.isArray(detailed.warnings)
      ? detailed.warnings.filter((line): line is string => typeof line === 'string')
      : []),
  ];
  return lines.join('\n');
}

/** Maps qpdf's technical diagnostics to a useful, non-secret-bearing UI state. */
export function classifyUnlockFailure(message: string): UnlockFailure {
  const lower = message.toLowerCase();
  if (lower.includes('invalid password') || lower.includes('password is incorrect')) return 'password';
  if (
    lower.includes('not a pdf') ||
    lower.includes('pdf header') ||
    lower.includes('xref') ||
    lower.includes('trailer') ||
    lower.includes('damaged') ||
    lower.includes('unable to find')
  )
    return 'invalid';
  if (lower.includes('encryption') || lower.includes('unsupported') || lower.includes('not supported'))
    return 'unsupported';
  if (lower.includes('timeout') || lower.includes('timed out') || lower.includes('qpdf_timeout')) return 'timeout';
  if (lower.includes('memory') || lower.includes('out of bounds') || lower.includes('oom')) return 'memory';
  return 'failed';
}
