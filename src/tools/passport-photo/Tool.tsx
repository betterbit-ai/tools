import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Select, Stat } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  PHOTO_SPECS,
  cropForPhoto,
  cropNeedsUpscaling,
  getPhotoSpec,
  outputDimensions,
  outputName,
  printLayout,
  type PhotoSpecId,
} from './logic';
import { OutputFormatError, readDimensions, renderPhoto, renderPrintSheet, type PhotoProgress } from './photo';

interface Result {
  blob: Blob;
  url: string;
}

type Processing = 'preview' | 'sheet' | null;
type ErrorKind = 'unsupported' | 'format' | 'processing' | null;

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
  const [processing, setProcessing] = useState<Processing>(null);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<ErrorKind>(null);
  const [status, setStatus] = useState('');
  const [previewCancelled, setPreviewCancelled] = useState(false);

  const loadIdRef = useRef(0);
  const runIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<Result | null>(null);

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
  const needsUpscaling = cropNeedsUpscaling(crop, dimensions.width, dimensions.height);

  const replaceResult = useCallback((next: Result | null) => {
    setResult((previous) => {
      if (previous) URL.revokeObjectURL(previous.url);
      resultRef.current = next;
      return next;
    });
  }, []);

  const loadFile = useCallback(
    async (nextFile: File) => {
      const loadId = ++loadIdRef.current;
      abortRef.current?.abort();
      runIdRef.current++;
      replaceResult(null);
      setFile(null);
      setSource({ width: 0, height: 0 });
      setProcessing(null);
      setProgress('');
      setError(null);
      setStatus('');
      setPreviewCancelled(false);
      try {
        const nextSource = await readDimensions(nextFile);
        if (loadId !== loadIdRef.current) return;
        replaceResult(null);
        setFile(nextFile);
        setSource(nextSource);
        setZoom(100);
        setFocusX(50);
        setFocusY(50);
      } catch {
        if (loadId === loadIdRef.current) setError('unsupported');
      }
    },
    [replaceResult],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      if (files[0]) void loadFile(files[0]);
    },
    [loadFile],
  );

  useEffect(() => {
    if (!file || !crop.width || !crop.height || previewCancelled) return;
    const runId = ++runIdRef.current;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    replaceResult(null);
    setError(null);
    setStatus('');
    setProcessing('preview');
    setProgress(ui.preparing);

    void renderPhoto(file, crop, dimensions.width, dimensions.height, {
      signal: controller.signal,
      onProgress: (stage) => {
        if (runId === runIdRef.current) setProgress(progressText(stage, false, ui));
      },
    })
      .then((blob) => {
        if (!controller.signal.aborted && runId === runIdRef.current) {
          replaceResult({ blob, url: URL.createObjectURL(blob) });
        }
      })
      .catch((cause) => {
        if (!isAbortError(cause) && runId === runIdRef.current) {
          setError(cause instanceof OutputFormatError ? 'format' : 'processing');
        }
      })
      .finally(() => {
        if (runId === runIdRef.current) {
          abortRef.current = null;
          setProcessing(null);
          setProgress('');
        }
      });

    return () => {
      controller.abort();
      if (abortRef.current === controller) abortRef.current = null;
    };
  }, [file, crop, dimensions.width, dimensions.height, previewCancelled, replaceResult, ui]);

  useEffect(
    () => () => {
      loadIdRef.current++;
      runIdRef.current++;
      abortRef.current?.abort();
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    },
    [],
  );

  const setNumber = (setter: (value: number) => void, min: number, max: number) => (value: number | '') => {
    if (value !== '') {
      setPreviewCancelled(false);
      setter(Math.min(max, Math.max(min, value)));
    }
  };

  const selectSpec = (nextSpec: PhotoSpecId) => {
    setPreviewCancelled(false);
    setSpecId(nextSpec);
  };

  const downloadSheet = async () => {
    if (!file || !layout || processing || !result) return;
    const runId = ++runIdRef.current;
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setError(null);
    setStatus('');
    setProcessing('sheet');
    setProgress(ui.preparingSheet);
    try {
      const blob = await renderPrintSheet(file, crop, dimensions.width, dimensions.height, layout, {
        signal: controller.signal,
        onProgress: (stage) => {
          if (runId === runIdRef.current) setProgress(progressText(stage, true, ui));
        },
      });
      if (!controller.signal.aborted && runId === runIdRef.current) {
        downloadBlob(blob, outputName(file.name, specId, 'print-sheet'));
      }
    } catch (cause) {
      if (!isAbortError(cause) && runId === runIdRef.current) {
        setError(cause instanceof OutputFormatError ? 'format' : 'processing');
      }
    } finally {
      if (runId === runIdRef.current) {
        abortRef.current = null;
        setProcessing(null);
        setProgress('');
      }
    }
  };

  const cancel = () => {
    const wasPreview = processing === 'preview';
    abortRef.current?.abort();
    abortRef.current = null;
    runIdRef.current++;
    setProcessing(null);
    setProgress('');
    setPreviewCancelled(wasPreview);
    setStatus(wasPreview ? ui.previewCancelled : ui.sheetCancelled);
  };

  const replace = () => {
    loadIdRef.current++;
    runIdRef.current++;
    abortRef.current?.abort();
    abortRef.current = null;
    replaceResult(null);
    setFile(null);
    setSource({ width: 0, height: 0 });
    setProcessing(null);
    setProgress('');
    setPreviewCancelled(false);
    setStatus('');
    setError(null);
  };

  const lowResolution = ui.lowResolution
    .replace('{width}', String(Math.round(crop.width)))
    .replace('{height}', String(Math.round(crop.height)))
    .replace('{outputWidth}', String(dimensions.width))
    .replace('{outputHeight}', String(dimensions.height));

  return (
    <Panel>
      {!file ? (
        <>
          <Dropzone accept="image/*" onFiles={addFiles} title={ui.dropTitle} hint={ui.dropHint} />
          <div class="mt-4">
            <Notice>{ui.privacyNote}</Notice>
          </div>
          {error === 'unsupported' && (
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
                <div class="h-80 animate-pulse rounded-sm bg-surface" aria-label={progress || ui.preparing} />
              )}
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="lg"
                disabled={!result || processing !== null}
                onClick={() => result && downloadBlob(result.blob, outputName(file.name, specId, 'photo'))}
              >
                {ui.downloadPhoto}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                disabled={processing !== null || !layout || !result}
                onClick={() => void downloadSheet()}
              >
                {ui.downloadSheet}
              </Button>
              {processing && (
                <Button size="lg" onClick={cancel}>
                  {ui.cancel}
                </Button>
              )}
              {previewCancelled && !processing && (
                <Button size="lg" onClick={() => setPreviewCancelled(false)}>
                  {ui.resumePreview}
                </Button>
              )}
              <Button variant="ghost" onClick={replace}>
                {ui.replace}
              </Button>
            </div>
            {processing && (
              <p class="mt-3 text-sm text-muted" aria-live="polite">
                {progress}
              </p>
            )}
            {status && (
              <div class="mt-4">
                <Notice>{status}</Notice>
              </div>
            )}
            {needsUpscaling && (
              <div class="mt-4">
                <Notice>{lowResolution}</Notice>
              </div>
            )}
            <div class="mt-4">
              <Notice>{ui.rulesNotice}</Notice>
            </div>
            {error === 'format' && (
              <div class="mt-4">
                <Notice tone="danger">{ui.formatFailed}</Notice>
              </div>
            )}
            {error === 'processing' && (
              <div class="mt-4">
                <Notice tone="danger">{ui.processingFailed}</Notice>
              </div>
            )}
          </div>

          <div class="flex flex-col gap-5">
            <Field label={ui.presetLabel}>
              <Select<PhotoSpecId>
                value={specId}
                onValue={selectSpec}
                disabled={processing === 'sheet'}
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
              <NumberInput
                value={zoom}
                min={100}
                max={400}
                step={1}
                disabled={processing === 'sheet'}
                onValue={setNumber(setZoom, 100, 400)}
              />
            </Field>
            <div class="grid grid-cols-2 gap-3">
              <Field label={ui.horizontal} hint={ui.positionHint}>
                <NumberInput
                  value={focusX}
                  min={0}
                  max={100}
                  step={1}
                  disabled={processing === 'sheet'}
                  onValue={setNumber(setFocusX, 0, 100)}
                />
              </Field>
              <Field label={ui.vertical}>
                <NumberInput
                  value={focusY}
                  min={0}
                  max={100}
                  step={1}
                  disabled={processing === 'sheet'}
                  onValue={setNumber(setFocusY, 0, 100)}
                />
              </Field>
            </div>
            <p class="text-xs text-subtle">{ui.printHint}</p>
          </div>
        </div>
      )}
    </Panel>
  );
}

function progressText(stage: PhotoProgress, sheet: boolean, ui: UI): string {
  if (stage === 'decoding') return ui.decoding;
  if (stage === 'drawing') return sheet ? ui.layingOutSheet : ui.cropping;
  return sheet ? ui.encodingSheet : ui.encodingPhoto;
}

function isAbortError(cause: unknown): boolean {
  return cause instanceof DOMException && cause.name === 'AbortError';
}
