import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'voice-recorder',
  category: 'media',
  icon: 'microphone',
  added: '2026-10-25',
  updated: '2026-10-25',
  edges: ['privacy', 'usability'],
  competitors: [
    {
      name: 'Convertilo Online Voice Recorder',
      url: 'https://convertilo.io/audio/recorder/',
      weakness:
        'Its opened recorder saves MP3 or WAV locally and has a waveform (Strength: it provides selectable 128–320 kbps MP3 and WAV export), but its visible first action is only “Allow microphone”; Betterbit presents the full record, pause/resume, listen, and MP3-download path in one focused panel with keyboard controls.',
    },
    {
      name: 'Omnibus Voice Recorder',
      url: 'https://omnibus.tools/voice-recorder',
      weakness:
        'Its opened tool has a dB meter, input controls, a persistent local takes library, editing and several export formats (Strength: it offers much deeper recording and post-production control). Its first screen asks users to choose presets, filters, channels, sample rate and library size; Betterbit keeps the immediate microphone-to-MP3 path to one primary action.',
    },
    {
      name: 'Stax Voice Recorder',
      url: 'https://stax.tools/voice-recorder',
      weakness:
        'Its opened recorder locally records and offers playback (Strength: it exposes noise suppression, echo cancellation and automatic gain controls), but its MP3 conversion requires a separately downloaded converter engine of about 31 MB after recording. Betterbit loads MP3 encoding only when Stop is selected and keeps the initial recorder focused.',
    },
    {
      name: 'Lalatone 온라인 녹음기',
      url: 'https://lalatone.com/ko/voice-recorder/',
      weakness:
        'Its Korean search-visible interface offers pitch curves, trimming, reverb, echo and backing-track mixing (Strength: it is much better for singing practice and production). Betterbit deliberately avoids those music controls for a faster speech-recording path that produces a direct MP3 download.',
    },
    {
      name: 'Clipchamp 온라인 음성 및 오디오 녹음기',
      url: 'https://clipchamp.com/ko/voice-recorder/',
      weakness:
        'Its opened Korean page routes the task into its video editor and describes saving the recording to a timeline; its FAQ limits a single voiceover to 30 minutes. (Strength: it offers a larger video-editing workflow, volume and fade tools.) Betterbit opens directly to an in-browser recording and MP3 download rather than an editor timeline.',
    },
    {
      name: 'LocalToolz 온라인 녹음기',
      url: 'https://www.localtoolz.com/ko/voice-recorder',
      weakness:
        'Its Korean search result shows a local recording list with playback, duration and file size after stopping (Strength: it can keep multiple recordings in one session). Betterbit keeps a single-take capture flow and makes the MP3 conversion and download state explicit immediately after Stop.',
    },
  ],
  related: ['mic-test', 'audio-cutter', 'speaker-test', 'video-compressor'],
};
