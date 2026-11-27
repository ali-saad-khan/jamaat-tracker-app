import type { DateKey } from "./dates";
import { addDays } from "./dates";
import { PRAYERS, type Prayer } from "./prayers";

export interface PlannedReminder {
  /** Stable, so a reminder is replaced rather than duplicated: "prayer-2026-11-27-fajr". */
  id: string;
  at: Date;
  prayer: Prayer;
  title: string;
  body: string;
}

export interface ReminderText {
  title(prayer: Prayer, offsetMinutes: number): string;
  body(prayer: Prayer, offsetMinutes: number): string;
}

const NAMES: Record<Prayer, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export const ENGLISH_TEXT: ReminderText = {
  title: (p, offset) => (offset === 0 ? `${NAMES[p]} time` : `${NAMES[p]} in ${offset} minutes`),
  body: () => "Remember to pray in congregation.",
};

/** The moment to notify: the prayer time minus the offset, in the phone's local zone. */
export function reminderMoment(date: DateKey, time: string, offsetMinutes: number): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm - offsetMinutes, 0, 0);
}

/**
 * The reminders still to come inside a rolling window: today plus the next `windowDays - 1` days.
 * Moments already in the past are skipped.
 */
export function planReminders(
  days: Record<DateKey, Record<Prayer, string>>,
  now: Date,
  offsetMinutes: number,
  windowDays = 7,
  text: ReminderText = ENGLISH_TEXT,
): PlannedReminder[] {
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const out: PlannedReminder[] = [];
  for (let i = 0; i < windowDays; i++) {
    const date = addDays(todayKey, i);
    const times = days[date];
    if (!times) continue;
    for (const prayer of PRAYERS) {
      const at = reminderMoment(date, times[prayer], offsetMinutes);
      if (at.getTime() <= now.getTime()) continue;
      out.push({
        id: `prayer-${date}-${prayer}`,
        at,
        prayer,
        title: text.title(prayer, offsetMinutes),
        body: text.body(prayer, offsetMinutes),
      });
    }
  }
  return out;
}
