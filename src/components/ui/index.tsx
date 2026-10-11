/**
 * UI primitives for tool components (Preact). Every Tool.tsx builds its UI from
 * these so all tools look and behave the same. If you need something new,
 * add it here (generic, token-based) — don't style one-offs inside a tool.
 * See docs/DESIGN_SYSTEM.md.
 */
import type { ButtonHTMLAttributes, ComponentChildren, InputHTMLAttributes } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { cx, inputClass } from './cx';

export { cx, inputClass };

/* ───────────── Layout ───────────── */

/** The tool's main surface. One per tool, wraps the whole interactive area. */
export function Panel(props: { children: ComponentChildren; class?: string }) {
  return (
    <div class={cx('rounded-xl border border-line bg-surface shadow-card p-4 sm:p-6', props.class)}>
      {props.children}
    </div>
  );
}

/** Labelled control. `hint` appears below in muted text. */
export function Field(props: { label: string; hint?: string; children: ComponentChildren; class?: string }) {
  return (
    <label class={cx('block', props.class)}>
      <span class="block text-sm font-medium text-fg mb-1.5">{props.label}</span>
      {props.children}
      {props.hint && <span class="block mt-1 text-xs text-subtle">{props.hint}</span>}
    </label>
  );
}

/* ───────────── Actions ───────────── */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:bg-accent-hover',
  secondary: 'bg-surface text-fg border border-line hover:border-line-strong hover:bg-surface-2',
  ghost: 'text-muted hover:text-fg hover:bg-surface-2',
  danger: 'bg-danger-soft text-danger hover:brightness-95',
};
const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-[15px] gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export function Button(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize },
) {
  const { variant = 'secondary', size = 'md', class: className, type = 'button', ...rest } = props;
  return (
    <button
      type={type as 'button'}
      class={cx(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'disabled:opacity-50 disabled:pointer-events-none select-none',
        buttonVariants[variant],
        buttonSizes[size],
        className as string,
      )}
      {...rest}
    />
  );
}

/** Copies `text` to clipboard and shows `copiedLabel` briefly. */
export function CopyButton(props: {
  text: string;
  label: string;
  copiedLabel: string;
  size?: ButtonSize;
  variant?: ButtonVariant;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(id);
  }, [copied]);
  return (
    <Button
      size={props.size ?? 'sm'}
      variant={props.variant ?? 'secondary'}
      disabled={!props.text}
      onClick={async () => {
        await navigator.clipboard.writeText(props.text);
        setCopied(true);
      }}
    >
      {copied ? props.copiedLabel : props.label}
    </Button>
  );
}

/* ───────────── Inputs ───────────── */

export function NumberInput(
  props: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
    value: number | '';
    onValue: (v: number | '') => void;
  },
) {
  const { value, onValue, class: className, ...rest } = props;
  return (
    <input
      type="number"
      inputMode="decimal"
      class={cx(inputClass, 'tabular', className as string)}
      value={value}
      onInput={(e) => {
        const raw = (e.currentTarget as HTMLInputElement).value;
        onValue(raw === '' ? '' : Number(raw));
      }}
      {...rest}
    />
  );
}

/** Single-line text input using the shared token-based input treatment. */
export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { class: className, type = 'text', ...rest } = props;
  return <input type={type} class={cx(inputClass, className as string)} {...rest} />;
}

/** Multi-line text input using the shared token-based input treatment. */
export function Textarea(props: InputHTMLAttributes<HTMLTextAreaElement>) {
  const { class: className, ...rest } = props;
  return <textarea class={cx(inputClass, 'min-h-32 resize-y leading-6', className as string)} {...rest} />;
}

export function Select<T extends string>(props: {
  value: T;
  onValue: (v: T) => void;
  options: { value: T; label: string }[];
  id?: string;
}) {
  return (
    <select
      id={props.id}
      class={cx(inputClass, 'pr-8 appearance-none bg-[length:16px] bg-[right_10px_center] bg-no-repeat')}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238b8b93' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      value={props.value}
      onChange={(e) => props.onValue((e.currentTarget as HTMLSelectElement).value as T)}
    >
      {props.options.map((o) => (
        <option value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

/** Mutually exclusive options shown inline (radio group). Use for ≤ 5 short options. */
export function Segmented<T extends string>(props: {
  value: T | null;
  onValue: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={props.label}
      class="inline-flex max-w-full flex-wrap rounded-md border border-line bg-surface-2 p-0.5"
    >
      {props.options.map((o) => {
        const active = o.value === props.value;
        return (
          <button
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => props.onValue(o.value)}
            class={cx(
              'h-8 px-3 rounded-[5px] text-sm font-medium transition-colors',
              active ? 'bg-surface text-fg shadow-card' : 'text-muted hover:text-fg',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle(props: { checked: boolean; onChecked: (v: boolean) => void; label: string }) {
  return (
    <label class="inline-flex items-center gap-2.5 cursor-pointer select-none text-sm text-fg">
      <span class="relative inline-flex">
        <input
          type="checkbox"
          class="peer sr-only"
          checked={props.checked}
          onChange={(e) => props.onChecked((e.currentTarget as HTMLInputElement).checked)}
        />
        <span class="h-5 w-9 rounded-full bg-line-strong transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]" />
        <span class="absolute top-0.5 left-0.5 size-4 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-4" />
      </span>
      {props.label}
    </label>
  );
}

/* ───────────── Files ───────────── */

/**
 * Drag & drop + click + paste (Ctrl/Cmd+V) file input. Files never leave the browser.
 * Paste is listened on window so users can paste right after landing on the page.
 */
export function Dropzone(props: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title: string;
  hint: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const { onFiles, accept } = props;

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => matchesAccept(f, accept));
      if (files.length) {
        e.preventDefault();
        onFiles(files);
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [onFiles, accept]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const files = Array.from(e.dataTransfer?.files ?? []).filter((f) => matchesAccept(f, accept));
        if (files.length) onFiles(props.multiple ? files : files.slice(0, 1));
      }}
      class={cx(
        'flex flex-col items-center justify-center text-center rounded-lg border-2 border-dashed cursor-pointer transition-colors',
        props.compact ? 'py-6 px-4' : 'py-14 px-6',
        over ? 'border-accent bg-accent-soft' : 'border-line-strong hover:border-accent hover:bg-surface-2',
      )}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-accent"
        aria-hidden="true"
      >
        <path d="M12 16V4" />
        <path d="m7 9 5-5 5 5" />
        <path d="M20 16v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3" />
      </svg>
      <p class="mt-3 font-medium text-fg">{props.title}</p>
      <p class="mt-1 text-sm text-muted">{props.hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={props.multiple}
        class="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          const el = e.currentTarget as HTMLInputElement;
          const files = Array.from(el.files ?? []);
          if (files.length) onFiles(files);
          el.value = '';
        }}
      />
    </div>
  );
}

function matchesAccept(file: File, accept: string): boolean {
  return accept.split(',').some((rule) => {
    const r = rule.trim();
    if (r.endsWith('/*')) return file.type.startsWith(r.slice(0, -1));
    if (r.startsWith('.')) return file.name.toLowerCase().endsWith(r.toLowerCase());
    return file.type === r;
  });
}

/* ───────────── Display ───────────── */

/** A labelled metric. Use in a grid for result summaries. */
export function Stat(props: { label: string; value: string | number; emphasis?: boolean }) {
  return (
    <div class="rounded-md bg-surface-2 px-3 py-2.5">
      <div class={cx('tabular font-semibold tracking-tight text-fg', props.emphasis ? 'text-3xl' : 'text-xl')}>
        {props.value}
      </div>
      <div class="text-xs text-muted mt-0.5">{props.label}</div>
    </div>
  );
}

/** A compact, token-based bar chart for a small series of labelled numeric values. */
export function BarChart(props: { items: { label: string; value: number }[]; ariaLabel: string }) {
  const max = Math.max(1, ...props.items.map((item) => item.value));
  return (
    <div role="img" aria-label={props.ariaLabel} class="h-36 rounded-md border border-line bg-surface-2 p-3">
      <div class="flex h-full items-end gap-1" aria-hidden="true">
        {props.items.map((item) => (
          <div class="flex h-full min-w-0 flex-1 items-end" title={item.label}>
            <div class="w-full rounded-sm bg-accent" style={{ height: `${Math.max(3, (item.value / max) * 100)}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Inline status message. */
export function Notice(props: { tone?: 'info' | 'success' | 'danger'; children: ComponentChildren }) {
  const tone = props.tone ?? 'info';
  return (
    <p
      role={tone === 'danger' ? 'alert' : 'status'}
      class={cx(
        'rounded-md px-3 py-2 text-sm',
        tone === 'info' && 'bg-accent-soft text-accent',
        tone === 'success' && 'bg-success-soft text-success',
        tone === 'danger' && 'bg-danger-soft text-danger',
      )}
    >
      {props.children}
    </p>
  );
}

/** Keyboard shortcut hint, e.g. <Kbd>Space</Kbd>. */
export function Kbd(props: { children: ComponentChildren }) {
  return (
    <kbd class="inline-flex items-center rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted">
      {props.children}
    </kbd>
  );
}
