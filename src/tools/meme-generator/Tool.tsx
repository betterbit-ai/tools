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
import { downloadBlob, safeStorage, yieldToBrowser } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { drawMeme, readImage, renderMemeBlob } from './meme';
import {
  isSupportedImageFileSize,
  normalizeCaption,
  normalizeOptions,
  outputName,
  previewDimensions,
  type CanvasPreset,
  type MemeOptions,
} from './logic';

const STORAGE_KEY = 'tools:meme-generator:settings';

interface ImageInfo {
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
}

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
  const loadVersionRef = useRef(0);
  const loadAbortRef = useRef<AbortController | null>(null);
  const saveVersionRef = useRef(0);
  const [options, setOptions] = useState<MemeOptions>(() => storedOptions(ui));
  const [preset, setPreset] = useState<CanvasPreset>('wide');
  const [fileName, setFileName] = useState<string>();
  const [imageInfo, setImageInfo] = useState<ImageInfo>();
  const [bitmapVersion, setBitmapVersion] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => safeStorage.set(STORAGE_KEY, JSON.stringify(options)), [options]);
  useEffect(
    () => () => {
      loadVersionRef.current += 1;
      loadAbortRef.current?.abort();
      saveVersionRef.current += 1;
      bitmapRef.current?.close();
    },
    [],
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    setIsRendering(true);
    const timeout = setTimeout(() => {
      try {
        if (!canvasRef.current) return;
        const bitmap = bitmapRef.current;
        const dimensions = bitmap ? previewDimensions(bitmap.width, bitmap.height) : undefined;
        drawMeme(canvasRef.current, bitmap, preset, options, dimensions);
        setError('');
      } catch {
        setError(ui.renderError);
      } finally {
        setIsRendering(false);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [bitmapVersion, options, preset, ui.renderError]);

  const usePreset = (nextPreset: CanvasPreset) => {
    loadVersionRef.current += 1;
    loadAbortRef.current?.abort();
    loadAbortRef.current = null;
    setIsLoading(false);
    bitmapRef.current?.close();
    bitmapRef.current = null;
    setFileName(undefined);
    setImageInfo(undefined);
    setPreset(nextPreset);
    setBitmapVersion((version) => version + 1);
    setError('');
  };

  const addFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      loadAbortRef.current?.abort();
      const loadVersion = ++loadVersionRef.current;
      if (!isSupportedImageFileSize(file.size)) {
        setIsLoading(false);
        setError(ui.fileTooLarge);
        return;
      }
      const controller = new AbortController();
      loadAbortRef.current = controller;
      setIsLoading(true);
      setError('');
      try {
        const next = await readImage(file, controller.signal);
        if (loadVersion !== loadVersionRef.current) {
          next.bitmap.close();
          return;
        }
        bitmapRef.current?.close();
        bitmapRef.current = next.bitmap;
        setFileName(file.name);
        setImageInfo({
          originalWidth: next.originalWidth,
          originalHeight: next.originalHeight,
          width: next.bitmap.width,
          height: next.bitmap.height,
        });
        setBitmapVersion((version) => version + 1);
        setError('');
      } catch (cause) {
        if (loadVersion === loadVersionRef.current && !(cause instanceof DOMException && cause.name === 'AbortError')) {
          setError(ui.unsupported);
        }
      } finally {
        if (loadVersion === loadVersionRef.current) {
          loadAbortRef.current = null;
          setIsLoading(false);
        }
      }
    },
    [ui.fileTooLarge, ui.unsupported],
  );

  const update = <K extends keyof MemeOptions>(key: K, value: MemeOptions[K]) =>
    setOptions((previous) => normalizeOptions({ ...previous, [key]: value }));

  const captions = [options.topText, options.bottomText].filter(Boolean).join(' / ');
  const previewDescription = captions
    ? ui.previewWithCaptions.replace('{captions}', captions)
    : fileName
      ? ui.previewImage
      : ui.previewBlank;

  const cancelLoad = () => {
    loadVersionRef.current += 1;
    loadAbortRef.current?.abort();
    loadAbortRef.current = null;
    setIsLoading(false);
  };

  const cancelSave = () => {
    saveVersionRef.current += 1;
    setIsSaving(false);
  };

  const download = async () => {
    if (isSaving) return;
    const saveVersion = ++saveVersionRef.current;
    setIsSaving(true);
    setError('');
    try {
      await yieldToBrowser();
      if (saveVersion !== saveVersionRef.current) return;
      const blob = await renderMemeBlob(bitmapRef.current, preset, options);
      if (saveVersion !== saveVersionRef.current) return;
      downloadBlob(blob, outputName(fileName));
    } catch {
      if (saveVersion === saveVersionRef.current) setError(ui.downloadError);
    } finally {
      if (saveVersion === saveVersionRef.current) setIsSaving(false);
    }
  };

  const reduced =
    imageInfo && (imageInfo.originalWidth !== imageInfo.width || imageInfo.originalHeight !== imageInfo.height);
  const reducedMessage = reduced
    ? ui.reducedImage
        .replace('{original}', `${imageInfo.originalWidth}×${imageInfo.originalHeight}`)
        .replace('{output}', `${imageInfo.width}×${imageInfo.height}`)
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <div class="overflow-hidden rounded-lg border border-line bg-surface-2">
            <canvas
              ref={canvasRef}
              width={1200}
              height={675}
              role="img"
              aria-label={previewDescription}
              class="block h-auto w-full"
            >
              {previewDescription}
            </canvas>
          </div>
          <span class="sr-only" aria-live="polite">
            {previewDescription}
          </span>
          <p class="mt-2 text-xs text-subtle" aria-live="polite">
            {fileName ? `${ui.usingImage}: ${fileName}` : ui.blankCanvas}
          </p>
          {isRendering && <p class="mt-1 text-xs text-subtle">{ui.rendering}</p>}
          {reduced && (
            <div class="mt-3">
              <Notice>{reducedMessage}</Notice>
            </div>
          )}
          <div class="mt-4">
            <Dropzone
              accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.heic,.heif"
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
          {isLoading && (
            <div class="mt-4 flex flex-wrap items-center gap-3" aria-live="polite">
              <span class="text-sm text-muted">{ui.readingImage}</span>
              <Button variant="secondary" size="sm" onClick={cancelLoad}>
                {ui.cancel}
              </Button>
            </div>
          )}
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
            <div class="flex flex-wrap items-center gap-2">
              <Button variant="primary" size="lg" onClick={download} disabled={isLoading || isSaving}>
                {isSaving ? ui.saving : ui.download}
              </Button>
              {isSaving && (
                <Button variant="secondary" size="md" onClick={cancelSave}>
                  {ui.cancel}
                </Button>
              )}
            </div>
            <p class="mt-2 text-xs text-subtle">{ui.downloadHint}</p>
          </div>
        </div>
      </div>
    </Panel>
  );
}
