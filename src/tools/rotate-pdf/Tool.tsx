import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, cx, Dropzone, Notice, Panel } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import {
  EncryptedPdfError,
  fileExceedsLimit,
  InvalidPdfError,
  isPdfFile,
  PdfLimitError,
  PdfOperationCancelledError,
  previewRotation,
  rotateAll,
  rotatePage,
  rotatedPdfFileName,
  type Rotation,
} from './logic';
import type { UI } from './content';

type FileError = 'invalid' | 'encrypted' | 'file-size' | 'page-count' | 'failed';

export default function RotatePdf({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [sourceRotations, setSourceRotations] = useState<Rotation[]>([]);
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [reading, setReading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const runId = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const revokePreviews = useCallback((urls: string[]) => urls.forEach((url) => URL.revokeObjectURL(url)), []);

  const clear = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    runId.current++;
    setFile(null);
    setPreviewUrls((urls) => {
      revokePreviews(urls);
      return [];
    });
    setSourceRotations([]);
    setRotations([]);
    setFileError(null);
    setReading(false);
    setDownloading(false);
    setProgress(null);
  }, [revokePreviews]);

  useEffect(() => clear, [clear]);

  const loadFile = useCallback(
    (picked: File) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const id = ++runId.current;
      setFile(picked);
      setPreviewUrls((urls) => {
        revokePreviews(urls);
        return [];
      });
      setSourceRotations([]);
      setRotations([]);
      setFileError(null);
      setDownloading(false);
      setProgress(null);
      if (!isPdfFile(picked.name, picked.type)) {
        controllerRef.current = null;
        setReading(false);
        setFileError('invalid');
        return;
      }
      if (fileExceedsLimit(picked.size)) {
        controllerRef.current = null;
        setReading(false);
        setFileError('file-size');
        return;
      }

      setReading(true);
      void (async () => {
        try {
          const source = new Uint8Array(await picked.arrayBuffer());
          if (runId.current !== id || controller.signal.aborted) return;
          const { openPdfPreviews } = await import('./rotate');
          const opened = await openPdfPreviews(source, picked.name, {
            signal: controller.signal,
            onProgress: (done, total) => {
              if (runId.current === id) setProgress({ done, total });
            },
          });
          if (runId.current !== id) {
            revokePreviews(opened.previews.map((preview) => preview.url));
            return;
          }
          setPreviewUrls(opened.previews.map((preview) => preview.url));
          setSourceRotations(opened.sourceRotations);
          setRotations(opened.sourceRotations);
          setReading(false);
          setProgress(null);
        } catch (caught) {
          if (runId.current !== id) return;
          setReading(false);
          setProgress(null);
          if (caught instanceof PdfOperationCancelledError || controller.signal.aborted) return;
          setFileError(
            caught instanceof EncryptedPdfError
              ? 'encrypted'
              : caught instanceof PdfLimitError
                ? 'page-count'
                : caught instanceof InvalidPdfError
                  ? 'invalid'
                  : 'failed',
          );
        } finally {
          if (controllerRef.current === controller) controllerRef.current = null;
        }
      })();
    },
    [revokePreviews],
  );

  const download = async () => {
    if (!file || rotations.length === 0 || downloading) return;
    const id = ++runId.current;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setDownloading(true);
    setFileError(null);
    try {
      const source = new Uint8Array(await file.arrayBuffer());
      if (runId.current !== id || controller.signal.aborted) return;
      const { writeRotatedPdfOffMainThread } = await import('./rotate');
      const rotated = await writeRotatedPdfOffMainThread(source, file.name, rotations, controller.signal);
      if (runId.current !== id || controller.signal.aborted) return;
      downloadBlob(new Blob([rotated as BlobPart], { type: 'application/pdf' }), rotatedPdfFileName(file.name));
    } catch (caught) {
      if (runId.current !== id || caught instanceof PdfOperationCancelledError || controller.signal.aborted) return;
      setFileError(caught instanceof EncryptedPdfError ? 'encrypted' : 'failed');
    } finally {
      if (runId.current === id) setDownloading(false);
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  };

  const errorMessage =
    fileError === 'encrypted'
      ? ui.encryptedPdf
      : fileError === 'file-size'
        ? ui.fileSizeLimit
        : fileError === 'page-count'
          ? ui.pageCountLimit
          : fileError === 'failed'
            ? ui.rotateFailed
            : ui.invalidPdf;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <Dropzone
            accept="application/pdf,.pdf"
            onFiles={(files) => files[0] && loadFile(files[0])}
            title={ui.dropTitle}
            hint={ui.dropHint}
            compact={!!file}
          />

          {file && (
            <div class="mt-4 flex items-center gap-3 rounded-lg border border-line p-3 text-sm">
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-fg">{file.name}</p>
                <p class="tabular text-muted" aria-live="polite">
                  {formatBytes(file.size, locale)}
                  {rotations.length
                    ? ` · ${
                        rotations.length === 1 ? ui.pageCountOne : ui.pageCount.replace('{n}', String(rotations.length))
                      }`
                    : ''}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={clear}
                aria-label={reading || downloading ? ui.cancel : ui.remove}
              >
                {reading || downloading ? ui.cancel : ui.remove}
              </Button>
            </div>
          )}

          {reading && (
            <div class="mt-4">
              <Notice>
                {progress
                  ? ui.previewProgress.replace('{n}', String(progress.done)).replace('{total}', String(progress.total))
                  : ui.reading}
              </Notice>
            </div>
          )}

          {fileError && (
            <div class="mt-4">
              <Notice tone="danger">{errorMessage}</Notice>
            </div>
          )}

          {previewUrls.length > 0 && (
            <ol class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label={ui.pagesLabel}>
              {previewUrls.map((url, index) => {
                const turn = previewRotation(rotations[index], sourceRotations[index]);
                return (
                  <li key={url} class="rounded-lg border border-line bg-surface-2 p-2">
                    <div class="flex items-center justify-between gap-2">
                      <p class="text-xs font-medium tabular text-fg">
                        {ui.pageNumber.replace('{n}', String(index + 1))}
                      </p>
                      {turn !== 0 && <p class="text-xs tabular text-accent">{turn}°</p>}
                    </div>
                    <div class="mt-2 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-surface p-2">
                      <img
                        src={url}
                        alt={ui.pagePreview.replace('{n}', String(index + 1))}
                        class={cx(
                          'max-h-full max-w-full object-contain transition-transform',
                          turn === 90 && 'rotate-90',
                          turn === 180 && 'rotate-180',
                          turn === 270 && '-rotate-90',
                        )}
                      />
                    </div>
                    <div class="mt-2 grid grid-cols-2 gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        aria-label={ui.rotatePageLeft.replace('{n}', String(index + 1))}
                        onClick={() => setRotations((current) => rotatePage(current, index, -90))}
                      >
                        {ui.rotateLeft}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        aria-label={ui.rotatePageRight.replace('{n}', String(index + 1))}
                        onClick={() => setRotations((current) => rotatePage(current, index, 90))}
                      >
                        {ui.rotateRight}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {!file && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-fg">{ui.allPagesLabel}</p>
            <p class="mt-1 text-xs text-subtle">{ui.allPagesHint}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={rotations.length === 0}
                onClick={() => setRotations((current) => rotateAll(current, -90))}
              >
                {ui.rotateAllLeft}
              </Button>
              <Button
                size="sm"
                disabled={rotations.length === 0}
                onClick={() => setRotations((current) => rotateAll(current, 90))}
              >
                {ui.rotateAllRight}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={rotations.length === 0}
                onClick={() => setRotations(sourceRotations)}
              >
                {ui.reset}
              </Button>
            </div>
          </div>

          <div class="border-t border-line pt-4">
            <p class="text-sm text-muted">{ui.downloadHint}</p>
            <Button
              class="mt-3 w-full"
              variant="primary"
              size="lg"
              disabled={rotations.length === 0 || downloading}
              onClick={() => void download()}
            >
              {downloading ? ui.saving : ui.download}
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
