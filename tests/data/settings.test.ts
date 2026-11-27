import type { Db } from "@/data/db";
import { migrate } from "@/data/migrations";
import { clearCache, getDays, saveDays } from "@/data/prayer-times";
import { DEFAULT_SETTINGS, loadSettings, locationKey, saveSettings } from "@/data/settings";
import { createMemoryDb } from "../helpers/memoryDb";

let db: Db;
beforeEach(async () => {
  db = createMemoryDb();
  await migrate(db);
});

describe("settings", () => {
  it("returns the defaults on a fresh database", async () => {
    expect(await loadSettings(db)).toEqual(DEFAULT_SETTINGS);
  });

  it("saves and reloads values with the right types", async () => {
    await saveSettings(db, {
      city: " Lahore ",
      method: 3,
      school: 0,
      remindersEnabled: true,
      reminderOffsetMinutes: 10,
      language: "ur",
      theme: "dark",
    });
    expect(await loadSettings(db)).toEqual({
      city: "Lahore",
      country: "Pakistan",
      method: 3,
      school: 0,
      remindersEnabled: true,
      reminderOffsetMinutes: 10,
      language: "ur",
      theme: "dark",
    });
  });

  it("falls back to defaults for invalid stored values", async () => {
    await db.runAsync(
      "INSERT INTO settings (key, value) VALUES ('method', '99'), ('school', '7'), ('reminderOffsetMinutes', '3'), ('language', 'fr'), ('theme', 'pink')",
    );
    expect(await loadSettings(db)).toEqual(DEFAULT_SETTINGS);
  });

  it("builds a case-insensitive location key from the fetch-relevant settings", () => {
    expect(locationKey({ ...DEFAULT_SETTINGS, city: " Karachi ", country: "PAKISTAN" })).toBe(
      "karachi|pakistan|1|1",
    );
    expect(locationKey({ ...DEFAULT_SETTINGS, school: 0 })).not.toBe(locationKey(DEFAULT_SETTINGS));
  });
});

describe("prayer time cache", () => {
  const times = { fajr: "05:36", dhuhr: "12:19", asr: "16:06", maghrib: "17:42", isha: "19:02" };

  it("saves, replaces and reads a range", async () => {
    await saveDays(db, "k", [
      { date: "2026-12-01", times },
      { date: "2026-12-02", times },
    ]);
    await saveDays(db, "k", [{ date: "2026-12-02", times: { ...times, fajr: "05:40" } }]);
    const days = await getDays(db, "k", "2026-12-01", "2026-12-02");
    expect(Object.keys(days)).toEqual(["2026-12-01", "2026-12-02"]);
    expect(days["2026-12-02"].fajr).toBe("05:40");
  });

  it("keeps locations apart and can be cleared", async () => {
    await saveDays(db, "a", [{ date: "2026-12-01", times }]);
    expect(await getDays(db, "b", "2026-12-01", "2026-12-01")).toEqual({});
    await clearCache(db);
    expect(await getDays(db, "a", "2026-12-01", "2026-12-01")).toEqual({});
  });
});
