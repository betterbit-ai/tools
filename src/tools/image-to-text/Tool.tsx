import { useCallback, useEffect, useState } from 'preact/hooks';
import { Button, CopyButton, Dropzone, Field, Notice, Panel, Select, Stat, Textarea } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  characterCount,
  extractedTextFileName,
  fileExceedsLimit,
  imageExceedsPixelLimit,
  isSupportedImage,
  normalizeOcrText,
  type OcrLanguage,
} from './logic';
import { recognizeImage, type OcrProgress } from './ocr';

type FileError = 'unsupported' | 'file-size' | 'pixel-size' | 'unreadable' | 'failed';

const ACCEPTED_IMAGES = 'image/jpeg,image/png,image/webp,image/bmp,.jpg,.jpeg,.png,.webp,.bmp';

export default function ImageToText({ locale, ui }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<OcrLanguage>(locale === 'ko' ? 'kor' : 'eng');
  const [text, setText] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);
  const [progress, setProgress] = useState<OcrProgress | null>(null);
  const [error, setError] = useState<FileError | null>(null);

  useEffect(() => {
    if (!file) return;
    const controller = new AbortController();
    setText('');
    setConfidence(null);
    setError(null);
    setProgress({ stage: 'starting', percent: 0 });

    void (async () => {
      let decoded = false;
      try {
        const bitmap = await createImageBitmap(file);
        const exceedsLimit = imageExceedsPixelLimit(bitmap.width, bitmap.height);
        bitmap.close();
        decoded = true;
        if (exceedsLimit) {
          setError('pixel-size');
          setProgress(null);
          return;
        }
        const result = await recognizeImage(file, language, setProgress, controller.signal);
        if (controller.signal.aborted) return;
        setText(normalizeOcrText(result.text));
        setConfidence(result.confidence);
        setProgress(null);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setProgress(null);
        setError(
          cause instanceof DOMException && cause.name === 'AbortError' ? null : decoded ? 'failed' : 'unreadable',
        );
      }
    })();

    return () => controller.abort();
  }, [file, language]);

  const addFile = useCallback((picked: File) => {
    setText('');
    setConfidence(null);
    setProgress(null);
    if (!isSupportedImage(picked.name, picked.type)) {
      setFile(null);
      setError('unsupported');
      return;
    }
    if (fileExceedsLimit(picked.size)) {
      setFile(null);
      setError('file-size');
      return;
    }
    setError(null);
    setFile(picked);
  }, []);

  const clear = () => {
    setFile(null);
    setText('');
    setConfidence(null);
    setProgress(null);
    setError(null);
  };
  const errorMessage =
    error === 'unsupported'
      ? ui.unsupported
      : error === 'file-size'
        ? ui.fileSizeLimit
        : error === 'pixel-size'
          ? ui.pixelSizeLimit
          : error === 'unreadable'
            ? ui.unreadable
            : error === 'failed'
              ? ui.failed
              : null;
  const progressLabel = progress
    ? ui.progress.replace('{stage}', ui[progress.stage]).replace('{percent}', formatNumber(progress.percent, locale))
    : '';
  const languageOptions: { value: OcrLanguage; label: string }[] = [
    { value: 'eng', label: ui.english },
    { value: 'kor', label: ui.korean },
    { value: 'eng+kor', label: ui.mixed },
  ];
  const download = () => {
    if (!file || !text) return;
    downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), extractedTextFileName(file.name));
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div class="min-w-0">
          <Dropzone
            accept={ACCEPTED_IMAGES}
            onFiles={(files) => files[0] && addFile(files[0])}
            title={ui.dropTitle}
            hint={ui.dropHint}
            compact={!!file}
          />

          {file && (
            <div class="mt-4 flex items-center gap-3 rounded-lg border border-line p-3 text-sm">
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-fg">{file.name}</p>
                <p class="tabular text-muted">{formatBytes(file.size, locale)}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={clear}>
                {ui.remove}
              </Button>
            </div>
          )}

          {errorMessage && (
            <div class="mt-4">
              <Notice tone="danger">{errorMessage}</Notice>
            </div>
          )}

          {progress && (
            <div class="mt-4" aria-live="polite">
              <Notice>{progressLabel}</Notice>
            </div>
          )}

          {file && !progress && !error && (
            <div class="mt-4">
              <Notice>{text ? ui.resultReady : ui.noText}</Notice>
            </div>
          )}

          {(text || (file && !progress && !error)) && (
            <div class="mt-5">
              <Field label={ui.resultLabel} hint={ui.resultHint}>
                <Textarea
                  aria-label={ui.resultLabel}
                  value={text}
                  onInput={(event) => setText((event.currentTarget as HTMLTextAreaElement).value)}
                  placeholder={ui.resultPlaceholder}
                />
              </Field>
              <div class="mt-3 flex flex-wrap gap-2">
                <CopyButton text={text} label={ui.copy} copiedLabel={ui.copied} />
                <Button size="sm" disabled={!text} onClick={download}>
                  {ui.download}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div class="space-y-5">
          <Field label={ui.languageLabel} hint={ui.languageHint}>
            <Select value={language} onValue={setLanguage} options={languageOptions} disabled={!!progress} />
          </Field>
          <Notice>{ui.privacyNote}</Notice>
          <div class="grid grid-cols-2 gap-3">
            <Stat label={ui.characters} value={formatNumber(characterCount(text), locale)} />
            <Stat
              label={ui.confidence}
              value={confidence === null ? '—' : `${formatNumber(Math.round(confidence), locale)}%`}
            />
          </div>
          <p class="text-xs leading-5 text-subtle">{ui.limitNote}</p>
        </div>
      </div>
    </Panel>
  );
}
