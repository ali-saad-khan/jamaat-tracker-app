import { planReminders, reminderMoment } from "@/domain/reminders";

const times = { fajr: "05:36", dhuhr: "12:19", asr: "16:06", maghrib: "17:42", isha: "19:02" };
const days = {
  "2026-12-02": times,
  "2026-12-03": times,
  "2026-12-09": times,
};

describe("reminderMoment", () => {
  it("applies the offset before the prayer", () => {
    expect(reminderMoment("2026-12-02", "12:19", 10)).toEqual(new Date(2026, 11, 2, 12, 9));
    expect(reminderMoment("2026-12-02", "00:05", 10)).toEqual(new Date(2026, 11, 1, 23, 55));
  });
});

describe("planReminders", () => {
  it("skips moments that already passed today", () => {
    const now = new Date(2026, 11, 2, 13, 0);
    const plan = planReminders(days, now, 0);
    expect(plan.filter((r) => r.id.startsWith("prayer-2026-12-02")).map((r) => r.prayer)).toEqual([
      "asr",
      "maghrib",
      "isha",
    ]);
  });

  it("includes later days inside the window and leaves out days outside it", () => {
    const plan = planReminders(days, new Date(2026, 11, 2, 0, 1), 0, 7);
    expect(plan.some((r) => r.id.startsWith("prayer-2026-12-03"))).toBe(true);
    expect(plan.some((r) => r.id.startsWith("prayer-2026-12-09"))).toBe(false);
    expect(plan).toHaveLength(10);
  });

  it("uses stable ids and sorted times", () => {
    const plan = planReminders(days, new Date(2026, 11, 2, 0, 1), 0);
    expect(plan[0].id).toBe("prayer-2026-12-02-fajr");
    const ms = plan.map((r) => r.at.getTime());
    expect([...ms].sort((a, b) => a - b)).toEqual(ms);
  });

  it("words the title by offset", () => {
    const now = new Date(2026, 11, 2, 0, 1);
    expect(planReminders(days, now, 0)[0].title).toBe("Fajr time");
    expect(planReminders(days, now, 10)[0].title).toBe("Fajr in 10 minutes");
  });

  it("drops a reminder whose offset moment is already past", () => {
    const now = new Date(2026, 11, 2, 5, 30);
    expect(planReminders(days, now, 10).some((r) => r.id === "prayer-2026-12-02-fajr")).toBe(false);
    expect(planReminders(days, now, 0).some((r) => r.id === "prayer-2026-12-02-fajr")).toBe(true);
  });

  it("skips days with no cached times", () => {
    expect(planReminders({}, new Date(2026, 11, 2), 0)).toEqual([]);
  });
});
