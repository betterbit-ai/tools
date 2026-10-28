import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, Panel, Segmented, Stat, Toggle } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { encodeImages, ImageDecodeError } from './encode';
import { gifFilename, MAX_FRAMES, planGif, type GifSettings } from './logic';

interface Frame {
  id: number;
  file: File;
  url: string;
  width: number;
  height: number;
}

const SETTINGS_KEY = 'tools:gif-maker:settings';
const DEFAULT_SETTINGS: GifSettings = { width: 480, delay: 500, fit: 'contain', loop: true };
let nextId = 1;

function loadSettings(): GifSettings {
  try {
    const stored = JSON.parse(safeStorage.get(SETTINGS_KEY) ?? '{}') as Partial<GifSettings>;
    return {
      width: [320, 480, 640].includes(stored.width ?? 0) ? stored.width! : DEFAULT_SETTINGS.width,
      delay: [100, 250, 500, 1_000].includes(stored.delay ?? 0) ? stored.delay! : DEFAULT_SETTINGS.delay,
      fit: stored.fit === 'cover' ? 'cover' : 'contain',
      loop: stored.loop !== false,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function GifMaker({ locale, ui }: ToolProps<UI>) {
  const [frames, setFrames] = useState<Frame[]>([]);
  const [settings, setSettings] = useState<GifSettings>(loadSettings);
  const [result, setResult] = useState<{ blob: Blob; url: string; name: string } | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [notice, setNotice] = useState<{ tone: 'danger' | 'info'; message: string } | null>(null);
  const jobRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const framesRef = useRef(frames);
  framesRef.current = frames;

  useEffect(() => safeStorage.set(SETTINGS_KEY, JSON.stringify(settings)), [settings]);
  useEffect(
    () => () => {
      controllerRef.current?.abort();
      for (const frame of framesRef.current) URL.revokeObjectURL(frame.url);
    },
    [],
  );
  useEffect(() => () => result && URL.revokeObjectURL(result.url), [result]);

  const clearResult = () => {
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return null;
    });
  };

  const addFiles = useCallback(
    async (files: File[]) => {
      const remaining = Math.max(0, MAX_FRAMES - framesRef.current.length);
      const accepted = files.slice(0, remaining);
      if (accepted.length < files.length)
        setNotice({ tone: 'info', message: ui.limit.replace('{max}', String(MAX_FRAMES)) });
      if (!accepted.length) return;
      const decoded = await Promise.all(
        accepted.map(async (file) => {
          try {
            const bitmap = await createImageBitmap(file);
            const frame = {
              id: nextId++,
              file,
              url: URL.createObjectURL(file),
              width: bitmap.width,
              height: bitmap.height,
            };
            bitmap.close();
            return frame;
          } catch {
            return null;
          }
        }),
      );
      const readable = decoded.filter((frame): frame is Frame => frame !== null);
      if (readable.length !== accepted.length) setNotice({ tone: 'danger', message: ui.unsupported });
      if (readable.length) {
        clearResult();
        setFrames((previous) => [...previous, ...readable]);
      }
    },
    [ui.limit, ui.unsupported],
  );

  const remove = (id: number) => {
    const frame = framesRef.current.find((item) => item.id === id);
    if (frame) URL.revokeObjectURL(frame.url);
    clearResult();
    setFrames((previous) => previous.filter((item) => item.id !== id));
  };

  const move = (id: number, offset: -1 | 1) => {
    clearResult();
    setFrames((previous) => {
      const index = previous.findIndex((item) => item.id === id);
      const target = index + offset;
      if (index < 0 || target < 0 || target >= previous.length) return previous;
      const reordered = [...previous];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      return reordered;
    });
  };

  const clear = () => {
    controllerRef.current?.abort();
    clearResult();
    setProgress(null);
    setNotice(null);
    for (const frame of framesRef.current) URL.revokeObjectURL(frame.url);
    setFrames([]);
  };

  const update = <K extends keyof GifSettings>(key: K, value: GifSettings[K]) => {
    clearResult();
    setNotice(null);
    setSettings((previous) => ({ ...previous, [key]: value }));
  };

  const frameKey = frames.map((frame) => frame.id).join(',');
  const plan = useMemo(() => (frames[0] ? planGif(frames[0], frames.length, settings) : null), [frames, settings]);
  useEffect(() => {
    if (!plan || frames.length < 2) return;
    const job = ++jobRef.current;
    const controller = new AbortController();
    controllerRef.current?.abort();
    controllerRef.current = controller;
    const timer = setTimeout(async () => {
      setProgress({ current: 0, total: plan.frames });
      try {
        const blob = await encodeImages(
          frames.map((frame) => frame.file),
          plan,
          { signal: controller.signal, onProgress: (current, total) => setProgress({ current, total }) },
        );
        if (controller.signal.aborted || job !== jobRef.current) return;
        const name = gifFilename(frames[0].file.name);
        setResult((previous) => {
          if (previous) URL.revokeObjectURL(previous.url);
          return { blob, url: URL.createObjectURL(blob), name };
        });
      } catch (error) {
        if (!controller.signal.aborted && job === jobRef.current) {
          setNotice({ tone: 'danger', message: error instanceof ImageDecodeError ? ui.unsupported : ui.failed });
        }
      } finally {
        if (job === jobRef.current) setProgress(null);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [frameKey, frames, plan, settings, ui.failed, ui.unsupported]);

  const output = plan
    ? ui.outputValue
        .replace('{width}', String(plan.width))
        .replace('{height}', String(plan.height))
        .replace('{frames}', String(plan.frames))
    : '';
  const duration = plan ? formatNumber((plan.frames * plan.delay) / 1_000, locale, 1) : '0';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0 space-y-4">
          <Dropzone
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            onFiles={addFiles}
            title={frames.length ? ui.addMore : ui.dropTitle}
            hint={frames.length ? ui.dropHint : `${ui.dropHint} · ${ui.privacy}`}
            compact={frames.length > 0}
          />
          {notice && <Notice tone={notice.tone}>{notice.message}</Notice>}
          {!frames.length && <p class="text-sm text-muted">{ui.needMore}</p>}
          {frames.length > 0 && (
            <ol class="divide-y divide-line rounded-lg border border-line">
              {frames.map((frame, index) => (
                <li key={frame.id} class="flex flex-wrap items-center gap-3 p-3">
                  <img src={frame.url} alt="" class="size-14 shrink-0 rounded-md border border-line object-cover" />
                  <div class="min-w-0 flex-1 text-sm">
                    <p class="truncate font-medium text-fg">{frame.file.name}</p>
                    <p class="tabular text-muted">
                      {ui.frame.replace('{number}', String(index + 1))} · {frame.width}×{frame.height}
                    </p>
                  </div>
                  <div class="flex w-full flex-wrap justify-start gap-1 sm:ml-auto sm:w-auto sm:justify-end">
                    <Button size="sm" variant="ghost" disabled={index === 0} onClick={() => move(frame.id, -1)}>
                      {ui.moveEarlier}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={index === frames.length - 1}
                      onClick={() => move(frame.id, 1)}
                    >
                      {ui.moveLater}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(frame.id)}>
                      {ui.remove}
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div class="space-y-4 border-t border-line pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          <Field label={ui.size}>
            <Segmented
              label={ui.size}
              value={String(settings.width)}
              onValue={(value) => update('width', Number(value))}
              options={[
                { value: '320', label: ui.sizeSmall },
                { value: '480', label: ui.sizeMedium },
                { value: '640', label: ui.sizeLarge },
              ]}
            />
          </Field>
          <Field label={ui.speed}>
            <Segmented
              label={ui.speed}
              value={String(settings.delay)}
              onValue={(value) => update('delay', Number(value))}
              options={[
                { value: '100', label: ui.speedFast },
                { value: '250', label: ui.speedMedium },
                { value: '500', label: ui.speedStandard },
                { value: '1000', label: ui.speedSlow },
              ]}
            />
          </Field>
          <Field label={ui.fit}>
            <Segmented
              label={ui.fit}
              value={settings.fit}
              onValue={(value) => update('fit', value)}
              options={[
                { value: 'contain', label: ui.fitContain },
                { value: 'cover', label: ui.fitCover },
              ]}
            />
          </Field>
          <Toggle checked={settings.loop} onChecked={(value) => update('loop', value)} label={ui.loop} />
          {plan && <Stat label={ui.output} value={output} emphasis />}
          {progress && (
            <Notice>
              {ui.building.replace('{current}', String(progress.current)).replace('{total}', String(progress.total))}
            </Notice>
          )}
          {result && !progress && (
            <div class="space-y-3 rounded-lg border border-line bg-surface-2 p-3" aria-live="polite">
              <img
                src={result.url}
                alt={ui.ready}
                class="aspect-video w-full rounded-sm border border-line object-contain"
              />
              <div>
                <p class="font-medium text-fg">{ui.ready}</p>
                <p class="tabular text-sm text-muted">
                  {ui.resultSize
                    .replace('{size}', formatBytes(result.blob.size, locale))
                    .replace('{duration}', duration)}
                </p>
              </div>
              <Button variant="primary" class="w-full" onClick={() => downloadBlob(result.blob, result.name)}>
                {ui.download}
              </Button>
            </div>
          )}
          {frames.length > 0 && (
            <Button variant="ghost" onClick={clear}>
              {ui.replace}
            </Button>
          )}
        </div>
      </div>
    </Panel>
  );
}
