/** Browser-only video sampling and GIF writing. */
import { yieldToBrowser } from '../../lib/browser';
import type { GifPlan } from './logic';

export class VideoDecodeError extends Error {}

export interface ConvertControl {
  signal?: AbortSignal;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Encodes sampled canvas frames into a GIF89a file. The fixed RGB332 palette
 * keeps the encoder compact and predictable: GIF itself is limited to 256
 * colours, and no source file ever leaves this browser tab.
 */
export async function convertVideoToGif(
  video: HTMLVideoElement,
  plan: GifPlan,
  control: ConvertControl = {},
): Promise<Blob> {
  if (!video.videoWidth || !video.videoHeight || !Number.isFinite(video.duration)) {
    throw new VideoDecodeError('The browser did not provide readable video frames.');
  }

  const canvas = document.createElement('canvas');
  canvas.width = plan.width;
  canvas.height = plan.height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new VideoDecodeError('Canvas is unavailable in this browser.');

  const bytes: number[] = [];
  writeHeader(bytes, plan.width, plan.height);
  const delayCentiseconds = Math.max(1, Math.round(100 / plan.fps));

  try {
    for (let frame = 0; frame < plan.frames; frame++) {
      throwIfAborted(control.signal);
      const time = Math.min(plan.end, plan.start + frame / plan.fps);
      await seekVideo(video, time, control.signal);
      context.drawImage(video, 0, 0, plan.width, plan.height);
      const pixels = context.getImageData(0, 0, plan.width, plan.height).data;
      writeFrame(bytes, toRgb332(pixels), plan.width, plan.height, delayCentiseconds);
      control.onProgress?.(frame + 1, plan.frames);
      await yieldToBrowser();
    }
    bytes.push(0x3b); // GIF trailer
    return new Blob([new Uint8Array(bytes)], { type: 'image/gif' });
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new DOMException('GIF conversion was cancelled.', 'AbortError');
}

function seekVideo(video: HTMLVideoElement, time: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const finish = (callback: () => void) => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      signal?.removeEventListener('abort', onAbort);
      callback();
    };
    const onSeeked = () => finish(resolve);
    const onError = () => finish(() => reject(new VideoDecodeError('The browser could not decode this video.')));
    const onAbort = () => finish(() => reject(new DOMException('GIF conversion was cancelled.', 'AbortError')));
    video.addEventListener('seeked', onSeeked, { once: true });
    video.addEventListener('error', onError, { once: true });
    signal?.addEventListener('abort', onAbort, { once: true });
    try {
      video.currentTime = time;
    } catch {
      onError();
    }
  });
}

function writeHeader(bytes: number[], width: number, height: number): void {
  pushText(bytes, 'GIF89a');
  writeWord(bytes, width);
  writeWord(bytes, height);
  bytes.push(0xf7, 0, 0); // global palette, 256 colours, no background colour
  for (let index = 0; index < 256; index++) {
    const red = ((index >> 5) & 7) * 36;
    const green = ((index >> 2) & 7) * 36;
    const blue = (index & 3) * 85;
    bytes.push(red, green, blue);
  }
  // NETSCAPE2.0 loop extension: zero means loop forever.
  bytes.push(0x21, 0xff, 0x0b);
  pushText(bytes, 'NETSCAPE2.0');
  bytes.push(3, 1, 0, 0, 0);
}

function writeFrame(bytes: number[], indexes: Uint8Array, width: number, height: number, delay: number): void {
  bytes.push(0x21, 0xf9, 4, 0);
  writeWord(bytes, delay);
  bytes.push(0, 0); // no transparent index, terminator
  bytes.push(0x2c);
  writeWord(bytes, 0);
  writeWord(bytes, 0);
  writeWord(bytes, width);
  writeWord(bytes, height);
  bytes.push(0); // use the global colour table
  const compressed = lzw(indexes);
  bytes.push(8); // minimum code size for 256-colour indexed pixels
  for (let offset = 0; offset < compressed.length; offset += 255) {
    const chunk = compressed.subarray(offset, offset + 255);
    bytes.push(chunk.length, ...chunk);
  }
  bytes.push(0);
}

function toRgb332(rgba: Uint8ClampedArray): Uint8Array {
  const result = new Uint8Array(rgba.length / 4);
  for (let source = 0, target = 0; source < rgba.length; source += 4, target++) {
    result[target] = (rgba[source] & 0xe0) | ((rgba[source + 1] & 0xe0) >> 3) | ((rgba[source + 2] & 0xc0) >> 6);
  }
  return result;
}

/** GIF LZW compression for an indexed 8-bit frame. */
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
  const reset = () => {
    dictionary = new Map<string, number>();
    next = 258;
    width = 9;
  };
  let dictionary = new Map<string, number>();

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
