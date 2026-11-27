import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { setStatus } from "@/data/entries";
import { addMonths, daysInMonth, monthGrid, type DateKey } from "@/domain/dates";
import type { Prayer } from "@/domain/prayers";
import { nextStatus, summarizeDay } from "@/domain/status";
import { useEntries } from "@/hooks/use-entries";
import { useToday } from "@/hooks/use-today";
import { DayEditor } from "@/ui/day-editor";
import { STATUS_COLORS } from "@/ui/labels";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Colour of a day cell by how many prayers were in congregation. */
function cellColor(jamaat: number, marked: number): string {
  if (marked === 0) return "transparent";
  if (jamaat === 5) return STATUS_COLORS.jamaat;
  if (jamaat >= 3) return "#7fc8a4";
  if (jamaat >= 1) return STATUS_COLORS.alone;
  return STATUS_COLORS.missed;
}

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const today = useToday();
  const [year0, month0] = today.split("-").map(Number);
  const [shown, setShown] = useState({ year: year0, month: month0 });
  const [selected, setSelected] = useState<DateKey | null>(null);

  const prefix = `${shown.year}-${String(shown.month).padStart(2, "0")}`;
  const { days, reload } = useEntries(
    `${prefix}-01`,
    `${prefix}-${String(daysInMonth(shown.year, shown.month)).padStart(2, "0")}`,
  );
  const grid = monthGrid(shown.year, shown.month);
  const canGoForward = shown.year * 12 + shown.month < year0 * 12 + month0;
  const entries = selected ? (days[selected] ?? {}) : {};

  const mark = async (prayer: Prayer, status: ReturnType<typeof nextStatus>) => {
    if (!selected) return;
    await setStatus(db, selected, prayer, status);
    await reload();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.nav}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          style={styles.navButton}
          onPress={() => {
            setShown((s) => addMonths(s.year, s.month, -1));
            setSelected(null);
          }}
        >
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.month}>
          {MONTH_NAMES[shown.month - 1]} {shown.year}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          disabled={!canGoForward}
          style={[styles.navButton, !canGoForward && styles.navOff]}
          onPress={() => {
            setShown((s) => addMonths(s.year, s.month, 1));
            setSelected(null);
          }}
        >
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>
      {grid.map((week, w) => (
        <View key={w} style={styles.weekRow}>
          {week.map((date, i) => {
            if (!date) return <View key={i} style={styles.cell} />;
            const s = summarizeDay(days[date] ?? {});
            const future = date > today;
            return (
              <Pressable
                key={date}
                disabled={future}
                accessibilityRole="button"
                accessibilityLabel={`${date}: ${s.marked} of 5 marked, ${s.jamaat} in congregation`}
                onPress={() => setSelected(date)}
                style={[
                  styles.cell,
                  { backgroundColor: cellColor(s.jamaat, s.marked) },
                  date === today && styles.todayCell,
                  date === selected && styles.selectedCell,
                  future && styles.futureCell,
                ]}
              >
                <Text style={[styles.cellText, s.marked > 0 && styles.cellTextOn]}>
                  {Number(date.slice(8))}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.legend}>
        <Text style={styles.legendText}>
          Dark green: all 5 in congregation · light green: 3 or more · amber: 1 or 2 · red: none
        </Text>
      </View>

      {selected ? (
        <View style={styles.editor}>
          <Text style={styles.editorTitle}>{selected}</Text>
          <DayEditor
            entries={entries}
            onCycle={(p) => void mark(p, nextStatus(entries[p] ?? null))}
            onClear={(p) => void mark(p, null)}
          />
        </View>
      ) : (
        <Text style={styles.hint}>Tap a day to see or change its prayers.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8 },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  navButton: { width: 48, height: 48, alignItems: "center", justifyContent: "center" },
  navOff: { opacity: 0.3 },
  navText: { fontSize: 28 },
  month: { fontSize: 20, fontWeight: "700" },
  weekRow: { flexDirection: "row", gap: 6 },
  weekday: { flex: 1, textAlign: "center", fontSize: 12, opacity: 0.6, marginBottom: 2 },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#c4c7cc",
  },
  cellText: { fontSize: 14 },
  cellTextOn: { color: "#fff", fontWeight: "600" },
  todayCell: { borderWidth: 2, borderColor: "#1b8a5a" },
  selectedCell: { borderWidth: 3, borderColor: "#2d6cdf" },
  futureCell: { opacity: 0.3 },
  legend: { marginTop: 6 },
  legendText: { fontSize: 12, opacity: 0.6 },
  editor: { marginTop: 14, gap: 10 },
  editorTitle: { fontSize: 20, fontWeight: "700" },
  hint: { fontSize: 13, opacity: 0.6, marginTop: 10 },
});
