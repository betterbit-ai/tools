import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Notice, Panel, Stat, Toggle } from '../../components/ui';
import { downloadBlob, yieldToBrowser } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import { cleanFile, inspectFile, makeZip } from './clean';
import type { UI } from './content';
import type { ExifSummary } from './logic';
import { cleanedName, privateName } from './logic';

interface Item {
  id: number;
  file: File;
  summary?: ExifSummary;
  result?: { blob: Blob; summary: ExifSummary };
  busy?: boolean;
  error?: 'read' | 'clean';
}

interface Work {
  kind: 'clean' | 'zip';
  current: number;
  total: number;
}

let nextId = 1;
const MAX_BATCH_SIZE = 50;

export default function ExifViewerRemover({ locale, ui }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [usePrivateNames, setUsePrivateNames] = useState(true);
  const [work, setWork] = useState<Work | null>(null);
  const [notice, setNotice] = useState<{ text: string; danger?: boolean } | null>(null);
  const itemsRef = useRef(items);
  const abortRef = useRef<AbortController>();
  const operationId = useRef(0);
  const workIds = useRef<number[]>([]);
  itemsRef.current = items;

  useEffect(
    () => () => {
      operationId.current++;
      abortRef.current?.abort();
    },
    [],
  );

  const addFiles = useCallback(
    async (files: File[]) => {
      const available = Math.max(0, MAX_BATCH_SIZE - itemsRef.current.length);
      const accepted = files.slice(0, available);
      if (accepted.length < files.length) {
        setNotice({ text: ui.batchLimit.replace('{n}', String(MAX_BATCH_SIZE)) });
      }
      if (!accepted.length) return;

      const incoming: Item[] = accepted.map((file) => ({ id: nextId++, file, busy: true }));
      setItems((current) => [...current, ...incoming]);
      for (const item of incoming) {
        try {
          const summary = await inspectFile(item.file);
          if (summary.format === 'unknown') throw new Error('unsupported image');
          setItems((current) =>
            current.map((entry) => (entry.id === item.id ? { ...entry, summary, busy: false } : entry)),
          );
        } catch {
          setItems((current) =>
            current.map((entry) => (entry.id === item.id ? { ...entry, error: 'read', busy: false } : entry)),
          );
        }
        await yieldToBrowser();
      }
    },
    [ui.batchLimit],
  );

  const startCleaning = async (ids: number[]) => {
    if (work || abortRef.current || !ids.length) return;
    const id = ++operationId.current;
    const controller = new AbortController();
    abortRef.current = controller;
    workIds.current = ids;
    setNotice(null);

    try {
      for (let index = 0; index < ids.length; index++) {
        if (controller.signal.aborted || operationId.current !== id) return;
        const item = itemsRef.current.find((entry) => entry.id === ids[index]);
        if (!item?.summary || item.error || item.result) continue;
        setWork({ kind: 'clean', current: index + 1, total: ids.length });
        setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, busy: true } : entry)));
        await yieldToBrowser();

        try {
          const blob = await cleanFile(item.file, item.summary.format, controller.signal);
          if (controller.signal.aborted || operationId.current !== id) return;
          const summary = await inspectFile(
            new File([blob], outputNameFor(item, itemsRef.current, usePrivateNames), { type: blob.type }),
          );
          if (
            summary.format !== item.summary.format ||
            summary.hasMetadata ||
            blob.size > item.file.size ||
            controller.signal.aborted ||
            operationId.current !== id
          ) {
            throw new Error('clean result did not satisfy its promises');
          }
          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, result: { blob, summary }, busy: false } : entry,
            ),
          );
        } catch (error) {
          if (isAbort(error) || controller.signal.aborted || operationId.current !== id) return;
          setItems((current) =>
            current.map((entry) => (entry.id === item.id ? { ...entry, error: 'clean', busy: false } : entry)),
          );
        }
        await yieldToBrowser();
      }
    } finally {
      if (operationId.current === id) {
        abortRef.current = undefined;
        workIds.current = [];
        setWork(null);
      }
    }
  };

  const cancelWork = () => {
    const cancelledKind = work?.kind;
    operationId.current++;
    abortRef.current?.abort();
    abortRef.current = undefined;
    const affected = new Set(workIds.current);
    workIds.current = [];
    setItems((current) =>
      current.map((item) => (affected.has(item.id) && !item.result ? { ...item, busy: false } : item)),
    );
    setWork(null);
    setNotice({ text: cancelledKind === 'zip' ? ui.zipCancelled : ui.cancelled });
  };

  const remove = (id: number) => setItems((current) => current.filter((item) => item.id !== id));
  const clear = () => {
    if (work) cancelWork();
    setItems([]);
    setNotice(null);
  };
  const ready = items.filter((item) => item.result && !item.busy);
  const pending = items.filter((item) => item.summary && !item.error && !item.result && !item.busy);
  const found = items.filter((item) => item.summary?.hasMetadata).length;
  const outputName = (item: Item) => outputNameFor(item, items, usePrivateNames);

  const downloadAll = async () => {
    if (work || !ready.length) return;
    if (ready.length === 1) return downloadBlob(ready[0].result!.blob, outputName(ready[0]));

    const id = ++operationId.current;
    const controller = new AbortController();
    abortRef.current = controller;
    workIds.current = [];
    setNotice(null);
    const files: Record<string, Uint8Array> = {};
    try {
      for (let index = 0; index < ready.length; index++) {
        if (controller.signal.aborted || operationId.current !== id) return;
        setWork({ kind: 'zip', current: index + 1, total: ready.length });
        await yieldToBrowser();
        if (controller.signal.aborted || operationId.current !== id) return;
        const item = ready[index];
        const sourceName = outputName(item);
        let name = sourceName;
        for (let duplicate = 2; files[name]; duplicate++) name = sourceName.replace(/(\.[^.]+)$/, `-${duplicate}$1`);
        files[name] = new Uint8Array(await item.result!.blob.arrayBuffer());
        if (controller.signal.aborted || operationId.current !== id) return;
      }
      const archive = await makeZip(files, controller.signal);
      if (controller.signal.aborted || operationId.current !== id) return;
      downloadBlob(new Blob([archive as BlobPart], { type: 'application/zip' }), 'clean-photos.zip');
    } catch (error) {
      if (!isAbort(error) && operationId.current === id) setNotice({ text: ui.zipError, danger: true });
    } finally {
      if (operationId.current === id) {
        abortRef.current = undefined;
        setWork(null);
      }
    }
  };

  const progressText = work
    ? (work.kind === 'clean' ? ui.cleanProgress : ui.zipProgress)
        .replace('{current}', String(work.current))
        .replace('{total}', String(work.total))
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <Dropzone
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            multiple
            onFiles={addFiles}
            title={ui.dropTitle}
            hint={ui.dropHint}
            compact={items.length > 0}
          />
          {notice && (
            <div class="mt-4" role={notice.danger ? 'alert' : undefined}>
              <Notice tone={notice.danger ? 'danger' : 'info'}>{notice.text}</Notice>
            </div>
          )}
          {work && (
            <div class="mt-4" aria-live="polite">
              <Notice>{progressText}</Notice>
            </div>
          )}
          {items.length === 0 ? (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          ) : (
            <>
              <ul class="mt-4 divide-y divide-line rounded-lg border border-line" aria-live="polite">
                {items.map((item) => (
                  <li key={item.id} class="flex items-start gap-3 p-3">
                    <div class="min-w-0 flex-1 text-sm">
                      <p class="truncate font-medium text-fg">{item.file.name}</p>
                      {item.error ? (
                        <p class="mt-1 text-danger">{item.error === 'clean' ? ui.cleanError : ui.unsupported}</p>
                      ) : item.busy && !item.summary ? (
                        <p class="mt-1 text-muted">{ui.processing}</p>
                      ) : item.summary ? (
                        <>
                          <p class="mt-1 tabular text-muted">
                            {item.summary.format.toUpperCase()} · {formatBytes(item.file.size, locale)}
                          </p>
                          <p class={item.summary.hasMetadata ? 'mt-1 text-warning' : 'mt-1 text-muted'}>
                            {item.result ? ui.cleaned : item.summary.hasMetadata ? ui.metadataFound : ui.noMetadata}
                          </p>
                          {item.summary.tags.length > 0 && !item.result && (
                            <p class="mt-1 truncate text-xs text-subtle">
                              {ui.tagLabel}: {item.summary.tags.map((tag) => `${tag.label}: ${tag.value}`).join(' · ')}
                            </p>
                          )}
                          {item.summary.gps && !item.result && (
                            <p class="mt-1 tabular text-xs text-subtle">
                              {ui.gpsLabel}: {item.summary.gps.latitude.toFixed(6)},{' '}
                              {item.summary.gps.longitude.toFixed(6)}
                            </p>
                          )}
                        </>
                      ) : null}
                    </div>
                    <div class="flex shrink-0 flex-col gap-2">
                      {item.result ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={Boolean(work)}
                          onClick={() => downloadBlob(item.result!.blob, outputName(item))}
                        >
                          {ui.download}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={item.busy || Boolean(item.error) || Boolean(work)}
                          onClick={() => void startCleaning([item.id])}
                        >
                          {item.busy ? ui.processing : ui.clean}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={ui.remove}
                        disabled={Boolean(work)}
                        onClick={() => remove(item.id)}
                      >
                        ×
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <div class="mt-4 flex flex-wrap items-center gap-3">
                {work ? (
                  <Button variant="danger" size="lg" onClick={cancelWork}>
                    {ui.cancel}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={pending.length === 0}
                    onClick={() => void startCleaning(pending.map((item) => item.id))}
                  >
                    {ui.cleanAll.replace('{n}', String(pending.length))}
                  </Button>
                )}
                {ready.length > 0 && !work && (
                  <Button variant="secondary" size="lg" onClick={() => void downloadAll()}>
                    {ready.length === 1 ? ui.download : ui.downloadAll.replace('{n}', String(ready.length))}
                  </Button>
                )}
                <Button variant="ghost" disabled={Boolean(work)} onClick={clear}>
                  {ui.clear}
                </Button>
              </div>
            </>
          )}
        </div>
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-2 gap-3" aria-live="polite">
            <Stat label={ui.fileLabel} value={items.length} emphasis />
            <Stat label={ui.metadataFound} value={found} emphasis />
          </div>
          <Notice>{ui.cleanNote}</Notice>
          <div>
            <Toggle checked={usePrivateNames} onChecked={setUsePrivateNames} label={ui.privateNames} />
            <p class="mt-1 text-xs text-subtle">{ui.privateNamesHint}</p>
          </div>
          {ready.length > 0 && <Notice tone="success">{ui.resultNote}</Notice>}
        </div>
      </div>
    </Panel>
  );
}

function outputNameFor(item: Item, items: Item[], usePrivateNames: boolean): string {
  const format = item.summary?.format;
  return usePrivateNames
    ? privateName(item.file.name, items.findIndex((entry) => entry.id === item.id) + 1, format)
    : cleanedName(item.file.name, format);
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
