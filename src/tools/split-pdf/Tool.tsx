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
  InvalidPdfError,
  parseRangeSpec,
  RangeOutOfBoundsError,
  RangeSyntaxError,
  tokensToPageGroups,
  tokensToRangeGroups,
  type SplitProgress,
} from './logic';
import {
  PdfSplitCancelledError,
  prepareSplitOffMainThread,
  readPdfPageCountOffMainThread,
  type PreparedSplit,
} from './split';

type Mode = 'range' | 'every';
type LoadError = 'invalid' | 'encrypted' | 'failed';

export default function SplitPdf({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [mode, setMode] = useState<Mode>('range');
  const [rangeInput, setRangeInput] = useState('');
  const [perPage, setPerPage] = useState(true);
  const [everyN, setEveryN] = useState<number | ''>(1);

  const [parseError, setParseError] = useState<string | null>(null);
  const [splitFailed, setSplitFailed] = useState(false);
  const [splitCancelled, setSplitCancelled] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [progress, setProgress] = useState<SplitProgress | null>(null);
  const [downloadFailed, setDownloadFailed] = useState(false);
  const [output, setOutput] = useState<PreparedSplit | null>(null);
  const runId = useRef(0);
  const loadId = useRef(0);
  const loadAbort = useRef<AbortController | null>(null);
  const splitAbort = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      loadAbort.current?.abort();
      splitAbort.current?.abort();
    },
    [],
  );

  const loadFile = (picked: File) => {
    const id = ++loadId.current;
    ++runId.current;
    loadAbort.current?.abort();
    splitAbort.current?.abort();
    splitAbort.current = null;
    const controller = new AbortController();
    loadAbort.current = controller;
    setFile(picked);
    setLoadError(null);
    setSplitCancelled(false);
    setIsLoading(true);
    setPageCount(null);
    setParseError(null);
    setSplitFailed(false);
    setDownloadFailed(false);
    setOutput(null);
    setProgress(null);
    void (async () => {
      try {
        const count = await readPdfPageCountOffMainThread(picked, controller.signal);
        if (loadId.current !== id || controller.signal.aborted) return;
        setPageCount(count);
        setRangeInput(count > 0 ? `1-${count}` : '');
      } catch (err) {
        if (loadId.current !== id || controller.signal.aborted) return;
        setPageCount(0);
        setLoadError(
          err instanceof EncryptedPdfError ? 'encrypted' : err instanceof InvalidPdfError ? 'invalid' : 'failed',
        );
      } finally {
        if (loadId.current === id) setIsLoading(false);
      }
    })();
  };

  const clear = () => {
    ++loadId.current;
    ++runId.current;
    loadAbort.current?.abort();
    loadAbort.current = null;
    splitAbort.current?.abort();
    splitAbort.current = null;
    setFile(null);
    setPageCount(null);
    setLoadError(null);
    setParseError(null);
    setSplitFailed(false);
    setSplitCancelled(false);
    setIsLoading(false);
    setIsSplitting(false);
    setProgress(null);
    setDownloadFailed(false);
    setOutput(null);
  };

  // Debounce so re-splitting doesn't run on every keystroke in the range field.
  useEffect(() => {
    if (!file || loadError || pageCount === null || pageCount === 0) return;
    if (splitCancelled) {
      setIsSplitting(false);
      setProgress(null);
      return;
    }
    const id = ++runId.current;
    const controller = new AbortController();
    splitAbort.current?.abort();
    splitAbort.current = controller;
    setOutput(null);
    setSplitFailed(false);
    setIsSplitting(true);
    setProgress(null);
    const timeout = window.setTimeout(() => {
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
          setOutput(null);
          setIsSplitting(false);
          setProgress(null);
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
        setProgress({ done: 0, total: groups.length });
        try {
          const prepared = await prepareSplitOffMainThread(file, groups, {
            signal: controller.signal,
            onProgress: (next) => {
              if (runId.current === id) setProgress(next);
            },
          });
          if (runId.current !== id) return;
          setSplitFailed(false);
          setOutput(prepared);
        } catch (caught) {
          if (caught instanceof PdfSplitCancelledError || controller.signal.aborted) return;
          if (runId.current !== id) return;
          setSplitFailed(true);
          setOutput(null);
        } finally {
          if (!controller.signal.aborted && runId.current === id) {
            setIsSplitting(false);
            setProgress(null);
          }
          if (splitAbort.current === controller) splitAbort.current = null;
        }
      })();
    }, 250);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
      if (splitAbort.current === controller) splitAbort.current = null;
    };
  }, [file, loadError, pageCount, mode, rangeInput, perPage, everyN, splitCancelled, ui]);

  const download = () => {
    if (!output) return;
    setDownloadFailed(false);
    try {
      downloadBlob(output.blob, output.downloadName);
    } catch {
      setDownloadFailed(true);
    }
  };

  const cancelSplit = () => {
    splitAbort.current?.abort();
    splitAbort.current = null;
    runId.current++;
    setOutput(null);
    setSplitFailed(false);
    setSplitCancelled(true);
    setIsSplitting(false);
    setProgress(null);
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
              <p class="text-danger">
                {loadError === 'encrypted' ? ui.encryptedPdf : loadError === 'invalid' ? ui.invalidPdf : ui.loadFailed}
              </p>
            ) : (
              <p class="tabular text-muted" aria-live="polite">
                {formatBytes(file.size, locale)}
                {pageCount !== null
                  ? ` · ${ui.pageCount.replace('{n}', String(pageCount))}`
                  : isLoading
                    ? ` · ${ui.processing}`
                    : null}
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
            onValue={(value) => {
              setSplitCancelled(false);
              setMode(value);
            }}
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
                  onInput={(e) => {
                    setSplitCancelled(false);
                    setRangeInput((e.currentTarget as HTMLInputElement).value);
                  }}
                  placeholder={ui.rangePlaceholder}
                  spellcheck={false}
                />
              </Field>
              <Toggle
                checked={perPage}
                onChecked={(checked) => {
                  setSplitCancelled(false);
                  setPerPage(checked);
                }}
                label={ui.perPageToggle}
              />
            </div>
          ) : (
            <Field label={ui.everyLabel} hint={ui.everyHint}>
              <NumberInput
                value={everyN}
                onValue={(value) => {
                  setSplitCancelled(false);
                  setEveryN(value);
                }}
                min={1}
                max={pageCount}
              />
            </Field>
          )}

          {parseError && <Notice tone="danger">{parseError}</Notice>}
          {splitFailed && <Notice tone="danger">{ui.splitFailed}</Notice>}
          {downloadFailed && <Notice tone="danger">{ui.downloadFailed}</Notice>}

          {splitCancelled && (
            <div class="flex flex-wrap items-center gap-3">
              <Notice>{ui.splitCancelled}</Notice>
              <Button variant="secondary" onClick={() => setSplitCancelled(false)}>
                {ui.resumeSplit}
              </Button>
            </div>
          )}

          {output && output.files.length > 0 && (
            <ul class="divide-y divide-line rounded-lg border border-line" aria-live="polite">
              {output.files.map((o) => (
                <li key={o.name} class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span class="truncate font-medium text-fg">{o.name}</span>
                  <span class="shrink-0 tabular text-muted">{formatBytes(o.size, locale)}</span>
                </li>
              ))}
            </ul>
          )}

          <div class="flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" disabled={!output} onClick={download}>
              {output && output.files.length > 1 ? ui.downloadZip : ui.download}
            </Button>
            {isSplitting && (
              <Button variant="ghost" onClick={cancelSplit}>
                {ui.cancel}
              </Button>
            )}
            {isSplitting ? (
              <span class="text-sm text-muted" role="status" aria-live="polite" aria-busy="true">
                {progress && progress.done > 0
                  ? ui.splitProgress.replace('{done}', String(progress.done)).replace('{total}', String(progress.total))
                  : ui.splitting}
              </span>
            ) : output && output.files.length > 0 ? (
              <span class="text-sm tabular text-muted" aria-live="polite">
                {ui.fileCount.replace('{n}', String(output.files.length))}
              </span>
            ) : null}
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
