import { useEffect, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Dropzone, Notice, Panel, Segmented, Stat, Toggle } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  base64ToBytes,
  bytesToBase64,
  type Base64DecodeError,
  type Base64DecodeErrorCode,
  type Base64Variant,
} from './logic';

const STORAGE_KEY = 'tools:base64:input';
const MODE_KEY = 'tools:base64:mode';
const VARIANT_KEY = 'tools:base64:variant';
const PADDING_KEY = 'tools:base64:padding';
const MAX_PERSISTED_LENGTH = 200_000;
const CONVERSION_DELAY = 150;

type Mode = 'encode' | 'decode';
type SourceFile = { name: string; bytes: Uint8Array };
type WorkerError = Base64DecodeError | { code: 'input-too-large' };
type ConversionResult =
  | { mode: 'encode'; ok: true; bytesLength: number; text: string }
  | { mode: 'decode'; ok: true; bytes: Uint8Array; text: string | null }
  | { mode: Mode; ok: false; error: WorkerError };

const SAMPLE = 'Betterbit Tools';

const ERROR_UI_KEY: Record<Base64DecodeErrorCode | 'input-too-large', keyof UI> = {
  'invalid-character': 'errorInvalidCharacter',
  'invalid-length': 'errorInvalidLength',
  'invalid-padding': 'errorInvalidPadding',
  'invalid-trailing-bits': 'errorInvalidTrailingBits',
  'invalid-utf8': 'errorInvalidUtf8',
  'input-too-large': 'errorInputTooLarge',
};

function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, String(v)), template);
}

export default function Base64Tool({ locale, ui }: ToolProps<UI>) {
  const [mode, setMode] = useState<Mode>('encode');
  const [variant, setVariant] = useState<Base64Variant>('standard');
  const [padding, setPadding] = useState(true);
  const [input, setInput] = useState('');
  const [sourceFile, setSourceFile] = useState<SourceFile | null>(null);
  const [conversion, setConversion] = useState<ConversionResult | null>(null);
  const [fileError, setFileError] = useState<'file-read' | 'input-too-large' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    setInput(safeStorage.get(STORAGE_KEY) ?? SAMPLE);
    const savedMode = safeStorage.get(MODE_KEY);
    if (savedMode === 'encode' || savedMode === 'decode') setMode(savedMode);
    const savedVariant = safeStorage.get(VARIANT_KEY);
    if (savedVariant === 'standard' || savedVariant === 'url') setVariant(savedVariant);
    setPadding(safeStorage.get(PADDING_KEY) !== '0');
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (input && input.length <= MAX_PERSISTED_LENGTH) safeStorage.set(STORAGE_KEY, input);
      else if (!input) safeStorage.remove(STORAGE_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  useEffect(() => safeStorage.set(MODE_KEY, mode), [mode]);
  useEffect(() => safeStorage.set(VARIANT_KEY, variant), [variant]);
  useEffect(() => safeStorage.set(PADDING_KEY, padding ? '1' : '0'), [padding]);

  useEffect(() => {
    const id = ++requestId.current;
    let worker: Worker | undefined;
    setConversion(null);
    setIsProcessing(Boolean(sourceFile || input));

    const timeout = setTimeout(() => {
      const finish = (result: ConversionResult) => {
        if (id !== requestId.current) return;
        setConversion(result);
        setIsProcessing(false);
      };

      try {
        worker = new Worker(new URL('./base64.worker.ts', import.meta.url), { type: 'module' });
        worker.onmessage = (event: MessageEvent<ConversionResult & { id: number }>) => finish(event.data);
        if (mode === 'encode') {
          worker.postMessage({
            id,
            mode,
            bytes: sourceFile?.bytes,
            text: sourceFile ? undefined : input,
            options: { variant, padding },
          });
        } else {
          worker.postMessage({ id, mode, input });
        }
      } catch {
        // Module workers are supported by current browsers. Keep a working fallback for older ones.
        if (mode === 'encode') {
          const bytes = sourceFile?.bytes ?? new TextEncoder().encode(input);
          finish({ mode, ok: true, bytesLength: bytes.length, text: bytesToBase64(bytes, { variant, padding }) });
        } else {
          const decoded = base64ToBytes(input);
          if (!decoded.ok) finish({ mode, ok: false, error: decoded.error });
          else {
            try {
              finish({
                mode,
                ok: true,
                bytes: decoded.bytes,
                text: new TextDecoder('utf-8', { fatal: true }).decode(decoded.bytes),
              });
            } catch {
              finish({ mode, ok: true, bytes: decoded.bytes, text: null });
            }
          }
        }
      }
    }, CONVERSION_DELAY);

    return () => {
      clearTimeout(timeout);
      worker?.terminate();
    };
  }, [input, mode, padding, sourceFile, variant]);

  const n = (bytes: number) => formatBytes(bytes, locale);
  const encodeResult = conversion?.mode === 'encode' && conversion.ok ? conversion : null;
  const decodeResult = conversion?.mode === 'decode' && conversion.ok ? conversion : null;
  const conversionError = conversion && !conversion.ok ? conversion.error : null;
  const outputText = mode === 'encode' ? (encodeResult?.text ?? '') : (decodeResult?.text ?? '');

  const switchMode = (next: Mode) => {
    setMode(next);
    setSourceFile(null);
    setInput('');
    setFileError(null);
  };

  const clearInput = () => {
    setInput('');
    setSourceFile(null);
    setFileError(null);
  };

  const openFile = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setFileError(null);
    const maxBytes = mode === 'encode' ? 8 * 1024 * 1024 : 12 * 1024 * 1024;
    if (file.size > maxBytes) {
      setFileError('input-too-large');
      return;
    }

    void (async () => {
      try {
        if (mode === 'encode') {
          const buffer = await file.arrayBuffer();
          setSourceFile({ name: file.name, bytes: new Uint8Array(buffer) });
          setInput('');
        } else {
          setSourceFile(null);
          setInput(await file.text());
        }
      } catch {
        setFileError('file-read');
      }
    })();
  };

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <Segmented<Mode>
          label={ui.modeLabel}
          value={mode}
          onValue={switchMode}
          options={[
            { value: 'encode', label: ui.modeEncode },
            { value: 'decode', label: ui.modeDecode },
          ]}
        />
        {mode === 'encode' && (
          <div class="flex flex-wrap items-center gap-3">
            <Segmented<Base64Variant>
              label={ui.variantLabel}
              value={variant}
              onValue={setVariant}
              options={[
                { value: 'standard', label: ui.variantStandard },
                { value: 'url', label: ui.variantUrl },
              ]}
            />
            <Toggle checked={padding} onChecked={setPadding} label={ui.paddingLabel} />
          </div>
        )}
      </div>

      <div class="mt-4 grid gap-6 lg:grid-cols-2">
        <div class="flex flex-col gap-3">
          <label for="base64-input" class="sr-only">
            {mode === 'encode' ? ui.inputLabelEncode : ui.inputLabelDecode}
          </label>
          <Dropzone
            compact
            accept={mode === 'encode' ? '*/*' : '.txt,.b64,text/plain'}
            onFiles={openFile}
            title={mode === 'encode' ? ui.openFileEncode : ui.openFileDecode}
            hint={mode === 'encode' ? ui.openFileHintEncode : ui.openFileHintDecode}
          />
          {fileError && (
            <Notice tone="danger">{ui[fileError === 'file-read' ? 'errorFileRead' : 'errorInputTooLarge']}</Notice>
          )}
          {sourceFile ? (
            <div class="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm">
              <span class="truncate text-fg">{sourceFile.name}</span>
              <div class="flex items-center gap-2">
                <span class="text-subtle">{n(sourceFile.bytes.length)}</span>
                <Button size="sm" variant="ghost" onClick={clearInput}>
                  {ui.clear}
                </Button>
              </div>
            </div>
          ) : (
            <textarea
              id="base64-input"
              value={input}
              onInput={(e) => {
                setFileError(null);
                setInput((e.currentTarget as HTMLTextAreaElement).value);
              }}
              placeholder={mode === 'encode' ? ui.placeholderEncode : ui.placeholderDecode}
              spellcheck={false}
              class="min-h-[220px] lg:min-h-[340px] flex-1 w-full resize-y rounded-lg border border-line bg-bg p-4 font-mono text-sm leading-6 text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
            />
          )}
          <div class="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={clearInput} disabled={!input && !sourceFile}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.autosaved}</span>
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-fg">{ui.outputLabel}</span>
            <div class="flex items-center gap-2">
              <CopyButton text={outputText} label={ui.copy} copiedLabel={ui.copied} />
              {mode === 'encode' ? (
                <Button
                  size="sm"
                  disabled={!encodeResult?.text}
                  onClick={() => downloadBlob(new Blob([encodeResult!.text], { type: 'text/plain' }), 'encoded.txt')}
                >
                  {ui.downloadText}
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={!decodeResult}
                  onClick={() => {
                    if (!decodeResult) return;
                    const name = decodeResult.text !== null ? 'decoded.txt' : 'decoded.bin';
                    downloadBlob(new Blob([decodeResult.bytes as BlobPart]), name);
                  }}
                >
                  {ui.downloadFile}
                </Button>
              )}
            </div>
          </div>

          {conversionError && (
            <Notice tone="danger">
              {fillTemplate(ui[ERROR_UI_KEY[conversionError.code]], {
                index: ('index' in conversionError ? (conversionError.index ?? 0) + 1 : 0) as number,
                char: ('char' in conversionError ? conversionError.char : '') ?? '',
              })}
            </Notice>
          )}
          {mode === 'decode' && decodeResult && decodeResult.text === null && <Notice tone="info">{ui.notUtf8}</Notice>}

          <pre
            class="min-h-[220px] lg:min-h-[340px] flex-1 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-line bg-bg p-4 font-mono text-sm leading-6 text-fg"
            aria-live="polite"
            aria-busy={isProcessing}
          >
            {isProcessing ? (
              <span class="text-subtle">{ui.processing}</span>
            ) : (
              outputText || <span class="text-subtle">{ui.emptyOutput}</span>
            )}
          </pre>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-live="polite">
        <Stat
          label={ui.statInputSize}
          value={mode === 'encode' ? n(encodeResult?.bytesLength ?? 0) : n(input.length)}
        />
        <Stat
          label={ui.statOutputSize}
          value={
            mode === 'encode' ? n(encodeResult?.text.length ?? 0) : decodeResult ? n(decodeResult.bytes.length) : '—'
          }
          emphasis
        />
        <Stat
          label={ui.statOverhead}
          value={(() => {
            if (mode === 'encode') {
              const inLen = encodeResult?.bytesLength ?? 0;
              const outLen = encodeResult?.text.length ?? 0;
              return inLen > 0 ? `+${Math.round((outLen / inLen - 1) * 100)}%` : '—';
            }
            const outLen = decodeResult?.bytes.length ?? 0;
            return input.length > 0 && decodeResult ? `-${Math.round((1 - outLen / input.length) * 100)}%` : '—';
          })()}
        />
      </div>
    </Panel>
  );
}
