import { PRAYERS, STATUSES } from "@/domain/prayers";

describe("prayers", () => {
  it("lists the five prayers in daily order", () => {
    expect(PRAYERS).toEqual(["fajr", "dhuhr", "asr", "maghrib", "isha"]);
  });

  it("defines the three ways a prayer can be marked", () => {
    expect(STATUSES).toEqual(["jamaat", "alone", "missed"]);
  });
});
