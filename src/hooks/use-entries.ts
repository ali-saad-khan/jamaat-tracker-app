import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";

import { getRange } from "@/data/entries";
import type { DateKey } from "@/domain/dates";
import type { DayEntries } from "@/domain/status";

/** Marks for an inclusive range of days; reloads whenever the screen comes into focus or `from`/`to` change. */
export function useEntries(from: DateKey, to: DateKey) {
  const db = useSQLiteContext();
  const [days, setDays] = useState<Record<DateKey, DayEntries>>({});

  const reload = useCallback(async () => {
    setDays(await getRange(db, from, to));
  }, [db, from, to]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { days, reload };
}
