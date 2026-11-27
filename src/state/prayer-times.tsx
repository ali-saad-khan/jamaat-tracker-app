import { useSQLiteContext } from "expo-sqlite";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { AppState } from "react-native";

import type { PrayerTimes } from "@/data/prayer-times";
import { DEFAULT_SETTINGS, locationKey } from "@/data/settings";
import type { DateKey } from "@/domain/dates";
import { planReminders } from "@/domain/reminders";
import { reminderText } from "@/i18n/strings";
import { ensureTimes, type AladhanErrorCode, type TimesStatus } from "@/services/aladhan";
import { applyReminders, expoNotifier } from "@/services/reminders";
import { useToday } from "@/hooks/use-today";

import { useSettings } from "./settings";

interface TimesValue {
  days: Record<DateKey, PrayerTimes>;
  status: TimesStatus | "loading";
  error?: AladhanErrorCode;
  /** Asks for a re-check: uses the cache and downloads only if something is missing. */
  refresh(): void;
}

const TimesContext = createContext<TimesValue | null>(null);

/** Keeps prayer times fresh and the scheduled reminders in step with them. */
export function PrayerTimesProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const { settings, ready } = useSettings();
  const today = useToday();
  const [state, setState] = useState<Omit<TimesValue, "refresh">>({ days: {}, status: "loading" });
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((t) => t + 1), []);
  const key = locationKey(settings);
  const { city, country, method, school, remindersEnabled, reminderOffsetMinutes, language } =
    settings;

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void (async () => {
      const result = await ensureTimes(
        db,
        { ...DEFAULT_SETTINGS, city, country, method, school },
        today,
      );
      if (cancelled) return;
      setState({ days: result.days, status: result.status, error: result.error });
      if (remindersEnabled) {
        await applyReminders(
          expoNotifier,
          planReminders(result.days, new Date(), reminderOffsetMinutes, 7, reminderText(language)),
        );
      } else {
        await expoNotifier.cancelAll();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    db,
    ready,
    key,
    city,
    country,
    method,
    school,
    today,
    remindersEnabled,
    reminderOffsetMinutes,
    language,
    tick,
  ]);

  // Come back to the app: re-check, so the rolling reminder window keeps moving.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return <TimesContext.Provider value={{ ...state, refresh }}>{children}</TimesContext.Provider>;
}

export function usePrayerTimes(): TimesValue {
  const value = useContext(TimesContext);
  if (!value) throw new Error("usePrayerTimes must be used inside PrayerTimesProvider");
  return value;
}
