import { useEffect, useMemo, useState } from 'preact/hooks';
import { Button, CopyButton, Kbd, Notice, Panel, Stat } from '../../components/ui';
import { formatNumber } from '../../lib/format';
import type { ToolProps } from '../types';
import type { UI } from './content';
import {
  aspectRatio,
  breakpointFor,
  dimensionLabel,
  displaySummary,
  resolutionStandard,
  safeDimension,
  safeRatio,
  type ResolutionStandard,
  type ScreenMetrics,
} from './logic';

const EMPTY_METRICS: ScreenMetrics = {
  screenWidth: null,
  screenHeight: null,
  availableWidth: null,
  availableHeight: null,
  layoutViewportWidth: null,
  layoutViewportHeight: null,
  visualViewportWidth: null,
  visualViewportHeight: null,
  devicePixelRatio: null,
  visualViewportScale: null,
  colorDepth: null,
};

const STANDARD_LABEL_KEY: Record<ResolutionStandard, keyof UI> = {
  hd: 'standardHd',
  fullHd: 'standardFullHd',
  qhd: 'standardQhd',
  wqhd: 'standardWqhd',
  uhd4k: 'standard4k',
  '5k': 'standard5k',
  uhd8k: 'standard8k',
};

function readMetrics(): ScreenMetrics {
  const viewport = window.visualViewport;
  return {
    screenWidth: safeDimension(window.screen?.width),
    screenHeight: safeDimension(window.screen?.height),
    availableWidth: safeDimension(window.screen?.availWidth),
    availableHeight: safeDimension(window.screen?.availHeight),
    layoutViewportWidth: safeDimension(window.innerWidth),
    layoutViewportHeight: safeDimension(window.innerHeight),
    visualViewportWidth: safeDimension(viewport?.width ?? window.innerWidth),
    visualViewportHeight: safeDimension(viewport?.height ?? window.innerHeight),
    devicePixelRatio: safeRatio(window.devicePixelRatio),
    visualViewportScale: safeRatio(viewport?.scale ?? 1),
    colorDepth: safeDimension(window.screen?.colorDepth),
  };
}

function isTextEntry(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export default function ScreenResolution({ locale, ui }: ToolProps<UI>) {
  const [metrics, setMetrics] = useState<ScreenMetrics>(EMPTY_METRICS);

  useEffect(() => {
    const update = () => setMetrics(readMetrics());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== 'r' ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isTextEntry(event.target)
      )
        return;
      event.preventDefault();
      setMetrics(readMetrics());
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const dimension = (width: number | null, height: number | null) => dimensionLabel(width, height, ui.unavailable);
  const ratio = (value: number | null) => (value === null ? ui.unavailable : formatNumber(value, locale, 2));
  const standard = resolutionStandard(metrics.screenWidth, metrics.screenHeight);
  const screenValue = `${dimension(metrics.screenWidth, metrics.screenHeight)}${standard ? ` · ${ui[STANDARD_LABEL_KEY[standard]]}` : ''}`;
  const breakpoint = breakpointFor(metrics.layoutViewportWidth);
  const breakpointValue = breakpoint
    ? `${breakpoint.name} · ${breakpoint.min}–${breakpoint.max ?? '∞'} ${ui.cssPixels}`
    : ui.unavailable;
  const summary = useMemo(
    () =>
      displaySummary(metrics, {
        screen: ui.screen,
        available: ui.available,
        layoutViewport: ui.layoutViewport,
        visualViewport: ui.visualViewport,
        devicePixelRatio: ui.devicePixelRatio,
        visualViewportScale: ui.visualViewportScale,
        aspectRatio: ui.aspectRatio,
        colorDepth: ui.colorDepth,
        activeBreakpoint: ui.activeBreakpoint,
        cssSnippet: ui.cssSnippet,
        cssPixels: ui.cssPixels,
        bit: ui.bit,
        unavailable: ui.unavailable,
      }),
    [metrics, ui],
  );

  return (
    <Panel>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-medium text-fg">{ui.resultsTitle}</h2>
          <p class="mt-1 text-xs leading-5 text-subtle">{ui.liveHint}</p>
        </div>
        <div class="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setMetrics(readMetrics())}>
            {ui.refresh}
          </Button>
          <span class="text-xs text-subtle">
            <Kbd>R</Kbd> {ui.refreshShortcut}
          </span>
        </div>
      </div>

      <div class="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        <Stat label={`${ui.screen} (${ui.browserCssPixels})`} value={screenValue} emphasis />
        <Stat
          label={`${ui.layoutViewport} (${ui.cssPixels})`}
          value={dimension(metrics.layoutViewportWidth, metrics.layoutViewportHeight)}
        />
        <Stat
          label={`${ui.visualViewport} (${ui.cssPixels})`}
          value={dimension(metrics.visualViewportWidth, metrics.visualViewportHeight)}
        />
        <Stat
          label={`${ui.available} (${ui.cssPixels})`}
          value={dimension(metrics.availableWidth, metrics.availableHeight)}
        />
        <Stat label={ui.devicePixelRatio} value={ratio(metrics.devicePixelRatio)} />
        <Stat
          label={ui.visualViewportScale}
          value={metrics.visualViewportScale === null ? ui.unavailable : `${ratio(metrics.visualViewportScale * 100)}%`}
        />
        <Stat label={ui.aspectRatio} value={aspectRatio(metrics.screenWidth, metrics.screenHeight, ui.unavailable)} />
        <Stat
          label={ui.colorDepth}
          value={metrics.colorDepth === null ? ui.unavailable : `${metrics.colorDepth} ${ui.bit}`}
        />
        <Stat label={ui.activeBreakpoint} value={breakpointValue} />
      </div>

      <div class="mt-5 grid gap-3 border-t border-line pt-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <Notice>{ui.accuracyNotice}</Notice>
        <CopyButton text={summary} label={ui.copy} copiedLabel={ui.copied} />
      </div>
    </Panel>
  );
}
