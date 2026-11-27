import { FlatList, StyleSheet, Text, View } from "react-native";

import { lastNDays } from "@/domain/dates";
import { PRAYERS } from "@/domain/prayers";
import { summarizeDay } from "@/domain/status";
import { useEntries } from "@/hooks/use-entries";
import { useToday } from "@/hooks/use-today";
import { PRAYER_NAMES, markColor } from "@/ui/labels";

const DAYS = 14;

export default function HistoryScreen() {
  const today = useToday();
  const dates = lastNDays(today, DAYS);
  const { days } = useEntries(dates[dates.length - 1], today);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={dates}
      keyExtractor={(date) => date}
      renderItem={({ item: date }) => {
        const entries = days[date] ?? {};
        const summary = summarizeDay(entries);
        return (
          <View
            style={styles.row}
            accessible
            accessibilityLabel={`${date}: ${summary.marked} of 5 marked, ${summary.jamaat} in congregation`}
          >
            <View>
              <Text style={styles.date}>{date}</Text>
              <Text style={styles.summary}>
                {summary.marked}/5 marked · {summary.jamaat} in congregation
              </Text>
            </View>
            <View style={styles.dots}>
              {PRAYERS.map((prayer) => (
                <View
                  key={prayer}
                  accessibilityLabel={PRAYER_NAMES[prayer]}
                  style={[styles.dot, { backgroundColor: markColor(entries[prayer] ?? null) }]}
                />
              ))}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 10 },
  row: {
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#c4c7cc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  date: { fontSize: 16, fontWeight: "600" },
  summary: { fontSize: 13, opacity: 0.65, marginTop: 2 },
  dots: { flexDirection: "row", gap: 6 },
  dot: { width: 16, height: 16, borderRadius: 8 },
});
