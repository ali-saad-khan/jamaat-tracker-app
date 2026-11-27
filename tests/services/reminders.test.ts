import type { PlannedReminder } from "@/domain/reminders";
import { applyReminders, type Notifier } from "@/services/reminders";

jest.mock("expo-notifications", () => ({}));

const reminder = (id: string): PlannedReminder => ({
  id,
  at: new Date(2026, 11, 2, 5, 36),
  prayer: "fajr",
  title: "Fajr time",
  body: "Remember to pray in congregation.",
});

describe("applyReminders", () => {
  it("cancels everything first, then schedules each reminder in order", async () => {
    const calls: string[] = [];
    const notifier: Notifier = {
      cancelAll: async () => void calls.push("cancel"),
      schedule: async (r) => void calls.push(r.id),
    };
    const count = await applyReminders(notifier, [reminder("a"), reminder("b")]);
    expect(calls).toEqual(["cancel", "a", "b"]);
    expect(count).toBe(2);
  });

  it("still clears old reminders when there is nothing to schedule", async () => {
    const cancelAll = jest.fn(async () => {});
    const schedule = jest.fn(async () => {});
    expect(await applyReminders({ cancelAll, schedule }, [])).toBe(0);
    expect(cancelAll).toHaveBeenCalledTimes(1);
    expect(schedule).not.toHaveBeenCalled();
  });
});
