import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'speech-to-text',
  category: 'text',
  icon: 'microphone',
  added: '2026-10-12',
  updated: '2026-10-12',
  edges: ['privacy', 'no-ads', 'usability'],
  competitors: [
    {
      name: 'WebConverter Speech to Text',
      url: 'https://webconverter.app/speech-to-text.html',
      weakness:
        'Its opened workflow begins with an audio-file drop zone and requires loading a 24 MB Normal model (41 MB High) before transcription; it does not provide a focused live-microphone dictation flow. (Strength: it privately transcribes files and exports SRT.)',
    },
    {
      name: 'Notta Speech to Text',
      url: 'https://www.notta.ai/en/tools/speech-to-text',
      weakness:
        'Its page combines the mic tool with repeated “Start Free Trial” calls and promotion for a broader app; pre-recorded transcription accepts uploaded MP3, WAV, M4A, and WEBM files. Betterbit has one private live-dictation control with no trial funnel. (Strength: Notta advertises 58 languages and file transcription.)',
    },
    {
      name: 'STT.ai Speech to Text',
      url: 'https://stt.ai/',
      weakness:
        'The opened page asks for an email to save transcripts and describes 600 initial free minutes, then paid plans from $5/month; its API example sends a file to https://api.stt.ai/v1/transcribe. Betterbit has no account, quota, or server transcription. (Strength: it offers file formats, speaker labels, and subtitle exports.)',
    },
    {
      name: 'OpenTranscript',
      url: 'https://opentranscript.app/ko/',
      weakness:
        'Its Korean page is private and local, but the visible task is to paste a YouTube link or drag an audio file, with a 75–480 MB Whisper model download; it does not offer a lightweight live-microphone dictation control. (Strength: it handles recorded files, YouTube captions, and 99+ languages.)',
    },
    {
      name: 'Wave AI 음성 텍스트 변환',
      url: 'https://wave.co/ko/tools/transcribe-audio',
      weakness:
        'Its Korean page uploads audio or video files, limits the free tool to five 200 MB files per day, and says it may retain private audio and transcript copies to improve recognition. Betterbit does not upload voice data and has no daily quota. (Strength: Wave includes speaker labels and AI summaries.)',
    },
    {
      name: 'Narakeet 음성 텍스트 변환',
      url: 'https://www.narakeet.com/languages/korean-speech-to-text-ko/',
      weakness:
        'Its Korean documentation says recordings are processed in the cloud and caps the free tier at 20 files of up to 10 minutes each. Betterbit is live on-device dictation, so there is no file upload, account, or per-file wait. (Strength: Narakeet supports uploaded audio and video formats.)',
    },
  ],
  related: ['word-counter', 'case-converter', 'remove-line-breaks', 'lorem-ipsum'],
};
