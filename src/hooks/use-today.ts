import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { msUntilNextLocalMidnight, toDateKey, type DateKey } from "@/domain/dates";

/** The user's current local day. It changes by itself at local midnight and when the app returns to the foreground. */
export function useToday(): DateKey {
  const [today, setToday] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    const refresh = () => setToday(toDateKey(new Date()));
    // +1s so the timer never fires just before midnight.
    const timer = setTimeout(refresh, msUntilNextLocalMidnight(new Date()) + 1000);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [today]);

  return today;
}
