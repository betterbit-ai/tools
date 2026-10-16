import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSessionRequestGate, recordLocally } from './microphone';

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
}

afterEach(() => {
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

describe('recordLocally', () => {
  it('reports recorder failures without creating a misleading playable sample', () => {
    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    const onComplete = vi.fn();
    const onError = vi.fn();

    recordLocally({} as MediaStream, onComplete, onError);
    FakeMediaRecorder.latest?.fail();
    FakeMediaRecorder.latest?.stop();

    expect(onError).toHaveBeenCalledOnce();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
