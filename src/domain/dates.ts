/** A local calendar day as "YYYY-MM-DD". Days are never stored as UTC timestamps (decision D4). */
export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, "0");

/** The user's local calendar day for a moment in time. */
export function toDateKey(date: Date): DateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parts(key: DateKey): [number, number, number] {
  const [y, m, d] = key.split("-").map(Number);
  return [y, m, d];
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [y, m, d] = parts(key);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** Calendar arithmetic done in UTC, so daylight-saving changes can never skip or repeat a day. */
export function addDays(key: DateKey, n: number): DateKey {
  const [y, m, d] = parts(key);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** `n` days ending at `today`, newest first: today, yesterday, ... */
export function lastNDays(today: DateKey, n: number): DateKey[] {
  return Array.from({ length: n }, (_, i) => addDays(today, -i));
}

/** Milliseconds from `now` to the next local midnight, used to roll "today" over while the app is open. */
export function msUntilNextLocalMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return next.getTime() - now.getTime();
}

/** 0 = Sunday ... 6 = Saturday, for a calendar day. */
export function weekdayIndex(key: DateKey): number {
  const [y, m, d] = parts(key);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** `month` is 1 to 12. Moves forward or back by whole months, wrapping the year. */
export function addMonths(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/** The weeks of a month, Monday first. Cells outside the month are null. */
export function monthGrid(year: number, month: number): (DateKey | null)[][] {
  const prefix = `${year}-${pad(month)}`;
  const lead = (weekdayIndex(`${prefix}-01`) + 6) % 7;
  const cells: (DateKey | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, i) => `${prefix}-${pad(i + 1)}`),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}
