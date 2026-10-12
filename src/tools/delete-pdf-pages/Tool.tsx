import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, cx, Dropzone, Field, Notice, Panel, Stat, TextInput } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  deletedPdfFileName,
  EncryptedPdfError,
  fileExceedsLimit,
  formatPageSelection,
  InvalidPdfError,
  isPdfFile,
  PageRangeOutOfBoundsError,
  PageRangeSyntaxError,
  parsePageSelection,
  PdfLimitError,
  remainingPageCount,
  toggleDeletedPage,
} from './logic';

type FileError = 'invalid' | 'encrypted' | 'file-size' | 'page-count' | 'failed';

export default function DeletePdfPages({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState('');
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const runId = useRef(0);

  const revokePreviews = useCallback((urls: string[]) => urls.forEach((url) => URL.revokeObjectURL(url)), []);

  const clear = useCallback(() => {
    runId.current++;
    setFile(null);
    setBytes(null);
    setPreviewUrls((urls) => {
      revokePreviews(urls);
      return [];
    });
    setDeletedPages([]);
    setRangeInput('');
    setRangeError(null);
    setFileError(null);
    setReading(false);
    setSaving(false);
  }, [revokePreviews]);

  useEffect(() => clear, [clear]);

  const loadFile = useCallback(
    (picked: File) => {
      const id = ++runId.current;
      setFile(picked);
      setBytes(null);
      setPreviewUrls((urls) => {
        revokePreviews(urls);
        return [];
      });
      setDeletedPages([]);
      setRangeInput('');
      setRangeError(null);
      setFileError(null);
      setSaving(false);
      if (!isPdfFile(picked.name, picked.type)) {
        setReading(false);
        setFileError('invalid');
        return;
      }
      if (fileExceedsLimit(picked.size)) {
        setReading(false);
        setFileError('file-size');
        return;
      }

      setReading(true);
      void (async () => {
        try {
          const source = new Uint8Array(await picked.arrayBuffer());
          const { openPdfPreviews } = await import('./delete');
          // PDF.js may transfer its byte buffer to a worker, so retain a copy for saving.
          const previews = await openPdfPreviews(source.slice(), picked.name);
          if (runId.current !== id) {
            revokePreviews(previews.map((preview) => preview.url));
            return;
          }
          setBytes(source);
          setPreviewUrls(previews.map((preview) => preview.url));
          setReading(false);
        } catch (caught) {
          if (runId.current !== id) return;
          setReading(false);
          setFileError(
            caught instanceof EncryptedPdfError
              ? 'encrypted'
              : caught instanceof PdfLimitError
                ? 'page-count'
                : caught instanceof InvalidPdfError
                  ? 'invalid'
                  : 'failed',
          );
        }
      })();
    },
    [revokePreviews],
  );

  const selectPagesFromRange = (value: string) => {
    setRangeInput(value);
    if (!previewUrls.length) return;
    try {
      const selected = parsePageSelection(value, previewUrls.length);
      if (selected.length >= previewUrls.length) {
        setRangeError(ui.keepOnePage);
        return;
      }
      setDeletedPages(selected);
      setRangeError(null);
    } catch (caught) {
      setRangeError(
        caught instanceof PageRangeOutOfBoundsError
          ? ui.rangeOutOfBounds.replace('{page}', String(caught.page)).replace('{n}', String(caught.pageCount))
          : ui.rangeSyntaxError.replace('{part}', caught instanceof PageRangeSyntaxError ? caught.part : value),
      );
    }
  };

  const togglePage = (page: number) => {
    setDeletedPages((current) => {
      const next = toggleDeletedPage(current, page, previewUrls.length);
      setRangeInput(formatPageSelection(next));
      setRangeError(next.length === current.length && !current.includes(page) ? ui.keepOnePage : null);
      return next;
    });
  };

  const download = async () => {
    if (!bytes || !file || deletedPages.length === 0 || saving) return;
    setSaving(true);
    setFileError(null);
    try {
      const { writeDeletedPdf } = await import('./delete');
      const output = await writeDeletedPdf(bytes.slice(), file.name, deletedPages);
      downloadBlob(new Blob([output as BlobPart], { type: 'application/pdf' }), deletedPdfFileName(file.name));
    } catch (caught) {
      setFileError(caught instanceof EncryptedPdfError ? 'encrypted' : 'failed');
    } finally {
      setSaving(false);
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
            ? ui.deleteFailed
            : ui.invalidPdf;
  const remaining = remainingPageCount(deletedPages, previewUrls.length);

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
                  {previewUrls.length ? ` · ${ui.pageCount.replace('{n}', String(previewUrls.length))}` : ''}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={clear} aria-label={ui.remove}>
                {ui.remove}
              </Button>
            </div>
          )}

          {reading && (
            <div class="mt-4">
              <Notice>{ui.reading}</Notice>
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
                const page = index + 1;
                const selected = deletedPages.includes(page);
                return (
                  <li key={url}>
                    <Button
                      size="sm"
                      variant="secondary"
                      class={cx(
                        'h-auto w-full p-2 text-left',
                        selected && 'border-danger bg-danger-soft text-danger hover:border-danger',
                      )}
                      aria-pressed={selected}
                      aria-label={(selected ? ui.restorePage : ui.deletePage).replace('{n}', String(page))}
                      onClick={() => togglePage(page)}
                    >
                      <span class="block w-full">
                        <span class="flex items-center justify-between gap-2 text-xs font-medium tabular">
                          <span>{ui.pageNumber.replace('{n}', String(page))}</span>
                          <span>{selected ? ui.markedForDeletion : ui.keepPage}</span>
                        </span>
                        <span class="mt-2 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-surface p-2">
                          <img
                            src={url}
                            alt={ui.pagePreview.replace('{n}', String(page))}
                            class="max-h-full max-w-full object-contain"
                          />
                        </span>
                      </span>
                    </Button>
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
          <Field label={ui.rangeLabel} hint={ui.rangeHint}>
            <TextInput
              value={rangeInput}
              onInput={(event) => selectPagesFromRange((event.currentTarget as HTMLInputElement).value)}
              placeholder={ui.rangePlaceholder}
              disabled={previewUrls.length === 0}
              spellcheck={false}
            />
          </Field>
          {rangeError && <Notice tone="danger">{rangeError}</Notice>}

          {previewUrls.length > 0 && (
            <div class="grid grid-cols-2 gap-3" aria-live="polite">
              <Stat label={ui.selectedCount} value={String(deletedPages.length)} />
              <Stat label={ui.remainingCount} value={String(remaining)} emphasis />
            </div>
          )}

          <Notice>{ui.privacyNote}</Notice>

          <div class="border-t border-line pt-4">
            <p class="text-sm text-muted">{ui.downloadHint}</p>
            <Button
              class="mt-3 w-full"
              variant="primary"
              size="lg"
              disabled={deletedPages.length === 0 || saving}
              onClick={() => void download()}
            >
              {saving ? ui.saving : ui.download}
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
