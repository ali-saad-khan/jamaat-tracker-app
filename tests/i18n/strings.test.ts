import { STRINGS, list, reminderText, translate, type StringKey } from "@/i18n/strings";

describe("strings", () => {
  it("has the same keys in English and Urdu, and none are empty", () => {
    const en = Object.keys(STRINGS.en) as StringKey[];
    expect(Object.keys(STRINGS.ur).sort()).toEqual([...en].sort());
    for (const key of en) {
      expect(STRINGS.en[key].length).toBeGreaterThan(0);
      expect(STRINGS.ur[key].length).toBeGreaterThan(0);
    }
  });

  it("uses the same placeholders in both languages", () => {
    const names = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(STRINGS.en) as StringKey[]) {
      expect(names(STRINGS.ur[key])).toEqual(names(STRINGS.en[key]));
    }
  });

  it("fills placeholders", () => {
    expect(translate("en", "today.summary", { marked: 3, total: 5, jamaat: 2 })).toBe(
      "3 of 5 marked · 2 in congregation",
    );
    expect(translate("en", "stats.percent", { n: 80 })).toBe("80% in congregation");
  });

  it("lists have the right lengths", () => {
    for (const lang of ["en", "ur"] as const) {
      expect(list(lang, "months")).toHaveLength(12);
      expect(list(lang, "weekdaysShort")).toHaveLength(7);
      expect(list(lang, "weekdaysChart")).toHaveLength(7);
    }
  });

  it("builds reminder wording per language", () => {
    expect(reminderText("en").title("fajr", 0)).toBe("Fajr time");
    expect(reminderText("en").title("asr", 10)).toBe("Asr in 10 minutes");
    expect(reminderText("ur").title("fajr", 0)).toBe("فجر کا وقت");
  });
});
