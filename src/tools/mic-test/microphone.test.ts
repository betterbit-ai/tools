import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createSessionRequestGate,
  getMicrophoneCapabilities,
  microphoneFailureKind,
  recordLocally,
} from './microphone';

class FakeMediaRecorder extends EventTarget {
  static latest: FakeMediaRecorder | undefined;

  state: RecordingState = 'inactive';
  mimeType = 'audio/webm';

  constructor(_stream: MediaStream) {
    super();
    FakeMediaRecorder.latest = this;
  }

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    this.dispatchEvent(new Event('stop'));
  }

  fail() {
    this.dispatchEvent(new Event('error'));
  }

  addChunk(blob: Blob, timecode = 0) {
    const event = new Event('dataavailable') as BlobEvent;
    Object.defineProperties(event, {
      data: { value: blob },
      timecode: { value: timecode },
    });
    this.dispatchEvent(event);
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  FakeMediaRecorder.latest = undefined;
});

describe('createSessionRequestGate', () => {
  it('rejects an older microphone request after a newer start or stop', () => {
    const gate = createSessionRequestGate();
    const firstRequest = gate.begin();
    const secondRequest = gate.begin();

    expect(gate.isCurrent(firstRequest)).toBe(false);
    expect(gate.isCurrent(secondRequest)).toBe(true);

    gate.invalidate();
    expect(gate.isCurrent(secondRequest)).toBe(false);
  });
});

describe('getMicrophoneCapabilities', () => {
  const AudioContextConstructor = class {} as unknown as typeof AudioContext;
  const MediaRecorderConstructor = class {} as unknown as typeof MediaRecorder;

  it('requires capture and Web Audio for the live test, but detects recording separately', () => {
    expect(
      getMicrophoneCapabilities({
        navigator: { mediaDevices: { getUserMedia: () => Promise.resolve({} as MediaStream) } },
        AudioContext: AudioContextConstructor,
        MediaRecorder: MediaRecorderConstructor,
      }),
    ).toEqual({ test: true, recording: true });

    expect(
      getMicrophoneCapabilities({
        navigator: { mediaDevices: { getUserMedia: () => Promise.resolve({} as MediaStream) } },
        AudioContext: AudioContextConstructor,
      }),
    ).toEqual({ test: true, recording: false });

    expect(getMicrophoneCapabilities({ AudioContext: AudioContextConstructor })).toEqual({
      test: false,
      recording: false,
    });
  });
});

describe('microphoneFailureKind', () => {
  it('distinguishes unsupported, denied, missing, busy, and stale-device failures', () => {
    expect(microphoneFailureKind(new Error('microphone-unsupported'))).toBe('unsupported');
    expect(microphoneFailureKind(new DOMException('', 'NotAllowedError'))).toBe('permission');
    expect(microphoneFailureKind(new DOMException('', 'SecurityError'))).toBe('permission');
    expect(microphoneFailureKind(new DOMException('', 'NotFoundError'))).toBe('not-found');
    expect(microphoneFailureKind(new DOMException('', 'NotReadableError'))).toBe('busy');
    expect(microphoneFailureKind(new DOMException('', 'AbortError'))).toBe('busy');
    expect(microphoneFailureKind(new DOMException('', 'OverconstrainedError'))).toBe('device-unavailable');
    expect(microphoneFailureKind(new Error('unexpected'))).toBe('unknown');
  });
});

describe('recordLocally', () => {
  it('stops recorder failures and does not create a misleading playable sample', () => {
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    const onComplete = vi.fn();
    const onError = vi.fn();

    recordLocally({} as MediaStream, onComplete, onError);
    FakeMediaRecorder.latest?.fail();
    FakeMediaRecorder.latest?.stop();

    expect(onError).toHaveBeenCalledOnce();
    expect(onComplete).not.toHaveBeenCalled();
    expect(FakeMediaRecorder.latest?.state).toBe('inactive');
  });

  it('rejects empty recordings instead of presenting them as playable', () => {
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    const onComplete = vi.fn();
    const onError = vi.fn();

    const recording = recordLocally({} as MediaStream, onComplete, onError);
    recording.stop();

    expect(onError).toHaveBeenCalledOnce();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('caps recording at the source even if the UI timer is delayed in a background tab', () => {
    vi.useFakeTimers();
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    const onComplete = vi.fn();
    const onError = vi.fn();

    recordLocally({} as MediaStream, onComplete, onError, 10_000);
    FakeMediaRecorder.latest?.addChunk(new Blob(['recorded audio'], { type: 'audio/webm' }), 9_900);
    vi.advanceTimersByTime(10_000);

    expect(FakeMediaRecorder.latest?.state).toBe('inactive');
    expect(onComplete).toHaveBeenCalledOnce();
    expect(onComplete.mock.calls[0]?.[0]).toMatchObject({ size: 14, type: 'audio/webm' });
    expect(onError).not.toHaveBeenCalled();
  });
});
