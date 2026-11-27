import type { DateKey } from "@/domain/dates";
import { PRAYERS, STATUSES, type Prayer, type PrayerStatus } from "@/domain/prayers";
import type { DayEntries, Mark } from "@/domain/status";

import type { Db } from "./db";

interface Row {
  date: string;
  prayer: string;
  status: string;
}

const isPrayer = (v: string): v is Prayer => (PRAYERS as readonly string[]).includes(v);
const isStatus = (v: string): v is PrayerStatus => (STATUSES as readonly string[]).includes(v);

/** Marks a prayer, or clears it when `status` is null. */
export async function setStatus(
  db: Db,
  date: DateKey,
  prayer: Prayer,
  status: Mark,
  now: number = Date.now(),
): Promise<void> {
  if (status === null) {
    await db.runAsync("DELETE FROM entries WHERE date = ? AND prayer = ?", date, prayer);
    return;
  }
  await db.runAsync(
    `INSERT INTO entries (date, prayer, status, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(date, prayer) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at`,
    date,
    prayer,
    status,
    now,
  );
}

/** Every mark for one day. Rows with unknown prayers or statuses are ignored. */
export async function getDay(db: Db, date: DateKey): Promise<DayEntries> {
  const rows = await db.getAllAsync<Row>(
    "SELECT date, prayer, status FROM entries WHERE date = ?",
    date,
  );
  return toDays(rows)[date] ?? {};
}

/** Marks for an inclusive range of days, keyed by date. Days with no marks are absent. */
export async function getRange(
  db: Db,
  from: DateKey,
  to: DateKey,
): Promise<Record<DateKey, DayEntries>> {
  const rows = await db.getAllAsync<Row>(
    "SELECT date, prayer, status FROM entries WHERE date >= ? AND date <= ? ORDER BY date",
    from,
    to,
  );
  return toDays(rows);
}

function toDays(rows: Row[]): Record<DateKey, DayEntries> {
  const days: Record<DateKey, DayEntries> = {};
  for (const row of rows) {
    if (!isPrayer(row.prayer) || !isStatus(row.status)) continue;
    (days[row.date] ??= {})[row.prayer] = row.status;
  }
  return days;
}

/** The earliest day with any mark, or null when nothing has been marked yet. */
export async function getEarliestDate(db: Db): Promise<DateKey | null> {
  const row = await db.getFirstAsync<{ first: string | null }>(
    "SELECT MIN(date) AS first FROM entries",
  );
  return row?.first ?? null;
}
