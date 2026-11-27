import { PRAYERS, type Prayer, type PrayerStatus } from "./prayers";

/** A prayer's mark; `null` means "not marked yet". */
export type Mark = PrayerStatus | null;

const CYCLE: Mark[] = [null, "jamaat", "alone", "missed"];

/** Tapping a prayer moves it: not marked -> jamaat -> alone -> missed -> not marked. */
export function nextStatus(current: Mark): Mark {
  return CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length];
}

export type DayEntries = Partial<Record<Prayer, PrayerStatus>>;

export interface DaySummary {
  total: number;
  marked: number;
  jamaat: number;
  alone: number;
  missed: number;
}

export function summarizeDay(entries: DayEntries): DaySummary {
  const summary: DaySummary = { total: PRAYERS.length, marked: 0, jamaat: 0, alone: 0, missed: 0 };
  for (const prayer of PRAYERS) {
    const status = entries[prayer];
    if (!status) continue;
    summary.marked += 1;
    summary[status] += 1;
  }
  return summary;
}
