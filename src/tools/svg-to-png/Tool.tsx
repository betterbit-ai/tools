import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, NumberInput, Panel, Segmented, Stat, Textarea } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { isSvgMarkup, outputDimensions, pngFilename, svgDimensions, type Scale, type SizeMode } from './logic';
import { rasterizeSvg } from './rasterize';

const SOURCE_KEY = 'tools:svg-to-png:source';
const MODE_KEY = 'tools:svg-to-png:size-mode';
const SCALE_KEY = 'tools:svg-to-png:scale';
const BACKGROUND_KEY = 'tools:svg-to-png:background';

interface Output {
  blob: Blob;
  url: string;
  key: string;
  removedExternalResources: boolean;
}

export default function SvgToPng({ ui }: ToolProps<UI>) {
  const [source, setSource] = useState('');
  const [fileName, setFileName] = useState('image.svg');
  const [sizeMode, setSizeMode] = useState<SizeMode>('scale');
  const [scale, setScale] = useState<Scale>(1);
  const [width, setWidth] = useState<number | ''>('');
  const [background, setBackground] = useState<'transparent' | 'white'>('transparent');
  const [output, setOutput] = useState<Output | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);
  const outputRef = useRef<Output | null>(null);

  useEffect(() => {
    setSource(safeStorage.get(SOURCE_KEY) ?? '');
    const savedMode = safeStorage.get(MODE_KEY);
    if (savedMode === 'scale' || savedMode === 'width') setSizeMode(savedMode);
    const savedScale = Number(safeStorage.get(SCALE_KEY));
    if (savedScale === 1 || savedScale === 2 || savedScale === 3 || savedScale === 4) setScale(savedScale);
    const savedBackground = safeStorage.get(BACKGROUND_KEY);
    if (savedBackground === 'transparent' || savedBackground === 'white') setBackground(savedBackground);
  }, []);

  useEffect(() => safeStorage.set(SOURCE_KEY, source), [source]);
  useEffect(() => safeStorage.set(MODE_KEY, sizeMode), [sizeMode]);
  useEffect(() => safeStorage.set(SCALE_KEY, String(scale)), [scale]);
  useEffect(() => safeStorage.set(BACKGROUND_KEY, background), [background]);
  useEffect(
    () => () => {
      runId.current++;
      if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    },
    [],
  );

  const dimensions = useMemo(() => svgDimensions(source), [source]);
  const size = useMemo(
    () => (dimensions ? outputDimensions(dimensions, { mode: sizeMode, scale, width }) : null),
    [dimensions, scale, sizeMode, width],
  );
  const sourceError = source.trim() && !isSvgMarkup(source) ? ui.invalidSvg : null;
  const sizeError = dimensions && !size ? ui.tooLarge : null;
  const renderKey = JSON.stringify([source, size, background]);
  const currentOutput = output?.key === renderKey ? output : null;

  const replaceOutput = useCallback((next: Output | null) => {
    if (outputRef.current) URL.revokeObjectURL(outputRef.current.url);
    outputRef.current = next;
    setOutput(next);
  }, []);

  useEffect(() => {
    const id = ++runId.current;
    setError(sourceError ?? sizeError);
    if (!source.trim() || sourceError || !size) {
      setWorking(false);
      replaceOutput(null);
      return;
    }
    setWorking(true);
    const timer = setTimeout(async () => {
      try {
        const result = await rasterizeSvg(source, size, background);
        if (runId.current !== id) return;
        replaceOutput({ ...result, key: renderKey, url: URL.createObjectURL(result.blob) });
        setError(null);
      } catch {
        if (runId.current === id) {
          replaceOutput(null);
          setError(ui.renderFailed);
        }
      } finally {
        if (runId.current === id) setWorking(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [background, renderKey, replaceOutput, size, source, sourceError, ui.renderFailed, sizeError]);

  const addFiles = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      try {
        const text = await file.text();
        setFileName(file.name || 'image.svg');
        setSource(text);
      } catch {
        setError(ui.readFailed);
      }
    },
    [ui.readFailed],
  );

  const changeMode = (mode: SizeMode) => {
    setSizeMode(mode);
    if (mode === 'width' && width === '' && dimensions) setWidth(dimensions.width);
  };

  const clear = () => {
    setSource('');
    setFileName('image.svg');
    setSizeMode('scale');
    setWidth('');
    setError(null);
    safeStorage.remove(SOURCE_KEY);
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div class="min-w-0">
          <Dropzone
            accept="image/svg+xml,.svg"
            onFiles={addFiles}
            title={ui.dropTitle}
            hint={ui.dropHint}
            compact={Boolean(source)}
          />

          <div class="mt-4">
            <Field label={ui.source} hint={ui.sourceHint}>
              <Textarea
                value={source}
                onInput={(event) => {
                  setFileName('image.svg');
                  setSource(event.currentTarget.value);
                }}
                placeholder={ui.sourcePlaceholder}
                aria-label={ui.source}
                class="font-mono text-xs"
              />
            </Field>
          </div>

          <div class="mt-4">
            <Notice>{ui.privacyNote}</Notice>
          </div>

          {error && (
            <div class="mt-4">
              <Notice tone="danger">{error}</Notice>
            </div>
          )}

          {working && (
            <div class="mt-4" aria-live="polite">
              <Notice>{ui.rendering}</Notice>
            </div>
          )}

          {currentOutput && size && (
            <div class="mt-4">
              <div class="overflow-hidden rounded-lg border border-line bg-surface-2 p-3">
                <img src={currentOutput.url} alt={ui.previewAlt} class="max-h-80 w-full object-contain" />
              </div>
              {currentOutput.removedExternalResources && (
                <div class="mt-3">
                  <Notice>{ui.externalResources}</Notice>
                </div>
              )}
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  disabled={working}
                  onClick={() => downloadBlob(currentOutput.blob, pngFilename(fileName))}
                >
                  {ui.download}
                </Button>
                <Button variant="ghost" onClick={clear}>
                  {ui.clear}
                </Button>
                <p class="text-xs text-subtle">{ui.downloadHint.replace('{name}', pngFilename(fileName))}</p>
              </div>
            </div>
          )}
        </div>

        <div class="min-w-0 space-y-5">
          <Field label={ui.resizeBy}>
            <Segmented
              value={sizeMode}
              onValue={changeMode}
              label={ui.resizeBy}
              options={[
                { value: 'scale', label: ui.modeScale },
                { value: 'width', label: ui.modeWidth },
              ]}
            />
          </Field>

          {sizeMode === 'scale' ? (
            <Field label={ui.scale} hint={ui.scaleHint}>
              <Segmented
                value={String(scale)}
                onValue={(value) => setScale(Number(value) as Scale)}
                label={ui.scale}
                options={[
                  { value: '1', label: ui.scale1 },
                  { value: '2', label: ui.scale2 },
                  { value: '3', label: ui.scale3 },
                  { value: '4', label: ui.scale4 },
                ]}
              />
            </Field>
          ) : (
            <Field label={ui.width} hint={ui.widthHint}>
              <NumberInput value={width} min={1} max={8192} onValue={setWidth} aria-label={ui.width} />
            </Field>
          )}

          <Field label={ui.background} hint={ui.backgroundHint}>
            <Segmented
              value={background}
              onValue={setBackground}
              label={ui.background}
              options={[
                { value: 'transparent', label: ui.backgroundTransparent },
                { value: 'white', label: ui.backgroundWhite },
              ]}
            />
          </Field>

          {dimensions && size && (
            <div class="grid grid-cols-2 gap-2" aria-live="polite">
              <Stat label={ui.sourceSize} value={`${dimensions.width} × ${dimensions.height}`} />
              <Stat label={ui.outputSize} value={`${size.width} × ${size.height}`} emphasis />
            </div>
          )}
          {dimensions?.source === 'fallback' && <p class="text-xs text-subtle">{ui.fallbackSize}</p>}
          <p class="text-xs text-subtle">{ui.limitHint}</p>
        </div>
      </div>
    </Panel>
  );
}
