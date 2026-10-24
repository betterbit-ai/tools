import { describe, expect, it } from 'vitest';
import {
  classifyProtectFailure,
  fileExceedsLimit,
  isPasswordPresent,
  isPdfFile,
  isEncryptedPdfLoadFailure,
  MAX_FILE_BYTES,
  passwordsMatch,
  protectFailureDiagnostic,
  protectedPdfFileName,
  protectArgs,
} from './logic';

describe('protect-pdf', () => {
  it('recognizes PDFs without trusting only the MIME type', () => {
    expect(isPdfFile('계약서.PDF', '')).toBe(true);
    expect(isPdfFile('statement', 'application/pdf')).toBe(true);
    expect(isPdfFile('statement.pdf.exe', '')).toBe(false);
    expect(isPdfFile('', '')).toBe(false);
  });

  it('enforces a finite browser-memory safety limit at the boundary', () => {
    expect(fileExceedsLimit(1)).toBe(false);
    expect(fileExceedsLimit(MAX_FILE_BYTES)).toBe(false);
    expect(fileExceedsLimit(0)).toBe(true);
    expect(fileExceedsLimit(MAX_FILE_BYTES + 1)).toBe(true);
    expect(fileExceedsLimit(Number.POSITIVE_INFINITY)).toBe(true);
  });

  it('requires a nonempty password but preserves intentionally chosen whitespace', () => {
    expect(isPasswordPresent('')).toBe(false);
    expect(isPasswordPresent(' ')).toBe(true);
    expect(isPasswordPresent('비밀 🔐')).toBe(true);
  });

  it('compares password confirmation exactly, including Unicode and whitespace', () => {
    expect(passwordsMatch('비밀 🔐', '비밀 🔐')).toBe(true);
    expect(passwordsMatch(' pass ', 'pass')).toBe(false);
    expect(passwordsMatch('', '')).toBe(true);
  });

  it('creates a separate output name without losing Unicode', () => {
    expect(protectedPdfFileName(' 계약서.résumé 📄.PDF ')).toBe('계약서.résumé 📄_protected.pdf');
    expect(protectedPdfFileName('')).toBe('document_protected.pdf');
  });

  it('passes Unicode passwords directly to qpdf with AES-256 encryption', () => {
    expect(protectArgs('비밀 🔐 with spaces', 'owner password')).toEqual([
      '--encrypt',
      '비밀 🔐 with spaces',
      'owner password',
      '256',
      '--',
      'input.pdf',
      'output.pdf',
    ]);
  });

  it('turns qpdf failures into actionable states without exposing the password', () => {
    expect(classifyProtectFailure('qpdf: invalid password')).toBe('encrypted');
    expect(classifyProtectFailure('PDF is encrypted and requires a password.')).toBe('encrypted');
    expect(classifyProtectFailure("qpdf: can't find PDF header")).toBe('invalid');
    expect(classifyProtectFailure('QPDF worker timed out.')).toBe('timeout');
    expect(classifyProtectFailure('file is damaged')).toBe('invalid');
    expect(classifyProtectFailure('WebAssembly out of bounds memory access')).toBe('memory');
    expect(classifyProtectFailure('unexpected worker error')).toBe('failed');
  });

  it('uses qpdf stderr when the top-level worker error is generic', () => {
    const encrypted = Object.assign(new Error('qpdf exited with status 2'), {
      stderr: ['qpdf: input.pdf: invalid password'],
    });
    const corrupt = Object.assign(new Error('qpdf exited with status 2'), {
      stderr: ["qpdf: input.pdf: can't find PDF header"],
    });

    expect(classifyProtectFailure(protectFailureDiagnostic(encrypted))).toBe('encrypted');
    expect(classifyProtectFailure(protectFailureDiagnostic(corrupt))).toBe('invalid');
    expect(protectFailureDiagnostic(new Error('plain failure'))).toBe('plain failure');
  });

  it('recognizes encrypted pdf-lib failures even when worker class identity is lost', () => {
    expect(isEncryptedPdfLoadFailure({ name: 'EncryptedPDFError', message: 'opaque' })).toBe(true);
    expect(isEncryptedPdfLoadFailure(new Error('Input document is encrypted.'))).toBe(true);
    expect(isEncryptedPdfLoadFailure(new Error('Invalid object reference.'))).toBe(false);
  });
});
