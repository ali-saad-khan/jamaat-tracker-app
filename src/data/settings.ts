import type { Db } from "./db";

export type School = 0 | 1; // 0 = Shafi (earlier Asr), 1 = Hanafi (later Asr)
export type ReminderOffset = 0 | 5 | 10 | 15;
export type StreakTarget = 3 | 4 | 5;
export type Language = "en" | "ur";
export type ThemeChoice = "system" | "light" | "dark";

export interface AppSettings {
  city: string;
  country: string;
  method: number;
  school: School;
  remindersEnabled: boolean;
  reminderOffsetMinutes: ReminderOffset;
  /** Prayers in congregation needed for a day to count toward the streak. */
  streakTarget: StreakTarget;
  language: Language;
  theme: ThemeChoice;
}

/** Defaults suit the author: Karachi, Karachi method, Hanafi Asr. */
export const DEFAULT_SETTINGS: AppSettings = {
  city: "Karachi",
  country: "Pakistan",
  method: 1,
  school: 1,
  remindersEnabled: false,
  reminderOffsetMinutes: 0,
  streakTarget: 5,
  language: "en",
  theme: "system",
};

export const CALCULATION_METHODS: { id: number; name: string }[] = [
  { id: 1, name: "Karachi" },
  { id: 3, name: "MWL" },
  { id: 2, name: "ISNA" },
  { id: 5, name: "Egypt" },
  { id: 4, name: "Makkah" },
];

/** Settings that decide which prayer times are fetched; changing one invalidates the cache. */
export function locationKey(s: Pick<AppSettings, "city" | "country" | "method" | "school">) {
  return `${s.city.trim().toLowerCase()}|${s.country.trim().toLowerCase()}|${s.method}|${s.school}`;
}

const isOneOf = <T>(value: unknown, allowed: readonly T[]): value is T =>
  allowed.includes(value as T);

/** Reads every setting, falling back to the default for anything missing or invalid. */
export async function loadSettings(db: Db): Promise<AppSettings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>(
    "SELECT key, value FROM settings",
  );
  const raw = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const d = DEFAULT_SETTINGS;
  const method = Number(raw.method);
  const school = Number(raw.school);
  const offset = Number(raw.reminderOffsetMinutes);
  const target = Number(raw.streakTarget);
  return {
    city: raw.city?.trim() || d.city,
    country: raw.country?.trim() || d.country,
    method: CALCULATION_METHODS.some((m) => m.id === method) ? method : d.method,
    school: isOneOf(school, [0, 1] as const) ? school : d.school,
    remindersEnabled: raw.remindersEnabled === "true",
    reminderOffsetMinutes: isOneOf(offset, [0, 5, 10, 15] as const)
      ? offset
      : d.reminderOffsetMinutes,
    streakTarget: isOneOf(target, [3, 4, 5] as const) ? target : d.streakTarget,
    language: isOneOf(raw.language, ["en", "ur"] as const) ? raw.language : d.language,
    theme: isOneOf(raw.theme, ["system", "light", "dark"] as const) ? raw.theme : d.theme,
  };
}

export async function saveSettings(db: Db, patch: Partial<AppSettings>): Promise<void> {
  for (const [key, value] of Object.entries(patch)) {
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      key,
      String(value),
    );
  }
}
