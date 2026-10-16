import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'webcam-test',
  category: 'device',
  icon: 'camera',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['usability', 'features'],
  competitors: [
    {
      name: 'WebcamTest.com',
      url: 'https://www.webcamtest.com/',
      weakness:
        'Its main page leads into a 21-diagnostic suite with recording, A/B device comparison, quality scoring and export controls before users reach a focused pre-call check. Betterbit keeps the basic path to one start action, live track readings, grid, mirror and PNG snapshot, with S/P/M/G keyboard controls. (Strength: it offers far deeper diagnostics, recording and multi-device comparison.)',
    },
    {
      name: 'Camera-Test.com',
      url: 'https://camera-test.com/',
      weakness:
        'Its page presents 15+ metrics, brightness/saturation analysis, microphone status and a large directory of other device tests around the core camera check. Its listed top controls are Start Webcam Test, Take Picture and Full Screen, not a framing grid or keyboard-controlled mirror. Betterbit makes the compact call-framing controls visible beside the active track readings. (Strength: it reports more image and audio diagnostics.)',
    },
    {
      name: 'RigVitals Webcam Tester',
      url: 'https://www.rigvitals.com/webcam-tester/',
      weakness:
        'Its visible test controls offer capture photo, mirror preview, fullscreen and a 30-second recording, but no on-preview framing grid or documented keyboard actions. Betterbit adds an optional 3 × 3 grid and S/P/M/G controls without requesting microphone access. (Strength: it can record and download a 30-second clip.)',
    },
    {
      name: 'moamoang 웹캠 테스트',
      url: 'https://www.moamoang.co.kr/webcam-test/',
      weakness:
        'Its Korean interface shows camera selection, mirror, resolution, FPS and a snapshot button, but does not expose a framing grid or keyboard controls in the test flow. Betterbit combines the same quick checks with a 3 × 3 guide and direct S/P/M/G shortcuts. (Strength: it provides Korean USB-bandwidth troubleshooting guidance.)',
    },
    {
      name: 'Micstest 웹캠 테스트',
      url: 'https://www.micstest.com/ko/camera',
      weakness:
        'Its Korean page offers resolution presets, a grid/focus box, mirror mode, a snapshot and image-quality readings, but its controls require applying and restarting a selected resolution and do not list keyboard operation. Betterbit focuses on the active stream’s negotiated resolution and FPS with single-key camera, snapshot, mirror and grid controls. (Strength: it includes brightness, clipping and sharpness trend readings.)',
    },
    {
      name: 'My PC Tester 웹캠 테스트',
      url: 'https://mypctester.com/ko/camera/',
      weakness:
        'Its Korean tool presents start, stop, retry, fullscreen and snapshot actions plus many device parameters, but its published test flow does not include a mirror setting, framing grid or keyboard controls. Betterbit makes mirrorable framing and a local PNG capture immediately available next to the core readings. (Strength: it reports brightness, facing mode and device ID.)',
    },
  ],
  related: ['mic-test', 'image-cropper', 'qr-code-scanner'],
};
