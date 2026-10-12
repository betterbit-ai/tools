import { describe, expect, it } from 'vitest';
import {
  classifyUnlockFailure,
  fileExceedsLimit,
  isPdfFile,
  MAX_FILE_BYTES,
  unlockedPdfFileName,
  unlockArgs,
} from './logic';

describe('unlock-pdf', () => {
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

  it('creates a separate output name without losing Unicode', () => {
    expect(unlockedPdfFileName(' 계약서.résumé 📄.PDF ')).toBe('계약서.résumé 📄_unlocked.pdf');
    expect(unlockedPdfFileName('')).toBe('document_unlocked.pdf');
  });

  it('passes passwords as one qpdf argument, including empty and Unicode passwords', () => {
    expect(unlockArgs('')).toEqual(['--password=', '--decrypt', '--', 'input.pdf', 'output.pdf']);
    expect(unlockArgs('비밀 🔐 with spaces')).toEqual([
      '--password=비밀 🔐 with spaces',
      '--decrypt',
      '--',
      'input.pdf',
      'output.pdf',
    ]);
  });

  it('turns qpdf failures into actionable states without exposing the password', () => {
    expect(classifyUnlockFailure('qpdf: invalid password')).toBe('password');
    expect(classifyUnlockFailure('file is damaged')).toBe('invalid');
    expect(classifyUnlockFailure('unsupported encryption filter')).toBe('unsupported');
    expect(classifyUnlockFailure('WebAssembly out of bounds memory access')).toBe('memory');
    expect(classifyUnlockFailure('unexpected worker error')).toBe('failed');
  });
});
