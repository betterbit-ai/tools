import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Select, Stat } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  PHOTO_SPECS,
  cropForPhoto,
  getPhotoSpec,
  outputDimensions,
  outputName,
  printLayout,
  type PhotoSpecId,
} from './logic';
import { readDimensions, renderPhoto, renderPrintSheet } from './photo';

interface Result {
  blob: Blob;
  url: string;
}

const STORAGE_KEY = 'tools:passport-photo:spec';

export default function PassportPhoto({ locale, ui }: ToolProps<UI>) {
  const defaultSpec: PhotoSpecId = locale === 'ko' ? 'korea-passport' : 'us-passport';
  const [specId, setSpecId] = useState<PhotoSpecId>(defaultSpec);
  const [file, setFile] = useState<File | null>(null);
  const [source, setSource] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(100);
  const [focusX, setFocusX] = useState(50);
  const [focusY, setFocusY] = useState(50);
  const [result, setResult] = useState<Result | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = safeStorage.get(STORAGE_KEY) as PhotoSpecId | null;
    if (saved && PHOTO_SPECS.some((spec) => spec.id === saved)) setSpecId(saved);
  }, []);

  useEffect(() => safeStorage.set(STORAGE_KEY, specId), [specId]);

  const spec = getPhotoSpec(specId);
  const dimensions = outputDimensions(spec);
  const crop = useMemo(
    () => cropForPhoto(source.width, source.height, spec, zoom, focusX, focusY),
    [source.width, source.height, spec, zoom, focusX, focusY],
  );
  const layout = useMemo(() => printLayout(dimensions.width, dimensions.height), [dimensions.width, dimensions.height]);

  const releaseResult = (next: Result | null) =>
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      return next;
    });

  const loadFile = useCallback(async (nextFile: File) => {
    try {
      const nextSource = await readDimensions(nextFile);
      setFile(nextFile);
      setSource(nextSource);
      setZoom(100);
      setFocusX(50);
      setFocusY(50);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files[0]) void loadFile(files[0]);
    },
    [loadFile],
  );

  useEffect(() => {
    if (!file || !crop.width || !crop.height) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      setProcessing(true);
      try {
        const blob = await renderPhoto(file, crop, dimensions.width, dimensions.height);
        if (!cancelled) releaseResult({ blob, url: URL.createObjectURL(blob) });
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setProcessing(false);
      }
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [file, crop, dimensions.width, dimensions.height]);

  useEffect(
    () => () => {
      if (result) URL.revokeObjectURL(result.url);
    },
    [result],
  );

  const setNumber = (setter: (value: number) => void, min: number, max: number) => (value: number | '') => {
    if (value !== '') setter(Math.min(max, Math.max(min, value)));
  };

  const downloadSheet = async () => {
    if (!file || !layout) return;
    try {
      setProcessing(true);
      const blob = await renderPrintSheet(file, crop, dimensions.width, dimensions.height, layout);
      downloadBlob(blob, outputName(file.name, specId, 'print-sheet'));
    } catch {
      setError(true);
    } finally {
      setProcessing(false);
    }
  };

  const replace = () => {
    releaseResult(null);
    setFile(null);
    setSource({ width: 0, height: 0 });
    setError(false);
  };

  return (
    <Panel>
      {!file ? (
        <>
          <Dropzone accept="image/*" onFiles={addFiles} title={ui.dropTitle} hint={ui.dropHint} />
          <div class="mt-4">
            <Notice>{ui.privacyNote}</Notice>
          </div>
          {error && (
            <div class="mt-4">
              <Notice tone="danger">{ui.unsupported}</Notice>
            </div>
          )}
        </>
      ) : (
        <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div class="min-w-0">
            <div class="mx-auto max-w-sm overflow-hidden rounded-lg border border-line bg-surface-2 p-3">
              {result ? (
                <img src={result.url} alt={ui.previewAlt} class="mx-auto max-h-[440px] max-w-full rounded-sm" />
              ) : (
                <div class="h-80 animate-pulse rounded-sm bg-surface" aria-label={ui.processing} />
              )}
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                disabled={!result || processing}
                onClick={() => result && downloadBlob(result.blob, outputName(file.name, specId, 'photo'))}
              >
                {ui.downloadPhoto}
              </Button>
              <Button variant="secondary" size="lg" disabled={processing || !layout} onClick={downloadSheet}>
                {ui.downloadSheet}
              </Button>
              <Button variant="ghost" onClick={replace}>
                {ui.replace}
              </Button>
            </div>
            {processing && (
              <p class="mt-3 text-sm text-muted" aria-live="polite">
                {ui.processing}
              </p>
            )}
            <div class="mt-4">
              <Notice>{ui.rulesNotice}</Notice>
            </div>
            {error && (
              <div class="mt-4">
                <Notice tone="danger">{ui.unsupported}</Notice>
              </div>
            )}
          </div>

          <div class="flex flex-col gap-5">
            <Field label={ui.presetLabel}>
              <Select<PhotoSpecId>
                value={specId}
                onValue={setSpecId}
                options={PHOTO_SPECS.map((option) => ({
                  value: option.id,
                  label: ui[`preset_${option.id.replace(/-/g, '_')}` as keyof UI],
                }))}
              />
            </Field>
            <div class="grid grid-cols-2 gap-3" aria-live="polite">
              <Stat label={ui.size} value={`${spec.widthMm} × ${spec.heightMm} mm`} />
              <Stat label={ui.pixels} value={`${dimensions.width} × ${dimensions.height}`} />
            </div>
            {layout && (
              <Stat label={ui.printCopies.replace('{n}', String(layout.count))} value={ui.sheetSize} emphasis />
            )}
            <Field label={ui.zoom} hint={ui.zoomHint}>
              <NumberInput value={zoom} min={100} max={400} step={1} onValue={setNumber(setZoom, 100, 400)} />
            </Field>
            <div class="grid grid-cols-2 gap-3">
              <Field label={ui.horizontal} hint={ui.positionHint}>
                <NumberInput value={focusX} min={0} max={100} step={1} onValue={setNumber(setFocusX, 0, 100)} />
              </Field>
              <Field label={ui.vertical}>
                <NumberInput value={focusY} min={0} max={100} step={1} onValue={setNumber(setFocusY, 0, 100)} />
              </Field>
            </div>
            <p class="text-xs text-subtle">{ui.printHint}</p>
          </div>
        </div>
      )}
    </Panel>
  );
}
