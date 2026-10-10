import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Notice, Panel, Segmented } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { compressPdf } from './compress';
import {
  COMPRESSION_PRESETS,
  compressedFileName,
  EncryptedPdfError,
  fileExceedsLimit,
  InvalidPdfError,
  isPdfFile,
  PdfLimitError,
  sizeChange,
  type CompressionLevel,
} from './logic';

const STORAGE_KEY = 'tools:compress-pdf:level';

function initialLevel(): CompressionLevel {
  const saved = safeStorage.get(STORAGE_KEY);
  return saved === 'smaller' || saved === 'smallest' || saved === 'balanced' ? saved : 'balanced';
}

type FileError = 'invalid' | 'encrypted' | 'file-size' | 'page-count' | 'page-pixels' | 'total-pixels' | 'failed';

export default function CompressPdf({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>(initialLevel);
  const [output, setOutput] = useState<{ blob: Blob; pageCount: number } | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<FileError | null>(null);
  const runId = useRef(0);

  useEffect(() => safeStorage.set(STORAGE_KEY, level), [level]);

  const loadFile = useCallback((picked: File) => {
    if (!isPdfFile(picked.name, picked.type)) {
      setFile(picked);
      setOutput(null);
      setProgress(null);
      setError('invalid');
      return;
    }
    setFile(picked);
    setOutput(null);
    setProgress(null);
    setError(fileExceedsLimit(picked.size) ? 'file-size' : null);
  }, []);

  useEffect(() => {
    if (!file || error) return;
    const id = ++runId.current;
    const timeout = setTimeout(async () => {
      setOutput(null);
      setError(null);
      setProgress({ done: 0, total: 0 });
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const result = await compressPdf(bytes, file.name, COMPRESSION_PRESETS[level], (done, total) => {
          if (runId.current === id) setProgress({ done, total });
        });
        if (runId.current !== id) return;
        setOutput({
          blob: new Blob([result.bytes as BlobPart], { type: 'application/pdf' }),
          pageCount: result.pageCount,
        });
        setProgress(null);
      } catch (caught) {
        if (runId.current !== id) return;
        setOutput(null);
        setProgress(null);
        setError(
          caught instanceof EncryptedPdfError
            ? 'encrypted'
            : caught instanceof InvalidPdfError
              ? 'invalid'
              : caught instanceof PdfLimitError
                ? caught.limit
                : 'failed',
        );
      }
    }, 250);
    return () => {
      clearTimeout(timeout);
      runId.current++;
    };
  }, [file, level, error]);

  const clear = () => {
    runId.current++;
    setFile(null);
    setOutput(null);
    setProgress(null);
    setError(null);
  };

  const change = output && file ? sizeChange(file.size, output.blob.size) : null;
  const errorMessage =
    error === 'encrypted'
      ? ui.encryptedPdf
      : error === 'invalid'
        ? ui.invalidPdf
        : error === 'file-size'
          ? ui.fileSizeLimit
          : error === 'page-count'
            ? ui.pageCountLimit
            : error === 'page-pixels'
              ? ui.pagePixelLimit
              : error === 'total-pixels'
                ? ui.totalPixelLimit
                : ui.compressionFailed;
  const changeLabel =
    change?.kind === 'smaller'
      ? ui.smallerBy.replace('{n}', String(change.percent))
      : change?.kind === 'larger'
        ? ui.largerBy.replace('{n}', String(change.percent))
        : ui.sameSize;

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
                  {output ? ` · ${ui.pageCount.replace('{n}', String(output.pageCount))}` : ''}
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

          {error && (
            <div class="mt-4">
              <Notice tone="danger">{errorMessage}</Notice>
              {error === 'failed' && (
                <Button class="mt-3" variant="secondary" onClick={() => setError(null)}>
                  {ui.retry}
                </Button>
              )}
            </div>
          )}

          {output && file && change && (
            <div class="mt-4 rounded-lg border border-line bg-surface-2 p-4" aria-live="polite">
              <p class="text-sm font-medium text-fg">{ui.resultReady}</p>
              <p class="mt-1 tabular text-sm text-muted">
                {formatBytes(file.size, locale)} → {formatBytes(output.blob.size, locale)} · {changeLabel}
              </p>
              <Button
                class="mt-4"
                variant="primary"
                size="lg"
                onClick={() => downloadBlob(output.blob, compressedFileName(file.name))}
              >
                {ui.download}
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
            label={ui.levelLabel}
            value={level}
            onValue={setLevel}
            options={[
              { value: 'balanced', label: ui.balanced },
              { value: 'smaller', label: ui.smaller },
              { value: 'smallest', label: ui.smallest },
            ]}
          />
          <Notice>{ui.rasterWarning}</Notice>
          <p class="text-xs leading-5 text-subtle">
            {level === 'balanced' ? ui.balancedHint : level === 'smaller' ? ui.smallerHint : ui.smallestHint}
          </p>
        </div>
      </div>
    </Panel>
  );
}
