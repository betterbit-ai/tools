import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Segmented, Select, TextInput } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  DEFAULT_OPTIONS,
  EncryptedPdfError,
  MAX_FILE_BYTES,
  PdfWatermarkCancelledError,
  fileExceedsLimit,
  isPdfFile,
  normalizeOptions,
  selectedPageIndexes,
  watermarkedPdfFileName,
  type WatermarkOptions,
} from './logic';

type WatermarkProgress = { current: number; total: number };

type FileError = 'invalid' | 'size' | 'encrypted';
const SETTINGS_KEY = 'tools:watermark-pdf:settings';

function storedOptions(): WatermarkOptions {
  try {
    const stored = safeStorage.get(SETTINGS_KEY);
    return stored ? normalizeOptions(JSON.parse(stored)) : DEFAULT_OPTIONS;
  } catch {
    return DEFAULT_OPTIONS;
  }
}

export default function WatermarkPdf({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [options, setOptions] = useState<WatermarkOptions>(storedOptions);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<WatermarkProgress | null>(null);
  const [failure, setFailure] = useState(false);
  const [complete, setComplete] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const runId = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => safeStorage.set(SETTINGS_KEY, JSON.stringify(options)), [options]);
  useEffect(
    () => () => {
      runId.current++;
      abortRef.current?.abort();
    },
    [],
  );

  const stop = useCallback(() => {
    runId.current++;
    abortRef.current?.abort();
    abortRef.current = null;
    setProcessing(false);
    setProgress(null);
  }, []);

  const clear = useCallback(() => {
    stop();
    setFile(null);
    setImage(null);
    setPageCount(0);
    setFileError(null);
    setFailure(false);
    setComplete(false);
    setCancelled(false);
  }, [stop]);

  const loadPdf = useCallback(
    async (picked: File) => {
      stop();
      setFile(picked);
      setPageCount(0);
      setFileError(null);
      setFailure(false);
      setComplete(false);
      setCancelled(false);
      if (!isPdfFile(picked.name, picked.type)) {
        setFileError('invalid');
        return;
      }
      if (fileExceedsLimit(picked.size)) {
        setFileError('size');
        return;
      }
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const { inspectPdf } = await import('./watermark');
        const count = await inspectPdf(picked, controller.signal);
        if (controller.signal.aborted) return;
        if (count < 1) {
          setFileError('invalid');
          return;
        }
        setPageCount(count);
      } catch (caught) {
        if (controller.signal.aborted || caught instanceof PdfWatermarkCancelledError) return;
        setFileError(caught instanceof EncryptedPdfError ? 'encrypted' : 'invalid');
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [stop],
  );

  const loadImage = (files: File[]) => {
    const picked = files[0];
    if (!picked) return;
    setImage(picked);
    setFailure(false);
    setComplete(false);
  };

  const update = <K extends keyof WatermarkOptions>(key: K, value: WatermarkOptions[K]) => {
    setOptions((previous) => normalizeOptions({ ...previous, [key]: value }));
    setFailure(false);
    setComplete(false);
  };

  const selection = selectedPageIndexes(options, pageCount);
  const textReady = options.mode !== 'text' || options.text.length > 0;
  const imageReady = options.mode !== 'image' || !!image;
  const canApply = !!file && !fileError && pageCount > 0 && textReady && imageReady && !selection.error && !processing;

  const apply = async () => {
    if (!file || !canApply || abortRef.current) return;
    const id = ++runId.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setProcessing(true);
    setFailure(false);
    setComplete(false);
    setCancelled(false);
    try {
      const { applyWatermark } = await import('./watermark');
      const bytes = await applyWatermark(file, options, selection.indexes, {
        image,
        signal: controller.signal,
        onProgress: (next) => {
          if (runId.current === id) setProgress(next);
        },
      });
      if (controller.signal.aborted || runId.current !== id) return;
      downloadBlob(new Blob([bytes as BlobPart], { type: 'application/pdf' }), watermarkedPdfFileName(file.name));
      setComplete(true);
    } catch (caught) {
      if (controller.signal.aborted || caught instanceof PdfWatermarkCancelledError || runId.current !== id) return;
      setFailure(true);
    } finally {
      if (runId.current === id) {
        abortRef.current = null;
        setProcessing(false);
        setProgress(null);
      }
    }
  };

  const cancel = () => {
    if (!processing) return;
    stop();
    setFailure(false);
    setComplete(false);
    setCancelled(true);
  };

  const fileErrorMessage =
    fileError === 'size' ? ui.fileSizeLimit : fileError === 'encrypted' ? ui.encryptedPdf : ui.invalidPdf;
  const rangeHint = selection.error
    ? selection.error === 'range'
      ? ui.pageRangeOutOfBounds.replace('{n}', formatNumber(pageCount, locale))
      : ui.pageRangeInvalid
    : ui.pageRangeHint;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0 space-y-4">
          <Dropzone
            accept="application/pdf,.pdf"
            onFiles={(files) => files[0] && void loadPdf(files[0])}
            title={ui.dropTitle}
            hint={ui.dropHint}
            compact={!!file}
          />

          {file && (
            <div class="flex items-center gap-3 rounded-lg border border-line p-3 text-sm">
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-fg">{file.name}</p>
                <p class="tabular text-muted">
                  {formatBytes(file.size, locale)}
                  {pageCount > 0 && ` · ${formatNumber(pageCount, locale)} ${ui.pages}`}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={clear} aria-label={ui.remove}>
                {ui.remove}
              </Button>
            </div>
          )}

          {fileError && <Notice tone="danger">{fileErrorMessage}</Notice>}
          {failure && <Notice tone="danger">{ui.processingError}</Notice>}
          {cancelled && <Notice>{ui.cancelled}</Notice>}
          {complete && <Notice tone="success">{ui.complete}</Notice>}
        </div>

        <div class="space-y-4">
          <Field label={ui.modeLabel}>
            <Segmented
              label={ui.modeLabel}
              value={options.mode}
              onValue={(value) => update('mode', value)}
              options={[
                { value: 'text', label: ui.modeText },
                { value: 'image', label: ui.modeImage },
              ]}
              disabled={processing}
            />
          </Field>

          {options.mode === 'text' ? (
            <Field label={ui.textLabel} hint={ui.textHint}>
              <TextInput
                value={options.text}
                maxLength={120}
                disabled={processing}
                onInput={(event) => update('text', (event.currentTarget as HTMLInputElement).value)}
              />
            </Field>
          ) : (
            <Dropzone
              accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
              onFiles={loadImage}
              title={image ? image.name : ui.imageDropTitle}
              hint={image ? ui.imageReady : ui.imageDropHint}
              compact
            />
          )}

          <Field label={ui.layoutLabel}>
            <Segmented
              label={ui.layoutLabel}
              value={options.layout}
              onValue={(value) => update('layout', value)}
              options={[
                { value: 'single', label: ui.layoutSingle },
                { value: 'tile', label: ui.layoutTile },
              ]}
              disabled={processing}
            />
          </Field>

          {options.layout === 'single' && (
            <Field label={ui.positionLabel}>
              <Select
                value={options.position}
                onValue={(value) => update('position', value)}
                disabled={processing}
                options={[
                  { value: 'top-left', label: ui.positionTopLeft },
                  { value: 'top', label: ui.positionTop },
                  { value: 'top-right', label: ui.positionTopRight },
                  { value: 'left', label: ui.positionLeft },
                  { value: 'center', label: ui.positionCenter },
                  { value: 'right', label: ui.positionRight },
                  { value: 'bottom-left', label: ui.positionBottomLeft },
                  { value: 'bottom', label: ui.positionBottom },
                  { value: 'bottom-right', label: ui.positionBottomRight },
                ]}
              />
            </Field>
          )}

          <div class="grid grid-cols-2 gap-3">
            <Field label={ui.sizeLabel} hint={ui.sizeHint}>
              <NumberInput
                value={options.size}
                min={5}
                max={80}
                disabled={processing}
                onValue={(value) => update('size', Number(value))}
              />
            </Field>
            <Field label={ui.opacityLabel} hint={ui.opacityHint}>
              <NumberInput
                value={options.opacity}
                min={0}
                max={100}
                disabled={processing}
                onValue={(value) => update('opacity', Number(value))}
              />
            </Field>
          </div>

          <Field label={ui.rotationLabel}>
            <NumberInput
              value={options.rotation}
              min={-90}
              max={90}
              disabled={processing}
              onValue={(value) => update('rotation', Number(value))}
            />
          </Field>

          <Field label={ui.pageLabel}>
            <Segmented
              label={ui.pageLabel}
              value={options.pageMode}
              onValue={(value) => update('pageMode', value)}
              options={[
                { value: 'all', label: ui.pageAll },
                { value: 'odd', label: ui.pageOdd },
                { value: 'even', label: ui.pageEven },
                { value: 'custom', label: ui.pageCustom },
              ]}
              disabled={processing}
            />
          </Field>
          {options.pageMode === 'custom' && (
            <Field label={ui.pageRangeLabel} hint={rangeHint}>
              <TextInput
                value={options.pageRanges}
                disabled={processing}
                placeholder={ui.pageRangePlaceholder}
                onInput={(event) => update('pageRanges', (event.currentTarget as HTMLInputElement).value)}
              />
            </Field>
          )}

          {processing ? (
            <div class="space-y-3" aria-live="polite">
              <Notice>
                {progress
                  ? ui.progress
                      .replace('{current}', String(progress.current))
                      .replace('{total}', String(progress.total))
                  : ui.preparing}
              </Notice>
              <Button variant="danger" size="lg" class="w-full" onClick={cancel}>
                {ui.cancel}
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="lg" class="w-full" disabled={!canApply} onClick={apply}>
              {ui.apply}
            </Button>
          )}
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-4">
        <Notice>{ui.privacyNote.replace('{max}', formatBytes(MAX_FILE_BYTES, locale))}</Notice>
      </div>
    </Panel>
  );
}
