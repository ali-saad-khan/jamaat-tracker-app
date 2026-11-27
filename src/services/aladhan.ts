import { getDays, saveDays, type DayTimes, type PrayerTimes } from "@/data/prayer-times";
import type { Db } from "@/data/db";
import { locationKey, type AppSettings } from "@/data/settings";
import { addDays, type DateKey } from "@/domain/dates";
import { PRAYERS } from "@/domain/prayers";

export type AladhanErrorCode = "city_not_found" | "network" | "bad_response";

export class AladhanError extends Error {
  constructor(
    public code: AladhanErrorCode,
    message?: string,
  ) {
    super(message ?? code);
  }
}

const API_NAMES = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
} as const;

/** "05:39 (PKT)" -> "05:39". Throws on anything that is not a valid 24-hour time. */
export function parseTime(raw: unknown): string {
  const match = typeof raw === "string" ? raw.match(/(\d{1,2}):(\d{2})/) : null;
  if (!match) throw new AladhanError("bad_response", `Unreadable time: ${String(raw)}`);
  const [h, m] = [Number(match[1]), Number(match[2])];
  if (h > 23 || m > 59) throw new AladhanError("bad_response", `Invalid time: ${String(raw)}`);
  return `${String(h).padStart(2, "0")}:${match[2]}`;
}

/** "27-11-2026" -> "2026-11-27". */
export function parseDate(raw: unknown): DateKey {
  const match = typeof raw === "string" ? raw.match(/^(\d{2})-(\d{2})-(\d{4})$/) : null;
  if (!match) throw new AladhanError("bad_response", `Unreadable date: ${String(raw)}`);
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/** Turns an Aladhan calendar response into clean days. Rejects the whole month if any day is malformed. */
export function parseMonth(json: unknown): DayTimes[] {
  const data = (json as { data?: unknown } | null)?.data;
  if (!Array.isArray(data) || data.length === 0) {
    throw new AladhanError("bad_response", "No days in response");
  }
  return data.map((item) => {
    const timings = (item as { timings?: Record<string, unknown> }).timings;
    const date = (item as { date?: { gregorian?: { date?: unknown } } }).date?.gregorian?.date;
    if (!timings) throw new AladhanError("bad_response", "Missing timings");
    const times = Object.fromEntries(
      PRAYERS.map((p) => [p, parseTime(timings[API_NAMES[p]])]),
    ) as PrayerTimes;
    return { date: parseDate(date), times };
  });
}

type FetchFn = (
  url: string,
  init?: { signal?: AbortSignal },
) => Promise<{
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}>;

export function monthUrl(
  s: Pick<AppSettings, "city" | "country" | "method" | "school">,
  year: number,
  month: number,
): string {
  const q = new URLSearchParams({
    city: s.city.trim(),
    country: s.country.trim(),
    method: String(s.method),
    school: String(s.school),
  });
  return `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?${q.toString()}`;
}

/** Fetches and parses one month of prayer times. */
export async function fetchMonth(
  settings: AppSettings,
  year: number,
  month: number,
  fetchFn: FetchFn = fetch as unknown as FetchFn,
): Promise<DayTimes[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  let response;
  try {
    response = await fetchFn(monthUrl(settings, year, month), { signal: controller.signal });
  } catch {
    throw new AladhanError("network");
  } finally {
    clearTimeout(timer);
  }
  if (response.status === 400) throw new AladhanError("city_not_found");
  if (!response.ok) throw new AladhanError("bad_response", `HTTP ${response.status}`);
  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new AladhanError("bad_response", "Not JSON");
  }
  return parseMonth(json);
}

export type TimesStatus = "fresh" | "cached" | "stale" | "unavailable";

export interface EnsureResult {
  /** Times for today and the days after it that are known. */
  days: Record<DateKey, PrayerTimes>;
  /** fresh: just downloaded. cached: complete cache, no download. stale: download failed, using older cache. unavailable: nothing to show. */
  status: TimesStatus;
  error?: AladhanErrorCode;
}

/**
 * Makes sure times for `today` and the following days are cached. Downloads a whole month only when some
 * needed day is missing, and falls back to whatever is cached if the download fails.
 */
export async function ensureTimes(
  db: Db,
  settings: AppSettings,
  today: DateKey,
  options: { windowDays?: number; fetchFn?: FetchFn; now?: number } = {},
): Promise<EnsureResult> {
  const windowDays = options.windowDays ?? 7;
  const key = locationKey(settings);
  const last = addDays(today, windowDays - 1);
  const needed = Array.from({ length: windowDays }, (_, i) => addDays(today, i));

  let cached = await getDays(db, key, today, last);
  if (needed.every((d) => cached[d])) return { days: cached, status: "cached" };

  // Months that contain a missing day, without repeats.
  const months = [...new Set(needed.filter((d) => !cached[d]).map((d) => d.slice(0, 7)))];
  try {
    for (const ym of months) {
      const [year, month] = ym.split("-").map(Number);
      const days = await fetchMonth(settings, year, month, options.fetchFn);
      await saveDays(db, key, days, options.now);
    }
    cached = await getDays(db, key, today, last);
    return { days: cached, status: "fresh" };
  } catch (e) {
    const error = e instanceof AladhanError ? e.code : "network";
    return { days: cached, status: cached[today] ? "stale" : "unavailable", error };
  }
}
