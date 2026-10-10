import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, inputClass, NumberInput, Notice, Panel, Segmented } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  clampPageNumber,
  clampPlacement,
  DEFAULT_PLACEMENT,
  dragPlacement,
  EncryptedPdfError,
  fileExceedsLimit,
  hasSignature,
  INK_COLOR,
  isPdfFile,
  nudgePlacement,
  pageCountExceedsLimit,
  placementToPdfRect,
  signedFileName,
  SIGNATURE_ASPECT,
  SIZE_PRESETS,
  type Placement,
  type SignatureMode,
  type SizePreset,
  type Stroke,
} from './logic';
import { drawStrokes, drawTypedSignature, readPdfInfo, renderPagePreview, signPdf } from './sign';

const MODE_KEY = 'tools:sign-pdf:mode';
const SIZE_KEY = 'tools:sign-pdf:size';
const SIGNATURE_WIDTH = 600;
const SIGNATURE_HEIGHT = Math.round(SIGNATURE_WIDTH * SIGNATURE_ASPECT);
const PREVIEW_MAX_WIDTH = 480;

function initialMode(): SignatureMode {
  return safeStorage.get(MODE_KEY) === 'type' ? 'type' : 'draw';
}

function initialSize(): SizePreset {
  const saved = safeStorage.get(SIZE_KEY);
  return saved === 'sm' || saved === 'md' || saved === 'lg' ? saved : 'md';
}

function pointerToCanvas(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * canvas.width,
    y: ((clientY - rect.top) / rect.height) * canvas.height,
  };
}

type LoadError = 'invalid' | 'encrypted' | 'file-size' | 'page-count';

export default function SignPdf({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageSizes, setPageSizes] = useState<{ width: number; height: number }[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadError, setLoadError] = useState<LoadError | null>(null);

  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 });

  const [mode, setMode] = useState<SignatureMode>(initialMode);
  const [sizePreset, setSizePreset] = useState<SizePreset>(initialSize);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [typedText, setTypedText] = useState('');
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement>(DEFAULT_PLACEMENT);

  const [signing, setSigning] = useState(false);
  const [signFailed, setSignFailed] = useState(false);

  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef<Stroke | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    placement: Placement;
    width: number;
    height: number;
  } | null>(null);
  const runId = useRef(0);

  useEffect(() => safeStorage.set(MODE_KEY, mode), [mode]);
  useEffect(() => safeStorage.set(SIZE_KEY, sizePreset), [sizePreset]);

  // Redraws the signature canvas whenever its content changes, and keeps the
  // overlay preview image in sync so the placement box always shows real ink.
  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    if (mode === 'type') drawTypedSignature(canvas, typedText, INK_COLOR);
    else drawStrokes(canvas, strokes, INK_COLOR);
    setSignatureDataUrl(hasSignature(mode, strokes, typedText) ? canvas.toDataURL('image/png') : null);
  }, [mode, strokes, typedText]);

  const loadFile = (picked: File) => {
    setFile(picked);
    setBytes(null);
    setPreviewSrc(null);
    setPageCount(0);
    setPageSizes([]);
    setPlacement(DEFAULT_PLACEMENT);
    if (!isPdfFile(picked.name, picked.type)) {
      setLoadError('invalid');
      return;
    }
    if (fileExceedsLimit(picked.size)) {
      setLoadError('file-size');
      return;
    }
    setLoadError(null);
    (async () => {
      const buf = new Uint8Array(await picked.arrayBuffer());
      try {
        const info = await readPdfInfo(buf, picked.name);
        if (pageCountExceedsLimit(info.pageCount)) {
          setLoadError('page-count');
          return;
        }
        setBytes(buf);
        setPageCount(info.pageCount);
        setPageSizes(info.pageSizes);
        setPageNumber(info.pageCount);
      } catch (err) {
        setLoadError(err instanceof EncryptedPdfError ? 'encrypted' : 'invalid');
      }
    })();
  };

  const clear = () => {
    runId.current++;
    setFile(null);
    setBytes(null);
    setPreviewSrc(null);
    setPageCount(0);
    setPageSizes([]);
    setLoadError(null);
    setSignFailed(false);
    setPlacement(DEFAULT_PLACEMENT);
  };

  // Renders the selected page to a <img> source whenever the file or page changes.
  useEffect(() => {
    if (!bytes || loadError || pageCount === 0) return;
    const id = ++runId.current;
    (async () => {
      try {
        const canvas = await renderPagePreview(bytes, pageNumber - 1, PREVIEW_MAX_WIDTH);
        if (runId.current !== id) return;
        setPreviewSize({ width: canvas.width, height: canvas.height });
        setPreviewSrc(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        if (runId.current !== id) return;
        setPreviewSrc(null);
      }
    })();
  }, [bytes, pageNumber, loadError, pageCount]);

  const onCanvasPointerDown = (e: PointerEvent) => {
    if (mode !== 'draw') return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const point = pointerToCanvas(canvas, e.clientX, e.clientY);
    drawingRef.current = [point];
    drawStrokes(canvas, [...strokes, drawingRef.current], INK_COLOR);
  };

  const onCanvasPointerMove = (e: PointerEvent) => {
    if (mode !== 'draw' || !drawingRef.current) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    drawingRef.current.push(pointerToCanvas(canvas, e.clientX, e.clientY));
    drawStrokes(canvas, [...strokes, drawingRef.current], INK_COLOR);
  };

  const onCanvasPointerUp = () => {
    if (mode !== 'draw' || !drawingRef.current) return;
    const finished = drawingRef.current;
    drawingRef.current = null;
    setStrokes((prev) => [...prev, finished]);
  };

  const clearSignature = () => {
    drawingRef.current = null;
    setStrokes([]);
    setTypedText('');
  };

  const undoStroke = () => {
    drawingRef.current = null;
    setStrokes((prev) => prev.slice(0, -1));
  };

  const onOverlayPointerDown = (e: PointerEvent) => {
    const container = previewContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      clientX: e.clientX,
      clientY: e.clientY,
      placement,
      width: rect.width,
      height: rect.height,
    };
  };

  const onOverlayPointerMove = (e: PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.clientX;
    const dy = e.clientY - drag.clientY;
    setPlacement(clampPlacement(dragPlacement(drag.placement, dx, dy, drag.width, drag.height)));
  };

  const onOverlayPointerUp = (e: PointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  };

  const onOverlayKeyDown = (e: KeyboardEvent) => {
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const step = steps[e.key];
    if (!step) return;
    e.preventDefault();
    setPlacement((prev) => clampPlacement(nudgePlacement(prev, step[0] as -1 | 0 | 1, step[1] as -1 | 0 | 1)));
  };

  const changeSize = (preset: SizePreset) => {
    setSizePreset(preset);
    setPlacement((prev) => clampPlacement({ ...prev, widthRatio: SIZE_PRESETS[preset] }));
  };

  const download = async () => {
    const canvas = signatureCanvasRef.current;
    const pageSize = pageSizes[pageNumber - 1];
    if (!bytes || !file || !canvas || !pageSize) return;
    setSigning(true);
    setSignFailed(false);
    try {
      const rect = placementToPdfRect(placement, pageSize.width, pageSize.height);
      const output = await signPdf(bytes, file.name, canvas, pageNumber - 1, rect);
      downloadBlob(new Blob([output as BlobPart], { type: 'application/pdf' }), signedFileName(file.name));
    } catch {
      setSignFailed(true);
    } finally {
      setSigning(false);
    }
  };

  const canDownload = hasSignature(mode, strokes, typedText) && !!bytes && !loadError && pageCount > 0;
  const errorMessage =
    loadError === 'encrypted'
      ? ui.encryptedPdf
      : loadError === 'invalid'
        ? ui.invalidPdf
        : loadError === 'file-size'
          ? ui.fileSizeLimit
          : loadError === 'page-count'
            ? ui.pageCountLimit
            : null;

  const previewRatioPercent =
    previewSize.height && previewSize.width ? (previewSize.height / previewSize.width) * 100 : 0;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
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
                  {pageCount > 0 ? ` · ${ui.pageCount.replace('{n}', String(pageCount))}` : ''}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={clear} aria-label={ui.remove}>
                {ui.remove}
              </Button>
            </div>
          )}

          {errorMessage && (
            <div class="mt-4">
              <Notice tone="danger">{errorMessage}</Notice>
            </div>
          )}

          {!errorMessage && bytes && previewSrc && pageSizes[pageNumber - 1] && (
            <div class="mt-4">
              {pageCount > 1 && (
                <div class="mb-3">
                  <Field
                    label={ui.pageLabel}
                    hint={ui.pageHint.replace('{n}', String(pageCount))}
                    class="max-w-[160px]"
                  >
                    <NumberInput
                      value={pageNumber}
                      onValue={(v) => setPageNumber(clampPageNumber(v === '' ? pageCount : v, pageCount))}
                      min={1}
                      max={pageCount}
                    />
                  </Field>
                </div>
              )}

              <div
                ref={previewContainerRef}
                class="relative w-full overflow-hidden rounded-lg border border-line bg-surface-2"
                style={{ paddingBottom: `${previewRatioPercent}%` }}
              >
                <img src={previewSrc} alt="" class="absolute inset-0 h-full w-full object-contain" draggable={false} />
                {signatureDataUrl && (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={ui.dragHandle}
                    aria-describedby="sign-pdf-drag-hint"
                    onPointerDown={onOverlayPointerDown}
                    onPointerMove={onOverlayPointerMove}
                    onPointerUp={onOverlayPointerUp}
                    onKeyDown={onOverlayKeyDown}
                    class="touch-none absolute cursor-move rounded-sm border-2 border-dashed border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                    style={{
                      left: `${placement.xRatio * 100}%`,
                      top: `${placement.yRatio * 100}%`,
                      width: `${placement.widthRatio * 100}%`,
                      height: `${placement.widthRatio * SIGNATURE_ASPECT * 100}%`,
                    }}
                  >
                    <img
                      src={signatureDataUrl}
                      alt=""
                      class="pointer-events-none h-full w-full object-contain"
                      draggable={false}
                    />
                  </div>
                )}
              </div>
              <p id="sign-pdf-drag-hint" class="mt-2 text-xs text-subtle">
                {ui.dragHint}
              </p>
            </div>
          )}

          {signFailed && (
            <div class="mt-4">
              <Notice tone="danger">{ui.signFailed}</Notice>
            </div>
          )}

          {!file && (
            <div class="mt-4">
              <Notice>{ui.privacyNote}</Notice>
            </div>
          )}

          {bytes && !errorMessage && pageCount > 0 && (
            <Button class="mt-4" variant="primary" size="lg" disabled={!canDownload || signing} onClick={download}>
              {signing ? ui.signing : ui.download}
            </Button>
          )}
        </div>

        <div class="space-y-4">
          <Segmented
            label={ui.modeLabel}
            value={mode}
            onValue={setMode}
            options={[
              { value: 'draw', label: ui.modeDraw },
              { value: 'type', label: ui.modeType },
            ]}
          />

          {mode === 'draw' && (
            <div>
              <canvas
                ref={signatureCanvasRef}
                width={SIGNATURE_WIDTH}
                height={SIGNATURE_HEIGHT}
                class="touch-none block w-full cursor-crosshair rounded-lg border border-line bg-surface"
                style={{ aspectRatio: `${SIGNATURE_WIDTH} / ${SIGNATURE_HEIGHT}` }}
                onPointerDown={onCanvasPointerDown}
                onPointerMove={onCanvasPointerMove}
                onPointerUp={onCanvasPointerUp}
                onPointerLeave={onCanvasPointerUp}
              />
              <div class="mt-2 flex items-center justify-between">
                <p class="text-xs text-subtle">{ui.drawHint}</p>
                <div class="flex gap-2">
                  <Button size="sm" variant="ghost" disabled={strokes.length === 0} onClick={undoStroke}>
                    {ui.undoStroke}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={clearSignature}>
                    {ui.clearSignature}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {mode === 'type' && (
            <div>
              <Field label={ui.typedLabel}>
                <input
                  class={inputClass}
                  value={typedText}
                  onInput={(e) => setTypedText((e.currentTarget as HTMLInputElement).value)}
                  placeholder={ui.typedPlaceholder}
                  maxLength={60}
                  spellcheck={false}
                />
              </Field>
              <canvas
                ref={signatureCanvasRef}
                width={SIGNATURE_WIDTH}
                height={SIGNATURE_HEIGHT}
                class="mt-3 block w-full rounded-lg border border-line bg-surface"
                style={{ aspectRatio: `${SIGNATURE_WIDTH} / ${SIGNATURE_HEIGHT}` }}
              />
              <Button size="sm" variant="ghost" class="mt-2" onClick={clearSignature}>
                {ui.clearSignature}
              </Button>
            </div>
          )}

          <Segmented
            label={ui.sizeLabel}
            value={sizePreset}
            onValue={changeSize}
            options={[
              { value: 'sm', label: ui.sizeSmall },
              { value: 'md', label: ui.sizeMedium },
              { value: 'lg', label: ui.sizeLarge },
            ]}
          />
        </div>
      </div>
    </Panel>
  );
}
