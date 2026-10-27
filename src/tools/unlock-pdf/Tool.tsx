import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, Panel, TextInput } from '../../components/ui';
import { downloadBlob, yieldToBrowser } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  classifyUnlockFailure,
  fileExceedsLimit,
  isPdfFile,
  unlockFailureDiagnostic,
  unlockedPdfFileName,
  type UnlockFailure,
} from './logic';
import type { UnlockProgress } from './unlock';

type FileError = 'invalid' | 'size';

export default function UnlockPdf({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [failure, setFailure] = useState<UnlockFailure | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<'reading' | UnlockProgress | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [complete, setComplete] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const runId = useRef(0);

  const stopActiveRun = useCallback(() => {
    runId.current++;
    abortRef.current?.abort();
    abortRef.current = null;
    setProcessing(false);
    setProgress(null);
  }, []);

  const clear = useCallback(() => {
    stopActiveRun();
    setFile(null);
    setPassword('');
    setShowPassword(false);
    setFileError(null);
    setFailure(null);
    setCancelled(false);
    setComplete(false);
  }, [stopActiveRun]);

  const loadFile = useCallback(
    (picked: File) => {
      stopActiveRun();
      setFile(picked);
      setFailure(null);
      setCancelled(false);
      setComplete(false);
      if (!isPdfFile(picked.name, picked.type)) {
        setFileError('invalid');
        return;
      }
      if (fileExceedsLimit(picked.size)) {
        setFileError('size');
        return;
      }
      setFileError(null);
    },
    [stopActiveRun],
  );

  useEffect(
    () => () => {
      runId.current++;
      abortRef.current?.abort();
      abortRef.current = null;
    },
    [],
  );

  const unlock = async () => {
    if (!file || fileError || processing || abortRef.current) return;
    const id = ++runId.current;
    const controller = new AbortController();
    abortRef.current = controller;
    setFailure(null);
    setCancelled(false);
    setComplete(false);
    setProcessing(true);
    setProgress('reading');
    try {
      await yieldToBrowser();
      if (controller.signal.aborted || runId.current !== id) return;
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (controller.signal.aborted || runId.current !== id) return;
      const { unlockPdf } = await import('./unlock');
      if (controller.signal.aborted || runId.current !== id) return;
      const output = await unlockPdf(bytes, password, {
        signal: controller.signal,
        onProgress: (next) => {
          if (runId.current === id) setProgress(next);
        },
      });
      if (controller.signal.aborted || runId.current !== id) return;
      downloadBlob(new Blob([output as BlobPart], { type: 'application/pdf' }), unlockedPdfFileName(file.name));
      setPassword('');
      setComplete(true);
    } catch (caught) {
      if (controller.signal.aborted || runId.current !== id) return;
      const diagnostic = unlockFailureDiagnostic(caught);
      setFailure(classifyUnlockFailure(diagnostic));
    } finally {
      if (runId.current === id) {
        abortRef.current = null;
        setProcessing(false);
        setProgress(null);
      }
    }
  };

  const cancel = () => {
    if (!processing) return;
    stopActiveRun();
    setFailure(null);
    setComplete(false);
    setCancelled(true);
  };

  const errorMessage = fileError === 'size' ? ui.fileSizeLimit : ui.invalidPdf;
  const failureMessage =
    failure === 'password'
      ? ui.incorrectPassword
      : failure === 'unsupported'
        ? ui.unsupportedEncryption
        : failure === 'invalid'
          ? ui.invalidPdf
          : failure === 'timeout'
            ? ui.timeoutError
            : failure === 'memory'
              ? ui.memoryError
              : ui.unlockFailed;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
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
                <p class="tabular text-muted">{formatBytes(file.size, locale)}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={clear} aria-label={ui.remove}>
                {ui.remove}
              </Button>
            </div>
          )}

          {fileError && (
            <div class="mt-4">
              <Notice tone="danger">{errorMessage}</Notice>
            </div>
          )}
          {failure && (
            <div class="mt-4">
              <Notice tone="danger">{failureMessage}</Notice>
            </div>
          )}
          {cancelled && (
            <div class="mt-4" aria-live="polite">
              <Notice>{ui.cancelled}</Notice>
            </div>
          )}
          {complete && (
            <div class="mt-4" aria-live="polite">
              <Notice tone="success">{ui.complete}</Notice>
            </div>
          )}
        </div>

        <div class="space-y-4">
          <Field label={ui.passwordLabel} hint={ui.passwordHint}>
            <div class="flex gap-2">
              <TextInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onInput={(event) => {
                  setPassword((event.currentTarget as HTMLInputElement).value);
                  setFailure(null);
                  setComplete(false);
                }}
                autoComplete="current-password"
                disabled={!file || !!fileError || processing}
              />
              <Button
                variant="secondary"
                aria-label={showPassword ? ui.hidePassword : ui.showPassword}
                disabled={!file || !!fileError || processing}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? ui.hidePassword : ui.showPassword}
              </Button>
            </div>
          </Field>

          {processing ? (
            <div class="space-y-3" aria-live="polite">
              <Notice>
                {progress === 'reading'
                  ? ui.progressReading
                  : progress === 'checking'
                    ? ui.progressChecking
                    : progress === 'loading'
                      ? ui.progressLoading
                      : progress === 'finishing'
                        ? ui.progressFinishing
                        : ui.progressDecrypting}
              </Notice>
              <Button variant="danger" size="lg" class="w-full" onClick={cancel}>
                {ui.cancel}
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="lg" class="w-full" disabled={!file || !!fileError} onClick={unlock}>
              {ui.unlock}
            </Button>
          )}
          <p class="text-xs leading-5 text-subtle">{ui.permissionNote}</p>
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-4">
        <Notice>{ui.privacyNote}</Notice>
      </div>
    </Panel>
  );
}
