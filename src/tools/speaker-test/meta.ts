import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'speaker-test',
  category: 'device',
  icon: 'speaker',
  added: '2026-10-18',
  updated: '2026-10-18',
  edges: ['usability', 'design'],
  competitors: [
    {
      name: 'Speaker Test',
      url: 'https://speaker-test.com/',
      weakness:
        'Its opened landing view groups Stereo, Sweep, Tone Generator, Noise and Phase as a broad test suite. Betterbit starts with a compact left/both/right check and a sweep whose current frequency remains visible while it plays. (Strength: it provides pink, white and brown noise, phase checks, waveform/spectrum views and output-device selection.)',
    },
    {
      name: 'SoundMeterX Speaker Test',
      url: 'https://soundmeterx.com/speaker-test/',
      weakness:
        'Its opened control set requires setting a tone frequency, volume and waveform or configuring sweep start, end and duration before playback; it does not display a live sweep-frequency reading in that interface. Betterbit makes the left/both/right path and three preset sweep lengths visible together. (Strength: it supports custom sweep endpoints and four waveforms.)',
    },
    {
      name: 'CheckMyMic Speaker Test',
      url: 'https://checkmymic.com/speaker-test.html',
      weakness:
        'Its published sweep runs from 120 Hz to 8 kHz for about three seconds, and its flow asks for a hearing confirmation after each channel. Betterbit offers a stoppable 20 Hz–20 kHz sweep in 10, 20 or 40 seconds and keeps the generated frequency visible. (Strength: it offers an output-device selector and channel-completion prompts.)',
    },
    {
      name: '스피커 좌우 테스트',
      url: 'https://tools.mayalibrarywiki.com/speaker-test',
      weakness:
        'Its opened Korean tool places signal choices, a three-question blind diagnosis, balance controls and an in/out-of-phase test around its first channel controls. Betterbit keeps the first check to three clear channel buttons and one live 20 Hz–20 kHz sweep. (Strength: it provides pink/white noise, a blind quiz, balance movement and phase comparison.)',
    },
    {
      name: 'CalcLab 소리 테스트',
      url: 'https://koilab.co.kr/tools/speaker-test',
      weakness:
        'Its published Korean tool supplies short low-volume center, left and right tones only; its guide explicitly frames it as a basic output check. Betterbit adds a cancellable 20 Hz–20 kHz logarithmic sweep with 10, 20 and 40-second choices. (Strength: its minimal three-button scope is especially quick for a basic channel check.)',
    },
    {
      name: 'Micstest 헤드폰·스피커 테스트',
      url: 'https://micstest.com/ko/audio',
      weakness:
        'Its search-visible Korean interface combines device refresh, output-device selection, signal choice, sweep/noise, and two level meters around the first test. Betterbit presents the immediate left/both/right and sweep path in one small panel, with the sweep frequency continuously shown. (Strength: it offers output-device selection, noise, custom frequency and generated-signal meters.)',
    },
  ],
  related: ['mic-test', 'webcam-test', 'keyboard-tester', 'audio-cutter'],
};
