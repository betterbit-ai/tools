import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Notice, Panel } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { EncryptedPdfError, totalPageCount, type MergeProgress } from './logic';
import { inspectPdfFile, mergePdfFiles, PdfMergeCancelledError } from './merge';

interface Item {
  id: number;
  file: File;
  pageCount?: number;
  error?: 'invalid' | 'encrypted';
}

let nextId = 1;

export default function MergePdf({ ui, locale }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [merged, setMerged] = useState<{ blob: Blob } | null>(null);
  const [mergeFailed, setMergeFailed] = useState(false);
  const [mergeCancelled, setMergeCancelled] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [progress, setProgress] = useState<MergeProgress | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const runId = useRef(0);
  const readQueue = useRef<Promise<void>>(Promise.resolve());
  const itemIds = useRef(new Set<number>());
  const readControllers = useRef(new Map<number, AbortController>());
  const mergeController = useRef<AbortController | null>(null);

  // Add rows immediately so the list isn't blank while pdf-lib's chunk downloads and
  // each file is parsed — then fill in page count / error per file as it resolves.
  const addFiles = (files: File[]) => {
    const placeholders: Item[] = files.map((file) => ({ id: nextId++, file }));
    placeholders.forEach((item) => itemIds.current.add(item.id));
    setMergeCancelled(false);
    setItems((prev) => [...prev, ...placeholders]);
    for (const placeholder of placeholders) {
      // Inspect one file at a time. Starting every large PDF at once makes a
      // low-memory browser retain several full copies at the same time.
      readQueue.current = readQueue.current.then(async () => {
        if (!itemIds.current.has(placeholder.id)) return;
        const controller = new AbortController();
        readControllers.current.set(placeholder.id, controller);
        try {
          const pageCount = await inspectPdfFile(placeholder.file, controller.signal);
          if (!itemIds.current.has(placeholder.id)) return;
          setItems((prev) => prev.map((p) => (p.id === placeholder.id ? { ...p, pageCount } : p)));
        } catch (err) {
          if (err instanceof PdfMergeCancelledError || controller.signal.aborted) return;
          const error = err instanceof EncryptedPdfError ? 'encrypted' : 'invalid';
          setItems((prev) => prev.map((p) => (p.id === placeholder.id ? { ...p, error } : p)));
        } finally {
          readControllers.current.delete(placeholder.id);
        }
      });
    }
  };

  const ready = items.filter((i): i is Item & { pageCount: number } => i.pageCount !== undefined);
  const readyKey = ready.map((i) => i.id).join(',');
  const hasPendingItems = items.some((i) => i.pageCount === undefined && !i.error);

  useEffect(() => {
    if (ready.length === 0) {
      mergeController.current?.abort();
      mergeController.current = null;
      setIsMerging(false);
      setMergeFailed(false);
      setMerged(null);
      setProgress(null);
      return;
    }
    if (hasPendingItems) {
      mergeController.current?.abort();
      mergeController.current = null;
      setIsMerging(true);
      setMergeFailed(false);
      setMerged(null);
      setProgress(null);
      return;
    }
    if (mergeCancelled) {
      setIsMerging(false);
      setProgress(null);
      return;
    }

    const id = ++runId.current;
    const controller = new AbortController();
    mergeController.current?.abort();
    mergeController.current = controller;
    setIsMerging(true);
    setMergeFailed(false);
    setMerged(null);
    setProgress({ done: 0, total: ready.length, fileName: ready[0].file.name });
    const timeout = window.setTimeout(() => {
      void mergePdfFiles(
        ready.map((item) => item.file),
        {
          signal: controller.signal,
          onProgress: (next) => {
            if (runId.current === id) setProgress(next);
          },
        },
      )
        .then((bytes) => {
          if (controller.signal.aborted || runId.current !== id) return;
          setMerged({ blob: new Blob([bytes as BlobPart], { type: 'application/pdf' }) });
          setIsMerging(false);
          setProgress(null);
        })
        .catch((caught) => {
          if (caught instanceof PdfMergeCancelledError || controller.signal.aborted || runId.current !== id) return;
          setMerged(null);
          setMergeFailed(true);
          setIsMerging(false);
          setProgress(null);
        })
        .finally(() => {
          if (mergeController.current === controller) mergeController.current = null;
        });
    }, 200);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
      if (mergeController.current === controller) mergeController.current = null;
    };
  }, [hasPendingItems, mergeCancelled, readyKey]);

  useEffect(
    () => () => {
      itemIds.current.clear();
      readControllers.current.forEach((controller) => controller.abort());
      mergeController.current?.abort();
    },
    [],
  );

  const remove = (id: number) => {
    itemIds.current.delete(id);
    readControllers.current.get(id)?.abort();
    setMergeCancelled(false);
    setItems((prev) => prev.filter((p) => p.id !== id));
  };
  const clear = () => {
    itemIds.current.clear();
    readControllers.current.forEach((controller) => controller.abort());
    // A canceled inspection may still be waiting for a browser/worker promise to settle.
    // Start the next selection on a fresh queue so clearing never stalls later uploads.
    readQueue.current = Promise.resolve();
    mergeController.current?.abort();
    runId.current++;
    setItems([]);
    setMerged(null);
    setMergeFailed(false);
    setMergeCancelled(false);
    setIsMerging(false);
    setProgress(null);
  };

  const cancelMerge = () => {
    mergeController.current?.abort();
    mergeController.current = null;
    runId.current++;
    setMerged(null);
    setMergeFailed(false);
    setMergeCancelled(true);
    setIsMerging(false);
    setProgress(null);
  };

  const move = (id: number, dir: -1 | 1) => {
    setMergeCancelled(false);
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const reorder = (draggedId: number, overId: number) => {
    if (draggedId === overId) return;
    setMergeCancelled(false);
    setItems((prev) => {
      const from = prev.findIndex((p) => p.id === draggedId);
      const to = prev.findIndex((p) => p.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const outputName = ready.length === 1 ? `${ready[0].file.name.replace(/\.pdf$/i, '')}.pdf` : 'merged.pdf';

  // Numbering only counts rows that will actually land in the merged file, so a row with
  // an error in the middle of the list doesn't shift the perceived page order of the rest.
  let mergeOrder = 0;

  return (
    <Panel>
      <Dropzone
        accept="application/pdf,.pdf"
        multiple
        onFiles={addFiles}
        title={ui.dropTitle}
        hint={ui.dropHint}
        compact={items.length > 0}
      />

      {items.length > 0 && (
        <ul class="mt-4 divide-y divide-line rounded-lg border border-line">
          {items.map((item, index) => {
            const position = item.error ? null : ++mergeOrder;
            return (
              <li
                key={item.id}
                draggable
                onDragStart={() => setDragId(item.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId !== null) reorder(dragId, item.id);
                  setDragId(null);
                }}
                onDragEnd={() => setDragId(null)}
                class={dragId === item.id ? 'flex items-center gap-3 p-3 opacity-50' : 'flex items-center gap-3 p-3'}
              >
                <span class="w-5 shrink-0 text-center text-sm tabular text-subtle">{position ?? '—'}</span>
                <div
                  class="flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-md bg-surface-2 text-muted active:cursor-grabbing"
                  aria-hidden="true"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1 text-sm">
                  <p class="truncate font-medium text-fg">{item.file.name}</p>
                  {item.error ? (
                    <p class="text-danger">{item.error === 'encrypted' ? ui.encryptedPdf : ui.invalidPdf}</p>
                  ) : (
                    <p class="tabular text-muted" aria-live="polite">
                      {formatBytes(item.file.size, locale)}
                      {item.pageCount !== undefined
                        ? ` · ${ui.pageCount.replace('{n}', String(item.pageCount))}`
                        : ` · ${ui.processing}`}
                    </p>
                  )}
                </div>
                <div class="flex shrink-0 items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={ui.moveUp}
                    disabled={index === 0}
                    onClick={() => move(item.id, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={ui.moveDown}
                    disabled={index === items.length - 1}
                    onClick={() => move(item.id, 1)}
                  >
                    ↓
                  </Button>
                  <Button size="sm" variant="ghost" aria-label={ui.remove} onClick={() => remove(item.id)}>
                    ✕
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {mergeFailed && (
        <div class="mt-4">
          <Notice tone="danger">{ui.mergeFailed}</Notice>
        </div>
      )}

      {mergeCancelled && (
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <Notice>{ui.mergeCancelled}</Notice>
          <Button variant="secondary" onClick={() => setMergeCancelled(false)}>
            {ui.retry}
          </Button>
        </div>
      )}

      {items.length > 0 && (
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            disabled={!merged || isMerging}
            onClick={() => merged && downloadBlob(merged.blob, outputName)}
          >
            {ui.download}
          </Button>
          {isMerging && !hasPendingItems && (
            <Button variant="ghost" onClick={cancelMerge}>
              {ui.cancel}
            </Button>
          )}
          <Button variant="ghost" onClick={clear}>
            {ui.clear}
          </Button>
          {isMerging ? (
            <span class="text-sm text-muted" role="status" aria-live="polite" aria-busy="true">
              {progress && progress.done > 0
                ? ui.mergeProgress
                    .replace('{done}', String(progress.done))
                    .replace('{total}', String(progress.total))
                    .replace('{file}', progress.fileName)
                : ui.preparing}
            </span>
          ) : merged ? (
            <span class="text-sm text-muted tabular" aria-live="polite">
              {ui.pageCount.replace('{n}', String(totalPageCount(ready.map((i) => i.pageCount))))} ·{' '}
              {formatBytes(merged.blob.size, locale)}
            </span>
          ) : null}
        </div>
      )}

      {items.length === 0 && (
        <div class="mt-4">
          <Notice>{ui.privacyNote}</Notice>
        </div>
      )}
    </Panel>
  );
}
