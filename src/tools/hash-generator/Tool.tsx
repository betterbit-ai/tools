import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
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
  TextInput,
} from '../../components/ui';
import { safeStorage } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { hashBytesWithProgress, hashFileWithProgress } from './hash';
import { digestByteLength, hashesMatch, type HashAlgorithm } from './logic';

const INPUT_KEY = 'tools:hash-generator:input';
const ALGORITHM_KEY = 'tools:hash-generator:algorithm';
const MODE_KEY = 'tools:hash-generator:mode';
const MAX_FILE_BYTES = 64 * 1024 * 1024;
const MAX_PERSISTED_LENGTH = 200_000;
const SAMPLE = 'Betterbit Tools';

type Mode = 'text' | 'file';

export default function HashGenerator({ locale, ui }: ToolProps<UI>) {
  const [mode, setMode] = useState<Mode>('text');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('sha-256');
  const [input, setInput] = useState(SAMPLE);
  const [file, setFile] = useState<File | null>(null);
  const [digest, setDigest] = useState('');
  const [expected, setExpected] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<'file-size' | 'file-read' | 'web-crypto' | null>(null);
  const [storage, setStorage] = useState<'ok' | 'blocked'>('ok');
  const requestId = useRef(0);

  useEffect(() => {
    const savedInput = safeStorage.get(INPUT_KEY);
    if (savedInput !== null) setInput(savedInput);
    const savedAlgorithm = safeStorage.get(ALGORITHM_KEY);
    if (['md5', 'sha-1', 'sha-256', 'sha-384', 'sha-512'].includes(savedAlgorithm ?? '')) {
      setAlgorithm(savedAlgorithm as HashAlgorithm);
    }
    const savedMode = safeStorage.get(MODE_KEY);
    if (savedMode === 'text' || savedMode === 'file') setMode(savedMode);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (input.length > MAX_PERSISTED_LENGTH) return;
      setStorage(safeStorage.trySet(INPUT_KEY, input) ? 'ok' : 'blocked');
    }, 300);
    return () => clearTimeout(timeout);
  }, [input]);

  useEffect(() => safeStorage.set(ALGORITHM_KEY, algorithm), [algorithm]);
  useEffect(() => safeStorage.set(MODE_KEY, mode), [mode]);

  useEffect(() => {
    if (mode === 'file' && !file) {
      requestId.current++;
      setDigest('');
      setStatus('idle');
      setProgress(null);
      return;
    }
    const id = ++requestId.current;
    const isCancelled = () => id !== requestId.current;
    const timeout = setTimeout(
      () => {
        setStatus('processing');
        setProgress(null);
        setError(null);
        const source = mode === 'file' ? file : null;
        const onProgress = (fraction: number) => {
          if (!isCancelled()) setProgress(fraction);
        };
        const work = source
          ? hashFileWithProgress(algorithm, source, onProgress, isCancelled)
          : hashBytesWithProgress(algorithm, new TextEncoder().encode(input), onProgress, isCancelled);
        void work
          .then((nextDigest) => {
            if (isCancelled()) return;
            setProgress(null);
            if (nextDigest === null) {
              setDigest('');
              setStatus('idle');
              return;
            }
            setDigest(nextDigest);
            setStatus('idle');
          })
          .catch(() => {
            if (isCancelled()) return;
            setProgress(null);
            setDigest('');
            setStatus('error');
            setError(source ? 'file-read' : 'web-crypto');
          });
      },
      mode === 'file' && file ? 0 : 200,
    );
    return () => clearTimeout(timeout);
  }, [algorithm, file, input, mode]);

  const cancel = () => {
    requestId.current++;
    setDigest('');
    setStatus('idle');
    setProgress(null);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setExpected('');
    setError(null);
  };

  const chooseFile = (files: File[]) => {
    const nextFile = files[0];
    if (!nextFile) return;
    if (nextFile.size > MAX_FILE_BYTES) {
      setFile(null);
      setDigest('');
      setStatus('error');
      setError('file-size');
      return;
    }
    setFile(nextFile);
    setExpected('');
    setError(null);
  };

  const clearText = () => {
    setInput('');
    setExpected('');
  };

  const comparison = digest ? hashesMatch(digest, expected) : null;
  const inputBytes = useMemo(
    () => (mode === 'file' ? (file?.size ?? 0) : new TextEncoder().encode(input).length),
    [mode, file, input],
  );
  const tooLongToSave = mode === 'text' && input.length > MAX_PERSISTED_LENGTH;
  const saveLabel = storage === 'blocked' ? ui.notSaved : tooLongToSave ? ui.tooLongToSave : ui.autosaved;

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <Segmented<Mode>
          label={ui.modeLabel}
          value={mode}
          onValue={switchMode}
          options={[
            { value: 'text', label: ui.modeText },
            { value: 'file', label: ui.modeFile },
          ]}
        />
        <Segmented<HashAlgorithm>
          label={ui.algorithmLabel}
          value={algorithm}
          onValue={setAlgorithm}
          options={[
            { value: 'md5', label: ui.algorithmMd5 },
            { value: 'sha-1', label: ui.algorithmSha1 },
            { value: 'sha-256', label: ui.algorithmSha256 },
            { value: 'sha-384', label: ui.algorithmSha384 },
            { value: 'sha-512', label: ui.algorithmSha512 },
          ]}
        />
      </div>

      <div class="mt-4 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex min-w-0 flex-col gap-3">
          {mode === 'file' ? (
            <>
              <Dropzone compact accept="*/*" onFiles={chooseFile} title={ui.fileTitle} hint={ui.fileHint} />
              {file && (
                <div class="flex items-center justify-between gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm">
                  <span class="min-w-0 truncate text-fg">{file.name}</span>
                  <div class="flex shrink-0 items-center gap-2">
                    <span class="text-subtle">{formatBytes(file.size, locale)}</span>
                    <Button size="sm" variant="ghost" onClick={() => setFile(null)}>
                      {ui.clear}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <Field label={ui.textLabel} hint={ui.textHint}>
                <Textarea
                  value={input}
                  onInput={(event) => {
                    setError(null);
                    setInput((event.currentTarget as HTMLTextAreaElement).value);
                  }}
                  placeholder={ui.textPlaceholder}
                  spellcheck={false}
                  class="min-h-[220px] font-mono text-sm"
                />
              </Field>
              <div class="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="ghost" onClick={clearText} disabled={!input}>
                  {ui.clear}
                </Button>
                <span class="ml-auto text-xs text-subtle">{saveLabel}</span>
              </div>
            </>
          )}
          {error && (
            <Notice tone="danger">
              {ui[error === 'file-size' ? 'errorFileSize' : error === 'file-read' ? 'errorFileRead' : 'errorWebCrypto']}
            </Notice>
          )}
          {algorithm === 'md5' && <Notice tone="info">{ui.md5Warning}</Notice>}
        </div>

        <div class="flex min-w-0 flex-col gap-4">
          <div class="flex items-center justify-between gap-2">
            <span class="text-sm font-medium text-fg">{ui.digestLabel}</span>
            <CopyButton text={digest} label={ui.copy} copiedLabel={ui.copied} />
          </div>
          <output
            aria-live="polite"
            aria-busy={status === 'processing'}
            class="min-h-28 overflow-auto break-all rounded-lg border border-line bg-bg p-4 font-mono text-sm leading-6 text-fg"
          >
            {status === 'processing' ? (
              <span class="text-subtle">
                {progress === null || progress >= 1
                  ? ui.processing
                  : ui.progress.replace('{percent}', String(Math.max(1, Math.floor(progress * 100))))}
              </span>
            ) : digest ? (
              digest
            ) : (
              <span class="text-subtle">{ui.emptyDigest}</span>
            )}
          </output>
          {status === 'processing' && (
            <Button size="sm" variant="ghost" class="self-start" onClick={cancel}>
              {ui.cancel}
            </Button>
          )}

          <Field label={ui.expectedLabel} hint={ui.expectedHint}>
            <TextInput
              value={expected}
              onInput={(event) => setExpected((event.currentTarget as HTMLInputElement).value)}
            />
          </Field>
          {comparison !== null && (
            <Notice tone={comparison ? 'success' : 'danger'}>{comparison ? ui.match : ui.mismatch}</Notice>
          )}

          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.statInput} value={formatBytes(inputBytes, locale)} />
            <Stat label={ui.statDigest} value={formatBytes(digestByteLength(algorithm), locale)} />
          </div>
        </div>
      </div>
    </Panel>
  );
}
