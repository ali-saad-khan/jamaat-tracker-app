import {
  addDays,
  isValidDateKey,
  lastNDays,
  msUntilNextLocalMidnight,
  toDateKey,
} from "@/domain/dates";

describe("toDateKey", () => {
  it("uses the local calendar day", () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59, 59))).toBe("2026-01-05");
    expect(toDateKey(new Date(2026, 0, 6, 0, 0, 0))).toBe("2026-01-06");
  });

  it("pads month and day", () => {
    expect(toDateKey(new Date(2026, 2, 4))).toBe("2026-03-04");
  });
});

describe("isValidDateKey", () => {
  it("accepts real dates, including a leap day", () => {
    expect(isValidDateKey("2028-02-29")).toBe(true);
    expect(isValidDateKey("2026-12-31")).toBe(true);
  });

  it("rejects malformed or impossible dates", () => {
    expect(isValidDateKey("2026-02-29")).toBe(false);
    expect(isValidDateKey("2026-13-01")).toBe(false);
    expect(isValidDateKey("2026-1-1")).toBe(false);
    expect(isValidDateKey("not-a-date")).toBe(false);
  });
});

describe("addDays", () => {
  it("crosses month, year and leap-day boundaries", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
  });

  it("goes backwards and by zero", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
    expect(addDays("2026-03-01", 0)).toBe("2026-03-01");
  });

  it("never skips or repeats a day around daylight-saving changes", () => {
    expect(addDays("2026-03-07", 1)).toBe("2026-03-08");
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
    expect(addDays("2026-03-28", 1)).toBe("2026-03-29");
    expect(addDays("2026-10-24", 1)).toBe("2026-10-25");
    expect(addDays("2026-11-01", 1)).toBe("2026-11-02");
  });
});

describe("lastNDays", () => {
  it("lists days newest first", () => {
    expect(lastNDays("2026-03-02", 4)).toEqual([
      "2026-03-02",
      "2026-03-01",
      "2026-02-28",
      "2026-02-27",
    ]);
  });

  it("returns nothing for zero days", () => {
    expect(lastNDays("2026-03-02", 0)).toEqual([]);
  });
});

describe("msUntilNextLocalMidnight", () => {
  it("counts to the next local midnight", () => {
    expect(msUntilNextLocalMidnight(new Date(2026, 0, 5, 23, 0, 0, 0))).toBe(3_600_000);
    expect(msUntilNextLocalMidnight(new Date(2026, 0, 5, 0, 0, 0, 0))).toBe(86_400_000);
  });
});

import { addMonths, daysInMonth, monthGrid, weekdayIndex } from "@/domain/dates";

describe("calendar helpers", () => {
  it("knows weekdays and month lengths", () => {
    expect(weekdayIndex("2026-11-27")).toBe(5); // Friday
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it("moves between months across year ends", () => {
    expect(addMonths(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(addMonths(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(addMonths(2026, 5, 0)).toEqual({ year: 2026, month: 5 });
    expect(addMonths(2026, 3, 13)).toEqual({ year: 2027, month: 4 });
  });

  it("builds Monday-first weeks padded with nulls", () => {
    const grid = monthGrid(2026, 11); // 1 Nov 2026 is a Sunday
    expect(grid[0]).toEqual([null, null, null, null, null, null, "2026-11-01"]);
    expect(grid[grid.length - 1][0]).toBe("2026-11-30");
    expect(grid.every((w) => w.length === 7)).toBe(true);
    expect(grid.flat().filter(Boolean)).toHaveLength(30);
  });
});
