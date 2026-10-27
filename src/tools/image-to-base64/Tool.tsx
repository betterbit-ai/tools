import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {
  Button,
  CopyButton,
  Dropzone,
  Field,
  Notice,
  Panel,
  Segmented,
  Stat,
  Textarea,
  inputClass,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { readAsDataUrl } from './encode';
import {
  MAX_IMAGE_BYTES,
  base64IncreasePercent,
  base64Length,
  createDataUri,
  defaultAltText,
  imageMimeType,
  imageOutput,
  type OutputFormat,
} from './logic';

const FORMAT_KEY = 'tools:image-to-base64:format';
const CSS_CLASS_KEY = 'tools:image-to-base64:css-class';

interface EncodedImage {
  name: string;
  size: number;
  mimeType: string;
  dataUri: string;
  base64: string;
}

type ErrorKind = 'not-image' | 'too-large' | 'read-failed';

const ERROR_UI_KEY: Record<ErrorKind, keyof UI> = {
  'not-image': 'notImage',
  'too-large': 'tooLarge',
  'read-failed': 'readFailed',
};

export default function ImageToBase64({ locale, ui }: ToolProps<UI>) {
  const [image, setImage] = useState<EncodedImage | null>(null);
  const [format, setFormat] = useState<OutputFormat>('data-uri');
  const [alt, setAlt] = useState('');
  const [cssClass, setCssClass] = useState('image');
  const [error, setError] = useState<ErrorKind | null>(null);
  const [reading, setReading] = useState(false);
  const [previewUnavailable, setPreviewUnavailable] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const readId = useRef(0);

  useEffect(() => {
    const savedFormat = safeStorage.get(FORMAT_KEY);
    if (savedFormat === 'data-uri' || savedFormat === 'base64' || savedFormat === 'html' || savedFormat === 'css') {
      setFormat(savedFormat);
    }
    setCssClass(safeStorage.get(CSS_CLASS_KEY) ?? 'image');
  }, []);

  useEffect(() => safeStorage.set(FORMAT_KEY, format), [format]);
  useEffect(() => safeStorage.set(CSS_CLASS_KEY, cssClass), [cssClass]);

  const addFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const mimeType = imageMimeType(file.type, file.name);
    const id = ++readId.current;
    setImage(null);
    setError(null);
    setCopyError(false);
    setPreviewUnavailable(false);

    if (!mimeType) {
      setError('not-image');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('too-large');
      return;
    }

    setReading(true);
    try {
      const read = await readAsDataUrl(file);
      if (id !== readId.current) return;
      const comma = read.indexOf(',');
      if (comma < 0) throw new Error('Invalid data URL');
      const base64 = read.slice(comma + 1);
      setImage({
        name: file.name,
        size: file.size,
        mimeType,
        base64,
        dataUri: createDataUri(mimeType, base64),
      });
      setAlt(defaultAltText(file.name));
    } catch {
      if (id === readId.current) setError('read-failed');
    } finally {
      if (id === readId.current) setReading(false);
    }
  }, []);

  const clear = () => {
    readId.current++;
    setImage(null);
    setAlt('');
    setError(null);
    setReading(false);
    setPreviewUnavailable(false);
    setCopyError(false);
  };

  const output = image ? imageOutput({ format, mimeType: image.mimeType, base64: image.base64, alt, cssClass }) : '';
  const encodedLength = image ? base64Length(image.size) : 0;
  const increase = image ? base64IncreasePercent(image.size) : 0;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <Dropzone
            accept="image/*,.svg,.avif,.heic,.heif"
            onFiles={addFiles}
            title={ui.dropTitle}
            hint={ui.dropHint}
            compact={Boolean(image)}
          />

          <div class="mt-4">
            <Notice>{ui.privacyNote}</Notice>
          </div>

          {reading && (
            <div class="mt-4" aria-live="polite">
              <Notice>{ui.reading}</Notice>
            </div>
          )}

          {error && (
            <div class="mt-4">
              <Notice tone="danger">{ui[ERROR_UI_KEY[error]]}</Notice>
            </div>
          )}

          {image && (
            <div class="mt-4">
              <div class="overflow-hidden rounded-lg border border-line bg-surface-2">
                {!previewUnavailable && (
                  <img
                    src={image.dataUri}
                    alt=""
                    class="max-h-72 w-full object-contain"
                    onError={() => setPreviewUnavailable(true)}
                  />
                )}
                {previewUnavailable && <p class="p-4 text-sm text-muted">{ui.previewUnavailable}</p>}
              </div>
              <div class="mt-3 flex items-center justify-between gap-3">
                <p class="min-w-0 truncate text-sm font-medium text-fg">{image.name}</p>
                <Button size="sm" variant="ghost" onClick={clear}>
                  {ui.clear}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div class="min-w-0 space-y-5">
          <Field label={ui.outputFormat}>
            <Segmented
              value={format}
              onValue={setFormat}
              label={ui.outputFormat}
              options={[
                { value: 'data-uri', label: ui.formatDataUri },
                { value: 'base64', label: ui.formatBase64 },
                { value: 'html', label: ui.formatHtml },
                { value: 'css', label: ui.formatCss },
              ]}
            />
          </Field>

          {format === 'html' && (
            <Field label={ui.altText} hint={ui.altHint}>
              <input class={inputClass} value={alt} onInput={(event) => setAlt(event.currentTarget.value)} />
            </Field>
          )}

          {format === 'css' && (
            <Field label={ui.cssClass} hint={ui.cssHint}>
              <input class={inputClass} value={cssClass} onInput={(event) => setCssClass(event.currentTarget.value)} />
            </Field>
          )}

          {image && (
            <div class="grid grid-cols-2 gap-2" aria-live="polite">
              <Stat label={ui.sourceSize} value={formatBytes(image.size, locale)} />
              <Stat label={ui.encodedSize} value={formatBytes(encodedLength, locale)} />
              <Stat label={ui.characters} value={formatNumber(Array.from(output).length, locale)} />
              <Stat label={ui.type} value={image.mimeType} />
            </div>
          )}

          {image && (
            <p class="text-xs text-subtle">{ui.sizeIncrease.replace('{percent}', formatNumber(increase, locale, 1))}</p>
          )}
        </div>
      </div>

      {image && (
        <div class="mt-6 border-t border-line pt-6">
          <Field label={ui.output}>
            <Textarea value={output} readOnly aria-label={ui.output} class="font-mono text-xs" />
          </Field>
          <div class="mt-3 flex flex-wrap items-center gap-3">
            <CopyButton
              text={output}
              label={ui.copy}
              copiedLabel={ui.copied}
              variant="primary"
              onSuccess={() => setCopyError(false)}
              onError={() => setCopyError(true)}
            />
            <p class="text-xs text-subtle">{ui.inlineTip}</p>
          </div>
          {copyError && (
            <div class="mt-3">
              <Notice tone="danger">{ui.copyFailed}</Notice>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
