/** Pure, browser-independent decisions for password-protecting a PDF. */

/** qpdf runs in a Web Worker and needs room for both input and output in memory. */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;

export function isPdfFile(fileName: string, mimeType: string): boolean {
  return mimeType === 'application/pdf' || /\.pdf$/i.test(fileName.trim());
}

export function fileExceedsLimit(bytes: number): boolean {
  return !Number.isFinite(bytes) || bytes <= 0 || bytes > MAX_FILE_BYTES;
}

/** An opening password must contain at least one character; spaces can be intentional. */
export function isPasswordPresent(password: string): boolean {
  return password.length > 0;
}

export function passwordsMatch(password: string, confirmation: string): boolean {
  return password === confirmation;
}

/** Keep the original name, including Unicode, while making the protected copy obvious. */
export function protectedPdfFileName(fileName: string): string {
  const base = fileName.trim().replace(/\.pdf$/i, '') || 'document';
  return `${base}_protected.pdf`;
}

/**
 * qpdf receives argv items directly, so spaces and Unicode never need shell escaping.
 * The browser integration supplies a random owner password, keeping this UI focused on
 * the one password recipients need to open the document.
 */
export function protectArgs(openPassword: string, ownerPassword: string): string[] {
  return ['--encrypt', openPassword, ownerPassword, '256', '--', 'input.pdf', 'output.pdf'];
}

export type ProtectFailure = 'invalid' | 'encrypted' | 'memory' | 'timeout' | 'failed';

/** Preserve qpdf's useful stderr without coupling the UI to qpdf-run's error class. */
export function protectFailureDiagnostic(caught: unknown): string {
  if (!(caught instanceof Error)) return String(caught);
  const detailed = caught as Error & { stderr?: unknown; warnings?: unknown };
  const lines = [
    caught.message,
    ...(Array.isArray(detailed.stderr)
      ? detailed.stderr.filter((line): line is string => typeof line === 'string')
      : []),
    ...(Array.isArray(detailed.warnings)
      ? detailed.warnings.filter((line): line is string => typeof line === 'string')
      : []),
  ];
  return lines.join('\n');
}

/** Worker bundles may not preserve instanceof identity for pdf-lib's encrypted error class. */
export function isEncryptedPdfLoadFailure(caught: unknown): boolean {
  if (!caught || typeof caught !== 'object') return false;
  const candidate = caught as { name?: unknown; message?: unknown };
  return (
    candidate.name === 'EncryptedPDFError' ||
    (typeof candidate.message === 'string' && /encrypted/i.test(candidate.message))
  );
}

/** Maps qpdf's technical diagnostics to a useful, non-secret-bearing UI state. */
export function classifyProtectFailure(message: string): ProtectFailure {
  const lower = message.toLowerCase();
  if (
    lower.includes('invalid password') ||
    lower.includes('password is incorrect') ||
    lower.includes('is encrypted') ||
    lower.includes('password-protected')
  )
    return 'encrypted';
  if (
    lower.includes('not a pdf') ||
    lower.includes('pdf header') ||
    lower.includes('xref') ||
    lower.includes('trailer') ||
    lower.includes('damaged') ||
    lower.includes('unable to find')
  )
    return 'invalid';
  if (lower.includes('timeout') || lower.includes('timed out')) return 'timeout';
  if (lower.includes('memory') || lower.includes('out of bounds')) return 'memory';
  return 'failed';
}
