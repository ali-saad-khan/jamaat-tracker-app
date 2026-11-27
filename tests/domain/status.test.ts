import { nextStatus, summarizeDay } from "@/domain/status";

describe("nextStatus", () => {
  it("cycles not marked -> jamaat -> alone -> missed -> not marked", () => {
    expect(nextStatus(null)).toBe("jamaat");
    expect(nextStatus("jamaat")).toBe("alone");
    expect(nextStatus("alone")).toBe("missed");
    expect(nextStatus("missed")).toBeNull();
  });
});

describe("summarizeDay", () => {
  it("counts an empty day", () => {
    expect(summarizeDay({})).toEqual({ total: 5, marked: 0, jamaat: 0, alone: 0, missed: 0 });
  });

  it("counts each kind of mark", () => {
    expect(
      summarizeDay({ fajr: "jamaat", dhuhr: "jamaat", asr: "alone", maghrib: "missed" }),
    ).toEqual({ total: 5, marked: 4, jamaat: 2, alone: 1, missed: 1 });
  });
});
