/** The five daily prayers, in the order they occur through the day. */
export const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type Prayer = (typeof PRAYERS)[number];

/** How a prayer was observed. A prayer with no record is "not marked yet". */
export const STATUSES = ["jamaat", "alone", "missed"] as const;
export type PrayerStatus = (typeof STATUSES)[number];
