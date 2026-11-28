import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, FieldGroup, Notice, Panel, Segmented, Stat, Textarea, Toggle } from '../../components/ui';
import { downloadBlob, safeStorage } from '../../lib/browser';
import { formatBytes, formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { type Language, type MinifyResult, detectLanguage, gzipSize, minifyCss, minifyJs } from './logic';

const INPUT_KEY = 'tools:css-minifier:input';
const OPTIONS_KEY = 'tools:css-minifier:options';

interface Options {
  language: Language;
  keepLicense: boolean;
}

const DEFAULTS: Options = { language: 'css', keepLicense: true };
const SAMPLE = `/* Card */
.card {
  margin: 0px;
  padding: 16px 24px;
  border-radius: 12px;
  background: #ffffff;
  color: #1a1a1a;
}

.card > .title {
  font-weight: 600;
}

@media (min-width: 600px) {
  .card {
    padding: 24px 32px;
  }
}
`;

export default function CssMinifier({ locale, ui }: ToolProps<UI>) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<Options>(DEFAULTS);
  const [gzip, setGzip] = useState<{ before: number | null; after: number | null }>({ before: null, after: null });
  const [saveFailed, setSaveFailed] = useState(false);
  const languageTouched = useRef(false);

  useEffect(() => {
    setInput(safeStorage.get(INPUT_KEY) ?? SAMPLE);
    const saved = safeStorage.get(OPTIONS_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>;
        const language = parsed.language === 'js' ? 'js' : parsed.language === 'css' ? 'css' : DEFAULTS.language;
        setOptions({ language, keepLicense: parsed.keepLicense !== false });
        languageTouched.current = true;
      } catch {
        setOptions(DEFAULTS);
      }
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!input) {
        safeStorage.remove(INPUT_KEY);
        setSaveFailed(false);
        return;
      }
      setSaveFailed(!safeStorage.trySet(INPUT_KEY, input));
    }, 300);
    return () => clearTimeout(id);
  }, [input]);

  useEffect(() => safeStorage.set(OPTIONS_KEY, JSON.stringify(options)), [options]);

  const result: MinifyResult = useMemo(
    () => (options.language === 'css' ? minifyCss(input, options.keepLicense) : minifyJs(input, options.keepLicense)),
    [input, options],
  );

  useEffect(() => {
    let live = true;
    const text = result.ok ? result.text : '';
    Promise.all([gzipSize(input), gzipSize(text)]).then(([before, after]) => {
      if (live) setGzip({ before, after });
    });
    return () => {
      live = false;
    };
  }, [input, result.ok, result.text]);

  const n = (v: number) => formatNumber(v, locale);
  const savedPercent = result.inputLength > 0 ? Math.round((1 - result.outputLength / result.inputLength) * 100) : 0;
  const fileExtension = options.language === 'css' ? '.min.css' : '.min.js';
  const mime = options.language === 'css' ? 'text/css' : 'text/javascript';

  const problemText =
    result.problem === 'unterminated-string'
      ? ui.problemUnterminated
      : result.problem === 'unbalanced-braces'
        ? ui.problemUnbalanced
        : result.problem === 'verification-failed'
          ? ui.problemVerification
          : null;

  const updateInput = (value: string) => {
    if (!languageTouched.current && value.trim()) {
      const detected = detectLanguage(value);
      if (detected !== options.language) setOptions((o) => ({ ...o, language: detected }));
    }
    setInput(value);
  };

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-2">
        <div class="flex min-w-0 flex-col">
          <label for="css-minifier-input" class="mb-1.5 text-sm font-medium text-fg">
            {ui.inputLabel}
          </label>
          <Textarea
            id="css-minifier-input"
            value={input}
            onInput={(e) => updateInput((e.currentTarget as HTMLTextAreaElement).value)}
            placeholder={ui.inputPlaceholder}
            spellcheck={false}
            class="min-h-64 flex-1 font-mono text-sm lg:min-h-[380px]"
          />
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => setInput('')} disabled={!input}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{saveFailed ? '' : ui.autosaved}</span>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <FieldGroup label={ui.languageLabel}>
            <Segmented
              value={options.language}
              onValue={(v) => {
                languageTouched.current = true;
                setOptions((o) => ({ ...o, language: v }));
              }}
              label={ui.languageLabel}
              options={[
                { value: 'css', label: ui.css },
                { value: 'js', label: ui.js },
              ]}
            />
          </FieldGroup>

          <Toggle
            checked={options.keepLicense}
            onChecked={(v) => setOptions((o) => ({ ...o, keepLicense: v }))}
            label={ui.keepLicense}
          />

          <div>
            <label for="css-minifier-output" class="mb-1.5 block text-sm font-medium text-fg">
              {ui.outputLabel}
            </label>
            <Textarea
              id="css-minifier-output"
              value={result.ok ? result.text : ''}
              readOnly
              placeholder={ui.outputPlaceholder}
              spellcheck={false}
              class="min-h-56 bg-surface-2 font-mono text-sm lg:min-h-[300px]"
            />
            <div class="mt-3 flex flex-wrap gap-2">
              <CopyButton text={result.ok ? result.text : ''} label={ui.copy} copiedLabel={ui.copied} />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => downloadBlob(new Blob([result.text], { type: mime }), `styles${fileExtension}`)}
                disabled={!result.ok || !result.text}
              >
                {ui.download}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setInput(result.text)}
                disabled={!result.ok || !result.text}
              >
                {ui.swap}
              </Button>
            </div>
          </div>

          {problemText ? <Notice tone="danger">{problemText}</Notice> : null}

          <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label={ui.original} value={formatBytes(result.inputLength, locale)} />
            <Stat label={ui.minified} value={formatBytes(result.outputLength, locale)} emphasis />
            <Stat label={ui.saved} value={`${n(Math.max(0, savedPercent))}%`} />
            <Stat label={ui.comments} value={n(result.removedComments)} />
          </div>

          <p class="text-xs text-subtle">
            {ui.gzip}:{' '}
            {gzip.before === null || gzip.after === null
              ? ui.gzipUnavailable
              : `${formatBytes(gzip.before, locale)} → ${formatBytes(gzip.after, locale)}`}
          </p>
        </div>
      </div>
    </Panel>
  );
}
