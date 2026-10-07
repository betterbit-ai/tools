/** Join class names, skipping falsy values. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

/** Shared input styling — every text/number/select control uses this. */
export const inputClass =
  'h-10 w-full rounded-md border border-line bg-surface px-3 text-[15px] text-fg placeholder:text-subtle ' +
  'transition-colors hover:border-line-strong focus:border-accent focus:outline-none disabled:opacity-50';
