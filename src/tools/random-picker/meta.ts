import type { ToolMeta } from '../types';

export const meta: ToolMeta = {
  slug: 'random-picker',
  category: 'generator',
  icon: 'sparkle',
  added: '2026-10-11',
  updated: '2026-10-11',
  edges: ['no-ads', 'usability', 'no-signup'],
  competitors: [
    {
      name: 'Wheel of Names',
      url: 'https://wheelofnames.com/',
      weakness:
        'The opened page explicitly says it relies on ads, even though users can close them for the session; its extensive customization, cloud/local saving, images, 150+ audio options, and multiple-wheel controls surround a simple name draw. Betterbit is an ad-free, paste-and-draw surface with a one-key redraw, automatic winner removal, and a compact copied result record. (Strength: it supports cloud sharing, image slices, weighted wheels, large imported lists, and much richer visual customization.)',
    },
    {
      name: 'Picker Wheel',
      url: 'https://pickerwheel.com/',
      weakness:
        'The opened guide exposes at least 16 table-of-contents sections and a feature-dense spreadsheet-style input flow before its spin controls; HD image enlargement is marked Premium. Betterbit keeps the common one-list draw to one paste box, one removal switch, and one result-copy action, including keyboard R outside inputs. (Strength: it offers weights, images, CSV import, result read-aloud, multiple action modes, and deep per-wheel customization.)',
    },
    {
      name: 'PickerEngine',
      url: 'https://pickerengine.com/',
      weakness:
        'The opened home page starts by making visitors choose among 55 specialized wheel tools and categories before entering a custom list. Betterbit opens directly to an editable four-name sample and supports a paste list, current-session draw history, removal without replacement, and a formatted copied result without a tool-selection step. (Strength: it has many ready-made decision wheels and specialized templates.)',
    },
    {
      name: 'Wheel Picker',
      url: 'https://www.wheelpicker.io/ko',
      weakness:
        'Its opened Korean result promotes 39 ready-made wheels and templates alongside the generic picker. Betterbit is intentionally narrower: paste one line per person, press R to draw, optionally remove one winner, and copy a result summary in the same compact screen. (장점: 미리 준비된 많은 종류의 룰렛과 템플릿을 제공한다.)',
    },
    {
      name: '랜덤 뽑기 룰렛',
      url: 'https://randompickerwheel.app/ko',
      weakness:
        'The opened page begins with six individual option fields and documents color customization, but its visible interface does not show a pasted-list workflow, automatic post-draw removal, recent-draw list, or copied result record. Betterbit adds all four while keeping the input in one multiline field. (장점: 항목별 확률과 룰렛 조각 색상을 조절할 수 있다.)',
    },
    {
      name: '툴타다 랜덤 뽑기',
      url: 'https://tooltada.com/random/',
      weakness:
        'The opened Korean tool says its participant list is cleared on refresh and combines five modes—name draw, number draw, teams, order, and ladder—on one page. Betterbit preserves the current name list locally after refresh and focuses the screen on a single keyboard-accessible draw, removal switch, recent results, and copied result summary. (장점: 숫자·조 나누기·순서·사다리타기와 공유 링크를 함께 제공한다.)',
    },
  ],
  related: ['random-number', 'password-generator', 'qr-code-generator', 'spin-wheel'],
};
