import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'screen-resolution',
  category: 'developer',
  icon: 'resize',
  added: '2026-10-16',
  updated: '2026-10-16',
  edges: ['usability', 'features', 'accuracy'],
  competitors: [
    {
      name: 'WhatIsMyIP — Screen Resolution',
      url: 'https://www.whatismyip.com/screen-resolution/',
      weakness:
        'Its opened result presents “Display Dimensions” and a diagonal based on an assumed 96 PPI, even though its own explanation later says a browser cannot read a panel’s physical size. Betterbit does not fabricate inches or panel-native dimensions: it labels the browser’s CSS-pixel readings, shows page-zoom/visual-viewport context, and copies a reproducible viewport report. (Strength: it includes operating-system instructions for checking or changing display settings.)',
    },
    {
      name: 'WhatisMyScreenResolutions',
      url: 'https://whatismyscreenresolutions.com/',
      weakness:
        'Its opened result shows screen, viewport, DPR, refresh rate, color depth, browser, and OS, but offers no active CSS width range or copy-ready bounded media query for reproducing a responsive bug. Betterbit turns the live layout viewport into a 640/768/1024/1280/1536 CSS range and copies that range with the measurements. (Strength: it also reports an estimated refresh rate and identifies the browser and operating system.)',
    },
    {
      name: 'Tonton Tools — What Is My Screen Resolution',
      url: 'https://tonton-tools.com/en/what-is-my-screen-resolution',
      weakness:
        'Its indexed result focuses on display size, window size, and pixel ratio, but does not expose the visual viewport scale that distinguishes pinch magnification from the layout width used by CSS. Betterbit shows both layout and visual viewports, their live values, and the reported visual-viewport scale in one compact report. (Strength: it links to a separate resolution simulator for testing other sizes.)',
    },
    {
      name: 'D8TEST — 내 화면 해상도 확인',
      url: 'https://d8test.com/tests/device-screen-tests/screen-resolution-test/',
      weakness:
        'Its indexed Korean result separates the operating-system screen area from the browser area, but does not provide an active CSS breakpoint or a copy-ready media-query range for responsive debugging. Betterbit pairs those two readings with the current CSS range and a one-click text report. (Strength: it explains the difference between the browser area and the wider screen area in Korean.)',
    },
    {
      name: '지락실닷컴 — 내 기기 정보 확인',
      url: 'https://new.jiraksil.com/service/deviceinfo',
      weakness:
        'Its indexed Korean result combines screen resolution and DPR with GPU, CPU, battery, IP, and a user-agent report, making the requested display reading part of a much broader device-information page. Betterbit keeps the display-specific facts together and adds visual viewport scale plus a bounded CSS query. (Strength: it also surfaces GPU, CPU-core, battery, and IP information.)',
    },
    {
      name: 'Akousa — 화면 해상도 확인기',
      url: 'https://akousa.net/ko/tools/screen-resolution-checker',
      weakness:
        'Its indexed Korean description lists screen resolution, current viewport, DPR, color depth, orientation, and a CSS breakpoint, but not the visual viewport or its scale; those are needed to distinguish a responsive layout width from a magnified visible area. Betterbit reports both viewport types and copies the current bounded CSS media query beside DPR. (Strength: it explains common breakpoint matches for web developers.)',
    },
  ],
  related: ['json-formatter', 'url-encoder', 'base64'],
};
