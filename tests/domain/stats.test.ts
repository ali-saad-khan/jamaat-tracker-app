import {
  bestStreak,
  currentStreak,
  dailyJamaatCounts,
  dayQualifies,
  rangeStats,
} from "@/domain/stats";
import type { DayEntries } from "@/domain/status";

const all: DayEntries = {
  fajr: "jamaat",
  dhuhr: "jamaat",
  asr: "jamaat",
  maghrib: "jamaat",
  isha: "jamaat",
};
const four: DayEntries = {
  fajr: "jamaat",
  dhuhr: "jamaat",
  asr: "jamaat",
  maghrib: "jamaat",
  isha: "alone",
};

describe("dayQualifies", () => {
  it("needs at least the target number of congregation prayers", () => {
    expect(dayQualifies(all, 5)).toBe(true);
    expect(dayQualifies(four, 5)).toBe(false);
    expect(dayQualifies(four, 4)).toBe(true);
    expect(dayQualifies(undefined, 3)).toBe(false);
  });
});

describe("currentStreak", () => {
  it("counts back from today when today qualifies", () => {
    const days = { "2026-03-01": all, "2026-03-02": all, "2026-03-03": all };
    expect(currentStreak(days, "2026-03-03", 5)).toBe(3);
  });

  it("does not break the streak while today is still incomplete", () => {
    const days = {
      "2026-03-01": all,
      "2026-03-02": all,
      "2026-03-03": { fajr: "jamaat" } as DayEntries,
    };
    expect(currentStreak(days, "2026-03-03", 5)).toBe(2);
  });

  it("is zero when yesterday and today both fail", () => {
    expect(currentStreak({ "2026-03-01": all }, "2026-03-03", 5)).toBe(0);
  });

  it("stops at a gap", () => {
    const days = { "2026-03-01": all, "2026-03-03": all, "2026-03-04": all };
    expect(currentStreak(days, "2026-03-04", 5)).toBe(2);
  });

  it("crosses month and year ends", () => {
    const days = { "2026-12-30": all, "2026-12-31": all, "2027-01-01": all };
    expect(currentStreak(days, "2027-01-01", 5)).toBe(3);
  });

  it("follows the chosen target", () => {
    const days = { "2026-03-01": four, "2026-03-02": four };
    expect(currentStreak(days, "2026-03-02", 5)).toBe(0);
    expect(currentStreak(days, "2026-03-02", 4)).toBe(2);
  });
});

describe("bestStreak", () => {
  it("finds the longest run, not the latest", () => {
    const days = {
      "2026-03-01": all,
      "2026-03-02": all,
      "2026-03-03": all,
      "2026-03-05": all,
      "2026-03-06": all,
    };
    expect(bestStreak(days, "2026-03-01", "2026-03-06", 5)).toBe(3);
  });

  it("is zero with no qualifying days", () => {
    expect(bestStreak({}, "2026-03-01", "2026-03-05", 5)).toBe(0);
  });
});

describe("rangeStats", () => {
  it("totals marks and the congregation percentage over every possible prayer", () => {
    const days = {
      "2026-03-01": all,
      "2026-03-02": { fajr: "alone", dhuhr: "missed" } as DayEntries,
    };
    expect(rangeStats(days, ["2026-03-01", "2026-03-02"])).toEqual({
      days: 2,
      possible: 10,
      jamaat: 5,
      alone: 1,
      missed: 1,
      unmarked: 3,
      jamaatPercent: 50,
    });
  });

  it("handles an empty range", () => {
    expect(rangeStats({}, []).jamaatPercent).toBe(0);
  });
});

describe("dailyJamaatCounts", () => {
  it("lists congregation prayers per day in order", () => {
    expect(
      dailyJamaatCounts({ "2026-03-01": all, "2026-03-02": four }, [
        "2026-03-01",
        "2026-03-02",
        "2026-03-03",
      ]),
    ).toEqual([5, 4, 0]);
  });
});
