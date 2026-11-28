import { useEffect, useMemo, useState } from 'preact/hooks';
import { CopyButton, Notice, Panel, Segmented, Stat, Textarea } from '../../components/ui';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  clientReport,
  majorVersion,
  parseUserAgent,
  pickClientHintBrand,
  shortIdentity,
  type ClientInfo,
  type DeviceType,
} from './logic';

type Mode = 'mine' | 'other';

interface ClientHints {
  brands: string | null;
  platform: string | null;
  mobile: boolean | null;
  platformVersion: string | null;
  architecture: string | null;
  bitness: string | null;
  model: string | null;
  fullVersion: string | null;
}

interface EnvValues {
  userAgent: string;
  vendor: string | null;
  platform: string | null;
  languages: string | null;
  maxTouchPoints: number | null;
  cookieEnabled: boolean | null;
  cores: number | null;
  memoryGb: number | null;
  hints: ClientHints | null;
}

const EMPTY_ENV: EnvValues = {
  userAgent: '',
  vendor: null,
  platform: null,
  languages: null,
  maxTouchPoints: null,
  cookieEnabled: null,
  cores: null,
  memoryGb: null,
  hints: null,
};

const DEVICE_UI_KEY: Record<DeviceType, keyof UI> = {
  desktop: 'deviceDesktop',
  mobile: 'deviceMobile',
  tablet: 'deviceTablet',
  tv: 'deviceTv',
  bot: 'deviceBot',
  tool: 'deviceTool',
  unknown: 'deviceUnknown',
};

interface UserAgentData {
  brands?: { brand: string; version: string }[];
  mobile?: boolean;
  platform?: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{
    platformVersion?: string;
    architecture?: string;
    bitness?: string;
    model?: string;
    fullVersionList?: { brand: string; version: string }[];
  }>;
}

function readEnv(): EnvValues {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    userAgentData?: UserAgentData;
  };
  const data = nav.userAgentData;
  const brand = pickClientHintBrand(data?.brands);
  return {
    userAgent: nav.userAgent ?? '',
    vendor: nav.vendor || null,
    platform: nav.platform || null,
    languages: nav.languages?.length ? nav.languages.join(', ') : nav.language || null,
    maxTouchPoints: typeof nav.maxTouchPoints === 'number' ? nav.maxTouchPoints : null,
    cookieEnabled: typeof nav.cookieEnabled === 'boolean' ? nav.cookieEnabled : null,
    cores: typeof nav.hardwareConcurrency === 'number' ? nav.hardwareConcurrency : null,
    memoryGb: typeof nav.deviceMemory === 'number' ? nav.deviceMemory : null,
    hints: data
      ? {
          brands: data.brands?.map((item) => `${item.brand} ${item.version}`).join(', ') ?? null,
          platform: data.platform ?? null,
          mobile: typeof data.mobile === 'boolean' ? data.mobile : null,
          platformVersion: null,
          architecture: null,
          bitness: null,
          model: null,
          fullVersion: brand ? `${brand.brand} ${brand.version}` : null,
        }
      : null,
  };
}

export default function UserAgent({ ui }: ToolProps<UI>) {
  const [env, setEnv] = useState<EnvValues>(EMPTY_ENV);
  const [mode, setMode] = useState<Mode>('mine');
  const [pasted, setPasted] = useState('');

  useEffect(() => {
    const initial = readEnv();
    setEnv(initial);
    const data = (navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
    if (!data?.getHighEntropyValues) return;
    let cancelled = false;
    data
      .getHighEntropyValues(['platformVersion', 'architecture', 'bitness', 'model', 'fullVersionList'])
      .then((values) => {
        if (cancelled) return;
        const fullVersion = pickClientHintBrand(values.fullVersionList);
        setEnv((current) =>
          current.hints
            ? {
                ...current,
                hints: {
                  ...current.hints,
                  platformVersion: values.platformVersion ?? null,
                  architecture: values.architecture ?? null,
                  bitness: values.bitness ?? null,
                  model: values.model || null,
                  fullVersion: fullVersion ? `${fullVersion.brand} ${fullVersion.version}` : current.hints.fullVersion,
                },
              }
            : current,
        );
      })
      .catch(() => {
        // High-entropy values are optional; the low-entropy hints already shown stay valid.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activeString = mode === 'mine' ? env.userAgent : pasted;
  const parsed = parseUserAgent(activeString);

  const isIpadDesktopMode =
    mode === 'mine' && parsed.os === 'macOS' && (env.maxTouchPoints ?? 0) > 1 && /Mobile\//.test(env.userAgent);
  const info: ClientInfo = isIpadDesktopMode
    ? { ...parsed, os: 'iPadOS', device: 'tablet', deviceModel: 'iPad', engine: parsed.engine }
    : parsed;

  const labels = useMemo(
    () => ({
      browser: ui.browser,
      version: ui.version,
      engine: ui.engine,
      os: ui.os,
      device: ui.device,
      model: ui.model,
      inApp: ui.inApp,
      bot: ui.bot,
      none: ui.unknown,
      rawString: 'User-Agent',
      deviceDesktop: ui.deviceDesktop,
      deviceMobile: ui.deviceMobile,
      deviceTablet: ui.deviceTablet,
      deviceTv: ui.deviceTv,
      deviceBot: ui.deviceBot,
      deviceTool: ui.deviceTool,
      deviceUnknown: ui.deviceUnknown,
      clientHints: ui.clientHints,
      platform: ui.platform,
    }),
    [ui],
  );

  const report = clientReport(info, activeString, labels);
  const browserLabel = info.browser
    ? `${info.browser}${info.browserVersion ? ` ${majorVersion(info.browserVersion) ?? info.browserVersion}` : ''}`
    : ui.unknown;

  return (
    <div class="space-y-4">
      <Panel>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <Segmented<Mode>
            value={mode}
            onValue={setMode}
            label={ui.modeLabel}
            options={[
              { value: 'mine', label: ui.modeMine },
              { value: 'other', label: ui.modeOther },
            ]}
          />
          <CopyButton text={activeString} label={ui.copyRaw} copiedLabel={ui.copied} />
        </div>

        {mode === 'other' ? (
          <div class="mt-4">
            <label class="block text-sm font-medium text-fg" for="ua-input">
              {ui.otherLabel}
            </label>
            <p class="mt-1 text-xs text-muted">{ui.otherHint}</p>
            <Textarea
              id="ua-input"
              class="mt-2 font-mono text-xs"
              value={pasted}
              placeholder={ui.otherPlaceholder}
              onInput={(event) => setPasted((event.currentTarget as HTMLTextAreaElement).value)}
            />
          </div>
        ) : (
          <div class="mt-4">
            <p class="text-xs font-medium tracking-wide text-subtle uppercase">{ui.rawString}</p>
            <p class="mt-1 rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-xs leading-5 break-all text-fg">
              {env.userAgent || ui.unknown}
            </p>
          </div>
        )}

        <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label={`${ui.browser}`} value={browserLabel} emphasis />
          <Stat label={ui.engine} value={info.engine ?? ui.unknown} />
          <Stat
            label={ui.os}
            value={info.os ? `${info.os}${info.osVersion ? ` ${info.osVersion}` : ''}` : ui.unknown}
          />
          <Stat label={ui.device} value={ui[DEVICE_UI_KEY[info.device]] as string} />
          <Stat label={ui.model} value={info.deviceModel ?? ui.unknown} />
          <Stat label={info.bot ? ui.bot : ui.inApp} value={info.inApp ?? info.bot ?? ui.none} />
        </div>

        <p class="mt-3 text-sm text-muted">{shortIdentity(info, labels)}</p>

        <div class="mt-4 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-2">
            {info.inApp && mode === 'mine' && (
              <Notice tone="danger">{ui.inAppNotice.replace('{app}', info.inApp)}</Notice>
            )}
            {info.bot && <Notice>{ui.botNotice.replace('{bot}', info.bot)}</Notice>}
            {info.reduced && mode === 'mine' && <Notice>{ui.reducedNotice}</Notice>}
            {isIpadDesktopMode && <Notice>{ui.ipadNotice}</Notice>}
            {mode === 'other' && !pasted.trim() && <Notice>{ui.emptyPaste}</Notice>}
            {mode === 'other' && pasted.trim() && info.kind === 'unknown' && <Notice>{ui.unknownString}</Notice>}
          </div>
          <CopyButton text={report} label={ui.copyReport} copiedLabel={ui.copied} />
        </div>
      </Panel>

      {mode === 'mine' && (
        <Panel>
          <h2 class="text-sm font-medium text-fg">{ui.valuesTitle}</h2>
          <p class="mt-1 text-xs leading-5 text-subtle">{ui.valuesHint}</p>
          <div class="mt-3 overflow-x-auto">
            <table class="w-full text-sm">
              <tbody>
                <Row label={ui.chPlatform} value={env.platform ?? ui.unknown} />
                <Row label={ui.chVendor} value={env.vendor ?? ui.unknown} />
                <Row label={ui.chLanguages} value={env.languages ?? ui.unknown} />
                <Row label={ui.chCores} value={env.cores === null ? ui.unknown : String(env.cores)} />
                <Row label={ui.chMemory} value={env.memoryGb === null ? ui.unknown : `${env.memoryGb} GB`} />
                <Row label={ui.chTouch} value={env.maxTouchPoints === null ? ui.unknown : String(env.maxTouchPoints)} />
                <Row
                  label={ui.chCookies}
                  value={env.cookieEnabled === null ? ui.unknown : env.cookieEnabled ? ui.yes : ui.no}
                />
                {env.hints && <Row label={ui.clientHints} value={env.hints.brands ?? ui.unavailable} />}
                {env.hints?.platform && <Row label={ui.chHintPlatform} value={env.hints.platform} />}
                {env.hints?.platformVersion && (
                  <Row label={ui.chHintPlatformVersion} value={env.hints.platformVersion} />
                )}
                {env.hints?.architecture && <Row label={ui.chHintArch} value={env.hints.architecture} />}
                {env.hints?.bitness && <Row label={ui.chHintBitness} value={env.hints.bitness} />}
                {env.hints?.model && <Row label={ui.chHintModel} value={env.hints.model} />}
              </tbody>
            </table>
          </div>
          <p class="mt-3 text-xs leading-5 text-subtle">{env.hints ? ui.hintsSupported : ui.hintsUnsupported}</p>
        </Panel>
      )}
    </div>
  );
}

function Row(props: { label: string; value: string }) {
  return (
    <tr class="border-b border-line/60 last:border-0">
      <th scope="row" class="w-1/2 py-2 pr-4 text-left text-xs font-medium text-muted">
        {props.label}
      </th>
      <td class="py-2 font-mono text-xs break-all text-fg">{props.value}</td>
    </tr>
  );
}
