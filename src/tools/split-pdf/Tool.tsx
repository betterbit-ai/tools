import { useEffect, useRef, useState } from 'preact/hooks';
import {
  Button,
  Dropzone,
  Field,
  NumberInput,
  Notice,
  Panel,
  Segmented,
  Toggle,
  inputClass,
} from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  chunkPages,
  EncryptedPdfError,
  parseRangeSpec,
  RangeOutOfBoundsError,
  RangeSyntaxError,
  readPdfPageCount,
  splitPdf,
  tokensToPageGroups,
  tokensToRangeGroups,
  type SplitFile,
} from './logic';

type Mode = 'range' | 'every';
type LoadError = 'invalid' | 'encrypted';

export default function SplitPdf({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);

  const [mode, setMode] = useState<Mode>('range');
  const [rangeInput, setRangeInput] = useState('');
  const [perPage, setPerPage] = useState(true);
  const [everyN, setEveryN] = useState<number | ''>(1);

  const [parseError, setParseError] = useState<string | null>(null);
  const [splitFailed, setSplitFailed] = useState(false);
  const [outputs, setOutputs] = useState<SplitFile[] | null>(null);
  const runId = useRef(0);

  const loadFile = (picked: File) => {
    setFile(picked);
    setLoadError(null);
    setBytes(null);
    setPageCount(null);
    setOutputs(null);
    (async () => {
      const buf = new Uint8Array(await picked.arrayBuffer());
      try {
        const count = await readPdfPageCount(buf, picked.name);
        setBytes(buf);
        setPageCount(count);
        setRangeInput(count > 0 ? `1-${count}` : '');
      } catch (err) {
        setBytes(buf);
        setPageCount(0);
        setLoadError(err instanceof EncryptedPdfError ? 'encrypted' : 'invalid');
      }
    })();
  };

  const clear = () => {
    setFile(null);
    setBytes(null);
    setPageCount(null);
    setLoadError(null);
    setParseError(null);
    setSplitFailed(false);
    setOutputs(null);
  };

  // Debounce so re-splitting doesn't run on every keystroke in the range field.
  useEffect(() => {
    if (!bytes || !file || loadError || pageCount === null || pageCount === 0) return;
    const id = ++runId.current;
    const timeout = setTimeout(() => {
      (async () => {
        let groups: number[][];
        try {
          if (mode === 'range') {
            const tokens = parseRangeSpec(rangeInput, pageCount);
            groups = perPage ? tokensToPageGroups(tokens) : tokensToRangeGroups(tokens);
          } else {
            const size = everyN === '' || everyN < 1 ? 1 : Math.floor(everyN);
            groups = chunkPages(pageCount, size);
          }
        } catch (err) {
          if (runId.current !== id) return;
          setSplitFailed(false);
          setOutputs(null);
          if (err instanceof RangeSyntaxError) {
            setParseError(ui.rangeSyntaxError.replace('{part}', err.part));
          } else if (err instanceof RangeOutOfBoundsError) {
            setParseError(
              ui.rangeOutOfBounds.replace('{page}', String(err.page)).replace('{n}', String(err.pageCount)),
            );
          } else {
            setParseError(ui.rangeSyntaxError.replace('{part}', rangeInput));
          }
          return;
        }

        setParseError(null);
        try {
          const files = await splitPdf(bytes, file.name, groups);
          if (runId.current !== id) return;
          setSplitFailed(false);
          setOutputs(files);
        } catch {
          if (runId.current !== id) return;
          setSplitFailed(true);
          setOutputs(null);
        }
      })();
    }, 250);
    return () => clearTimeout(timeout);
  }, [bytes, file, loadError, pageCount, mode, rangeInput, perPage, everyN, ui]);

  const download = async () => {
    if (!outputs || outputs.length === 0) return;
    if (outputs.length === 1) {
      downloadBlob(new Blob([outputs[0].bytes as BlobPart], { type: 'application/pdf' }), outputs[0].name);
      return;
    }
    const { zipSync } = await import('fflate');
    const entries: Record<string, Uint8Array> = {};
    for (const o of outputs) entries[o.name] = o.bytes;
    const zipped = zipSync(entries, { level: 0 });
    const baseName = file ? file.name.replace(/\.pdf$/i, '') : 'split';
    downloadBlob(new Blob([zipped as BlobPart], { type: 'application/zip' }), `${baseName}_split.zip`);
  };

  return (
    <Panel>
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
            {loadError ? (
              <p class="text-danger">{loadError === 'encrypted' ? ui.encryptedPdf : ui.invalidPdf}</p>
            ) : (
              <p class="tabular text-muted" aria-live="polite">
                {formatBytes(file.size, locale)}
                {pageCount !== null ? ` · ${ui.pageCount.replace('{n}', String(pageCount))}` : ` · ${ui.processing}`}
              </p>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={clear}>
            {ui.remove}
          </Button>
        </div>
      )}

      {pageCount !== null && pageCount > 0 && (
        <div class="mt-4 space-y-4">
          <Segmented
            label={ui.modeLabel}
            value={mode}
            onValue={setMode}
            options={[
              { value: 'range', label: ui.modeRange },
              { value: 'every', label: ui.modeEvery },
            ]}
          />

          {mode === 'range' ? (
            <div class="space-y-3">
              <Field label={ui.rangeLabel} hint={ui.rangeHint}>
                <input
                  class={inputClass}
                  value={rangeInput}
                  onInput={(e) => setRangeInput((e.currentTarget as HTMLInputElement).value)}
                  placeholder={ui.rangePlaceholder}
                  spellcheck={false}
                />
              </Field>
              <Toggle checked={perPage} onChecked={setPerPage} label={ui.perPageToggle} />
            </div>
          ) : (
            <Field label={ui.everyLabel} hint={ui.everyHint}>
              <NumberInput value={everyN} onValue={setEveryN} min={1} max={pageCount} />
            </Field>
          )}

          {parseError && <Notice tone="danger">{parseError}</Notice>}
          {splitFailed && <Notice tone="danger">{ui.splitFailed}</Notice>}

          {outputs && outputs.length > 0 && (
            <ul class="divide-y divide-line rounded-lg border border-line" aria-live="polite">
              {outputs.map((o) => (
                <li key={o.name} class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span class="truncate font-medium text-fg">{o.name}</span>
                  <span class="shrink-0 tabular text-muted">{formatBytes(o.bytes.length, locale)}</span>
                </li>
              ))}
            </ul>
          )}

          <div class="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" disabled={!outputs || outputs.length === 0} onClick={download}>
              {outputs && outputs.length > 1 ? ui.downloadZip : ui.download}
            </Button>
            {outputs && outputs.length > 0 && (
              <span class="text-sm tabular text-muted" aria-live="polite">
                {ui.fileCount.replace('{n}', String(outputs.length))}
              </span>
            )}
          </div>
        </div>
      )}

      {!file && (
        <div class="mt-4">
          <Notice>{ui.privacyNote}</Notice>
        </div>
      )}
    </Panel>
  );
}
