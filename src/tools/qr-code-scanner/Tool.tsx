import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Dropzone, Field, Kbd, Notice, Panel, Select, Textarea } from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { classifyScan, type ScanResult } from './logic';
import { closeCamera, listCameras, openCamera, scanImage, scanVideoFrame, type CameraSession } from './scan';

const CAMERA_KEY = 'tools:qr-code-scanner:camera';

function cameraError(error: unknown, ui: UI): string {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError') return ui.permissionDenied;
  if (name === 'NotFoundError') return ui.noCamera;
  if (name === 'NotReadableError') return ui.cameraBusy;
  return ui.cameraError;
}

function scanError(error: unknown, ui: UI): string {
  if (error instanceof Error && error.message === 'image-too-large') return ui.imageTooLarge;
  if (error instanceof Error && error.message === 'unreadable-image') return ui.unreadableImage;
  return ui.unreadableImage;
}

export default function QrCodeScanner({ ui }: ToolProps<UI>) {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [status, setStatus] = useState(ui.ready);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(() => safeStorage.get(CAMERA_KEY) ?? '');
  const [image, setImage] = useState<{ name: string; width: number; height: number } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<CameraSession | null>(null);
  const requestRef = useRef(0);
  const frameRef = useRef<number | null>(null);
  const lastFrameAt = useRef(0);

  const stopCamera = useCallback(() => {
    requestRef.current += 1;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    closeCamera(sessionRef.current);
    sessionRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  const showResult = useCallback(
    (value: string) => {
      setResult(classifyScan(value));
      setStatus(ui.ready);
      setError('');
      setBusy(false);
    },
    [ui.ready],
  );

  const clear = useCallback(() => {
    stopCamera();
    setResult(null);
    setImage(null);
    setError('');
    setBusy(false);
    setStatus(ui.ready);
  }, [stopCamera, ui.ready]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      stopCamera();
      setResult(null);
      setError('');
      setBusy(true);
      setStatus(ui.scanning);
      try {
        const decoded = await scanImage(file);
        setImage({ name: file.name, width: decoded.width, height: decoded.height });
        if (decoded.value) showResult(decoded.value);
        else {
          setBusy(false);
          setStatus(ui.ready);
          setError(ui.noCode);
        }
      } catch (caught) {
        setBusy(false);
        setStatus(ui.ready);
        setError(scanError(caught, ui));
      }
    },
    [showResult, stopCamera, ui],
  );

  const startCamera = useCallback(
    async (deviceId = selectedDeviceId) => {
      stopCamera();
      const request = ++requestRef.current;
      setResult(null);
      setImage(null);
      setError('');
      setBusy(true);
      setStatus(ui.scanning);
      try {
        const session = await openCamera(deviceId);
        if (request !== requestRef.current) {
          closeCamera(session);
          return;
        }
        const video = videoRef.current;
        if (!video) {
          closeCamera(session);
          return;
        }
        sessionRef.current = session;
        video.srcObject = session.stream;
        await video.play();
        if (request !== requestRef.current) {
          closeCamera(session);
          return;
        }
        setActive(true);
        setBusy(false);
        const cameras = await listCameras().catch(() => []);
        if (request === requestRef.current) setDevices(cameras);

        const nextFrame = async (now: number) => {
          if (request !== requestRef.current) return;
          if (now - lastFrameAt.current >= 250) {
            lastFrameAt.current = now;
            try {
              const value = await scanVideoFrame(video);
              if (request !== requestRef.current) return;
              if (value) {
                stopCamera();
                showResult(value);
                return;
              }
            } catch {
              // A first video frame may not be available yet; keep looking while the stream is alive.
            }
          }
          frameRef.current = requestAnimationFrame(nextFrame);
        };
        frameRef.current = requestAnimationFrame(nextFrame);
      } catch (caught) {
        if (request !== requestRef.current) return;
        stopCamera();
        setBusy(false);
        setStatus(ui.ready);
        setError(cameraError(caught, ui));
      }
    },
    [selectedDeviceId, showResult, stopCamera, ui],
  );

  const chooseDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    safeStorage.set(CAMERA_KEY, deviceId);
    if (active) void startCamera(deviceId);
  };

  useEffect(() => stopCamera, [stopCamera]);

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
      if (event.key === 'Escape' && active) stopCamera();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, stopCamera]);

  const deviceOptions = [
    { value: '', label: ui.defaultCamera },
    ...devices.map((device, index) => ({
      value: device.deviceId,
      label: device.label || ui.unnamedCamera.replace('{number}', String(index + 1)),
    })),
  ];
  const resultLabel = result?.kind === 'url' ? ui.resultUrl : result?.kind === 'wifi' ? ui.resultWifi : ui.resultText;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section class="min-w-0" aria-label={ui.imageTitle}>
          <Dropzone
            accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
            onFiles={addFiles}
            title={ui.imageTitle}
            hint={ui.imageHint}
          />
          {image && (
            <div class="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm">
              <span class="min-w-0 truncate text-fg">{image.name}</span>
              <span class="text-muted">
                {ui.imageSize.replace('{width}', String(image.width)).replace('{height}', String(image.height))}
              </span>
              <Button size="sm" variant="ghost" onClick={clear}>
                {ui.removeImage}
              </Button>
            </div>
          )}
          <p class="mt-3 text-xs text-subtle">
            <Kbd>Ctrl</Kbd>/<Kbd>⌘</Kbd> + <Kbd>V</Kbd> {ui.shortcut}
          </p>

          <div class="mt-6 border-t border-line pt-5">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-sm font-medium text-fg">{ui.cameraTitle}</h2>
                <p class="mt-1 text-xs text-muted">{ui.cameraHint}</p>
              </div>
              <Button
                variant={active ? 'danger' : 'primary'}
                onClick={() => (active ? stopCamera() : void startCamera())}
              >
                {active ? ui.stopCamera : ui.startCamera}
              </Button>
            </div>
            <div class="relative mt-4 overflow-hidden rounded-lg border border-line bg-surface-2">
              <video
                ref={videoRef}
                aria-label={ui.cameraPreview}
                autoplay
                muted
                playsinline
                class="block max-h-[400px] w-full object-contain"
              />
              {!active && (
                <div class="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted">
                  {ui.cameraPlaceholder}
                </div>
              )}
            </div>
          </div>
        </section>

        <aside class="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6">
          <Field label={ui.camera} hint={ui.cameraDeviceHint}>
            <Select
              value={selectedDeviceId}
              onValue={chooseDevice}
              options={deviceOptions}
              disabled={busy && !active}
            />
          </Field>
          <div class="mt-5" aria-live="polite">
            <Notice tone={error ? 'danger' : active || busy ? 'info' : 'success'}>
              {error || (active || busy ? status : ui.privacyNote)}
            </Notice>
          </div>
          <div class="mt-6 border-t border-line pt-5">
            <h2 class="text-sm font-medium text-fg">{ui.resultTitle}</h2>
            {!result ? (
              <p class="mt-2 text-sm leading-6 text-muted">{ui.resultEmpty}</p>
            ) : (
              <div class="mt-3 space-y-4" aria-live="polite">
                <p class="text-sm font-medium text-fg">{resultLabel}</p>
                {result.kind === 'wifi' && result.wifi && (
                  <div class="grid grid-cols-2 gap-2 text-sm">
                    <div class="rounded-md bg-surface-2 p-2">
                      <span class="block text-xs text-muted">{ui.networkName}</span>
                      <span class="break-all text-fg">{result.wifi.ssid}</span>
                    </div>
                    <div class="rounded-md bg-surface-2 p-2">
                      <span class="block text-xs text-muted">{ui.security}</span>
                      <span class="break-all text-fg">{result.wifi.security || ui.unavailable}</span>
                    </div>
                    <div class="rounded-md bg-surface-2 p-2">
                      <span class="block text-xs text-muted">{ui.password}</span>
                      <span class="break-all text-fg">{result.wifi.password || ui.unavailable}</span>
                    </div>
                    <div class="rounded-md bg-surface-2 p-2">
                      <span class="block text-xs text-muted">{ui.hiddenNetwork}</span>
                      <span class="text-fg">{result.wifi.hidden ? ui.yes : ui.no}</span>
                    </div>
                  </div>
                )}
                <Field label={ui.rawContent}>
                  <Textarea value={result.raw} readOnly aria-label={ui.rawContent} class="min-h-24" />
                </Field>
                <div class="flex flex-wrap gap-2">
                  <CopyButton text={result.raw} label={ui.copy} copiedLabel={ui.copied} />
                  {result.url && (
                    <Button onClick={() => window.open(result.url, '_blank', 'noopener,noreferrer')}>
                      {ui.openLink}
                    </Button>
                  )}
                  <Button variant="ghost" onClick={clear}>
                    {ui.scanAnother}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </Panel>
  );
}
