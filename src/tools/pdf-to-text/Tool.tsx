import { useCallback, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Dropzone, Field, Notice, Panel, Select, Stat, Textarea } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  characterCount,
  EncryptedPdfError,
  extractedTextFileName,
  fileExceedsLimit,
  InvalidPdfError,
  isPdfFile,
  joinPageText,
  PdfLimitError,
  type ExtractedPage,
} from './logic';

type FileError = 'invalid' | 'encrypted' | 'file-size' | 'page-count' | 'text-length' | 'failed';

export default function PdfToText({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<ExtractedPage[] | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<FileError | null>(null);
  const runId = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);

  const clear = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    runId.current++;
    setFile(null);
    setPages(null);
    setSelectedPage(1);
    setProgress(null);
    setError(null);
  }, []);

  const loadFile = useCallback((picked: File) => {
    controllerRef.current?.abort();
    const id = ++runId.current;
    const controller = new AbortController();
    controllerRef.current = controller;
    setFile(picked);
    setPages(null);
    setSelectedPage(1);
    setProgress(null);
    setError(null);

    if (!isPdfFile(picked.name, picked.type)) {
      setError('invalid');
      return;
    }
    if (fileExceedsLimit(picked.size)) {
      setError('file-size');
      return;
    }

    setProgress({ done: 0, total: 0 });
    void (async () => {
      try {
        const bytes = new Uint8Array(await picked.arrayBuffer());
        const { extractPdfText } = await import('./extract');
        const extractedPages = await extractPdfText(
          bytes,
          picked.name,
          (done, total) => {
            if (runId.current === id) setProgress({ done, total });
          },
          controller.signal,
        );
        if (runId.current !== id || controller.signal.aborted) return;
        setPages(extractedPages);
        setProgress(null);
      } catch (caught) {
        if (runId.current !== id || controller.signal.aborted) return;
        setPages(null);
        setProgress(null);
        setError(
          caught instanceof EncryptedPdfError
            ? 'encrypted'
            : caught instanceof PdfLimitError
              ? caught.limit
              : caught instanceof InvalidPdfError
                ? 'invalid'
                : 'failed',
        );
      }
    })();
  }, []);

  const allText = pages ? joinPageText(pages) : '';
  const page = pages?.[selectedPage - 1] ?? null;
  const errorMessage =
    error === 'encrypted'
      ? ui.encryptedPdf
      : error === 'file-size'
        ? ui.fileSizeLimit
        : error === 'page-count'
          ? ui.pageCountLimit
          : error === 'text-length'
            ? ui.textLengthLimit
            : error === 'failed'
              ? ui.extractionFailed
              : ui.invalidPdf;
  const format = (number: number) => formatNumber(number, locale);

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
                  {pages ? ` · ${ui.pageCount.replace('{n}', format(pages.length))}` : ''}
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
                  ? ui.processingPages.replace('{n}', format(progress.done)).replace('{total}', format(progress.total))
                  : ui.reading}
              </Notice>
            </div>
          )}

          {error && (
            <div class="mt-4">
              <Notice tone="danger">{errorMessage}</Notice>
            </div>
          )}

          {!file && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}

          {pages && page && (
            <div class="mt-5 rounded-lg border border-line bg-surface-2 p-4" aria-live="polite">
              <p class="text-sm text-muted">{ui.resultHint}</p>
              {allText ? (
                <div class="mt-4">
                  <Field label={ui.pageTextLabel.replace('{n}', format(page.pageNumber))}>
                    <Textarea value={page.text} readOnly spellcheck={false} class="min-h-56 bg-surface" />
                  </Field>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <CopyButton text={page.text} label={ui.copyPage} copiedLabel={ui.copied} />
                    {!page.text && <p class="self-center text-sm text-subtle">{ui.emptyPage}</p>}
                  </div>
                </div>
              ) : (
                <div class="mt-4">
                  <Notice>{ui.emptyDocument}</Notice>
                </div>
              )}
            </div>
          )}
        </div>

        <div class="space-y-4">
          {pages ? (
            <>
              <div class="grid grid-cols-2 gap-2" aria-live="polite">
                <Stat label={ui.pages} value={format(pages.length)} emphasis />
                <Stat label={ui.characters} value={format(characterCount(allText))} emphasis />
              </div>
              <Field label={ui.pageSelectorLabel}>
                <Select<string>
                  value={String(selectedPage)}
                  onValue={(value) => setSelectedPage(Number(value))}
                  options={pages.map((item) => ({
                    value: String(item.pageNumber),
                    label: ui.pageOption.replace('{n}', format(item.pageNumber)),
                  }))}
                />
              </Field>
              <div class="flex gap-2">
                <Button
                  class="flex-1"
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedPage((current) => Math.max(1, current - 1))}
                  disabled={selectedPage <= 1}
                >
                  {ui.previousPage}
                </Button>
                <Button
                  class="flex-1"
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedPage((current) => Math.min(pages.length, current + 1))}
                  disabled={selectedPage >= pages.length}
                >
                  {ui.nextPage}
                </Button>
              </div>
              <CopyButton text={allText} label={ui.copyAll} copiedLabel={ui.copied} size="md" />
              <Button
                variant="primary"
                size="md"
                disabled={!allText}
                onClick={() =>
                  downloadBlob(
                    new Blob([allText], { type: 'text/plain;charset=utf-8' }),
                    extractedTextFileName(file?.name ?? ''),
                  )
                }
              >
                {ui.download}
              </Button>
            </>
          ) : (
            <Notice>{ui.privacyNote}</Notice>
          )}
        </div>
      </div>
    </Panel>
  );
}
