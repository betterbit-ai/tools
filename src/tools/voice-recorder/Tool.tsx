import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, Panel, Select, Stat } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { formatRecordingTime, recordingFilename } from './logic';
import {
  canRecord,
  closeSession,
  encodeMp3,
  listInputDevices,
  openSession,
  recorderFailure,
  startLocalRecording,
  type ActiveRecording,
  type RecordingSession,
} from './recording';

type Status = 'ready' | 'requesting' | 'recording' | 'paused' | 'processing' | 'finished';

export default function VoiceRecorder({ ui }: ToolProps<UI>) {
  const [status, setStatus] = useState<Status>('ready');
  const [supported, setSupported] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState('');
  const [recording, setRecording] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const sessionRef = useRef<RecordingSession | null>(null);
  const recordingRef = useRef<ActiveRecording | null>(null);
  const previewUrlRef = useRef('');
  const timerRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const runningSinceRef = useRef(0);
  const requestRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = '';
    setPreviewUrl('');
  }, []);

  const stopSession = useCallback(() => {
    closeSession(sessionRef.current);
    sessionRef.current = null;
  }, []);

  const reset = useCallback(() => {
    requestRef.current += 1;
    clearTimer();
    recordingRef.current?.stop();
    recordingRef.current = null;
    stopSession();
    revokePreview();
    setRecording(null);
    elapsedRef.current = 0;
    setElapsed(0);
    setError('');
    setStatus('ready');
  }, [clearTimer, revokePreview, stopSession]);

  const refreshDevices = useCallback(async () => {
    try {
      setDevices(await listInputDevices());
    } catch {
      // Capture can continue even when a browser declines device enumeration.
    }
  }, []);

  const start = useCallback(async () => {
    if (!canRecord()) {
      setSupported(false);
      setError(ui.unsupported);
      return;
    }
    reset();
    const request = ++requestRef.current;
    setStatus('requesting');
    try {
      const session = await openSession(deviceId);
      if (request !== requestRef.current) {
        closeSession(session);
        return;
      }
      sessionRef.current = session;
      await refreshDevices();
      const complete = async (source: Blob) => {
        if (request !== requestRef.current) return;
        recordingRef.current = null;
        stopSession();
        clearTimer();
        setStatus('processing');
        try {
          const mp3 = await encodeMp3(source, 128);
          if (request !== requestRef.current) return;
          revokePreview();
          const url = URL.createObjectURL(mp3);
          previewUrlRef.current = url;
          setPreviewUrl(url);
          setRecording(mp3);
          setStatus('finished');
        } catch {
          if (request !== requestRef.current) return;
          setError(ui.encodeFailed);
          setStatus('ready');
        }
      };
      recordingRef.current = startLocalRecording(
        session.stream,
        (source) => void complete(source),
        () => {
          if (request !== requestRef.current) return;
          clearTimer();
          stopSession();
          setError(ui.recordingFailed);
          setStatus('ready');
        },
      );
      runningSinceRef.current = Date.now();
      elapsedRef.current = 0;
      setElapsed(0);
      setStatus('recording');
      timerRef.current = window.setInterval(() => {
        setElapsed(elapsedRef.current + (Date.now() - runningSinceRef.current) / 1000);
      }, 250);
    } catch (caught) {
      if (request !== requestRef.current) return;
      setError(
        {
          permission: ui.permissionDenied,
          'not-found': ui.noMicrophone,
          busy: ui.microphoneBusy,
          unsupported: ui.unsupported,
          unknown: ui.startError,
        }[recorderFailure(caught)],
      );
      setStatus('ready');
    }
  }, [clearTimer, deviceId, refreshDevices, reset, revokePreview, stopSession, ui]);

  const pause = useCallback(() => {
    recordingRef.current?.pause();
    elapsedRef.current += (Date.now() - runningSinceRef.current) / 1000;
    clearTimer();
    setElapsed(elapsedRef.current);
    setStatus('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    recordingRef.current?.resume();
    runningSinceRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsed(elapsedRef.current + (Date.now() - runningSinceRef.current) / 1000);
    }, 250);
    setStatus('recording');
  }, []);

  const stop = useCallback(() => {
    if (status !== 'recording' && status !== 'paused') return;
    if (status === 'recording') elapsedRef.current += (Date.now() - runningSinceRef.current) / 1000;
    clearTimer();
    setElapsed(elapsedRef.current);
    setStatus('processing');
    recordingRef.current?.stop();
  }, [clearTimer, status]);

  useEffect(() => {
    const available = canRecord();
    setSupported(available);
    if (!available) setError(ui.unsupported);
    else void refreshDevices();
    return () => {
      requestRef.current += 1;
      clearTimer();
      recordingRef.current?.stop();
      stopSession();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [clearTimer, refreshDevices, stopSession, ui.unsupported]);

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
      if (event.key.toLowerCase() === 'r' && status === 'ready') {
        event.preventDefault();
        void start();
      }
      if (event.code === 'Space' && (status === 'recording' || status === 'paused')) {
        event.preventDefault();
        status === 'recording' ? pause() : resume();
      }
      if (event.key === 'Escape' && (status === 'recording' || status === 'paused')) {
        event.preventDefault();
        stop();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pause, resume, start, status, stop]);

  const deviceOptions = [
    { value: '', label: ui.defaultDevice },
    ...devices.map((device, index) => ({
      value: device.deviceId,
      label: device.label || `${ui.unnamedMicrophone} ${index + 1}`,
    })),
  ];
  const active = status === 'recording' || status === 'paused';
  const message =
    status === 'requesting'
      ? ui.requesting
      : status === 'recording'
        ? ui.recording
        : status === 'paused'
          ? ui.paused
          : status === 'processing'
            ? ui.processing
            : status === 'finished'
              ? ui.readyToDownload
              : ui.ready;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section aria-label={ui.recorder}>
          <div class="rounded-lg border border-line bg-surface-2 px-4 py-7 text-center">
            <p class="tabular text-5xl font-semibold tracking-tight text-fg" aria-live="off">
              {formatRecordingTime(elapsed)}
            </p>
            <p class="mt-2 text-sm text-muted" aria-live="polite">
              {message}
            </p>
          </div>
          <div class="mt-4 flex flex-wrap justify-center gap-2">
            {status === 'ready' || status === 'finished' ? (
              <Button variant="primary" size="lg" disabled={!supported} onClick={() => void start()}>
                {ui.start}
              </Button>
            ) : null}
            {status === 'recording' ? <Button onClick={pause}>{ui.pause}</Button> : null}
            {status === 'paused' ? <Button onClick={resume}>{ui.resume}</Button> : null}
            {active ? (
              <Button variant="danger" size="lg" onClick={stop}>
                {ui.stop}
              </Button>
            ) : null}
            {status === 'finished' ? (
              <Button variant="ghost" onClick={reset}>
                {ui.newRecording}
              </Button>
            ) : null}
          </div>
          <p class="mt-4 text-center text-xs text-subtle">
            <Kbd>R</Kbd> {ui.shortcutRecord} · <Kbd>Space</Kbd> {ui.shortcutPause} · <Kbd>Esc</Kbd> {ui.shortcutStop}
          </p>
          {error ? (
            <div class="mt-4">
              <Notice tone="danger">{error}</Notice>
            </div>
          ) : null}
        </section>

        <aside class="space-y-4">
          <Field label={ui.microphone} hint={ui.deviceHint}>
            <Select
              value={deviceId}
              onValue={setDeviceId}
              options={deviceOptions}
              disabled={active || status === 'processing'}
            />
          </Field>
          <div class="grid grid-cols-2 gap-3" aria-live="polite">
            <Stat label={ui.elapsed} value={formatRecordingTime(elapsed)} emphasis />
            <Stat label={ui.format} value={ui.formatValue} />
          </div>
          <Notice>{ui.localOnly}</Notice>
          {recording && previewUrl ? (
            <div class="space-y-3 border-t border-line pt-4">
              <Field label={ui.playback}>
                <audio class="w-full" controls src={previewUrl} />
              </Field>
              <Button
                variant="primary"
                class="w-full"
                onClick={() => downloadBlob(recording, recordingFilename(new Date()))}
              >
                {ui.download}
              </Button>
            </div>
          ) : null}
        </aside>
      </div>
    </Panel>
  );
}
