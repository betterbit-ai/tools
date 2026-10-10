/**
 * Pure logic for temperature-converter — no DOM, no Preact. Everything testable lives here.
 */

export type TemperatureUnit = 'c' | 'f' | 'k';

export const TEMPERATURE_UNITS: TemperatureUnit[] = ['c', 'f', 'k'];

export function isTemperatureUnit(value: unknown): value is TemperatureUnit {
  return typeof value === 'string' && (TEMPERATURE_UNITS as string[]).includes(value);
}

/** Absolute zero, the physical lower bound of every scale. */
export const ABSOLUTE_ZERO_C = -273.15;
export const ABSOLUTE_ZERO_F = -459.67;

function toCelsius(value: number, unit: TemperatureUnit): number {
  if (unit === 'c') return value;
  if (unit === 'f') return ((value - 32) * 5) / 9;
  return value - 273.15;
}

function fromCelsius(celsius: number, unit: TemperatureUnit): number {
  if (unit === 'c') return celsius;
  if (unit === 'f') return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}

/** Converts a temperature between any two supported scales. Non-finite input yields 0. */
export function convertTemperature(value: number, from: TemperatureUnit, to: TemperatureUnit): number {
  if (!Number.isFinite(value)) return 0;
  if (from === to) return value;
  return fromCelsius(toCelsius(value, from), to);
}

/** True if a value is physically impossible — colder than absolute zero (-273.15 °C / 0 K). */
export function isBelowAbsoluteZero(value: number, unit: TemperatureUnit): boolean {
  if (!Number.isFinite(value)) return false;
  return toCelsius(value, unit) < ABSOLUTE_ZERO_C - 1e-9;
}

export interface CookingRow {
  /** UK/Ireland gas-mark number shown on gas ovens. */
  gasMark: number;
  /** Recipe-standard rounded Celsius value for this mark (not the exact math conversion). */
  celsius: number;
  /** Recipe-standard rounded Fahrenheit value for this mark. */
  fahrenheit: number;
  descriptionKey: 'ovenSlow' | 'ovenModeratelySlow' | 'ovenModerate' | 'ovenModeratelyHot' | 'ovenHot' | 'ovenVeryHot';
}

/**
 * Standard oven-temperature reference table (gas mark + the rounded °C/°F pairs recipes
 * actually print), not the exact mathematical conversion — e.g. 180°C is printed as 350°F
 * even though 350°F converts exactly to ~176.7°C. Source: The Calculator Site's UK gas-mark
 * oven-temperature chart (thecalculatorsite.com/cooking/oven-temperatures.php).
 */
export const COOKING_TABLE: CookingRow[] = [
  { gasMark: 1, celsius: 135, fahrenheit: 275, descriptionKey: 'ovenSlow' },
  { gasMark: 2, celsius: 150, fahrenheit: 300, descriptionKey: 'ovenSlow' },
  { gasMark: 3, celsius: 165, fahrenheit: 325, descriptionKey: 'ovenModeratelySlow' },
  { gasMark: 4, celsius: 180, fahrenheit: 350, descriptionKey: 'ovenModerate' },
  { gasMark: 5, celsius: 190, fahrenheit: 375, descriptionKey: 'ovenModerate' },
  { gasMark: 6, celsius: 205, fahrenheit: 400, descriptionKey: 'ovenModeratelyHot' },
  { gasMark: 7, celsius: 220, fahrenheit: 425, descriptionKey: 'ovenHot' },
  { gasMark: 8, celsius: 230, fahrenheit: 450, descriptionKey: 'ovenHot' },
  { gasMark: 9, celsius: 245, fahrenheit: 475, descriptionKey: 'ovenVeryHot' },
];

export interface CookingTableRow extends CookingRow {
  fromValue: number;
  toValue: number;
}

/** The cooking table re-expressed in whichever two units the user currently has selected. */
export function cookingTable(from: TemperatureUnit, to: TemperatureUnit): CookingTableRow[] {
  return COOKING_TABLE.map((row) => ({
    ...row,
    fromValue: fromCelsius(row.celsius, from),
    toValue: fromCelsius(row.celsius, to),
  }));
}
