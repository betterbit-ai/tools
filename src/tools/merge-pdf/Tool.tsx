import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Notice, Panel } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { EncryptedPdfError, mergePdfs, readPdfPageCount, totalPageCount } from './logic';

interface Item {
  id: number;
  file: File;
  bytes?: Uint8Array;
  pageCount?: number;
  error?: 'invalid' | 'encrypted';
}

let nextId = 1;

export default function MergePdf({ ui, locale }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [merged, setMerged] = useState<{ blob: Blob; url: string } | null>(null);
  const [mergeFailed, setMergeFailed] = useState(false);
  const [dragId, setDragId] = useState<number | null>(null);
  const runId = useRef(0);

  // Add rows immediately so the list isn't blank while pdf-lib's chunk downloads and
  // each file is parsed — then fill in page count / error per file as it resolves.
  const addFiles = (files: File[]) => {
    const placeholders: Item[] = files.map((file) => ({ id: nextId++, file }));
    setItems((prev) => [...prev, ...placeholders]);
    for (const placeholder of placeholders) {
      (async () => {
        const bytes = new Uint8Array(await placeholder.file.arrayBuffer());
        try {
          const pageCount = await readPdfPageCount(bytes, placeholder.file.name);
          setItems((prev) => prev.map((p) => (p.id === placeholder.id ? { ...p, bytes, pageCount } : p)));
        } catch (err) {
          const error = err instanceof EncryptedPdfError ? 'encrypted' : 'invalid';
          setItems((prev) => prev.map((p) => (p.id === placeholder.id ? { ...p, bytes, error } : p)));
        }
      })();
    }
  };

  const ready = items.filter((i): i is Item & { bytes: Uint8Array; pageCount: number } => i.pageCount !== undefined);
  const readyKey = ready.map((i) => i.id).join(',');

  useEffect(() => {
    if (ready.length === 0) {
      setMergeFailed(false);
      setMerged((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return null;
      });
      return;
    }
    const id = ++runId.current;
    (async () => {
      try {
        const bytes = await mergePdfs(ready.map((i) => ({ bytes: i.bytes, fileName: i.file.name })));
        if (runId.current !== id) return;
        const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
        setMergeFailed(false);
        setMerged((prev) => {
          if (prev) URL.revokeObjectURL(prev.url);
          return { blob, url: URL.createObjectURL(blob) };
        });
      } catch {
        if (runId.current !== id) return;
        setMergeFailed(true);
        setMerged((prev) => {
          if (prev) URL.revokeObjectURL(prev.url);
          return null;
        });
      }
    })();
  }, [readyKey]);

  useEffect(
    () => () =>
      setMerged((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return prev;
      }),
    [],
  );

  const remove = (id: number) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clear = () => setItems([]);

  const move = (id: number, dir: -1 | 1) =>
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const reorder = (draggedId: number, overId: number) => {
    if (draggedId === overId) return;
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

  const outputName = items.length === 1 ? `${items[0].file.name.replace(/\.pdf$/i, '')}.pdf` : 'merged.pdf';

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

      {items.length > 0 && (
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            disabled={!merged}
            onClick={() => merged && downloadBlob(merged.blob, outputName)}
          >
            {ui.download}
          </Button>
          <Button variant="ghost" onClick={clear}>
            {ui.clear}
          </Button>
          {merged && (
            <span class="text-sm text-muted tabular" aria-live="polite">
              {ui.pageCount.replace('{n}', String(totalPageCount(ready.map((i) => i.pageCount))))} ·{' '}
              {formatBytes(merged.blob.size, locale)}
            </span>
          )}
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
