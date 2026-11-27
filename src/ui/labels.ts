import type { Prayer, PrayerStatus } from "@/domain/prayers";
import type { Mark } from "@/domain/status";

export const PRAYER_NAMES: Record<Prayer, string> = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

export const STATUS_LABELS: Record<PrayerStatus, string> = {
  jamaat: "With congregation",
  alone: "Alone",
  missed: "Missed",
};

export const STATUS_COLORS: Record<PrayerStatus, string> = {
  jamaat: "#1b8a5a",
  alone: "#d68a00",
  missed: "#c0392b",
};

export const NOT_MARKED_COLOR = "#9aa0a6";

export function markLabel(mark: Mark): string {
  return mark ? STATUS_LABELS[mark] : "Not marked";
}

export function markColor(mark: Mark): string {
  return mark ? STATUS_COLORS[mark] : NOT_MARKED_COLOR;
}
