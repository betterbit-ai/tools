import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, Panel, Select, Stat, Toggle, cx } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  aspectRatioLabel,
  cameraFailureKind,
  deviceLabel,
  frameRateLabel,
  getCameraCapabilities,
  isCurrentCameraRequest,
  resolutionLabel,
  snapshotFilename,
} from './logic';
import {
  closeCamera,
  listCameras,
  observeFrameRate,
  openCamera,
  playCameraPreview,
  snapshotFromVideo,
  type CameraSession,
} from './webcam';

export default function WebcamTest({ ui }: ToolProps<UI>) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [active, setActive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [deviceWarning, setDeviceWarning] = useState('');
  const [snapshotError, setSnapshotError] = useState('');
  const [mirrored, setMirrored] = useState(() => safeStorage.get('tools:webcam-test:mirrored') !== 'false');
  const [showGrid, setShowGrid] = useState(() => safeStorage.get('tools:webcam-test:grid') === 'true');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [frameRate, setFrameRate] = useState(0);
  const sessionRef = useRef<CameraSession | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stopObserveRef = useRef<() => void>(() => undefined);
  const requestRef = useRef(0);
  // Server rendering has no browser APIs, so replace these optimistic values after hydration.
  const [capabilities, setCapabilities] = useState({ test: true, selection: true });

  const stopTest = useCallback(() => {
    requestRef.current += 1;
    stopObserveRef.current();
    stopObserveRef.current = () => undefined;
    closeCamera(sessionRef.current);
    sessionRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setStarting(false);
    setDimensions({ width: 0, height: 0 });
    setFrameRate(0);
  }, []);

  const startTest = useCallback(
    async (deviceId = selectedDeviceId) => {
      stopTest();
      const requestId = ++requestRef.current;
      setError('');
      setDeviceWarning('');
      setSnapshotError('');
      setStarting(true);
      try {
        const session = await openCamera(deviceId);
        if (!isCurrentCameraRequest(requestId, requestRef.current)) {
          closeCamera(session);
          return;
        }
        const video = videoRef.current;
        if (!video) {
          closeCamera(session);
          throw new Error('preview-unavailable');
        }
        sessionRef.current = session;
        video.srcObject = session.stream;
        await playCameraPreview(video);
        if (!isCurrentCameraRequest(requestId, requestRef.current)) {
          if (video.srcObject === session.stream) video.srcObject = null;
          closeCamera(session);
          return;
        }
        session.track.addEventListener(
          'ended',
          () => {
            if (!isCurrentCameraRequest(requestId, requestRef.current) || sessionRef.current !== session) return;
            stopTest();
            setError(ui.cameraDisconnected);
          },
          { once: true },
        );
        const settings = session.track.getSettings();
        setDimensions({
          width: video.videoWidth || settings.width || 0,
          height: video.videoHeight || settings.height || 0,
        });
        setFrameRate(settings.frameRate || 0);
        stopObserveRef.current = observeFrameRate(video, setFrameRate);
        setStarting(false);
        setActive(true);
        let cameras: MediaDeviceInfo[];
        try {
          cameras = await listCameras();
        } catch {
          if (isCurrentCameraRequest(requestId, requestRef.current)) setDeviceWarning(ui.deviceListUnavailable);
          cameras = [];
        }
        if (isCurrentCameraRequest(requestId, requestRef.current)) setDevices(cameras);
      } catch (caught) {
        if (!isCurrentCameraRequest(requestId, requestRef.current)) return;
        stopTest();
        const failure = cameraFailureKind(caught);
        setError(
          {
            unsupported: ui.unsupported,
            permission: ui.permissionDenied,
            'not-found': ui.noCamera,
            busy: ui.cameraBusy,
            'device-unavailable': ui.deviceUnavailable,
            'preview-timeout': ui.previewTimeout,
            unknown: ui.startError,
          }[failure],
        );
      }
    },
    [
      selectedDeviceId,
      stopTest,
      ui.cameraBusy,
      ui.cameraDisconnected,
      ui.deviceListUnavailable,
      ui.deviceUnavailable,
      ui.noCamera,
      ui.permissionDenied,
      ui.previewTimeout,
      ui.startError,
      ui.unsupported,
    ],
  );

  const chooseDevice = useCallback(
    (deviceId: string) => {
      setSelectedDeviceId(deviceId);
      if (active) void startTest(deviceId);
    },
    [active, startTest],
  );

  const takeSnapshot = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    setSnapshotError('');
    try {
      downloadBlob(await snapshotFromVideo(video, mirrored), snapshotFilename(new Date()));
    } catch {
      setSnapshotError(ui.snapshotError);
    }
  }, [mirrored, ui.snapshotError]);

  const setMirror = (value: boolean) => {
    setMirrored(value);
    safeStorage.set('tools:webcam-test:mirrored', String(value));
  };
  const setGrid = (value: boolean) => {
    setShowGrid(value);
    safeStorage.set('tools:webcam-test:grid', String(value));
  };

  useEffect(() => {
    const detected = getCameraCapabilities();
    setCapabilities(detected);
    if (!detected.test) {
      setError(ui.unsupported);
    } else if (!detected.selection) {
      setDeviceWarning(ui.deviceListUnavailable);
    } else {
      void listCameras()
        .then(setDevices)
        .catch(() => setDeviceWarning(ui.deviceListUnavailable));
    }
    return stopTest;
  }, [stopTest, ui.deviceListUnavailable, ui.unsupported]);

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
        if (active || starting) stopTest();
        else void startTest();
      }
      if ((event.key === 'p' || event.key === 'P') && active) {
        event.preventDefault();
        void takeSnapshot();
      }
      if (event.key === 'm' || event.key === 'M') {
        event.preventDefault();
        setMirror(!mirrored);
      }
      if (event.key === 'g' || event.key === 'G') {
        event.preventDefault();
        setGrid(!showGrid);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, mirrored, showGrid, startTest, starting, stopTest, takeSnapshot]);

  const settings = sessionRef.current?.track.getSettings();
  const width = dimensions.width || settings?.width || 0;
  const height = dimensions.height || settings?.height || 0;
  const selectedCamera = devices.find((device) => device.deviceId === selectedDeviceId);
  const deviceOptions = [
    { value: '', label: ui.defaultDevice },
    ...devices.map((device, index) => ({
      value: device.deviceId,
      label: deviceLabel(device.label, index, ui.unnamedCamera),
    })),
  ];

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section aria-label={ui.liveTest} class="min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-sm font-medium text-fg">{ui.liveTest}</h2>
              <p class="mt-1 text-xs text-muted">{ui.localOnly}</p>
            </div>
            <Button
              variant={active || starting ? 'danger' : 'primary'}
              disabled={!capabilities.test}
              onClick={() => (active || starting ? stopTest() : void startTest())}
            >
              {active ? ui.stopTest : starting ? ui.cancelStart : ui.startTest}
            </Button>
          </div>

          <div class="relative mt-5 overflow-hidden rounded-lg border border-line bg-surface-2">
            <video
              ref={videoRef}
              aria-label={ui.preview}
              autoplay
              muted
              playsinline
              class={cx('block max-h-[480px] w-full object-contain', mirrored && '-scale-x-100')}
              onLoadedMetadata={() => {
                const video = videoRef.current;
                if (video) setDimensions({ width: video.videoWidth, height: video.videoHeight });
              }}
            />
            {!active && (
              <div class="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted">
                {ui.previewPlaceholder}
              </div>
            )}
            {active && showGrid && (
              <div aria-hidden="true" class="pointer-events-none absolute inset-0">
                <span class="absolute inset-y-0 left-1/3 border-l border-line-strong" />
                <span class="absolute inset-y-0 left-2/3 border-l border-line-strong" />
                <span class="absolute inset-x-0 top-1/3 border-t border-line-strong" />
                <span class="absolute inset-x-0 top-2/3 border-t border-line-strong" />
              </div>
            )}
          </div>

          <div class="mt-5 flex flex-wrap items-center gap-2">
            <Button onClick={() => void takeSnapshot()} disabled={!active}>
              {ui.takeSnapshot}
            </Button>
            <span class="text-xs text-subtle">{ui.snapshotHint}</span>
          </div>
          {snapshotError && (
            <div class="mt-3">
              <Notice tone="danger">{snapshotError}</Notice>
            </div>
          )}
        </section>

        <aside class="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-6">
          <Field label={ui.camera} hint={ui.deviceHint}>
            <Select
              value={selectedDeviceId}
              onValue={chooseDevice}
              options={deviceOptions}
              disabled={!capabilities.test || !capabilities.selection || starting}
            />
          </Field>
          <div class="mt-5 space-y-4">
            <Toggle checked={mirrored} onChecked={setMirror} label={ui.mirror} />
            <Toggle checked={showGrid} onChecked={setGrid} label={ui.framingGrid} />
          </div>
          <div class="mt-5 grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.resolution} value={resolutionLabel(width, height, ui.unavailable)} emphasis />
            <Stat label={ui.frameRate} value={frameRateLabel(frameRate, ui.fps, ui.unavailable)} />
            <Stat label={ui.aspectRatio} value={aspectRatioLabel(width, height, ui.unavailable)} />
            <Stat
              label={ui.activeCamera}
              value={
                active
                  ? deviceLabel(selectedCamera?.label ?? sessionRef.current?.track.label ?? '', 0, ui.unnamedCamera)
                  : ui.unavailable
              }
            />
          </div>
          <div class="mt-4">
            <Notice tone={active ? 'success' : 'info'}>
              {active ? ui.activeNotice : starting ? ui.startingNotice : ui.ready}
            </Notice>
          </div>
          {deviceWarning && (
            <div class="mt-3">
              <Notice>{deviceWarning}</Notice>
            </div>
          )}
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
          <Kbd>P</Kbd> {ui.shortcutSnapshot}
        </span>
        <span>
          <Kbd>M</Kbd> {ui.shortcutMirror}
        </span>
        <span>
          <Kbd>G</Kbd> {ui.shortcutGrid}
        </span>
      </div>
    </Panel>
  );
}
