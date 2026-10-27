import { describe, expect, it } from 'vitest';
import {
  classifyUnlockFailure,
  fileExceedsLimit,
  isPdfFile,
  MAX_FILE_BYTES,
  unlockFailureDiagnostic,
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
    expect(classifyUnlockFailure('WARNING: file is damaged; unable to find trailer dictionary')).toBe('invalid');
    expect(classifyUnlockFailure('unsupported encryption filter')).toBe('unsupported');
    expect(classifyUnlockFailure('QPDF_TIMEOUT: worker timed out')).toBe('timeout');
    expect(classifyUnlockFailure('WebAssembly out of bounds memory access')).toBe('memory');
    expect(classifyUnlockFailure('unexpected worker error')).toBe('failed');
  });

  it('includes qpdf stderr and its error code when classifying a failed run', () => {
    const error = Object.assign(new Error('qpdf exited with status 2'), {
      code: 'QPDF_EXEC_FAILED',
      stdout: ['qpdf diagnostic output'],
      stderr: ['qpdf: input.pdf: invalid password'],
      warnings: ['warning detail'],
    });
    const diagnostic = unlockFailureDiagnostic(error);
    expect(diagnostic).toContain('QPDF_EXEC_FAILED');
    expect(diagnostic).toContain('qpdf diagnostic output');
    expect(diagnostic).toContain('invalid password');
    expect(diagnostic).toContain('warning detail');
    expect(classifyUnlockFailure(diagnostic)).toBe('password');
  });
});
