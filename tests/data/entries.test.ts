import type { Db } from "@/data/db";
import { getDay, getRange, setStatus } from "@/data/entries";
import { DATABASE_VERSION, migrate } from "@/data/migrations";
import { createMemoryDb } from "../helpers/memoryDb";

let db: Db;

beforeEach(async () => {
  db = createMemoryDb();
  await migrate(db);
});

describe("migrate", () => {
  it("sets the schema version and is safe to run twice", async () => {
    await migrate(db);
    const row = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    expect(row?.user_version).toBe(DATABASE_VERSION);
  });
});

describe("entries", () => {
  it("starts empty", async () => {
    expect(await getDay(db, "2026-03-02")).toEqual({});
  });

  it("saves a mark and reads it back", async () => {
    await setStatus(db, "2026-03-02", "fajr", "jamaat");
    expect(await getDay(db, "2026-03-02")).toEqual({ fajr: "jamaat" });
  });

  it("replaces an existing mark instead of adding a second one", async () => {
    await setStatus(db, "2026-03-02", "fajr", "jamaat", 1);
    await setStatus(db, "2026-03-02", "fajr", "missed", 2);
    expect(await getDay(db, "2026-03-02")).toEqual({ fajr: "missed" });
    const count = await db.getFirstAsync<{ n: number }>("SELECT COUNT(*) AS n FROM entries");
    expect(count?.n).toBe(1);
  });

  it("clears a mark when given null", async () => {
    await setStatus(db, "2026-03-02", "asr", "alone");
    await setStatus(db, "2026-03-02", "asr", null);
    expect(await getDay(db, "2026-03-02")).toEqual({});
  });

  it("keeps days separate", async () => {
    await setStatus(db, "2026-03-01", "isha", "jamaat");
    await setStatus(db, "2026-03-02", "isha", "alone");
    expect(await getDay(db, "2026-03-01")).toEqual({ isha: "jamaat" });
    expect(await getDay(db, "2026-03-02")).toEqual({ isha: "alone" });
  });

  it("returns an inclusive range keyed by date, leaving out days with no marks", async () => {
    await setStatus(db, "2026-02-28", "fajr", "jamaat");
    await setStatus(db, "2026-03-01", "dhuhr", "alone");
    await setStatus(db, "2026-03-03", "asr", "missed");
    await setStatus(db, "2026-03-04", "isha", "jamaat");
    expect(await getRange(db, "2026-02-28", "2026-03-03")).toEqual({
      "2026-02-28": { fajr: "jamaat" },
      "2026-03-01": { dhuhr: "alone" },
      "2026-03-03": { asr: "missed" },
    });
  });

  it("ignores rows with unknown prayers or statuses", async () => {
    await db.runAsync(
      "INSERT INTO entries (date, prayer, status, updated_at) VALUES ('2026-03-02', 'chasht', 'jamaat', 1), ('2026-03-02', 'fajr', 'maybe', 1), ('2026-03-02', 'isha', 'alone', 1)",
    );
    expect(await getDay(db, "2026-03-02")).toEqual({ isha: "alone" });
  });
});
