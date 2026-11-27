import { useSQLiteContext } from "expo-sqlite";
import { ScrollView, StyleSheet, Text } from "react-native";

import { setStatus } from "@/data/entries";
import type { Prayer } from "@/domain/prayers";
import { nextStatus, summarizeDay } from "@/domain/status";
import { useEntries } from "@/hooks/use-entries";
import { useToday } from "@/hooks/use-today";
import { usePrayerTimes } from "@/state/prayer-times";
import { DayEditor } from "@/ui/day-editor";

export default function TodayScreen() {
  const db = useSQLiteContext();
  const today = useToday();
  const { days, reload } = useEntries(today, today);
  const entries = days[today] ?? {};
  const summary = summarizeDay(entries);
  const { days: timeDays, status, error } = usePrayerTimes();

  const cycle = async (prayer: Prayer) => {
    await setStatus(db, today, prayer, nextStatus(entries[prayer] ?? null));
    await reload();
  };
  const clear = async (prayer: Prayer) => {
    await setStatus(db, today, prayer, null);
    await reload();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.date}>{today}</Text>
      <Text style={styles.summary}>
        {summary.marked} of {summary.total} marked · {summary.jamaat} in congregation
      </Text>
      {status === "stale" && (
        <Text style={styles.note}>Showing saved prayer times (could not refresh).</Text>
      )}
      {status === "unavailable" && (
        <Text style={styles.note}>
          Prayer times are unavailable
          {error === "city_not_found"
            ? ": city not found. Check Settings."
            : ". Check your connection."}
        </Text>
      )}
      <DayEditor
        entries={entries}
        times={timeDays[today]}
        onCycle={(p) => void cycle(p)}
        onClear={(p) => void clear(p)}
      />
      <Text style={styles.hint}>Tap to change a prayer. Long-press to clear it.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  date: { fontSize: 26, fontWeight: "700" },
  summary: { fontSize: 15, opacity: 0.7 },
  note: { fontSize: 13, color: "#c0392b" },
  hint: { fontSize: 13, opacity: 0.6, marginTop: 4 },
});
