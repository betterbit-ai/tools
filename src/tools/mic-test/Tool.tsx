import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, Panel, Select, Stat, cx } from '../../components/ui';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  analyseSignal,
  deviceLabel,
  formatDbfs,
  formatRecordingTime,
  MAX_RECORDING_SECONDS,
  type SignalReading,
} from './logic';
import {
  closeMicrophone,
  listMicrophones,
  openMicrophone,
  recordLocally,
  type LocalRecording,
  type MicrophoneSession,
} from './microphone';

const SILENT_READING: SignalReading = { peak: 0, rms: 0, peakDbfs: -Infinity, percent: 0, status: 'silent' };

export default function MicTest({ ui }: ToolProps<UI>) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [reading, setReading] = useState<SignalReading>(SILENT_READING);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingUrl, setRecordingUrl] = useState('');
  const sessionRef = useRef<MicrophoneSession | null>(null);
  const recordingRef = useRef<LocalRecording | null>(null);
  const animationRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingStartedRef = useRef(0);
  const urlRef = useRef('');

  const stopRecording = useCallback(() => {
    if (recordingTimerRef.current !== null) window.clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = null;
    recordingRef.current?.stop();
    recordingRef.current = null;
    setRecording(false);
  }, []);

  const stopTest = useCallback(() => {
    stopRecording();
    if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    closeMicrophone(sessionRef.current);
    sessionRef.current = null;
    setActive(false);
    setReading(SILENT_READING);
  }, [stopRecording]);

  const startTest = useCallback(
    async (deviceId = selectedDeviceId) => {
      stopTest();
      setError('');
      try {
        const session = await openMicrophone(deviceId);
        sessionRef.current = session;
        setActive(true);
        setDevices(await listMicrophones());
        const samples = new Uint8Array(session.analyser.fftSize);
        const update = () => {
          session.analyser.getByteTimeDomainData(samples);
          setReading(analyseSignal(samples));
          animationRef.current = window.requestAnimationFrame(update);
        };
        update();
      } catch (caught) {
        const name = caught instanceof DOMException ? caught.name : '';
        setError(
          name === 'NotAllowedError' ? ui.permissionDenied : name === 'NotFoundError' ? ui.noMicrophone : ui.startError,
        );
      }
    },
    [selectedDeviceId, stopTest, ui.noMicrophone, ui.permissionDenied, ui.startError],
  );

  const chooseDevice = useCallback(
    (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      if (active) void startTest(deviceId);
    },
    [active, startTest],
  );

  const startRecording = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    stopRecording();
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = '';
    setRecordingUrl('');
    try {
      recordingRef.current = recordLocally(session.stream, (blob) => {
        const url = URL.createObjectURL(blob);
        if (urlRef.current) URL.revokeObjectURL(urlRef.current);
        urlRef.current = url;
        setRecordingUrl(url);
        setRecording(false);
      });
      recordingStartedRef.current = Date.now();
      setRecordingSeconds(0);
      setRecording(true);
      recordingTimerRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - recordingStartedRef.current) / 1000);
        setRecordingSeconds(Math.min(MAX_RECORDING_SECONDS, seconds));
        if (seconds >= MAX_RECORDING_SECONDS) stopRecording();
      }, 100);
    } catch {
      setError(ui.recordingUnsupported);
    }
  }, [stopRecording, ui.recordingUnsupported]);

  useEffect(() => {
    void listMicrophones().then(setDevices);
    return () => {
      stopTest();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [stopTest]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.key === 's' || event.key === 'S') {
        event.preventDefault();
        if (active) stopTest();
        else void startTest();
      }
      if ((event.key === 'r' || event.key === 'R') && active && !recording) {
        event.preventDefault();
        startRecording();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, recording, startRecording, startTest, stopTest]);

  const deviceOptions = [
    { value: '', label: ui.defaultDevice },
    ...devices.map((device, index) => ({
      value: device.deviceId,
      label: deviceLabel(device.label, index, ui.unnamedMicrophone),
    })),
  ];
  const levelClass =
    reading.status === 'clipping' ? 'bg-danger' : reading.status === 'quiet' ? 'bg-warning' : 'bg-accent';
  const stateMessage = active
    ? reading.status === 'clipping'
      ? ui.clipping
      : reading.status === 'quiet' || reading.status === 'silent'
        ? ui.quiet
        : ui.signalGood
    : ui.ready;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section aria-label={ui.liveTest}>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-medium text-fg">{ui.liveTest}</h2>
              <p class="mt-1 text-xs text-muted">{ui.localOnly}</p>
            </div>
            <Button variant={active ? 'danger' : 'primary'} onClick={() => (active ? stopTest() : void startTest())}>
              {active ? ui.stopTest : ui.startTest}
            </Button>
          </div>

          <div class="mt-5 rounded-lg border border-line bg-surface-2 p-4">
            <div class="flex items-end justify-between gap-3">
              <div>
                <p class="text-xs font-medium text-muted">{ui.inputLevel}</p>
                <p class="mt-1 tabular text-3xl font-semibold tracking-tight text-fg">{reading.percent}%</p>
              </div>
              <p class="tabular text-sm text-muted">{formatDbfs(reading.peakDbfs)}</p>
            </div>
            <div
              role="meter"
              aria-label={ui.inputLevel}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={reading.percent}
              class="mt-4 h-3 overflow-hidden rounded-full bg-surface"
            >
              <div
                class={cx('h-full rounded-full transition-[width]', levelClass)}
                style={{ width: `${reading.percent}%` }}
              />
            </div>
            <p class="mt-3 text-sm text-muted" aria-live="polite">
              {stateMessage}
            </p>
          </div>

          <div class="mt-5 flex flex-wrap items-center gap-2">
            <Button onClick={recording ? stopRecording : startRecording} disabled={!active}>
              {recording ? ui.stopRecording : ui.startRecording}
            </Button>
            {recording && (
              <span class="tabular text-sm text-muted">
                {formatRecordingTime(recordingSeconds)}
                {ui.recordingLimit}
              </span>
            )}
            {!recording && recordingUrl && <span class="text-sm text-success">{ui.recordingReady}</span>}
          </div>
          <p class="mt-2 text-xs text-subtle">{ui.recordingHint}</p>
          {recordingUrl && <audio class="mt-3 w-full" aria-label={ui.playback} controls src={recordingUrl} />}
        </section>

        <aside class="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6">
          <Field label={ui.microphone} hint={ui.deviceHint}>
            <Select value={selectedDeviceId} onValue={chooseDevice} options={deviceOptions} />
          </Field>
          <div class="mt-5 grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.peakLevel} value={formatDbfs(reading.peakDbfs)} emphasis />
            <Stat
              label={ui.sampleRate}
              value={
                active ? `${sessionRef.current?.context.sampleRate ?? ui.unavailable} ${ui.hertz}` : ui.unavailable
              }
            />
          </div>
          <div class="mt-4">
            <Notice tone={active ? 'success' : 'info'}>{active ? ui.listening : ui.ready}</Notice>
          </div>
          {error && (
            <div class="mt-3">
              <Notice tone="danger">{error}</Notice>
            </div>
          )}
        </aside>
      </div>
      <div class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-xs text-subtle">
        <span>
          <Kbd>S</Kbd> {ui.shortcutStartStop}
        </span>
        <span>
          <Kbd>R</Kbd> {ui.shortcutRecord}
        </span>
      </div>
    </Panel>
  );
}
