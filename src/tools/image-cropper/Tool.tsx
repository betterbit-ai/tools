import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Kbd, Notice, NumberInput, Panel, Segmented, Select, cx } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import { cropImage, readDimensions } from './crop';
import type { UI } from './content';
import {
  ASPECTS,
  applyAspect,
  aspectRatio,
  clampRect,
  extensionFor,
  initialCrop,
  moveRect,
  outputName,
  outputType,
  resizeRect,
  roundRect,
  supportsQuality,
  type AspectId,
  type CropRect,
  type FormatChoice,
  type Handle,
  type ShapeKind,
} from './logic';

const HANDLES: { id: Handle; cursor: string; style: string }[] = [
  { id: 'nw', cursor: 'nwse-resize', style: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' },
  { id: 'n', cursor: 'ns-resize', style: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
  { id: 'ne', cursor: 'nesw-resize', style: 'top-0 right-0 translate-x-1/2 -translate-y-1/2' },
  { id: 'e', cursor: 'ew-resize', style: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
  { id: 'se', cursor: 'nwse-resize', style: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' },
  { id: 's', cursor: 'ns-resize', style: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
  { id: 'sw', cursor: 'nesw-resize', style: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' },
  { id: 'w', cursor: 'ew-resize', style: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
];

const aspectKey = (id: AspectId) => `aspect_${id.replace(/:/g, '_')}` as keyof UI;

interface Drag {
  kind: 'move' | 'resize';
  handle?: Handle;
  startX: number;
  startY: number;
  startRect: CropRect;
}

export default function ImageCropper({ locale, ui }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [previewUrl, setPreviewUrl] = useState('');
  const [rect, setRect] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [aspect, setAspect] = useState<AspectId>('free');
  const [shape, setShape] = useState<ShapeKind>('rect');
  const [format, setFormat] = useState<FormatChoice>('original');
  const [quality, setQuality] = useState(90);
  const [error, setError] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; url: string; name: string } | null>(null);
  const [display, setDisplay] = useState({ w: 0, h: 0 });

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const rectRef = useRef(rect);
  rectRef.current = rect;
  const naturalRef = useRef(natural);
  naturalRef.current = natural;
  const scaleRef = useRef(0);
  const aspectRatioRef = useRef<number | null>(null);
  aspectRatioRef.current = shape === 'circle' ? 1 : aspectRatio(aspect);

  useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const update = () => setDisplay({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewUrl]);

  const loadFile = useCallback(async (f: File) => {
    try {
      const dims = await readDimensions(f);
      setFile(f);
      setNatural({ w: dims.width, h: dims.height });
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(f);
      });
      setRect(initialCrop(dims.width, dims.height));
      setAspect('free');
      setShape('rect');
      setResult(null);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      if (files[0]) void loadFile(files[0]);
    },
    [loadFile],
  );

  const reset = () => {
    setRect(initialCrop(natural.w, natural.h));
    setAspect('free');
    setShape('rect');
  };

  const clear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (result) URL.revokeObjectURL(result.url);
    setFile(null);
    setPreviewUrl('');
    setResult(null);
    setError(false);
  };

  // Re-encode whenever the crop region or output settings change (debounced, cancellable).
  useEffect(() => {
    if (!file || !natural.w) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const mime = outputType(shape, format, file.type);
        const cropped = roundRect(rect, natural.w, natural.h);
        const blob = await cropImage(file, cropped, shape, mime, quality / 100);
        if (cancelled) return;
        setResult((prev) => {
          if (prev) URL.revokeObjectURL(prev.url);
          return { blob, url: URL.createObjectURL(blob), name: outputName(file.name, mime, cropped.w, cropped.h) };
        });
      } catch {
        if (!cancelled) setError(true);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [file, natural, rect, shape, format, quality]);

  const scale = display.w > 0 && natural.w > 0 ? display.w / natural.w : 0;
  scaleRef.current = scale;

  const onDragMove = useCallback((e: PointerEvent) => {
    const drag = dragRef.current;
    const s = scaleRef.current;
    if (!drag || !s) return;
    const dx = (e.clientX - drag.startX) / s;
    const dy = (e.clientY - drag.startY) / s;
    const ratio = aspectRatioRef.current;
    const { w, h } = naturalRef.current;
    setRect(
      drag.kind === 'move'
        ? moveRect(drag.startRect, dx, dy, w, h)
        : resizeRect(drag.startRect, drag.handle!, dx, dy, w, h, ratio),
    );
  }, []);

  const endDrag = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', endDrag);
  }, [onDragMove]);

  const startDrag = (kind: Drag['kind'], handle: Handle | undefined, e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = { kind, handle, startX: e.clientX, startY: e.clientY, startRect: rectRef.current };
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', endDrag);
  };

  // Defensive cleanup if the component unmounts mid-drag (e.g. navigating away).
  useEffect(() => endDrag, [endDrag]);

  const setAspectAndRefit = (id: AspectId) => {
    setAspect(id);
    setRect((r) => applyAspect(r, aspectRatio(id), natural.w, natural.h));
  };

  const setShapeAndRefit = (s: ShapeKind) => {
    setShape(s);
    if (s === 'circle') {
      setAspect('1:1');
      setRect((r) => applyAspect(r, 1, natural.w, natural.h));
    }
  };

  const setField = (key: keyof CropRect) => (v: number | '') => {
    if (v === '') return;
    // Circle crops must stay square: typing a side updates both (capped to the
    // smaller image dimension) so the mask stays a circle, not an ellipse.
    const next: CropRect =
      shape === 'circle' && (key === 'w' || key === 'h')
        ? { ...rect, w: Math.min(v, natural.w, natural.h), h: Math.min(v, natural.w, natural.h) }
        : { ...rect, [key]: v };
    if (shape !== 'circle') setAspect('free');
    setRect(clampRect(next, natural.w, natural.h));
  };

  const nudge = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setRect((r) => moveRect(r, move[0], move[1], natural.w, natural.h));
  };

  const outMime = file ? outputType(shape, format, file.type) : 'image/png';
  const cropped = natural.w ? roundRect(rect, natural.w, natural.h) : null;

  const boxStyle = {
    left: `${rect.x * scale}px`,
    top: `${rect.y * scale}px`,
    width: `${rect.w * scale}px`,
    height: `${rect.h * scale}px`,
  };

  return (
    <Panel>
      {!file ? (
        <>
          <Dropzone accept="image/*" onFiles={addFiles} title={ui.dropTitle} hint={ui.dropHint} />
          <div class="mt-4">
            <Notice>{ui.privacyNote}</Notice>
          </div>
          {error && (
            <div class="mt-4">
              <Notice tone="danger">{ui.unsupported}</Notice>
            </div>
          )}
        </>
      ) : (
        <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div class="min-w-0">
            <div
              ref={stageRef}
              class="relative mx-auto max-w-full select-none touch-none overflow-hidden rounded-lg bg-surface-2"
              style={{ width: 'fit-content' }}
            >
              <img src={previewUrl} alt="" draggable={false} class="block max-h-[480px] w-auto max-w-full" />
              {scale > 0 && (
                <div
                  role="group"
                  aria-label={ui.cropBoxLabel}
                  tabIndex={0}
                  onKeyDown={nudge}
                  onPointerDown={(e) => startDrag('move', undefined, e as unknown as PointerEvent)}
                  class={cx(
                    'absolute border-2 border-accent shadow-[0_0_0_9999px_rgb(var(--shadow-color)/0.55)] cursor-move',
                    shape === 'circle' ? 'rounded-full' : '',
                  )}
                  style={boxStyle}
                >
                  {HANDLES.map((h) => (
                    <div
                      key={h.id}
                      onPointerDown={(e) => startDrag('resize', h.id, e as unknown as PointerEvent)}
                      class={cx('absolute size-3 rounded-full bg-accent border-2 border-surface', h.style)}
                      style={{ cursor: h.cursor }}
                    />
                  ))}
                </div>
              )}
            </div>
            <p class="mt-2 text-xs text-subtle">
              {ui.keyboardHint} <Kbd>↑↓←→</Kbd>
            </p>

            {result && (
              <div class="mt-4 flex flex-wrap items-center gap-3">
                <Button variant="primary" size="lg" onClick={() => downloadBlob(result.blob, result.name)}>
                  {ui.download}
                </Button>
                <Button variant="ghost" onClick={clear}>
                  {ui.replace}
                </Button>
                <span class="text-sm text-muted tabular" aria-live="polite">
                  {cropped?.w}×{cropped?.h} · {formatBytes(result.blob.size, locale)}
                </span>
              </div>
            )}
          </div>

          <div class="flex flex-col gap-5">
            <Segmented
              label={ui.shapeLabel}
              value={shape}
              onValue={setShapeAndRefit}
              options={[
                { value: 'rect', label: ui.shapeRect },
                { value: 'circle', label: ui.shapeCircle },
              ]}
            />

            <Field label={ui.aspectLabel} hint={shape === 'circle' ? ui.circleAspectLockedHint : undefined}>
              <Select<AspectId>
                value={aspect}
                onValue={setAspectAndRefit}
                options={ASPECTS.map((a) => ({ value: a.id, label: ui[aspectKey(a.id)] }))}
                id="crop-aspect"
              />
            </Field>

            <div class="grid grid-cols-2 gap-3">
              <Field label={ui.x}>
                <NumberInput value={Math.round(rect.x)} min={0} onValue={setField('x')} />
              </Field>
              <Field label={ui.y}>
                <NumberInput value={Math.round(rect.y)} min={0} onValue={setField('y')} />
              </Field>
              <Field label={ui.width}>
                <NumberInput value={Math.round(rect.w)} min={1} onValue={setField('w')} />
              </Field>
              <Field label={ui.height}>
                <NumberInput value={Math.round(rect.h)} min={1} onValue={setField('h')} />
              </Field>
            </div>

            <Button variant="secondary" onClick={reset}>
              {ui.reset}
            </Button>

            <div class="border-t border-line pt-5 flex flex-col gap-5">
              <Field label={ui.format}>
                <Select<FormatChoice>
                  value={format}
                  onValue={setFormat}
                  options={[
                    { value: 'original', label: ui.formatOriginal },
                    { value: 'image/jpeg', label: 'JPG' },
                    { value: 'image/png', label: 'PNG' },
                    { value: 'image/webp', label: 'WebP' },
                  ]}
                />
              </Field>
              {supportsQuality(outMime) && (
                <Field label={`${ui.quality}: ${quality}`} hint={ui.qualityHint}>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={quality}
                    onInput={(e) => setQuality(Number((e.currentTarget as HTMLInputElement).value))}
                    class="w-full accent-[var(--accent)]"
                  />
                </Field>
              )}
              <p class="text-xs text-subtle">.{extensionFor(outMime)}</p>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
