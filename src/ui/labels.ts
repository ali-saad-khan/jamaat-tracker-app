import type { PrayerStatus } from "@/domain/prayers";
import type { Mark } from "@/domain/status";

export const STATUS_COLORS: Record<PrayerStatus, string> = {
  jamaat: "#1b8a5a",
  alone: "#b87500",
  missed: "#c0392b",
};

export const NOT_MARKED_COLOR = "#7d858c";

export function markColor(mark: Mark): string {
  return mark ? STATUS_COLORS[mark] : NOT_MARKED_COLOR;
}
