import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, Panel, Stat, Toggle } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { formatRecordingTime, recordingExtension, recordingFilename } from './logic';
import {
  canRecordScreen,
  openCaptureSession,
  recorderFailure,
  startLocalScreenRecording,
  type ActiveRecording,
  type CaptureSession,
} from './recording';

type Status = 'ready' | 'requesting' | 'recording' | 'paused' | 'finished';

export default function ScreenRecorder({ locale, ui }: ToolProps<UI>) {
  const [status, setStatus] = useState<Status>('ready');
  const [supported, setSupported] = useState(true);
  const [includeMicrophone, setIncludeMicrophone] = useState(
    () => safeStorage.get('tools:screen-recorder:microphone') === 'true',
  );
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const sessionRef = useRef<CaptureSession | null>(null);
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
    sessionRef.current?.stop();
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

  const start = useCallback(async () => {
    if (!canRecordScreen()) {
      setSupported(false);
      setError(ui.unsupported);
      return;
    }
    reset();
    const request = ++requestRef.current;
    setStatus('requesting');
    try {
      const session = await openCaptureSession(includeMicrophone);
      if (request !== requestRef.current) {
        session.stop();
        return;
      }
      sessionRef.current = session;
      const complete = (source: Blob) => {
        if (request !== requestRef.current) return;
        recordingRef.current = null;
        clearTimer();
        stopSession();
        revokePreview();
        const url = URL.createObjectURL(source);
        previewUrlRef.current = url;
        setPreviewUrl(url);
        setRecording(source);
        setStatus('finished');
      };
      const fail = () => {
        if (request !== requestRef.current) return;
        recordingRef.current = null;
        clearTimer();
        stopSession();
        setError(ui.recordingFailed);
        setStatus('ready');
      };
      const activeRecording = startLocalScreenRecording(session.stream, complete, fail);
      if (!activeRecording) return;
      recordingRef.current = activeRecording;
      runningSinceRef.current = Date.now();
      elapsedRef.current = 0;
      setElapsed(0);
      setStatus('recording');
      timerRef.current = window.setInterval(() => {
        setElapsed(elapsedRef.current + (Date.now() - runningSinceRef.current) / 1_000);
      }, 250);
    } catch (caught) {
      if (request !== requestRef.current) return;
      setError(
        {
          permission: ui.permissionDenied,
          'not-found': ui.noDisplay,
          busy: ui.captureBusy,
          cancelled: ui.cancelled,
          unsupported: ui.unsupported,
          unknown: ui.startError,
        }[recorderFailure(caught)],
      );
      setStatus('ready');
    }
  }, [clearTimer, includeMicrophone, reset, revokePreview, stopSession, ui]);

  const pause = useCallback(() => {
    recordingRef.current?.pause();
    elapsedRef.current += (Date.now() - runningSinceRef.current) / 1_000;
    clearTimer();
    setElapsed(elapsedRef.current);
    setStatus('paused');
  }, [clearTimer]);

  const resume = useCallback(() => {
    recordingRef.current?.resume();
    runningSinceRef.current = Date.now();
    timerRef.current = window.setInterval(() => {
      setElapsed(elapsedRef.current + (Date.now() - runningSinceRef.current) / 1_000);
    }, 250);
    setStatus('recording');
  }, []);

  const stop = useCallback(() => {
    if (status !== 'recording' && status !== 'paused') return;
    if (status === 'recording') elapsedRef.current += (Date.now() - runningSinceRef.current) / 1_000;
    clearTimer();
    setElapsed(elapsedRef.current);
    recordingRef.current?.stop();
  }, [clearTimer, status]);

  useEffect(() => {
    const available = canRecordScreen();
    setSupported(available);
    if (!available) setError(ui.unsupported);
    return () => {
      requestRef.current += 1;
      clearTimer();
      recordingRef.current?.stop();
      stopSession();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [clearTimer, stopSession, ui.unsupported]);

  useEffect(() => {
    safeStorage.set('tools:screen-recorder:microphone', String(includeMicrophone));
  }, [includeMicrophone]);

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
      if (event.key.toLowerCase() === 'r' && (status === 'ready' || status === 'finished')) {
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

  const active = status === 'recording' || status === 'paused';
  const message =
    status === 'requesting'
      ? ui.requesting
      : status === 'recording'
        ? ui.recording
        : status === 'paused'
          ? ui.paused
          : status === 'finished'
            ? ui.readyToDownload
            : ui.ready;
  const outputFormat = recording ? (recordingExtension(recording.type) === 'mp4' ? ui.mp4 : ui.webm) : ui.formatValue;

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
          <Field label={ui.microphone} hint={ui.microphoneHint}>
            <Toggle
              checked={includeMicrophone}
              onChecked={setIncludeMicrophone}
              label={ui.includeMicrophone}
              disabled={active || status === 'requesting'}
            />
          </Field>
          <div class="grid grid-cols-2 gap-3" aria-live="polite">
            <Stat label={ui.elapsed} value={formatRecordingTime(elapsed)} emphasis />
            <Stat label={ui.format} value={outputFormat} />
          </div>
          <Notice>{ui.localOnly}</Notice>
          <p class="text-xs leading-5 text-subtle">{ui.systemAudioHint}</p>
          {recording && previewUrl ? (
            <div class="space-y-3 border-t border-line pt-4">
              <Field label={ui.playback}>
                <video
                  class="w-full rounded-md border border-line bg-surface-2"
                  controls
                  playsInline
                  src={previewUrl}
                />
              </Field>
              <p class="text-xs text-subtle">{formatBytes(recording.size, locale)}</p>
              <Button
                variant="primary"
                class="w-full"
                onClick={() => downloadBlob(recording, recordingFilename(new Date(), recording.type))}
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
