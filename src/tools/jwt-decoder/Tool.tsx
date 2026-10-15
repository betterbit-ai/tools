import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button, CopyButton, Field, Kbd, Notice, Panel, Textarea } from '../../components/ui';
import type { ToolProps } from '../types';
import type { UI } from './content';
import { decodeJwt, getJwtTimeStatus, type JwtErrorReason, type JwtTimeStatus } from './logic';

const SAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImRlbW8ta2V5LTEifQ.eyJzdWIiOiJ1c2VyLTEyMyIsIm5hbWUiOiJIYW5hIEtpbSIsInJvbGUiOiJlZGl0b3IiLCJpYXQiOjE3NjcyMjU2MDAsIm5iZiI6MTc2NzIyNTYwMCwiZXhwIjoxODkzNDU2MDAwLCJpc3MiOiJodHRwczovL2V4YW1wbGUudGVzdCJ9.demo-signature';

const ERROR_KEY: Record<JwtErrorReason, keyof UI> = {
  segments: 'errorSegments',
  encrypted: 'errorEncrypted',
  'too-long': 'errorTooLong',
  base64: 'errorBase64',
  utf8: 'errorUtf8',
  json: 'errorJson',
  object: 'errorObject',
};

const STATUS_KEY: Record<JwtTimeStatus, keyof UI> = {
  expired: 'statusExpired',
  'not-active': 'statusNotActive',
  active: 'statusActive',
  'no-expiration': 'statusNoExpiration',
};

export default function JwtDecoder({ locale, ui }: ToolProps<UI>) {
  const [token, setToken] = useState('');
  const [now, setNow] = useState(Date.now());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const result = useMemo(() => decodeJwt(token), [token]);

  useEffect(() => {
    if (result.status !== 'decoded' || result.value.timeClaims.length === 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [result.status, result.status === 'decoded' ? result.value.timeClaims.length : 0]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.key !== '/' ||
        target.closest('input, textarea, select, [contenteditable]') ||
        event.metaKey ||
        event.ctrlKey
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const decoded = result.status === 'decoded' ? result.value : undefined;
  const status = decoded ? getJwtTimeStatus(decoded.timeClaims, now) : undefined;
  const copyAll = decoded
    ? `${ui.header}\n${decoded.headerText}\n\n${ui.payload}\n${decoded.payloadText}\n\n${ui.signature}\n${decoded.signature}`
    : '';

  return (
    <Panel>
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="flex flex-col gap-3">
          <Field label={ui.inputLabel} hint={ui.inputHint}>
            <Textarea
              ref={inputRef}
              value={token}
              onInput={(event) => setToken(event.currentTarget.value)}
              placeholder={ui.inputPlaceholder}
              spellcheck={false}
              class="min-h-[260px] w-full font-mono text-sm"
            />
          </Field>
          <div class="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setToken(SAMPLE_TOKEN)}>
              {ui.loadExample}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setToken('')} disabled={!token}>
              {ui.clear}
            </Button>
            <span class="ml-auto text-xs text-subtle">{ui.notSaved}</span>
          </div>
          <p class="text-xs text-subtle">
            {ui.focusHintStart} <Kbd>/</Kbd> {ui.focusHintEnd}
          </p>
        </div>

        <div class="flex flex-col gap-3" aria-live="polite">
          <h2 class="text-sm font-medium text-fg">{ui.overview}</h2>
          {result.status === 'empty' ? (
            <Notice>{ui.empty}</Notice>
          ) : result.status === 'invalid' ? (
            <Notice tone="danger">{ui[ERROR_KEY[result.reason]]}</Notice>
          ) : decoded && status ? (
            <>
              <Notice tone={status === 'active' ? 'success' : status === 'no-expiration' ? 'info' : 'danger'}>
                {ui[STATUS_KEY[status]]}
              </Notice>
              <ResultRow label={ui.algorithm} value={stringValue(decoded.header.alg, ui.notAvailable)} />
              <ResultRow label={ui.type} value={stringValue(decoded.header.typ, ui.notAvailable)} />
              <ResultRow label={ui.signature} value={decoded.signature ? ui.signaturePresent : ui.signatureEmpty} />
              {decoded.timeClaims.length > 0 ? (
                <div class="border-t border-line pt-4">
                  <h3 class="text-sm font-medium text-fg">{ui.timeClaims}</h3>
                  <div class="mt-3 space-y-3">
                    {decoded.timeClaims.map((claim) => (
                      <TimeClaim key={claim.name} claim={claim} locale={locale} ui={ui} now={now} />
                    ))}
                  </div>
                </div>
              ) : (
                <p class="text-sm text-muted">{ui.noTimeClaims}</p>
              )}
              <CopyButton text={copyAll} label={ui.copyAll} copiedLabel={ui.copied} />
            </>
          ) : null}
          <p class="mt-auto text-xs text-subtle">{ui.unverified}</p>
        </div>
      </div>

      {decoded && (
        <div class="mt-6 grid gap-6 border-t border-line pt-6 lg:grid-cols-2">
          <JsonBlock title={ui.header} value={decoded.headerText} copyLabel={ui.copy} copiedLabel={ui.copied} />
          <JsonBlock title={ui.payload} value={decoded.payloadText} copyLabel={ui.copy} copiedLabel={ui.copied} />
        </div>
      )}
    </Panel>
  );
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback;
}

function ResultRow(props: { label: string; value: string }) {
  return (
    <div class="rounded-md bg-surface-2 px-3 py-2.5">
      <div class="text-xs text-muted">{props.label}</div>
      <div class="mt-0.5 break-all font-mono text-sm text-fg">{props.value}</div>
    </div>
  );
}

function TimeClaim(props: {
  claim: { name: string; value: number | null; milliseconds: number | null };
  locale: string;
  ui: UI;
  now: number;
}) {
  const { claim, locale, ui, now } = props;
  if (claim.value === null || claim.milliseconds === null) {
    return <ResultRow label={claim.name} value={ui.invalidTimeClaim} />;
  }
  const date = new Date(claim.milliseconds);
  const local = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'medium', hourCycle: 'h23' }).format(
    date,
  );
  const utc = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hourCycle: 'h23',
    timeZone: 'UTC',
  }).format(date);
  const seconds = Math.round((claim.milliseconds - now) / 1000);
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(seconds, 'second');
  return (
    <div class="rounded-md bg-surface-2 px-3 py-2.5">
      <div class="flex items-baseline justify-between gap-2">
        <div class="font-mono text-sm font-medium text-fg">{claim.name}</div>
        <div class="text-xs text-muted">{claim.value}</div>
      </div>
      <div class="mt-1 text-sm text-fg">{local}</div>
      <div class="mt-0.5 text-xs text-muted">
        {ui.utc}: {utc}
      </div>
      <div class="mt-1 text-sm text-accent">{relative}</div>
    </div>
  );
}

function JsonBlock(props: { title: string; value: string; copyLabel: string; copiedLabel: string }) {
  return (
    <section>
      <div class="mb-2 flex items-center justify-between gap-3">
        <h2 class="text-sm font-medium text-fg">{props.title}</h2>
        <CopyButton text={props.value} label={props.copyLabel} copiedLabel={props.copiedLabel} />
      </div>
      <pre class="max-h-96 overflow-auto rounded-md border border-line bg-surface-2 p-3 font-mono text-xs leading-5 text-fg">
        {props.value}
      </pre>
    </section>
  );
}
