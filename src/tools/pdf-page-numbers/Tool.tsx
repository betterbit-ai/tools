import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Segmented, Select, TextInput } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  DEFAULT_SETTINGS,
  EncryptedPdfError,
  fileExceedsLimit,
  formatPageSelection,
  isPdfFile,
  MAX_PAGE_SELECTION_CHARS,
  normalizeSettings,
  numberedPdfFileName,
  PageRangeOutOfBoundsError,
  PageRangeSyntaxError,
  PageRangeTooLongError,
  parsePageSelection,
  PdfLimitError,
  renderPageLabel,
  templateForFormat,
  type PageNumberFormat,
  type PageNumberPosition,
  type PageNumberSettings,
} from './logic';

const STORAGE_KEY = 'tools:pdf-page-numbers:settings';

type FileError = 'invalid' | 'encrypted' | 'file-size' | 'page-count' | 'failed';

function initialSettings(): PageNumberSettings {
  const stored = safeStorage.get(STORAGE_KEY);
  if (!stored) return DEFAULT_SETTINGS;
  try {
    return normalizeSettings(JSON.parse(stored) as Partial<PageNumberSettings>);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export default function PdfPageNumbers({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rangeInput, setRangeInput] = useState('');
  const [settings, setSettings] = useState<PageNumberSettings>(initialSettings);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const runId = useRef(0);

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(settings)), [settings]);

  const clear = useCallback(() => {
    runId.current++;
    setFile(null);
    setBytes(null);
    setPageCount(null);
    setRangeInput('');
    setRangeError(null);
    setFileError(null);
    setReading(false);
    setSaving(false);
    setProgress(null);
  }, []);

  const loadFile = useCallback((picked: File) => {
    const id = ++runId.current;
    setFile(picked);
    setBytes(null);
    setPageCount(null);
    setRangeInput('');
    setRangeError(null);
    setFileError(null);
    setSaving(false);
    setProgress(null);
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
        if (runId.current !== id) return;
        const { readPdfPageCount } = await import('./page-numbers');
        const count = await readPdfPageCount(source, picked.name);
        if (runId.current !== id) return;
        setBytes(source);
        setPageCount(count);
        setRangeInput(`1-${count}`);
      } catch (caught) {
        if (runId.current !== id) return;
        setFileError(
          caught instanceof EncryptedPdfError
            ? 'encrypted'
            : caught instanceof PdfLimitError
              ? 'page-count'
              : 'invalid',
        );
      } finally {
        if (runId.current === id) setReading(false);
      }
    })();
  }, []);

  const changeRange = (value: string) => {
    setRangeInput(value);
    if (!pageCount) return;
    try {
      parsePageSelection(value, pageCount);
      setRangeError(null);
    } catch (caught) {
      setRangeError(rangeErrorMessage(caught, value, ui));
    }
  };

  const updateSettings = <K extends keyof PageNumberSettings>(key: K, value: PageNumberSettings[K]) => {
    setSettings((current) => normalizeSettings({ ...current, [key]: value }));
  };

  const excludeCover = () => {
    if (!pageCount || pageCount < 2) return;
    changeRange(formatPageSelection(Array.from({ length: pageCount - 1 }, (_, index) => index + 2)));
    updateSettings('firstNumber', 1);
  };

  const download = async () => {
    if (!file || !bytes || !pageCount || saving) return;
    let selectedPages: number[];
    try {
      selectedPages = parsePageSelection(rangeInput, pageCount);
      setRangeError(null);
    } catch (caught) {
      setRangeError(rangeErrorMessage(caught, rangeInput, ui));
      return;
    }
    setSaving(true);
    setFileError(null);
    setProgress({ done: 0, total: selectedPages.length });
    try {
      const { addPageNumbers } = await import('./page-numbers');
      const output = await addPageNumbers(bytes.slice(), file.name, selectedPages, settings, (done, total) =>
        setProgress({ done, total }),
      );
      downloadBlob(new Blob([output as BlobPart], { type: 'application/pdf' }), numberedPdfFileName(file.name));
    } catch (caught) {
      setFileError(caught instanceof EncryptedPdfError ? 'encrypted' : 'failed');
    } finally {
      setSaving(false);
      setProgress(null);
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
            ? ui.numberingFailed
            : ui.invalidPdf;
  const selectedCount = pageCount ? safelyCountSelectedPages(rangeInput, pageCount) : 0;
  const example = renderPageLabel(
    templateForFormat(settings.format),
    settings.firstNumber,
    settings.firstNumber + Math.max(0, selectedCount - 1),
  );

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
                  {pageCount !== null ? ` · ${ui.pageCount.replace('{n}', String(pageCount))}` : ''}
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
          {!file && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}

          {pageCount && !reading && !fileError && (
            <div class="mt-5 space-y-4">
              <Field label={ui.pagesLabel} hint={ui.pagesHint}>
                <TextInput value={rangeInput} onInput={(event) => changeRange(event.currentTarget.value)} />
              </Field>
              {rangeError && <Notice tone="danger">{rangeError}</Notice>}
              <div class="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => changeRange(`1-${pageCount}`)}>
                  {ui.allPages}
                </Button>
                <Button size="sm" variant="secondary" onClick={excludeCover} disabled={pageCount < 2}>
                  {ui.skipCover}
                </Button>
                {selectedCount > 0 && (
                  <span class="text-xs tabular text-subtle">
                    {ui.selectedCount.replace('{n}', String(selectedCount))}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div class="space-y-4">
          <Field label={ui.positionLabel}>
            <Select<PageNumberPosition>
              value={settings.position}
              onValue={(value) => updateSettings('position', value)}
              options={[
                { value: 'bottom-center', label: ui.positionBottomCenter },
                { value: 'bottom-left', label: ui.positionBottomLeft },
                { value: 'bottom-right', label: ui.positionBottomRight },
                { value: 'top-center', label: ui.positionTopCenter },
                { value: 'top-left', label: ui.positionTopLeft },
                { value: 'top-right', label: ui.positionTopRight },
              ]}
            />
          </Field>
          <Field label={ui.formatLabel} hint={ui.formatHint}>
            <Segmented<PageNumberFormat>
              label={ui.formatLabel}
              value={settings.format}
              onValue={(value) => updateSettings('format', value)}
              options={[
                { value: 'number', label: ui.formatNumber },
                { value: 'page', label: ui.formatPage },
                { value: 'page-of-total', label: ui.formatPageOfTotal },
                { value: 'fraction', label: ui.formatFraction },
              ]}
            />
          </Field>
          <div class="grid grid-cols-2 gap-3">
            <Field label={ui.firstNumberLabel} hint={ui.firstNumberHint}>
              <NumberInput
                min={0}
                max={999999}
                value={settings.firstNumber}
                onValue={(value) =>
                  updateSettings('firstNumber', typeof value === 'number' ? value : DEFAULT_SETTINGS.firstNumber)
                }
              />
            </Field>
            <Field label={ui.fontSizeLabel} hint={ui.fontSizeHint}>
              <NumberInput
                min={6}
                max={72}
                value={settings.fontSize}
                onValue={(value) =>
                  updateSettings('fontSize', typeof value === 'number' ? value : DEFAULT_SETTINGS.fontSize)
                }
              />
            </Field>
          </div>
          <Field label={ui.marginLabel} hint={ui.marginHint}>
            <NumberInput
              min={0}
              max={144}
              value={settings.margin}
              onValue={(value) => updateSettings('margin', typeof value === 'number' ? value : DEFAULT_SETTINGS.margin)}
            />
          </Field>
          <div class="rounded-lg border border-line bg-surface-2 p-3" aria-live="polite">
            <p class="text-xs text-subtle">{ui.previewLabel}</p>
            <p class="mt-1 truncate font-mono text-sm text-fg">{example}</p>
          </div>
          {progress && (
            <Notice>
              {ui.savingPages.replace('{n}', String(progress.done)).replace('{total}', String(progress.total))}
            </Notice>
          )}
          <Button
            variant="primary"
            class="w-full"
            onClick={download}
            disabled={!bytes || !pageCount || !!rangeError || saving || selectedCount === 0}
          >
            {saving ? ui.saving : ui.download}
          </Button>
          <p class="text-xs leading-5 text-subtle">{ui.downloadHint}</p>
        </div>
      </div>
    </Panel>
  );
}

function safelyCountSelectedPages(value: string, pageCount: number): number {
  try {
    return parsePageSelection(value, pageCount).length;
  } catch {
    return 0;
  }
}

function rangeErrorMessage(caught: unknown, fallback: string, ui: UI): string {
  if (caught instanceof PageRangeOutOfBoundsError) {
    return ui.rangeOutOfBounds.replace('{page}', String(caught.page)).replace('{n}', String(caught.pageCount));
  }
  if (caught instanceof PageRangeTooLongError) return ui.rangeTooLong.replace('{n}', String(MAX_PAGE_SELECTION_CHARS));
  return ui.rangeSyntaxError.replace('{part}', caught instanceof PageRangeSyntaxError ? caught.part : fallback);
}
