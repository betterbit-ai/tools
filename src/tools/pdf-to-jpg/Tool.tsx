import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, Panel, Segmented, inputClass } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  EncryptedPdfError,
  fileExceedsLimit,
  InvalidPdfError,
  isPdfFile,
  jpgFileName,
  MAX_PAGE_SELECTION_CHARS,
  PageRangeOutOfBoundsError,
  PageRangeSyntaxError,
  PageRangeTooLongError,
  parsePageSelection,
  PdfConversionCancelledError,
  PdfLimitError,
  type Resolution,
  zipFileName,
} from './logic';

const STORAGE_KEY = 'tools:pdf-to-jpg:resolution';

type FileError = 'invalid' | 'encrypted' | 'file-size' | 'page-count' | 'page-pixels' | 'total-pixels' | 'failed';

function initialResolution(): Resolution {
  const saved = safeStorage.get(STORAGE_KEY);
  return saved === 'screen' || saved === 'standard' || saved === 'print' ? saved : 'standard';
}

function ownedArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

export default function PdfToJpg({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [loadedFileId, setLoadedFileId] = useState<number | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [resolution, setResolution] = useState<Resolution>(initialResolution);
  const [rangeInput, setRangeInput] = useState('');
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [downloadError, setDownloadError] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [output, setOutput] = useState<{ pageNumber: number; blob: Blob }[] | null>(null);
  const fileRunId = useRef(0);
  const conversionRunId = useRef(0);
  const readControllerRef = useRef<AbortController | null>(null);
  const conversionControllerRef = useRef<AbortController | null>(null);

  useEffect(() => safeStorage.set(STORAGE_KEY, resolution), [resolution]);

  const clear = useCallback(() => {
    readControllerRef.current?.abort();
    readControllerRef.current = null;
    conversionControllerRef.current?.abort();
    conversionControllerRef.current = null;
    fileRunId.current++;
    conversionRunId.current++;
    setFile(null);
    setBytes(null);
    setLoadedFileId(null);
    setPageCount(null);
    setRangeInput('');
    setRangeError(null);
    setFileError(null);
    setDownloadError(false);
    setDownloading(false);
    setCancelled(false);
    setProgress(null);
    setOutput(null);
  }, []);

  const loadFile = useCallback((picked: File) => {
    readControllerRef.current?.abort();
    readControllerRef.current = null;
    conversionControllerRef.current?.abort();
    conversionControllerRef.current = null;
    const id = ++fileRunId.current;
    conversionRunId.current++;
    setFile(picked);
    setBytes(null);
    setLoadedFileId(null);
    setPageCount(null);
    setRangeInput('');
    setRangeError(null);
    setOutput(null);
    setDownloadError(false);
    setDownloading(false);
    setCancelled(false);
    if (!isPdfFile(picked.name, picked.type)) {
      setProgress(null);
      setFileError('invalid');
      return;
    }
    if (fileExceedsLimit(picked.size)) {
      setProgress(null);
      setFileError('file-size');
      return;
    }
    const controller = new AbortController();
    readControllerRef.current = controller;
    setFileError(null);
    setProgress({ done: 0, total: 0 });
    const task = (async () => {
      try {
        const source = new Uint8Array(await picked.arrayBuffer());
        const { readPdfPageCount } = await import('./convert');
        // PDF.js can transfer its byte array to a worker, so retain `source` and inspect a copy.
        const count = await readPdfPageCount(source.slice(), picked.name, controller.signal);
        if (fileRunId.current !== id || controller.signal.aborted) return;
        setBytes(source);
        setLoadedFileId(id);
        setPageCount(count);
        setRangeInput(`1-${count}`);
        setProgress(null);
      } catch (caught) {
        if (fileRunId.current !== id || caught instanceof PdfConversionCancelledError || controller.signal.aborted)
          return;
        setBytes(null);
        setLoadedFileId(null);
        setPageCount(null);
        setProgress(null);
        setFileError(
          caught instanceof EncryptedPdfError
            ? 'encrypted'
            : caught instanceof PdfLimitError
              ? caught.limit
              : 'invalid',
        );
      } finally {
        if (readControllerRef.current === controller) readControllerRef.current = null;
      }
    })();
    void task;
  }, []);

  useEffect(
    () => () => {
      fileRunId.current++;
      conversionRunId.current++;
      readControllerRef.current?.abort();
      conversionControllerRef.current?.abort();
    },
    [],
  );

  useEffect(() => {
    if (!bytes || !file || !pageCount || fileError || cancelled || loadedFileId !== fileRunId.current) return;
    let selectedPages: number[];
    try {
      selectedPages = parsePageSelection(rangeInput, pageCount);
      setRangeError(null);
    } catch (caught) {
      setOutput(null);
      setProgress(null);
      setRangeError(
        caught instanceof PageRangeOutOfBoundsError
          ? ui.rangeOutOfBounds.replace('{page}', String(caught.page)).replace('{n}', String(caught.pageCount))
          : caught instanceof PageRangeTooLongError
            ? ui.rangeTooLong
            : ui.rangeSyntaxError.replace('{part}', caught instanceof PageRangeSyntaxError ? caught.part : rangeInput),
      );
      return;
    }

    const id = ++conversionRunId.current;
    const controller = new AbortController();
    conversionControllerRef.current?.abort();
    conversionControllerRef.current = controller;
    const timeout = setTimeout(() => {
      const task = (async () => {
        setOutput(null);
        setFileError(null);
        setProgress({ done: 0, total: selectedPages.length });
        try {
          const { convertPdfToJpg } = await import('./convert');
          const converted = await convertPdfToJpg(
            bytes.slice(),
            file.name,
            selectedPages,
            resolution,
            (done, total) => {
              if (conversionRunId.current === id && fileRunId.current === loadedFileId) {
                setProgress({ done, total });
              }
            },
            controller.signal,
          );
          if (conversionRunId.current !== id || fileRunId.current !== loadedFileId || controller.signal.aborted) return;
          setOutput(converted);
          setProgress(null);
        } catch (caught) {
          if (
            conversionRunId.current !== id ||
            fileRunId.current !== loadedFileId ||
            caught instanceof PdfConversionCancelledError ||
            controller.signal.aborted
          )
            return;
          setOutput(null);
          setProgress(null);
          setFileError(
            caught instanceof EncryptedPdfError
              ? 'encrypted'
              : caught instanceof InvalidPdfError
                ? 'invalid'
                : caught instanceof PdfLimitError
                  ? caught.limit
                  : 'failed',
          );
        }
      })();
      void task.finally(() => {
        if (conversionControllerRef.current === controller) conversionControllerRef.current = null;
      });
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
      if (conversionControllerRef.current === controller) conversionControllerRef.current = null;
      conversionRunId.current++;
    };
  }, [bytes, cancelled, file, loadedFileId, pageCount, rangeInput, resolution, ui]);

  const cancel = () => {
    readControllerRef.current?.abort();
    readControllerRef.current = null;
    conversionControllerRef.current?.abort();
    conversionControllerRef.current = null;
    if (!bytes) fileRunId.current++;
    conversionRunId.current++;
    setOutput(null);
    setProgress(null);
    setCancelled(true);
  };

  const resume = () => {
    if (!file) return;
    if (!bytes) {
      loadFile(file);
      return;
    }
    setCancelled(false);
  };

  const download = async () => {
    if (!output || !file || !pageCount) return;
    setDownloading(true);
    setDownloadError(false);
    try {
      if (output.length === 1) {
        downloadBlob(output[0].blob, jpgFileName(file.name, output[0].pageNumber, pageCount));
        return;
      }
      const { zip } = await import('fflate');
      const entries: Record<string, Uint8Array> = {};
      for (const page of output) {
        entries[jpgFileName(file.name, page.pageNumber, pageCount)] = new Uint8Array(await page.blob.arrayBuffer());
      }
      const archive = await new Promise<Uint8Array>((resolve, reject) => {
        zip(entries, { level: 0 }, (error, data) => (error ? reject(error) : resolve(data)));
      });
      downloadBlob(new Blob([ownedArrayBuffer(archive)], { type: 'application/zip' }), zipFileName(file.name));
    } catch {
      setDownloadError(true);
    } finally {
      setDownloading(false);
    }
  };

  const errorMessage =
    fileError === 'encrypted'
      ? ui.encryptedPdf
      : fileError === 'file-size'
        ? ui.fileSizeLimit
        : fileError === 'page-count'
          ? ui.pageCountLimit
          : fileError === 'page-pixels'
            ? ui.pagePixelLimit
            : fileError === 'total-pixels'
              ? ui.totalPixelLimit
              : fileError === 'failed'
                ? ui.conversionFailed
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
                  {pageCount !== null ? ` · ${ui.pageCount.replace('{n}', String(pageCount))}` : ''}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={progress ? cancel : clear}
                aria-label={progress ? ui.cancel : ui.remove}
              >
                {progress ? ui.cancel : ui.remove}
              </Button>
            </div>
          )}

          {progress && (
            <div class="mt-4">
              <Notice>
                {progress.total
                  ? ui.processingPages.replace('{n}', String(progress.done)).replace('{total}', String(progress.total))
                  : ui.reading}
              </Notice>
            </div>
          )}

          {fileError && (
            <div class="mt-4">
              <Notice tone="danger">{errorMessage}</Notice>
            </div>
          )}

          {cancelled && file && (
            <div class="mt-4">
              <Notice>{ui.cancelled}</Notice>
              <Button class="mt-3" variant="secondary" onClick={resume}>
                {ui.resume}
              </Button>
            </div>
          )}

          {output && file && pageCount && (
            <div class="mt-4 rounded-lg border border-line bg-surface-2 p-4" aria-live="polite">
              <p class="text-sm font-medium text-fg">{ui.resultReady}</p>
              <p class="mt-1 tabular text-sm text-muted">
                {ui.fileCount.replace('{n}', String(output.length))}
                {output.length > 1 ? ` · ${ui.zipReady}` : ''}
              </p>
              <Button class="mt-4" variant="primary" size="lg" disabled={downloading} onClick={() => void download()}>
                {downloading ? ui.downloading : output.length > 1 ? ui.downloadZip : ui.downloadJpg}
              </Button>
              {downloadError && <Notice tone="danger">{ui.downloadFailed}</Notice>}
            </div>
          )}

          {!file && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}
        </div>

        <div class="space-y-4">
          <Segmented
            label={ui.resolutionLabel}
            value={resolution}
            onValue={setResolution}
            options={[
              { value: 'screen', label: ui.screen },
              { value: 'standard', label: ui.standard },
              { value: 'print', label: ui.print },
            ]}
          />
          <p class="text-xs leading-5 text-subtle">
            {resolution === 'screen' ? ui.screenHint : resolution === 'standard' ? ui.standardHint : ui.printHint}
          </p>
          {pageCount !== null && pageCount > 0 && (
            <Field label={ui.rangeLabel} hint={ui.rangeHint}>
              <input
                class={inputClass}
                value={rangeInput}
                onInput={(event) => setRangeInput((event.currentTarget as HTMLInputElement).value)}
                placeholder={ui.rangePlaceholder}
                maxLength={MAX_PAGE_SELECTION_CHARS}
                aria-invalid={!!rangeError}
                spellcheck={false}
              />
            </Field>
          )}
          {rangeError && <Notice tone="danger">{rangeError}</Notice>}
          <Notice>{ui.privacyNote}</Notice>
        </div>
      </div>
    </Panel>
  );
}
