/** Pure camera-reading and display helpers. Browser camera and canvas work live in webcam.ts. */

interface CameraEnvironment {
  navigator?: {
    mediaDevices?: {
      getUserMedia?: unknown;
      enumerateDevices?: unknown;
    };
  };
}

export interface CameraCapabilities {
  test: boolean;
  selection: boolean;
}

export type CameraFailureKind =
  'unsupported' | 'permission' | 'not-found' | 'busy' | 'device-unavailable' | 'preview-timeout' | 'unknown';

/** Detect only the standard capture APIs exposed by current Chrome, Safari, and Firefox. */
export function getCameraCapabilities(
  environment: CameraEnvironment = globalThis as CameraEnvironment,
): CameraCapabilities {
  const mediaDevices = environment.navigator?.mediaDevices;
  return {
    test: typeof mediaDevices?.getUserMedia === 'function',
    selection: typeof mediaDevices?.enumerateDevices === 'function',
  };
}

/** Convert standard Media Capture failures into stable user-facing categories. */
export function cameraFailureKind(error: unknown): CameraFailureKind {
  if (error instanceof Error && error.message === 'camera-unsupported') return 'unsupported';
  if (error instanceof Error && error.message === 'camera-preview-timeout') return 'preview-timeout';
  const name = error && typeof error === 'object' && 'name' in error ? String(error.name) : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'permission';
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') return 'not-found';
  if (name === 'NotReadableError' || name === 'AbortError' || name === 'TrackStartError') return 'busy';
  if (name === 'OverconstrainedError' || name === 'ConstraintNotSatisfiedError') return 'device-unavailable';
  return 'unknown';
}

function dimension(value: number): number {
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

/** Format dimensions reported by the active browser video track. */
export function resolutionLabel(width: number, height: number, unavailable: string): string {
  const w = dimension(width);
  const h = dimension(height);
  return w && h ? `${w} × ${h}` : unavailable;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** Reduce camera dimensions to a readable ratio, such as 1920×1080 → 16:9. */
export function aspectRatioLabel(width: number, height: number, unavailable: string): string {
  const w = dimension(width);
  const h = dimension(height);
  if (!w || !h) return unavailable;
  const divisor = gcd(w, h);
  return `${w / divisor}:${h / divisor}`;
}

/** Derive a measured frame rate from compositor frame counts and elapsed milliseconds. */
export function frameRateFromSamples(frameCount: number, elapsedMs: number): number {
  if (!Number.isFinite(frameCount) || !Number.isFinite(elapsedMs) || frameCount < 0 || elapsedMs <= 0) return 0;
  return Math.round((frameCount * 10000) / elapsedMs) / 10;
}

export function frameRateLabel(frameRate: number, unit: string, unavailable: string): string {
  if (!Number.isFinite(frameRate) || frameRate <= 0) return unavailable;
  const value = Math.round(frameRate * 10) / 10;
  return `${Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1)} ${unit}`;
}

/** Camera names can be withheld until permission is granted; retain real Unicode names when available. */
export function deviceLabel(label: string, index: number, unnamed: string): string {
  const trimmed = label.trim();
  return trimmed || `${unnamed} ${Math.max(1, Math.floor(index) + 1)}`;
}

/** A local PNG download name without device labels or other personal data. */
export function snapshotFilename(now: Date): string {
  if (Number.isNaN(now.getTime())) return 'webcam-snapshot.png';
  const part = (value: number) => String(value).padStart(2, '0');
  return `webcam-snapshot-${now.getFullYear()}-${part(now.getMonth() + 1)}-${part(now.getDate())}_${part(
    now.getHours(),
  )}-${part(now.getMinutes())}-${part(now.getSeconds())}.png`;
}

/** A camera result is usable only when it belongs to the latest start request. */
export function isCurrentCameraRequest(requestId: number, currentRequestId: number): boolean {
  return Number.isSafeInteger(requestId) && requestId === currentRequestId;
}
