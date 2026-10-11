import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'mic-test',
  category: 'device',
  icon: 'microphone',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'FrequencyDetector Microphone Test',
      url: 'https://www.frequencydetector.com/microphone-test/',
      weakness:
        'Its main test emphasizes RMS/peak, waveform and spectrum, but does not offer a local recording-and-playback check in the test interface. Betterbit adds a clearly capped 10-second local sample alongside the live meter. (Strength: it includes a live spectrum and reported channel count.)',
    },
    {
      name: 'Microphone-Test.org',
      url: 'https://microphone-test.org/',
      weakness:
        'Its page places live loopback, recording, download and a frequency graph as separate controls around a volume input. Betterbit keeps the pre-call path to one live meter, device picker and one capped recording action, with S/R keyboard shortcuts. (Strength: it offers live loopback and extensive per-app troubleshooting guides.)',
    },
    {
      name: 'TestMic.net',
      url: 'https://www.testmic.net/',
      weakness:
        'Its interface exposes quality scoring, noise-floor diagnostics, WebM/WAV downloads and live monitoring before the basic playback task; its published interface does not list keyboard controls. Betterbit makes a 10-second listen-back sample and S/R shortcuts immediately available. (Strength: it provides more detailed diagnostics and downloadable WebM/WAV files.)',
    },
    {
      name: 'Device-Test 마이크 테스트',
      url: 'https://device-test.com/ko/microphone',
      weakness:
        'Its Korean tool shows a device selector, level percentage and waveform, while its FAQ explicitly says it only visualizes audio and does not record or save it. Betterbit adds a local 10-second recording so users can hear the captured result. (Strength: it groups many other device tests in one site.)',
    },
    {
      name: 'moamoang 마이크 테스트',
      url: 'https://www.moamoang.co.kr/mic-test/',
      weakness:
        'Its Korean page starts from one microphone-test button and describes level, waveform and playback, but does not present an input-device chooser in the test flow. Betterbit shows the selected browser input and lets users switch it after permission. (Strength: it offers Korean troubleshooting content about browser-test limitations.)',
    },
    {
      name: 'Screen Tester 마이크 테스트',
      url: 'https://screen-tester.com/ko/tests/microphone-test',
      weakness:
        'Its Korean page presents start controls, level/waveform feedback and a fixed 5-second local sample, but no visible input-device selection. Betterbit offers a device picker and a 10-second sample with direct playback. (Strength: it explains the browser permission request clearly.)',
    },
  ],
  related: ['keyboard-tester', 'timer', 'stopwatch', 'typing-test'],
};
