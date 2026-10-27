import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'text-to-speech',
  category: 'text',
  icon: 'microphone',
  added: '2026-10-13',
  updated: '2026-10-27',
  edges: ['privacy', 'usability', 'no-signup'],
  competitors: [
    {
      name: 'TextIntoAudio',
      url: 'https://textintoaudio.com/',
      weakness:
        'It allows browser-provided online voices and explains that Chrome Google and Edge Microsoft Online voices can send text to those vendors. Betterbit excludes every voice except ones the browser marks localService. (Strength: it explains browser speech limitations and supports up to 20,000 characters.)',
    },
    {
      name: 'ReadAloudly',
      url: 'https://readaloudly.com/en/',
      weakness:
        'Its main reader combines text-to-speech with PDF, DOCX, and TXT file opening, while Betterbit keeps a focused editable text reader and offers only browser-reported local voices. (Strength: it highlights the current sentence and accepts document files.)',
    },
    {
      name: 'Read-Aloud',
      url: 'https://read-aloud.com/',
      weakness:
        'Its page promotes Edge voices alongside browser voices and offers uploads, subtitles, looping, and MP3 controls around the reader; Betterbit makes the local-voice privacy choice explicit in one compact text-only flow. (Strength: it supports document import and extra playback features.)',
    },
    {
      name: 'Speecher Korean Text-to-Speech',
      url: 'https://speecher.org/en/korean',
      weakness:
        'Its Korean page advertises AI voices, karaoke-style highlighting, IPA, and MP3 downloads, but it does not make a browser-reported local-only voice restriction visible. Betterbit provides a direct local-device voice selector with no account. (Strength: it offers pronunciation learning features and audio downloads.)',
    },
    {
      name: 'TTSForge Korean Text-to-Speech',
      url: 'https://ttsforge.com/language/ko-KR/',
      weakness:
        'Its opened Korean editor shows a 300-character free allowance, an account registration link, and a separate voice library before conversion. Betterbit has no account or character allowance and starts with local voices already on the device. (Strength: it offers SSML tools and MP3, WAV, and OGG output.)',
    },
    {
      name: 'Rewind.ai Korean Text-to-Speech',
      url: 'https://rewind.ai/voice/tts-korean/',
      weakness:
        'It processes requests on GPU servers, limits anonymous use to 2,500 tokens per day, and promotes a sign-up that raises the limit. Betterbit sends no text to a speech server and has no quota or sign-up. (Strength: it generates downloadable AI audio in MP3 or WAV.)',
    },
  ],
  related: ['word-counter', 'speech-to-text', 'case-converter', 'remove-line-breaks'],
};
