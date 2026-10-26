import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, Panel, Select, Stat, Textarea } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import type { ToolProps } from '../types';
import { appendTranscript, isEditableElement, recognitionErrorKey, transcriptStats } from './logic';
import { startOnDeviceRecognition, type RecognitionSession } from './recognition';
import type { UI } from './content';

const TEXT_KEY = 'tools:speech-to-text:transcript';
type State =
  'ready' | 'preparing' | 'listening' | 'unsupported' | 'permission' | 'no-speech' | 'language' | 'setup' | 'error';

export default function SpeechToText({ locale, ui }: ToolProps<UI>) {
  const [text, setText] = useState('');
  const [interim, setInterim] = useState('');
  const [language, setLanguage] = useState(locale === 'ko' ? 'ko-KR' : 'en-US');
  const [state, setState] = useState<State>('ready');
  const session = useRef<RecognitionSession | null>(null);
  const preparation = useRef<AbortController | null>(null);
  const startRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    setText(safeStorage.get(TEXT_KEY) ?? '');
    return () => {
      preparation.current?.abort();
      session.current?.stop();
    };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (text) safeStorage.set(TEXT_KEY, text);
      else safeStorage.remove(TEXT_KEY);
    }, 300);
    return () => clearTimeout(id);
  }, [text]);

  const stats = useMemo(() => transcriptStats(text), [text]);
  const stop = () => {
    preparation.current?.abort();
    preparation.current = null;
    session.current?.stop();
    session.current = null;
    setInterim('');
    setState('ready');
  };
  const start = async () => {
    if (state === 'preparing' || state === 'listening') return;
    const controller = new AbortController();
    preparation.current = controller;
    setState('preparing');
    setInterim('');
    const result = await startOnDeviceRecognition(
      language,
      {
        onStart: () => {
          if (!controller.signal.aborted) setState('listening');
        },
        onFinal: (phrase) => setText((current) => appendTranscript(current, phrase)),
        onInterim: setInterim,
        onError: (code) => {
          if (controller.signal.aborted) return;
          preparation.current = null;
          session.current = null;
          setInterim('');
          const error = recognitionErrorKey(code);
          setState(error === 'generic' ? 'error' : error);
        },
        onEnd: () => {
          preparation.current = null;
          session.current = null;
          setInterim('');
          setState((current) => (current === 'listening' || current === 'preparing' ? 'ready' : current));
        },
      },
      controller.signal,
    );
    if (controller.signal.aborted || result.kind === 'cancelled') return;
    preparation.current = null;
    if (result.kind === 'unsupported') {
      setState('unsupported');
      return;
    }
    if (result.kind === 'failed') {
      if (result.error === 'setup') {
        setState('setup');
        return;
      }
      const error = recognitionErrorKey(result.error);
      setState(error === 'generic' ? 'error' : error);
      return;
    }
    session.current = result.session;
  };
  startRef.current = () => void start();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (isEditableElement(target?.tagName ?? '', target?.isContentEditable ?? false)) return;
      if (event.key !== ' ') return;
      event.preventDefault();
      if (session.current || preparation.current) stop();
      else startRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const message =
    state === 'preparing'
      ? ui.preparing
      : state === 'unsupported'
        ? ui.unsupported
        : state === 'permission'
          ? ui.permissionError
          : state === 'no-speech'
            ? ui.noSpeechError
            : state === 'language'
              ? ui.languageError
              : state === 'setup'
                ? ui.setupError
                : state === 'error'
                  ? ui.genericError
                  : null;

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div class="flex min-w-0 flex-col gap-3">
          <Field label={ui.transcriptLabel} hint={ui.transcriptHint}>
            <Textarea
              value={text}
              onInput={(event) => setText((event.currentTarget as HTMLTextAreaElement).value)}
              placeholder={ui.placeholder}
              class="min-h-[320px]"
            />
          </Field>
          {interim && (
            <p class="text-sm text-subtle" aria-live="polite">
              {ui.hearing}: {interim}
            </p>
          )}
          <div class="flex flex-wrap items-center gap-2">
            <CopyButton text={text} label={ui.copy} copiedLabel={ui.copied} />
            <Button
              size="sm"
              variant="secondary"
              disabled={!text}
              onClick={() => downloadBlob(new Blob([text], { type: 'text/plain;charset=utf-8' }), 'dictation.txt')}
            >
              {ui.download}
            </Button>
            <Button size="sm" variant="ghost" disabled={!text} onClick={() => setText('')}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.saved}</span>
          </div>
        </div>

        <div class="flex flex-col gap-5">
          <Field label={ui.languageLabel} hint={ui.languageHint}>
            <Select
              value={language}
              onValue={(value) => setLanguage(value)}
              options={[
                { value: 'en-US', label: ui.english },
                { value: 'ko-KR', label: ui.korean },
              ]}
            />
          </Field>
          <Button
            size="lg"
            variant={state === 'listening' || state === 'preparing' ? 'danger' : 'primary'}
            onClick={state === 'listening' || state === 'preparing' ? stop : start}
          >
            {state === 'listening' ? ui.stop : state === 'preparing' ? ui.cancelSetup : ui.start}
          </Button>
          <p class="text-xs text-subtle">
            {ui.shortcut} <Kbd>{ui.shortcutKey}</Kbd>
          </p>
          {message && <Notice tone={state === 'preparing' ? 'info' : 'danger'}>{message}</Notice>}
          <Notice tone="info">{ui.privacyNotice}</Notice>
          <div class="grid grid-cols-2 gap-2" aria-live="polite">
            <Stat label={ui.characters} value={String(stats.characters)} emphasis />
            <Stat label={ui.words} value={String(stats.words)} emphasis />
          </div>
        </div>
      </div>
    </Panel>
  );
}
