import { addDays, type DateKey } from "./dates";
import { PRAYERS } from "./prayers";
import { summarizeDay, type DayEntries } from "./status";

type Days = Record<DateKey, DayEntries>;

/** A day counts toward a streak when at least `target` prayers were prayed in congregation. */
export function dayQualifies(entries: DayEntries | undefined, target: number): boolean {
  return summarizeDay(entries ?? {}).jamaat >= target;
}

/**
 * Consecutive qualifying days ending today. Today does not break the streak while it is still incomplete:
 * if today does not qualify yet, the count runs back from yesterday.
 */
export function currentStreak(days: Days, today: DateKey, target: number): number {
  let day = dayQualifies(days[today], target) ? today : addDays(today, -1);
  let count = 0;
  while (dayQualifies(days[day], target)) {
    count += 1;
    day = addDays(day, -1);
  }
  return count;
}

/** The longest run of qualifying days from `first` to `today`. */
export function bestStreak(days: Days, first: DateKey, today: DateKey, target: number): number {
  let best = 0;
  let run = 0;
  for (let day = first; day <= today; day = addDays(day, 1)) {
    run = dayQualifies(days[day], target) ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

export interface RangeStats {
  days: number;
  possible: number;
  jamaat: number;
  alone: number;
  missed: number;
  unmarked: number;
  /** Whole percent of all prayers in the range that were prayed in congregation. */
  jamaatPercent: number;
}

export function rangeStats(days: Days, dates: DateKey[]): RangeStats {
  const out: RangeStats = {
    days: dates.length,
    possible: dates.length * PRAYERS.length,
    jamaat: 0,
    alone: 0,
    missed: 0,
    unmarked: 0,
    jamaatPercent: 0,
  };
  let marked = 0;
  for (const date of dates) {
    const s = summarizeDay(days[date] ?? {});
    out.jamaat += s.jamaat;
    out.alone += s.alone;
    out.missed += s.missed;
    marked += s.marked;
  }
  out.unmarked = out.possible - marked;
  out.jamaatPercent = out.possible === 0 ? 0 : Math.round((out.jamaat / out.possible) * 100);
  return out;
}

/** Prayers in congregation per day, in the order of `dates`. */
export function dailyJamaatCounts(days: Days, dates: DateKey[]): number[] {
  return dates.map((d) => summarizeDay(days[d] ?? {}).jamaat);
}
