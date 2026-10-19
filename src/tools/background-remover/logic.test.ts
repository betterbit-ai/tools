import { describe, expect, it } from 'vitest';
import {
  MAX_FILE_BYTES,
  MAX_INPUT_DIMENSION,
  MAX_INPUT_PIXELS,
  normaliseMask,
  outputDimensions,
  outputName,
  validateInput,
} from './logic';

describe('background-remover planning', () => {
  it('keeps the original dimensions for the full-resolution transparent PNG', () => {
    expect(outputDimensions(4032, 3024)).toEqual({ width: 4032, height: 3024 });
  });

  it('accepts exact boundaries and rejects invalid, oversized and over-limit images', () => {
    expect(validateInput(1, 1, 0)).toEqual({ ok: true });
    expect(validateInput(MAX_INPUT_DIMENSION, 3000, MAX_FILE_BYTES)).toEqual({ ok: true });
    expect(validateInput(0, 1)).toEqual({ ok: false, reason: 'invalid' });
    expect(validateInput(MAX_INPUT_DIMENSION + 1, 1)).toEqual({ ok: false, reason: 'dimension' });
    expect(validateInput(5000, 5000)).toEqual({ ok: false, reason: 'pixels' });
    expect(validateInput(1, MAX_INPUT_PIXELS + 1)).toEqual({ ok: false, reason: 'dimension' });
    expect(validateInput(1, 1, MAX_FILE_BYTES + 1)).toEqual({ ok: false, reason: 'file' });
  });

  it('accepts a large encoded phone image when its decoded pixels remain bounded', () => {
    expect(validateInput(6000, 4000, 80 * 1024 * 1024)).toEqual({ ok: true });
  });

  it('normalises finite model scores to alpha and handles a flat or invalid mask safely', () => {
    expect([...normaliseMask([-2, 0, 2])]).toEqual([0, 128, 255]);
    expect([...normaliseMask([0.5, 0.5])]).toEqual([0, 0]);
    expect([...normaliseMask([Number.NaN, Number.POSITIVE_INFINITY])]).toEqual([0, 0]);
  });

  it('keeps Korean and emoji filenames readable in the PNG download name', () => {
    expect(outputName('가족 사진 📷.JPG')).toBe('가족 사진 📷-background-removed.png');
    expect(outputName('.hidden')).toBe('.hidden-background-removed.png');
    expect(outputName('')).toBe('image-background-removed.png');
  });
});
