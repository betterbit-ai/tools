import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import {
  Button,
  Dropzone,
  Field,
  Kbd,
  Notice,
  NumberInput,
  Panel,
  Segmented,
  Textarea,
  Toggle,
} from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { canvasBlob, drawMeme, readImage } from './meme';
import { normalizeCaption, normalizeOptions, outputName, type CanvasPreset, type MemeOptions } from './logic';

const STORAGE_KEY = 'tools:meme-generator:settings';

function storedOptions(ui: UI): MemeOptions {
  try {
    return normalizeOptions(
      JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') ?? {
        topText: ui.defaultTopText,
        bottomText: ui.defaultBottomText,
      },
    );
  } catch {
    return normalizeOptions({ topText: ui.defaultTopText, bottomText: ui.defaultBottomText });
  }
}

export default function MemeGenerator({ ui }: ToolProps<UI>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bitmapRef = useRef<ImageBitmap | null>(null);
  const [options, setOptions] = useState<MemeOptions>(() => storedOptions(ui));
  const [preset, setPreset] = useState<CanvasPreset>('wide');
  const [fileName, setFileName] = useState<string>();
  const [bitmapVersion, setBitmapVersion] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(options)), [options]);
  useEffect(
    () => () => {
      bitmapRef.current?.close();
    },
    [],
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    try {
      drawMeme(canvasRef.current, bitmapRef.current, preset, options);
      setError('');
    } catch {
      setError(ui.renderError);
    }
  }, [bitmapVersion, options, preset, ui.renderError]);

  const usePreset = (nextPreset: CanvasPreset) => {
    bitmapRef.current?.close();
    bitmapRef.current = null;
    setFileName(undefined);
    setPreset(nextPreset);
    setBitmapVersion((version) => version + 1);
    setError('');
  };

  const addFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      try {
        const next = await readImage(file);
        bitmapRef.current?.close();
        bitmapRef.current = next;
        setFileName(file.name);
        setBitmapVersion((version) => version + 1);
        setError('');
      } catch {
        setError(ui.unsupported);
      }
    },
    [ui.unsupported],
  );

  const update = <K extends keyof MemeOptions>(key: K, value: MemeOptions[K]) =>
    setOptions((previous) => normalizeOptions({ ...previous, [key]: value }));

  const captions = [options.topText, options.bottomText].filter(Boolean).join(' / ');
  const previewDescription = captions
    ? ui.previewWithCaptions.replace('{captions}', captions)
    : fileName
      ? ui.previewImage
      : ui.previewBlank;

  const download = async () => {
    if (!canvasRef.current) return;
    try {
      downloadBlob(await canvasBlob(canvasRef.current), outputName(fileName));
      setError('');
    } catch {
      setError(ui.downloadError);
    }
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <div class="overflow-hidden rounded-lg border border-line bg-surface-2">
            <canvas ref={canvasRef} role="img" aria-label={previewDescription} class="block h-auto w-full">
              {previewDescription}
            </canvas>
          </div>
          <span class="sr-only" aria-live="polite">
            {previewDescription}
          </span>
          <p class="mt-2 text-xs text-subtle" aria-live="polite">
            {fileName ? `${ui.usingImage}: ${fileName}` : ui.blankCanvas}
          </p>
          <div class="mt-4">
            <Dropzone
              accept="image/*"
              onFiles={addFiles}
              compact
              title={fileName ? ui.replaceTitle : ui.dropTitle}
              hint={ui.dropHint}
            />
          </div>
          <div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-subtle">
            <span>{ui.pasteHint}</span>
            <Kbd>{ui.pasteKeys}</Kbd>
          </div>
          {error && (
            <div class="mt-4">
              <Notice tone="danger">{error}</Notice>
            </div>
          )}
        </div>

        <div class="flex flex-col gap-5">
          <Segmented
            label={ui.canvasLabel}
            value={preset}
            onValue={usePreset}
            options={[
              { value: 'wide', label: ui.canvasWide },
              { value: 'square', label: ui.canvasSquare },
            ]}
          />
          <Field label={ui.topLabel} hint={ui.captionHint}>
            <Textarea
              value={options.topText}
              onInput={(event) => update('topText', normalizeCaption(event.currentTarget.value))}
            />
          </Field>
          <Field label={ui.bottomLabel} hint={ui.captionHint}>
            <Textarea
              value={options.bottomText}
              onInput={(event) => update('bottomText', normalizeCaption(event.currentTarget.value))}
            />
          </Field>
          <Field label={ui.fontSizeLabel} hint={ui.fontSizeHint}>
            <NumberInput
              value={options.fontScale}
              min={4}
              max={20}
              step={1}
              onValue={(value) => value !== '' && update('fontScale', value)}
            />
          </Field>
          <Toggle checked={options.allCaps} onChecked={(value) => update('allCaps', value)} label={ui.allCaps} />
          <div class="border-t border-line pt-5">
            <Button variant="primary" size="lg" onClick={download}>
              {ui.download}
            </Button>
            <p class="mt-2 text-xs text-subtle">{ui.downloadHint}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}
