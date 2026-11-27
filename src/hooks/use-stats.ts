import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import { getEarliestDate, getRange } from "@/data/entries";
import { lastNDays, type DateKey } from "@/domain/dates";
import {
  bestStreak,
  currentStreak,
  dailyJamaatCounts,
  rangeStats,
  type RangeStats,
} from "@/domain/stats";

export interface Stats {
  current: number;
  best: number;
  week: RangeStats;
  month: RangeStats;
  /** Last 7 days, oldest first. */
  bars: { date: DateKey; jamaat: number }[];
}

/** Streaks and summaries, recomputed whenever the screen is focused or the day changes. */
export function useStats(today: DateKey, target: number): Stats | null {
  const db = useSQLiteContext();
  const [stats, setStats] = useState<Stats | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        const first = (await getEarliestDate(db)) ?? today;
        const days = await getRange(db, first, today);
        if (cancelled) return;
        const week = lastNDays(today, 7);
        const month = lastNDays(today, 30);
        const oldestFirst = [...week].reverse();
        const counts = dailyJamaatCounts(days, oldestFirst);
        setStats({
          current: currentStreak(days, today, target),
          best: bestStreak(days, first, today, target),
          week: rangeStats(days, week),
          month: rangeStats(days, month),
          bars: oldestFirst.map((date, i) => ({ date, jamaat: counts[i] })),
        });
      })();
      return () => {
        cancelled = true;
      };
    }, [db, today, target]),
  );

  return stats;
}
