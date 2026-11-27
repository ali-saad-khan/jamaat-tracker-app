import type { DateKey } from "@/domain/dates";
import { PRAYERS, type Prayer } from "@/domain/prayers";

import type { Db } from "./db";

/** "HH:mm" local time for each prayer. */
export type PrayerTimes = Record<Prayer, string>;

export interface DayTimes {
  date: DateKey;
  times: PrayerTimes;
}

interface Row extends PrayerTimes {
  date: string;
}

export async function saveDays(
  db: Db,
  locationKey: string,
  days: DayTimes[],
  now: number = Date.now(),
): Promise<void> {
  for (const { date, times } of days) {
    await db.runAsync(
      `INSERT INTO prayer_times (date, location_key, fajr, dhuhr, asr, maghrib, isha, fetched_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(date, location_key) DO UPDATE SET
         fajr = excluded.fajr, dhuhr = excluded.dhuhr, asr = excluded.asr,
         maghrib = excluded.maghrib, isha = excluded.isha, fetched_at = excluded.fetched_at`,
      date,
      locationKey,
      times.fajr,
      times.dhuhr,
      times.asr,
      times.maghrib,
      times.isha,
      now,
    );
  }
}

/** Cached times for an inclusive range of days, keyed by date. */
export async function getDays(
  db: Db,
  locationKey: string,
  from: DateKey,
  to: DateKey,
): Promise<Record<DateKey, PrayerTimes>> {
  const rows = await db.getAllAsync<Row>(
    `SELECT date, fajr, dhuhr, asr, maghrib, isha FROM prayer_times
     WHERE location_key = ? AND date >= ? AND date <= ? ORDER BY date`,
    locationKey,
    from,
    to,
  );
  const out: Record<DateKey, PrayerTimes> = {};
  for (const row of rows) {
    out[row.date] = Object.fromEntries(PRAYERS.map((p) => [p, row[p]])) as PrayerTimes;
  }
  return out;
}

export async function clearCache(db: Db): Promise<void> {
  await db.runAsync("DELETE FROM prayer_times");
}
