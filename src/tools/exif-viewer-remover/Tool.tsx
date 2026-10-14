import { useCallback, useRef, useState } from 'preact/hooks';
import { zipSync } from 'fflate';
import { Button, Dropzone, Notice, Panel, Stat, Toggle } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import { cleanFile, inspectFile } from './clean';
import type { ExifSummary } from './logic';
import { cleanedName, privateName } from './logic';
import type { UI } from './content';

interface Item {
  id: number;
  file: File;
  summary?: ExifSummary;
  result?: { blob: Blob; summary: ExifSummary };
  busy?: boolean;
  error?: 'read' | 'clean';
}

let nextId = 1;

export default function ExifViewerRemover({ locale, ui }: ToolProps<UI>) {
  const [items, setItems] = useState<Item[]>([]);
  const [usePrivateNames, setUsePrivateNames] = useState(true);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const addFiles = useCallback(async (files: File[]) => {
    const incoming = files.map((file) => ({ id: nextId++, file, busy: true }));
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
    }
  }, []);

  const clean = useCallback(async (id: number) => {
    const item = itemsRef.current.find((entry) => entry.id === id);
    if (!item || item.busy || item.error) return;
    setItems((current) => current.map((entry) => (entry.id === id ? { ...entry, busy: true } : entry)));
    try {
      const blob = await cleanFile(item.file);
      const summary = await inspectFile(new File([blob], item.file.name, { type: item.file.type }));
      setItems((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, result: { blob, summary }, busy: false } : entry)),
      );
    } catch {
      setItems((current) =>
        current.map((entry) => (entry.id === id ? { ...entry, error: 'clean', busy: false } : entry)),
      );
    }
  }, []);

  const cleanAll = async () => {
    for (const item of itemsRef.current) if (!item.error && !item.result) await clean(item.id);
  };
  const remove = (id: number) => setItems((current) => current.filter((item) => item.id !== id));
  const clear = () => setItems([]);
  const ready = items.filter((item) => item.result && !item.busy);
  const pending = items.filter((item) => !item.error && !item.result && !item.busy);
  const found = items.filter((item) => item.summary?.hasMetadata).length;
  const outputName = (item: Item) =>
    usePrivateNames
      ? privateName(item.file.name, items.findIndex((entry) => entry.id === item.id) + 1)
      : cleanedName(item.file.name);

  const downloadAll = async () => {
    if (ready.length === 1) return downloadBlob(ready[0].result!.blob, outputName(ready[0]));
    const files: Record<string, Uint8Array> = {};
    for (const item of ready) {
      const sourceName = outputName(item);
      let name = sourceName;
      for (let duplicate = 2; files[name]; duplicate++) name = sourceName.replace(/(\.[^.]+)$/, `-${duplicate}$1`);
      files[name] = new Uint8Array(await item.result!.blob.arrayBuffer());
    }
    downloadBlob(new Blob([zipSync(files, { level: 0 }) as BlobPart], { type: 'application/zip' }), 'clean-photos.zip');
  };

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
          {items.length === 0 ? (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          ) : (
            <>
              <ul class="mt-4 divide-y divide-line rounded-lg border border-line" aria-live="polite">
                {items.map((item) => (
                  <li class="flex items-start gap-3 p-3">
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
                          onClick={() => downloadBlob(item.result!.blob, outputName(item))}
                        >
                          {ui.download}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={item.busy || Boolean(item.error)}
                          onClick={() => clean(item.id)}
                        >
                          {item.busy ? ui.processing : ui.clean}
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" aria-label={ui.remove} onClick={() => remove(item.id)}>
                        ×
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              <div class="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="lg" disabled={pending.length === 0} onClick={cleanAll}>
                  {ui.cleanAll.replace('{n}', String(pending.length))}
                </Button>
                {ready.length > 0 && (
                  <Button variant="secondary" size="lg" onClick={downloadAll}>
                    {ready.length === 1 ? ui.download : ui.downloadAll.replace('{n}', String(ready.length))}
                  </Button>
                )}
                <Button variant="ghost" onClick={clear}>
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
