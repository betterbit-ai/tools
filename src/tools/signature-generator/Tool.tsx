import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, Field, Kbd, Notice, Panel, Segmented, TextInput } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  hasSignature,
  isInk,
  isPenWidth,
  isSignatureMode,
  isSignatureStyle,
  normalizePoint,
  normalizeSignatureText,
  type Ink,
  type PenWidth,
  type SignatureMode,
  type SignatureStyle,
  type Stroke,
} from './logic';
import { canvasPoint, drawSignature, exportSignaturePng, SIGNATURE_HEIGHT, SIGNATURE_WIDTH } from './render';

const STORAGE_KEY = 'tools:signature-generator:settings';

interface Settings {
  mode: SignatureMode;
  text: string;
  style: SignatureStyle;
  ink: Ink;
  penWidth: PenWidth;
  strokes: Stroke[];
}

function areStrokes(value: unknown): value is Stroke[] {
  return (
    Array.isArray(value) &&
    value.every(
      (stroke) =>
        Array.isArray(stroke) &&
        stroke.every(
          (point) =>
            !!point &&
            typeof point === 'object' &&
            Number.isFinite((point as { x?: unknown }).x) &&
            Number.isFinite((point as { y?: unknown }).y),
        ),
    )
  );
}

function readSettings(defaultName: string): Settings {
  try {
    const saved = JSON.parse(safeStorage.get(STORAGE_KEY) ?? 'null') as Partial<Settings> | null;
    if (!saved) throw new Error('No saved settings');
    return {
      mode: isSignatureMode(saved.mode) ? saved.mode : 'type',
      text: typeof saved.text === 'string' ? normalizeSignatureText(saved.text) : defaultName,
      style: isSignatureStyle(saved.style) ? saved.style : 'script',
      ink: isInk(saved.ink) ? saved.ink : 'accent',
      penWidth: isPenWidth(saved.penWidth) ? saved.penWidth : 'medium',
      strokes: areStrokes(saved.strokes) ? saved.strokes : [],
    };
  } catch {
    return { mode: 'type', text: defaultName, style: 'script', ink: 'accent', penWidth: 'medium', strokes: [] };
  }
}

function inkColor(ink: Ink): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(ink === 'accent' ? '--accent' : '--fg')
    .trim();
}

export default function SignatureGenerator({ ui }: ToolProps<UI>) {
  const [settings, setSettings] = useState<Settings>(() => readSettings(ui.defaultName));
  const [message, setMessage] = useState<'downloaded' | 'failed' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeStroke = useRef<Stroke | null>(null);

  const ready = hasSignature(settings.mode, settings.text, settings.strokes);

  useEffect(() => {
    safeStorage.set(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawSignature(canvas, {
      text: settings.text,
      strokes: settings.strokes,
      style: settings.style,
      penWidth: settings.penWidth,
      ink: inkColor(settings.ink),
      draw: settings.mode === 'draw',
    });
  }, [settings]);

  const update = (patch: Partial<Settings>) => {
    setMessage(null);
    setSettings((current) => ({ ...current, ...patch }));
  };

  const redrawActiveStroke = (stroke: Stroke) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawSignature(canvas, {
      text: settings.text,
      strokes: [...settings.strokes, stroke],
      style: settings.style,
      penWidth: settings.penWidth,
      ink: inkColor(settings.ink),
      draw: true,
    });
  };

  const startDrawing = (event: PointerEvent) => {
    if (settings.mode !== 'draw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(event.pointerId);
    const point = canvasPoint(canvas, event.clientX, event.clientY);
    const stroke = [normalizePoint(point.x, point.y, point.width, point.height)];
    activeStroke.current = stroke;
    redrawActiveStroke(stroke);
  };

  const continueDrawing = (event: PointerEvent) => {
    if (settings.mode !== 'draw' || !activeStroke.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = canvasPoint(canvas, event.clientX, event.clientY);
    activeStroke.current.push(normalizePoint(point.x, point.y, point.width, point.height));
    redrawActiveStroke(activeStroke.current);
  };

  const stopDrawing = () => {
    const stroke = activeStroke.current;
    activeStroke.current = null;
    if (!stroke) return;
    update({ strokes: [...settings.strokes, stroke] });
  };

  const clear = () => {
    activeStroke.current = null;
    update({ text: '', strokes: [] });
  };

  const undo = () => {
    activeStroke.current = null;
    update({ strokes: settings.strokes.slice(0, -1) });
  };

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    try {
      downloadBlob(await exportSignaturePng(canvas), 'signature.png');
      setMessage('downloaded');
    } catch {
      setMessage('failed');
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.matches('input, textarea, select') ||
        event.key.toLowerCase() !== ui.downloadShortcutKey.toLowerCase()
      )
        return;
      if (!ready) return;
      event.preventDefault();
      void download();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ready, settings, ui.downloadShortcutKey]);

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div class="min-w-0 space-y-5">
          <Field label={ui.modeLabel}>
            <Segmented<SignatureMode>
              value={settings.mode}
              onValue={(mode) => update({ mode })}
              label={ui.modeLabel}
              options={[
                { value: 'type', label: ui.modeType },
                { value: 'draw', label: ui.modeDraw },
              ]}
            />
          </Field>

          {settings.mode === 'type' && (
            <Field label={ui.nameLabel} hint={ui.nameHint}>
              <TextInput
                value={settings.text}
                placeholder={ui.namePlaceholder}
                maxLength={80}
                onInput={(event) => update({ text: normalizeSignatureText(event.currentTarget.value) })}
              />
            </Field>
          )}

          <Field label={ui.previewLabel} hint={settings.mode === 'draw' ? ui.drawHint : ui.transparentNote}>
            <div class="relative overflow-hidden rounded-lg border border-line bg-surface-2">
              <canvas
                ref={canvasRef}
                width={SIGNATURE_WIDTH}
                height={SIGNATURE_HEIGHT}
                aria-label={ui.drawCanvasLabel}
                onPointerDown={startDrawing}
                onPointerMove={continueDrawing}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                class="block aspect-[3/1] w-full touch-none"
              />
              {settings.mode === 'draw' && !ready && (
                <p class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-subtle">
                  {ui.drawPlaceholder}
                </p>
              )}
            </div>
          </Field>

          {settings.mode === 'draw' && (
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" disabled={settings.strokes.length === 0} onClick={undo}>
                {ui.undo}
              </Button>
              <Button size="sm" variant="ghost" disabled={settings.strokes.length === 0} onClick={clear}>
                {ui.clear}
              </Button>
            </div>
          )}
        </div>

        <div class="space-y-5 border-t border-line pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
          {settings.mode === 'type' && (
            <Field label={ui.styleLabel}>
              <Segmented<SignatureStyle>
                value={settings.style}
                onValue={(style) => update({ style })}
                label={ui.styleLabel}
                options={[
                  { value: 'script', label: ui.styleScript },
                  { value: 'formal', label: ui.styleFormal },
                  { value: 'simple', label: ui.styleSimple },
                ]}
              />
            </Field>
          )}

          <Field label={ui.inkLabel}>
            <Segmented<Ink>
              value={settings.ink}
              onValue={(ink) => update({ ink })}
              label={ui.inkLabel}
              options={[
                { value: 'accent', label: ui.inkBlue },
                { value: 'fg', label: ui.inkBlack },
              ]}
            />
          </Field>

          {settings.mode === 'draw' && (
            <Field label={ui.penLabel}>
              <Segmented<PenWidth>
                value={settings.penWidth}
                onValue={(penWidth) => update({ penWidth })}
                label={ui.penLabel}
                options={[
                  { value: 'thin', label: ui.penThin },
                  { value: 'medium', label: ui.penMedium },
                  { value: 'bold', label: ui.penBold },
                ]}
              />
            </Field>
          )}

          <Notice>{ui.privacyNote}</Notice>

          <div>
            <Button variant="primary" class="w-full" disabled={!ready} onClick={() => void download()}>
              {ui.download}
            </Button>
            <p class="mt-2 text-xs text-subtle">
              <Kbd>{ui.downloadShortcutKey}</Kbd> {ui.downloadShortcut}
            </p>
          </div>

          {!ready && <Notice>{ui.readyHint}</Notice>}
          {message === 'downloaded' && <Notice tone="success">{ui.downloadStarted}</Notice>}
          {message === 'failed' && <Notice tone="danger">{ui.downloadFailed}</Notice>}
        </div>
      </div>
    </Panel>
  );
}
