import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Dropzone, Notice, Panel, Segmented, Stat, Toggle } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { base64ToBytes, base64ToText, bytesToBase64, type Base64DecodeErrorCode, type Base64Variant } from './logic';

const STORAGE_KEY = 'tools:base64:input';
const MODE_KEY = 'tools:base64:mode';
const VARIANT_KEY = 'tools:base64:variant';
const PADDING_KEY = 'tools:base64:padding';
const MAX_PERSISTED_LENGTH = 200_000;

type Mode = 'encode' | 'decode';
type SourceFile = { name: string; bytes: Uint8Array };

const SAMPLE = 'Betterbit Tools';

const ERROR_UI_KEY: Record<Base64DecodeErrorCode, keyof UI> = {
  'invalid-character': 'errorInvalidCharacter',
  'invalid-length': 'errorInvalidLength',
  'invalid-padding': 'errorInvalidPadding',
  'invalid-utf8': 'errorInvalidUtf8',
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

  const n = (bytes: number) => formatBytes(bytes, locale);

  const encodeResult = useMemo(() => {
    if (mode !== 'encode') return null;
    const bytes = sourceFile ? sourceFile.bytes : new TextEncoder().encode(input);
    return { bytes, text: bytesToBase64(bytes, { variant, padding }) };
  }, [mode, sourceFile, input, variant, padding]);

  const decodeBytesResult = useMemo(() => (mode === 'decode' ? base64ToBytes(input) : null), [mode, input]);
  const decodeTextResult = useMemo(() => (mode === 'decode' ? base64ToText(input) : null), [mode, input]);

  const outputText = mode === 'encode' ? (encodeResult?.text ?? '') : decodeTextResult?.ok ? decodeTextResult.text : '';

  const switchMode = (next: Mode) => {
    setMode(next);
    setSourceFile(null);
    setInput('');
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
            onFiles={(files) => {
              const file = files[0];
              if (!file) return;
              if (mode === 'encode') {
                void file.arrayBuffer().then((buf) => {
                  setSourceFile({ name: file.name, bytes: new Uint8Array(buf) });
                  setInput('');
                });
              } else {
                void file.text().then((text) => {
                  setSourceFile(null);
                  setInput(text);
                });
              }
            }}
            title={mode === 'encode' ? ui.openFileEncode : ui.openFileDecode}
            hint={ui.openFileHint}
          />
          {sourceFile ? (
            <div class="flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm">
              <span class="truncate text-fg">{sourceFile.name}</span>
              <div class="flex items-center gap-2">
                <span class="text-subtle">{n(sourceFile.bytes.length)}</span>
                <Button size="sm" variant="ghost" onClick={() => setSourceFile(null)}>
                  {ui.clear}
                </Button>
              </div>
            </div>
          ) : (
            <textarea
              id="base64-input"
              value={input}
              onInput={(e) => setInput((e.currentTarget as HTMLTextAreaElement).value)}
              placeholder={mode === 'encode' ? ui.placeholderEncode : ui.placeholderDecode}
              spellcheck={false}
              class="min-h-[220px] lg:min-h-[340px] flex-1 w-full resize-y rounded-lg border border-line bg-bg p-4 font-mono text-sm leading-6 text-fg placeholder:text-subtle focus:border-accent focus:outline-none"
            />
          )}
          <div class="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setInput('');
                setSourceFile(null);
              }}
              disabled={!input && !sourceFile}
            >
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
                  disabled={!decodeBytesResult?.ok}
                  onClick={() => {
                    if (!decodeBytesResult?.ok) return;
                    const name = decodeTextResult?.ok ? 'decoded.txt' : 'decoded.bin';
                    downloadBlob(new Blob([decodeBytesResult.bytes as BlobPart]), name);
                  }}
                >
                  {ui.downloadFile}
                </Button>
              )}
            </div>
          </div>

          {mode === 'decode' && !decodeBytesResult?.ok && decodeBytesResult?.error && (
            <Notice tone="danger">
              {fillTemplate(ui[ERROR_UI_KEY[decodeBytesResult.error.code]], {
                index: (decodeBytesResult.error.index ?? 0) + 1,
                char: decodeBytesResult.error.char ?? '',
              })}
            </Notice>
          )}
          {mode === 'decode' &&
            decodeBytesResult?.ok &&
            !decodeTextResult?.ok &&
            decodeTextResult?.error.code === 'invalid-utf8' && <Notice tone="info">{ui.notUtf8}</Notice>}

          <pre
            class="min-h-[220px] lg:min-h-[340px] flex-1 overflow-auto whitespace-pre-wrap break-all rounded-lg border border-line bg-bg p-4 font-mono text-sm leading-6 text-fg"
            aria-live="polite"
          >
            {outputText || <span class="text-subtle">{ui.emptyOutput}</span>}
          </pre>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-live="polite">
        <Stat
          label={ui.statInputSize}
          value={mode === 'encode' ? n(encodeResult?.bytes.length ?? 0) : n(input.length)}
        />
        <Stat
          label={ui.statOutputSize}
          value={
            mode === 'encode'
              ? n(encodeResult?.text.length ?? 0)
              : decodeBytesResult?.ok
                ? n(decodeBytesResult.bytes.length)
                : '—'
          }
          emphasis
        />
        <Stat
          label={ui.statOverhead}
          value={(() => {
            if (mode === 'encode') {
              const inLen = encodeResult?.bytes.length ?? 0;
              const outLen = encodeResult?.text.length ?? 0;
              return inLen > 0 ? `+${Math.round((outLen / inLen - 1) * 100)}%` : '—';
            }
            const outLen = decodeBytesResult?.ok ? decodeBytesResult.bytes.length : 0;
            return input.length > 0 && decodeBytesResult?.ok
              ? `-${Math.round((1 - outLen / input.length) * 100)}%`
              : '—';
          })()}
        />
      </div>
    </Panel>
  );
}
