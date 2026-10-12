import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, cx, Dropzone, Kbd, Notice, Panel } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  EncryptedPdfError,
  fileExceedsLimit,
  initialPageOrder,
  InvalidPdfError,
  isOriginalOrder,
  isPdfFile,
  movePage,
  movePageBy,
  PdfLimitError,
  reorderedPdfFileName,
  reversePageOrder,
} from './logic';

type FileError = 'invalid' | 'encrypted' | 'file-size' | 'page-count' | 'failed';

export default function ReorderPdf({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [pageOrder, setPageOrder] = useState<number[]>([]);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draggedPage, setDraggedPage] = useState<number | null>(null);
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
    setPageOrder([]);
    setFileError(null);
    setReading(false);
    setSaving(false);
    setDraggedPage(null);
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
      setPageOrder([]);
      setFileError(null);
      setSaving(false);
      setDraggedPage(null);
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
          const { openPdfPreviews } = await import('./reorder');
          // PDF.js can transfer the input to a worker, so retain a copy for saving.
          const previews = await openPdfPreviews(source.slice(), picked.name);
          if (runId.current !== id) {
            revokePreviews(previews.map((preview) => preview.url));
            return;
          }
          setBytes(source);
          setPreviewUrls(previews.map((preview) => preview.url));
          setPageOrder(initialPageOrder(previews.length));
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

  const download = async () => {
    if (!bytes || !file || pageOrder.length === 0 || saving) return;
    setSaving(true);
    setFileError(null);
    try {
      const { writeReorderedPdf } = await import('./reorder');
      const output = await writeReorderedPdf(bytes.slice(), file.name, pageOrder);
      downloadBlob(new Blob([output as BlobPart], { type: 'application/pdf' }), reorderedPdfFileName(file.name));
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
            ? ui.reorderFailed
            : ui.invalidPdf;

  const moveToIndex = (page: number, index: number) =>
    setPageOrder((current) => movePage(current, current.indexOf(page), index));
  const originalOrder = isOriginalOrder(pageOrder);

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
                  {pageOrder.length ? ` · ${ui.pageCount.replace('{n}', String(pageOrder.length))}` : ''}
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

          {pageOrder.length > 0 && (
            <>
              <p class="mt-4 text-xs text-subtle" id="reorder-pdf-help">
                {ui.dragHint} <Kbd>{ui.tabKey}</Kbd> {ui.keyboardHint}
              </p>
              <ol
                class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
                aria-label={ui.pagesLabel}
                aria-describedby="reorder-pdf-help"
              >
                {pageOrder.map((page, index) => {
                  const url = previewUrls[page - 1];
                  const isDragging = draggedPage === page;
                  return (
                    <li
                      key={page}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer?.setData('text/plain', String(page));
                        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
                        setDraggedPage(page);
                      }}
                      onDragEnd={() => setDraggedPage(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const dragged = Number(event.dataTransfer?.getData('text/plain')) || draggedPage;
                        if (dragged) moveToIndex(dragged, index);
                        setDraggedPage(null);
                      }}
                      class={cx(
                        'rounded-lg border border-line bg-surface-2 p-2 transition-colors',
                        isDragging && 'opacity-50',
                      )}
                    >
                      <div class="flex items-center justify-between gap-2">
                        <p class="text-xs font-medium tabular text-fg">
                          {ui.position.replace('{n}', String(index + 1))}
                        </p>
                        <p class="text-xs tabular text-muted">{ui.sourcePage.replace('{n}', String(page))}</p>
                      </div>
                      <div class="mt-2 flex aspect-[3/4] items-center justify-center overflow-hidden rounded-md bg-surface p-2">
                        <img
                          src={url}
                          alt={ui.pagePreview.replace('{n}', String(page))}
                          class="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div class="mt-2 grid grid-cols-2 gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={index === 0}
                          aria-label={ui.moveEarlier.replace('{n}', String(page))}
                          onClick={() => setPageOrder((current) => movePageBy(current, page, -1))}
                        >
                          {ui.moveUp}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={index === pageOrder.length - 1}
                          aria-label={ui.moveLater.replace('{n}', String(page))}
                          onClick={() => setPageOrder((current) => movePageBy(current, page, 1))}
                        >
                          {ui.moveDown}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}

          {!file && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}
        </div>

        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-fg">{ui.orderLabel}</p>
            <p class="mt-1 text-xs text-subtle">{ui.orderHint}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <Button size="sm" disabled={pageOrder.length === 0} onClick={() => setPageOrder(reversePageOrder)}>
                {ui.reverse}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pageOrder.length === 0 || originalOrder}
                onClick={() => setPageOrder(initialPageOrder(pageOrder.length))}
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
              disabled={pageOrder.length === 0 || saving}
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
