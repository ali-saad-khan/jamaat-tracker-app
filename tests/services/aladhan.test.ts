import {
  AladhanError,
  ensureTimes,
  monthUrl,
  parseDate,
  parseMonth,
  parseTime,
} from "@/services/aladhan";
import { saveDays } from "@/data/prayer-times";
import { DEFAULT_SETTINGS, locationKey } from "@/data/settings";
import type { Db } from "@/data/db";
import { migrate } from "@/data/migrations";
import { createMemoryDb } from "../helpers/memoryDb";

const day = (date: string, fajr = "05:36 (PKT)") => ({
  date: { gregorian: { date } },
  timings: {
    Fajr: fajr,
    Dhuhr: "12:19 (PKT)",
    Asr: "16:06 (PKT)",
    Maghrib: "17:42 (PKT)",
    Isha: "19:02 (PKT)",
  },
});

const respond =
  (body: unknown, status = 200) =>
  async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });

describe("parsing", () => {
  it("strips the zone suffix and pads the hour", () => {
    expect(parseTime("05:39 (PKT)")).toBe("05:39");
    expect(parseTime("5:39")).toBe("05:39");
  });

  it("rejects unreadable or impossible times", () => {
    expect(() => parseTime("soon")).toThrow(AladhanError);
    expect(() => parseTime("25:00")).toThrow(AladhanError);
    expect(() => parseTime(undefined)).toThrow(AladhanError);
  });

  it("converts DD-MM-YYYY to a date key", () => {
    expect(parseDate("27-11-2026")).toBe("2026-11-27");
    expect(() => parseDate("2026-11-27")).toThrow(AladhanError);
  });

  it("parses a month of days", () => {
    const days = parseMonth({ data: [day("01-12-2026"), day("02-12-2026", "05:40 (PKT)")] });
    expect(days).toHaveLength(2);
    expect(days[1]).toEqual({
      date: "2026-12-02",
      times: { fajr: "05:40", dhuhr: "12:19", asr: "16:06", maghrib: "17:42", isha: "19:02" },
    });
  });

  it("rejects the whole month when a day is malformed or empty", () => {
    expect(() => parseMonth({ data: [] })).toThrow(AladhanError);
    expect(() => parseMonth({})).toThrow(AladhanError);
    expect(() => parseMonth({ data: [{ date: { gregorian: { date: "01-12-2026" } } }] })).toThrow(
      AladhanError,
    );
  });
});

describe("monthUrl", () => {
  it("encodes the settings into the query", () => {
    const url = monthUrl({ ...DEFAULT_SETTINGS, city: "New York", country: "USA" }, 2026, 12);
    expect(url).toContain("/calendarByCity/2026/12?");
    expect(url).toContain("city=New+York");
    expect(url).toContain("method=1");
    expect(url).toContain("school=1");
  });
});

describe("ensureTimes", () => {
  let db: Db;
  const today = "2026-12-02";
  beforeEach(async () => {
    db = createMemoryDb();
    await migrate(db);
  });

  const monthBody = (n: number, from = 1) => ({
    data: Array.from({ length: n }, (_, i) => day(`${String(from + i).padStart(2, "0")}-12-2026`)),
  });

  it("downloads and caches when the cache is empty", async () => {
    const fetchFn = jest.fn(respond(monthBody(31)));
    const result = await ensureTimes(db, DEFAULT_SETTINGS, today, { fetchFn });
    expect(result.status).toBe("fresh");
    expect(Object.keys(result.days)).toHaveLength(7);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it("does not download again when the window is cached", async () => {
    await ensureTimes(db, DEFAULT_SETTINGS, today, { fetchFn: respond(monthBody(31)) });
    const fetchFn = jest.fn(respond(monthBody(31)));
    const result = await ensureTimes(db, DEFAULT_SETTINGS, today, { fetchFn });
    expect(result.status).toBe("cached");
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("fetches the next month when the window crosses a month end", async () => {
    const fetchFn = jest.fn(async (url: string) => {
      const body = url.includes("/2026/12?")
        ? monthBody(31)
        : { data: [day("01-01-2027"), day("02-01-2027")] };
      return { ok: true, status: 200, json: async () => body };
    });
    const result = await ensureTimes(db, DEFAULT_SETTINGS, "2026-12-30", { fetchFn });
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(result.days["2027-01-02"]).toBeDefined();
  });

  it("uses older cached times when the download fails", async () => {
    await saveDays(db, locationKey(DEFAULT_SETTINGS), [
      {
        date: today,
        times: { fajr: "05:40", dhuhr: "12:19", asr: "16:06", maghrib: "17:42", isha: "19:02" },
      },
    ]);
    const result = await ensureTimes(db, DEFAULT_SETTINGS, today, {
      fetchFn: async () => {
        throw new Error("offline");
      },
    });
    expect(result.status).toBe("stale");
    expect(result.error).toBe("network");
    expect(result.days[today].fajr).toBe("05:40");
  });

  it("reports unavailable when nothing is cached and the download fails", async () => {
    const result = await ensureTimes(db, DEFAULT_SETTINGS, today, { fetchFn: respond({}, 500) });
    expect(result.status).toBe("unavailable");
    expect(result.error).toBe("bad_response");
  });

  it("reports an unknown city", async () => {
    const result = await ensureTimes(db, DEFAULT_SETTINGS, today, {
      fetchFn: respond({ code: 400 }, 400),
    });
    expect(result.error).toBe("city_not_found");
  });

  it("keeps cached times separate per location settings", async () => {
    await ensureTimes(db, DEFAULT_SETTINGS, today, { fetchFn: respond(monthBody(31)) });
    const fetchFn = jest.fn(respond(monthBody(31)));
    await ensureTimes(db, { ...DEFAULT_SETTINGS, school: 0 }, today, { fetchFn });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
