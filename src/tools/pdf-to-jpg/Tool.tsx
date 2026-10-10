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
  PageRangeOutOfBoundsError,
  PageRangeSyntaxError,
  parsePageSelection,
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

export default function PdfToJpg({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [resolution, setResolution] = useState<Resolution>(initialResolution);
  const [rangeInput, setRangeInput] = useState('');
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [output, setOutput] = useState<{ pageNumber: number; blob: Blob }[] | null>(null);
  const runId = useRef(0);

  useEffect(() => safeStorage.set(STORAGE_KEY, resolution), [resolution]);

  const clear = useCallback(() => {
    runId.current++;
    setFile(null);
    setBytes(null);
    setPageCount(null);
    setRangeInput('');
    setRangeError(null);
    setFileError(null);
    setProgress(null);
    setOutput(null);
  }, []);

  const loadFile = useCallback((picked: File) => {
    const id = ++runId.current;
    setFile(picked);
    setBytes(null);
    setPageCount(null);
    setRangeInput('');
    setRangeError(null);
    setOutput(null);
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
    setFileError(null);
    setProgress({ done: 0, total: 0 });
    void (async () => {
      const source = new Uint8Array(await picked.arrayBuffer());
      try {
        const { readPdfPageCount } = await import('./convert');
        // PDF.js can transfer its byte array to a worker, so retain `source` and inspect a copy.
        const count = await readPdfPageCount(source.slice(), picked.name);
        if (runId.current !== id) return;
        setBytes(source);
        setPageCount(count);
        setRangeInput(`1-${count}`);
        setProgress(null);
      } catch (caught) {
        if (runId.current !== id) return;
        setBytes(null);
        setPageCount(null);
        setProgress(null);
        setFileError(
          caught instanceof EncryptedPdfError
            ? 'encrypted'
            : caught instanceof PdfLimitError
              ? caught.limit
              : 'invalid',
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (!bytes || !file || !pageCount || fileError) return;
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
          : ui.rangeSyntaxError.replace('{part}', caught instanceof PageRangeSyntaxError ? caught.part : rangeInput),
      );
      return;
    }

    const id = ++runId.current;
    const timeout = setTimeout(() => {
      void (async () => {
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
              if (runId.current === id) setProgress({ done, total });
            },
          );
          if (runId.current !== id) return;
          setOutput(converted);
          setProgress(null);
        } catch (caught) {
          if (runId.current !== id) return;
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
    }, 250);
    return () => {
      clearTimeout(timeout);
      runId.current++;
    };
  }, [bytes, file, fileError, pageCount, rangeInput, resolution, ui]);

  const download = async () => {
    if (!output || !file || !pageCount) return;
    if (output.length === 1) {
      downloadBlob(output[0].blob, jpgFileName(file.name, output[0].pageNumber, pageCount));
      return;
    }
    const { zipSync } = await import('fflate');
    const entries: Record<string, Uint8Array> = {};
    for (const page of output) {
      entries[jpgFileName(file.name, page.pageNumber, pageCount)] = new Uint8Array(await page.blob.arrayBuffer());
    }
    downloadBlob(
      new Blob([zipSync(entries, { level: 0 }) as BlobPart], { type: 'application/zip' }),
      zipFileName(file.name),
    );
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
              <Button size="sm" variant="ghost" onClick={clear} aria-label={ui.remove}>
                {ui.remove}
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

          {output && file && pageCount && (
            <div class="mt-4 rounded-lg border border-line bg-surface-2 p-4" aria-live="polite">
              <p class="text-sm font-medium text-fg">{ui.resultReady}</p>
              <p class="mt-1 tabular text-sm text-muted">
                {ui.fileCount.replace('{n}', String(output.length))}
                {output.length > 1 ? ` · ${ui.zipReady}` : ''}
              </p>
              <Button class="mt-4" variant="primary" size="lg" onClick={() => void download()}>
                {output.length > 1 ? ui.downloadZip : ui.downloadJpg}
              </Button>
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
