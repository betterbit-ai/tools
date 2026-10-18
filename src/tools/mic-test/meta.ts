import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'mic-test',
  category: 'device',
  icon: 'microphone',
  added: '2026-10-11',
  updated: '2026-10-19',
  edges: ['usability'],
  competitors: [
    {
      name: 'W3Schools Microphone Test',
      url: 'https://www.w3schools.com/tools/tool_mic_test.php',
      weakness:
        'Its current test has a live meter, waveform, device selector and optional live loopback, but does not offer a short recorded sample to play back. Betterbit keeps the pre-call path to start, a capped 10-second recording and playback, with S/R keyboard shortcuts. (Strength: it includes a waveform and live loopback.)',
    },
    {
      name: 'TestMic.net',
      url: 'https://www.testmic.net/',
      weakness:
        'Its page puts a quality score, noise-floor reading, waveform, spectrum, live monitoring and WebM/WAV downloads around the basic test. Betterbit keeps the pre-call path to start, a device picker, one capped recording action and playback, with S/R keyboard shortcuts. (Strength: it provides richer diagnostics and downloads.)',
    },
    {
      name: 'SoundTools Microphone Test',
      url: 'https://soundtools.online/microphone-test/',
      weakness:
        'Its current tool exposes optional browser-processing controls, a waveform, room-noise measurement and download before the basic sample check. Betterbit offers a shorter start-to-listen path with an always visible 10-second action and S/R keyboard shortcuts. (Strength: it provides room-noise measurement, processing controls and local WAV download.)',
    },
  ],
  related: ['webcam-test', 'keyboard-tester', 'typing-test', 'mouse-test', 'dead-pixel-test'],
};
