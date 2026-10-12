import { useCallback, useState } from 'preact/hooks';
import { Button, Dropzone, Field, Notice, Panel, TextInput } from '../../components/ui';
import { downloadBlob } from '../../lib/browser';
import { formatBytes } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  classifyProtectFailure,
  fileExceedsLimit,
  isPasswordPresent,
  isPdfFile,
  passwordsMatch,
  protectedPdfFileName,
  type ProtectFailure,
} from './logic';

type FileError = 'invalid' | 'size';

export default function ProtectPdf({ ui, locale }: ToolProps<UI>) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [failure, setFailure] = useState<ProtectFailure | null>(null);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const clear = useCallback(() => {
    setFile(null);
    setPassword('');
    setConfirmation('');
    setShowPassword(false);
    setFileError(null);
    setFailure(null);
    setProcessing(false);
    setComplete(false);
  }, []);

  const loadFile = useCallback((picked: File) => {
    setFile(picked);
    setFailure(null);
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
  }, []);

  const passwordMismatch = isPasswordPresent(confirmation) && !passwordsMatch(password, confirmation);
  const canProtect =
    !!file && !fileError && isPasswordPresent(password) && passwordsMatch(password, confirmation) && !processing;

  const protect = async () => {
    if (!file || !canProtect) return;
    setFailure(null);
    setComplete(false);
    setProcessing(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { protectPdf } = await import('./protect');
      const output = await protectPdf(bytes, password);
      downloadBlob(new Blob([output as BlobPart], { type: 'application/pdf' }), protectedPdfFileName(file.name));
      setPassword('');
      setConfirmation('');
      setComplete(true);
    } catch (caught) {
      setFailure(classifyProtectFailure(caught instanceof Error ? caught.message : String(caught)));
    } finally {
      setProcessing(false);
    }
  };

  const errorMessage = fileError === 'size' ? ui.fileSizeLimit : ui.invalidPdf;
  const failureMessage =
    failure === 'encrypted'
      ? ui.encryptedPdf
      : failure === 'invalid'
        ? ui.invalidPdf
        : failure === 'memory'
          ? ui.memoryError
          : ui.protectFailed;

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
                autoComplete="new-password"
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

          <Field label={ui.confirmPasswordLabel} hint={passwordMismatch ? ui.passwordMismatch : ui.confirmPasswordHint}>
            <TextInput
              type={showPassword ? 'text' : 'password'}
              value={confirmation}
              onInput={(event) => {
                setConfirmation((event.currentTarget as HTMLInputElement).value);
                setFailure(null);
                setComplete(false);
              }}
              autoComplete="new-password"
              disabled={!file || !!fileError || processing}
            />
          </Field>

          <Button variant="primary" size="lg" class="w-full" disabled={!canProtect} onClick={protect}>
            {processing ? ui.processing : ui.protect}
          </Button>
          <p class="text-xs leading-5 text-subtle">{ui.compatibilityNote}</p>
        </div>
      </div>

      <div class="mt-6 border-t border-line pt-4">
        <Notice>{ui.privacyNote}</Notice>
      </div>
    </Panel>
  );
}
