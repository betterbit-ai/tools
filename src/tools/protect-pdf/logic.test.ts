import { describe, expect, it } from 'vitest';
import {
  classifyProtectFailure,
  fileExceedsLimit,
  isPasswordPresent,
  isPdfFile,
  MAX_FILE_BYTES,
  passwordsMatch,
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
    expect(classifyProtectFailure('file is damaged')).toBe('invalid');
    expect(classifyProtectFailure('WebAssembly out of bounds memory access')).toBe('memory');
    expect(classifyProtectFailure('unexpected worker error')).toBe('failed');
  });
});
