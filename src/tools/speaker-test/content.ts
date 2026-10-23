import type { Locale } from '../../i18n/locales';
import type { ToolContent } from '../types';

const uiEn = {
  localOnly: 'Test tones are generated in this browser; this page does not use a microphone.',
  safety: 'Start with a low system volume. Stop if any tone is uncomfortable or distorted.',
  channelCheck: 'Left / right channel check',
  channelHint: 'Choose a side and confirm the tone comes from the matching speaker or earcup.',
  left: 'Left',
  center: 'Both',
  right: 'Right',
  volume: 'Test volume',
  volumeHint: 'Kept between 1% and 50% to help you start cautiously.',
  percent: '%',
  sweep: 'Frequency sweep',
  sweepHint: 'A smooth 20 Hz–20 kHz sine sweep. Listen for gaps, buzzes, or rattles.',
  duration: 'Sweep length',
  seconds: 'seconds',
  startSweep: 'Start sweep',
  stop: 'Stop sound',
  currentFrequency: 'Current frequency',
  hertz: 'Hz',
  kilohertz: 'kHz',
  ready: 'Ready — choose a channel or start a sweep.',
  playingLeft: 'Playing the left channel.',
  playingCenter: 'Playing both channels.',
  playingRight: 'Playing the right channel.',
  sweeping: 'Sweeping from 20 Hz to 20 kHz.',
  audioUnavailable:
    'This browser could not start Web Audio. Check that the tab is not muted, then try a current browser.',
  shortcutChannel: 'play left, both, or right',
  shortcutSweep: 'start a sweep',
  shortcutStop: 'stop sound',
};
export type UI = typeof uiEn;

export const content: Record<Locale, ToolContent<UI>> = {
  en: {
    title: 'Speaker Test — Left/Right Check and Frequency Sweep',
    description:
      'Run a speaker test with clear left, both and right tones plus a live 20 Hz–20 kHz sweep. A focused, low-volume browser check with keyboard controls.',
    h1: 'Speaker Test',
    tagline:
      'Confirm left and right channels first, then follow a live 20 Hz–20 kHz sweep without installing an app or granting microphone access.',
    name: 'Speaker Test',
    keywords: [
      'speaker test',
      'left right speaker test',
      'left right audio test',
      'headphone test',
      'speaker frequency sweep',
      'sound test',
    ],
    howTo: [
      'Set your system volume low before starting.',
      'Select Left and then Right; each tone should come from the matching side.',
      'Select Both to check that the sound image is centered.',
      'Choose 10, 20, or 40 seconds, then select Start sweep.',
      'Stop immediately if a tone is uncomfortable, or if you hear a buzz or rattle worth investigating.',
    ],
    sections: [
      {
        heading: 'What the left, both, and right buttons check',
        body: 'Each button sends a 440 Hz sine tone to the selected stereo position: left only, both channels equally, or right only. If the Left tone is heard on the right, the channels are swapped somewhere between the computer and the speakers; with headphones, first check that the L and R earcups are on the correct ears. A built-in phone or laptop speaker may be mono, so it cannot demonstrate left/right separation.',
      },
      {
        heading: 'Why the sweep is logarithmic',
        body: 'The sweep moves from 20 Hz to 20,000 Hz over 10, 20, or 40 seconds. Frequency doubles every octave, so this tool uses an exponential frequency ramp: each equal part of the sweep covers an equal number of octaves instead of spending nearly all of its time at high frequencies. Use the live frequency readout to note where a rattle, buzz, or dropout occurs. This is a listening check, not a calibrated frequency-response measurement; room acoustics, placement, output volume, and hearing all affect what you hear.',
      },
      {
        heading: 'Use test tones safely',
        body: 'Pure tones concentrate energy at one frequency and can sound louder or more piercing than music. Begin with the system volume low; this tool defaults to 20% and limits its own control to 50%. Small speakers commonly reproduce very low bass or very high treble weakly, which alone does not prove that the hardware is faulty. Stop the test rather than raising volume if a tone is painful, distorted, or makes a speaker rattle.',
      },
    ],
    faq: [
      {
        q: 'What does it mean if the left speaker test plays on the right?',
        a: 'A Left test tone heard on the right indicates swapped channels, such as reversed speaker cables, an audio-setting problem, or headphones worn on the wrong ears. The audio output can otherwise sound normal, but stereo placement in music, games, and video will be reversed.',
      },
      {
        q: 'Why can I not hear 20 Hz or 20 kHz during a speaker test?',
        a: 'A 20 Hz–20 kHz sweep sends those frequencies to the output, but audibility depends on the speaker, listening level, room, and listener. Compact laptop and phone speakers often have little low-bass output, and very high frequencies can be quieter or inaudible. Check for a clear problem at ordinary frequencies such as 440 Hz before assuming a fault.',
      },
      {
        q: 'Does this speaker test measure frequency response?',
        a: 'No. This is a subjective listening test that plays a 20 Hz–20 kHz sine sweep and shows the generated frequency. Measuring frequency response needs a calibrated microphone, known playback level, and software that accounts for the room and microphone response.',
      },
      {
        q: 'Does this speaker test need microphone permission?',
        a: 'No. The test only creates output tones through the Web Audio API; it does not record sound or request microphone permission. Browser autoplay rules still require selecting a test button before audio can begin.',
      },
    ],
    ui: uiEn,
  },
  ko: {
    title: '스피커 테스트 — 좌우 확인·20Hz~20kHz 스윕',
    description:
      '좌우 스피커 테스트와 현재 주파수를 보여 주는 20Hz~20kHz 스윕을 한 화면에서 실행합니다. 낮은 기본 음량과 키보드 조작을 지원합니다.',
    h1: '스피커 테스트',
    tagline: '왼쪽·양쪽·오른쪽 채널을 먼저 확인하고, 현재 주파수가 표시되는 20Hz~20kHz 스윕으로 소리를 점검합니다.',
    name: '스피커 테스트',
    keywords: [
      '스피커 테스트',
      '좌우 스피커 테스트',
      '좌우 채널 테스트',
      '이어폰 좌우 테스트',
      '헤드폰 테스트',
      '스피커 주파수 테스트',
    ],
    howTo: [
      '시스템 음량을 낮게 맞춥니다.',
      '왼쪽과 오른쪽을 차례로 눌러 표시한 방향에서 소리가 나는지 확인합니다.',
      '양쪽을 눌러 소리가 가운데에 균등하게 들리는지 확인합니다.',
      '10초·20초·40초 중 길이를 고른 뒤 스윕 시작을 누릅니다.',
      '불편하거나 찢어지는 소리, 떨림이 들리면 바로 소리 정지를 누릅니다.',
    ],
    sections: [
      {
        heading: '왼쪽·양쪽·오른쪽 버튼으로 확인하는 것',
        body: '각 버튼은 440Hz 사인파를 왼쪽만, 양쪽에 같은 크기로, 또는 오른쪽만 보냅니다. 왼쪽을 눌렀는데 오른쪽에서 들리면 컴퓨터와 스피커 사이 어딘가에서 채널이 바뀐 것입니다. 이어폰·헤드폰은 먼저 L/R 표기가 맞는 귀에 놓였는지 확인합니다. 휴대폰이나 노트북의 내장 스피커가 모노라면 좌우 분리를 확인할 수 없습니다.',
      },
      {
        heading: '주파수 스윕이 일정한 비율로 올라가는 이유',
        body: '스윕은 10초·20초·40초에 걸쳐 20Hz에서 20,000Hz까지 올라갑니다. 한 옥타브가 올라갈 때 주파수는 두 배가 되므로, 이 도구는 선형 증가 대신 지수형 램프를 사용합니다. 따라서 스윕의 같은 시간마다 같은 수의 옥타브를 지나며 고음에만 시간이 몰리지 않습니다. 지지직거림·진동·끊김이 들리는 지점의 현재 주파수를 확인합니다. 이 결과는 청취용 참고이며, 방 구조·스피커 위치·음량·청력의 영향을 받으므로 보정된 주파수 응답 측정은 아닙니다.',
      },
      {
        heading: '테스트 음을 안전하게 듣는 방법',
        body: '순음은 한 주파수에 에너지가 집중되어 음악보다 더 크거나 날카롭게 느껴질 수 있습니다. 시스템 음량을 낮게 시작하고, 이 도구의 기본 음량 20%와 최대 50% 안에서만 조절합니다. 작은 노트북·휴대폰 스피커는 매우 낮은 저음이나 매우 높은 고음을 약하게 내는 일이 흔하며, 그것만으로 고장이라고 단정할 수 없습니다. 소리가 아프거나 왜곡·떨림이 생기면 음량을 올리지 말고 테스트를 멈춥니다.',
      },
    ],
    faq: [
      {
        q: '왼쪽 스피커 테스트를 눌렀는데 오른쪽에서 들리면 무엇이 문제인가요?',
        a: '왼쪽 테스트 음이 오른쪽에서 들리면 스피커 케이블이 반대로 연결되었거나 운영체제·오디오 장치의 채널 설정이 바뀌었을 수 있습니다. 이어폰·헤드폰은 먼저 좌우를 반대로 착용하지 않았는지 확인합니다. 평소 음악은 들리더라도 영상·게임과 음악의 좌우 위치가 반대로 재생됩니다.',
      },
      {
        q: '스피커 테스트에서 20Hz나 20kHz가 안 들리는 이유는 무엇인가요?',
        a: '20Hz~20kHz 스윕은 해당 주파수를 출력하지만, 실제로 들리는 정도는 스피커·음량·방·청력에 따라 달라집니다. 노트북과 휴대폰의 작은 스피커는 저음을 약하게 내는 경우가 많고, 아주 높은 주파수도 작게 들리거나 들리지 않을 수 있습니다. 먼저 440Hz처럼 일반적인 음역에서 이상이 있는지 확인합니다.',
      },
      {
        q: '이 스피커 테스트로 주파수 응답을 측정할 수 있나요?',
        a: '아니요. 이 도구는 20Hz~20kHz 사인파 스윕과 현재 발생 주파수를 제공하는 청취용 점검입니다. 주파수 응답을 측정하려면 보정된 마이크, 일정한 재생 음량, 방과 마이크의 특성을 고려하는 측정 소프트웨어가 필요합니다.',
      },
      {
        q: '스피커 테스트에 마이크 권한이 필요한가요?',
        a: '아니요. 이 도구는 Web Audio API로 출력 테스트 음만 만들며 소리를 녹음하거나 마이크 권한을 요청하지 않습니다. 다만 브라우저의 자동 재생 정책 때문에 사용자가 버튼을 눌러야 소리가 시작됩니다.',
      },
    ],
    ui: {
      localOnly: '테스트 음은 이 브라우저에서 만들며, 이 페이지는 마이크를 사용하지 않습니다.',
      safety: '시스템 음량을 낮게 시작합니다. 소리가 불편하거나 왜곡되면 바로 멈춥니다.',
      channelCheck: '좌우 채널 확인',
      channelHint: '방향을 고른 뒤, 표시한 스피커 또는 이어폰 쪽에서 소리가 나는지 확인합니다.',
      left: '왼쪽',
      center: '양쪽',
      right: '오른쪽',
      volume: '테스트 음량',
      volumeHint: '조심스럽게 시작할 수 있도록 1%~50% 범위에서만 조절합니다.',
      percent: '%',
      sweep: '주파수 스윕',
      sweepHint: '20Hz~20kHz 사인파가 부드럽게 올라갑니다. 끊김, 지지직거림, 떨림을 확인합니다.',
      duration: '스윕 길이',
      seconds: '초',
      startSweep: '스윕 시작',
      stop: '소리 정지',
      currentFrequency: '현재 주파수',
      hertz: 'Hz',
      kilohertz: 'kHz',
      ready: '준비됨 — 채널을 고르거나 스윕을 시작합니다.',
      playingLeft: '왼쪽 채널을 재생 중입니다.',
      playingCenter: '양쪽 채널을 재생 중입니다.',
      playingRight: '오른쪽 채널을 재생 중입니다.',
      sweeping: '20Hz에서 20kHz까지 스윕 중입니다.',
      audioUnavailable:
        '이 브라우저에서 Web Audio를 시작하지 못했습니다. 탭 음소거를 확인하고 최신 브라우저에서 다시 시도합니다.',
      shortcutChannel: '왼쪽·양쪽·오른쪽 재생',
      shortcutSweep: '스윕 시작',
      shortcutStop: '소리 정지',
    },
  },
};
