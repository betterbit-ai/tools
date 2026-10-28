/** Browser-only image decoding and GIF89a writing. */
import { yieldToBrowser } from '../../lib/browser';
import { framePlacement, type GifPlan } from './logic';

export class ImageDecodeError extends Error {}

export interface EncodeControl {
  signal?: AbortSignal;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Draws still-image files onto one stable canvas and writes a looping GIF89a.
 * RGB332 is intentionally compact and predictable; GIF has at most 256 colours
 * per frame regardless of the source image format.
 */
export async function encodeImages(files: File[], plan: GifPlan, control: EncodeControl = {}): Promise<Blob> {
  if (files.length < 2 || !plan.frames) throw new ImageDecodeError('At least two readable images are required.');
  const canvas = document.createElement('canvas');
  canvas.width = plan.width;
  canvas.height = plan.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new ImageDecodeError('Canvas is unavailable in this browser.');

  const bytes: number[] = [];
  writeHeader(bytes, plan.width, plan.height, plan.loop);
  try {
    for (const [index, file] of files.slice(0, plan.frames).entries()) {
      throwIfAborted(control.signal);
      let bitmap: ImageBitmap;
      try {
        bitmap = await createImageBitmap(file);
      } catch {
        throw new ImageDecodeError('The browser could not decode this image.');
      }
      try {
        context.clearRect(0, 0, plan.width, plan.height);
        // A white matte makes mixed JPEG/PNG photo frames stable in a GIF, whose
        // single transparent palette entry cannot represent partial alpha.
        context.fillStyle = '#fff';
        context.fillRect(0, 0, plan.width, plan.height);
        const placement = framePlacement({ width: bitmap.width, height: bitmap.height }, plan);
        context.drawImage(bitmap, placement.x, placement.y, placement.width, placement.height);
        writeFrame(
          bytes,
          toRgb332(context.getImageData(0, 0, plan.width, plan.height).data),
          plan.width,
          plan.height,
          plan.delay,
        );
      } finally {
        bitmap.close();
      }
      control.onProgress?.(index + 1, plan.frames);
      await yieldToBrowser();
    }
    bytes.push(0x3b);
    return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('GIF creation was cancelled.', 'AbortError');
}

function writeHeader(bytes: number[], width: number, height: number, loop: boolean): void {
  pushText(bytes, 'GIF89a');
  writeWord(bytes, width);
  writeWord(bytes, height);
  bytes.push(0xf7, 0, 0);
  for (let index = 0; index < 256; index++) {
    bytes.push(((index >> 5) & 7) * 36, ((index >> 2) & 7) * 36, (index & 3) * 85);
  }
  if (loop) {
    bytes.push(0x21, 0xff, 0x0b);
    pushText(bytes, 'NETSCAPE2.0');
    bytes.push(3, 1, 0, 0, 0);
  }
}

function writeFrame(
  bytes: number[],
  indexes: Uint8Array,
  width: number,
  height: number,
  delayMilliseconds: number,
): void {
  bytes.push(0x21, 0xf9, 4, 0);
  writeWord(bytes, Math.max(1, Math.round(delayMilliseconds / 10)));
  bytes.push(0, 0, 0x2c);
  writeWord(bytes, 0);
  writeWord(bytes, 0);
  writeWord(bytes, width);
  writeWord(bytes, height);
  bytes.push(0);
  const compressed = lzw(indexes);
  bytes.push(8);
  for (let offset = 0; offset < compressed.length; offset += 255) {
    const chunk = compressed.subarray(offset, offset + 255);
    bytes.push(chunk.length, ...chunk);
  }
  bytes.push(0);
}

function toRgb332(rgba: Uint8ClampedArray): Uint8Array {
  const indexes = new Uint8Array(rgba.length / 4);
  for (let source = 0, target = 0; source < rgba.length; source += 4, target++) {
    indexes[target] = (rgba[source] & 0xe0) | ((rgba[source + 1] & 0xe0) >> 3) | ((rgba[source + 2] & 0xc0) >> 6);
  }
  return indexes;
}

function lzw(indexes: Uint8Array): Uint8Array {
  const clear = 256;
  const end = 257;
  let next = 258;
  let width = 9;
  let bits = 0;
  let bitCount = 0;
  const output: number[] = [];
  const write = (code: number) => {
    bits |= code << bitCount;
    bitCount += width;
    while (bitCount >= 8) {
      output.push(bits & 0xff);
      bits >>>= 8;
      bitCount -= 8;
    }
  };
  let dictionary = new Map<string, number>();
  const reset = () => {
    dictionary = new Map<string, number>();
    next = 258;
    width = 9;
  };

  write(clear);
  if (!indexes.length) {
    write(end);
    return new Uint8Array(output);
  }
  let prefix = indexes[0];
  for (let i = 1; i < indexes.length; i++) {
    const value = indexes[i];
    const key = `${prefix},${value}`;
    const found = dictionary.get(key);
    if (found !== undefined) {
      prefix = found;
      continue;
    }
    write(prefix);
    if (next < 4096) {
      dictionary.set(key, next++);
      if (next === 1 << width && width < 12) width++;
    } else {
      write(clear);
      reset();
    }
    prefix = value;
  }
  write(prefix);
  write(end);
  if (bitCount) output.push(bits & 0xff);
  return new Uint8Array(output);
}

function writeWord(bytes: number[], value: number): void {
  bytes.push(value & 0xff, (value >> 8) & 0xff);
}

function pushText(bytes: number[], text: string): void {
  for (const character of text) bytes.push(character.charCodeAt(0));
}
