import { useEffect, useRef, useState } from 'preact/hooks';
import { cx, inputClass } from '../../components/ui';
import { formatNumber } from '../../lib/format';
import type { Locale } from '../../i18n/locales';
import { parseKrw } from './logic';

/**
 * A KRW amount field. People paste "1,234,567" from a payslip or write "10만원", so the
 * field keeps what they typed and hands the parsed amount to the calculator; a valid amount
 * is shown with thousands separators once the field is left. The shared NumberInput is a
 * native number input, which drops those separators and 만원 entirely.
 */
export function KrwInput(props: {
  value: number | '';
  onValue: (value: number | '') => void;
  locale: Locale;
  class?: string;
}) {
  const display = (value: number | '') => (value === '' ? '' : formatNumber(value, props.locale));
  const [draft, setDraft] = useState(() => display(props.value));
  const lastValue = useRef(props.value);

  // Follow the calculator when something else changes the amount (reset, preset, restore).
  useEffect(() => {
    if (props.value === lastValue.current) return;
    lastValue.current = props.value;
    setDraft(display(props.value));
  }, [props.value]);

  const emit = (raw: string) => {
    setDraft(raw);
    const amount = parseKrw(raw);
    const next = amount === null || !Number.isFinite(amount) || amount < 0 ? '' : Math.round(amount);
    lastValue.current = next;
    props.onValue(next);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      autocomplete="off"
      class={cx(inputClass, 'tabular', props.class)}
      value={draft}
      onInput={(event) => emit(event.currentTarget.value)}
      onBlur={() => {
        const amount = parseKrw(draft);
        if (amount === null) return; // keep unreadable text visible so it can be corrected
        const rounded = Math.round(amount);
        // If the calculator moved on (reset, preset), its value owns the text; the effect above shows it.
        if (rounded !== props.value) return;
        setDraft(display(rounded));
      }}
    />
  );
}
