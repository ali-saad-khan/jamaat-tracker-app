import { useSQLiteContext } from "expo-sqlite";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { setStatus } from "@/data/entries";
import { PRAYERS, type Prayer } from "@/domain/prayers";
import { nextStatus, summarizeDay } from "@/domain/status";
import { useEntries } from "@/hooks/use-entries";
import { useToday } from "@/hooks/use-today";
import { usePrayerTimes } from "@/state/prayer-times";
import { PRAYER_NAMES, markColor, markLabel } from "@/ui/labels";

export default function TodayScreen() {
  const db = useSQLiteContext();
  const today = useToday();
  const { days, reload } = useEntries(today, today);
  const entries = days[today] ?? {};
  const summary = summarizeDay(entries);
  const { days: timeDays, status, error } = usePrayerTimes();
  const times = timeDays[today];

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
      <View style={styles.list}>
        {PRAYERS.map((prayer) => {
          const mark = entries[prayer] ?? null;
          return (
            <Pressable
              key={prayer}
              accessibilityRole="button"
              accessibilityLabel={`${PRAYER_NAMES[prayer]}: ${markLabel(mark)}. Tap to change.`}
              onPress={() => void cycle(prayer)}
              onLongPress={() => void clear(prayer)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View>
                <Text style={styles.prayer}>{PRAYER_NAMES[prayer]}</Text>
                {times && <Text style={styles.time}>{times[prayer]}</Text>}
              </View>
              <View style={[styles.badge, { backgroundColor: markColor(mark) }]}>
                <Text style={styles.badgeText}>{markLabel(mark)}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>Tap to change a prayer. Long-press to clear it.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  date: { fontSize: 26, fontWeight: "700" },
  summary: { fontSize: 15, opacity: 0.7 },
  list: { gap: 10, marginTop: 8 },
  row: {
    minHeight: 64,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#c4c7cc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowPressed: { opacity: 0.6 },
  prayer: { fontSize: 20, fontWeight: "600" },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: "#fff", fontWeight: "600" },
  note: { fontSize: 13, color: "#c0392b" },
  time: { fontSize: 15, opacity: 0.65, marginTop: 2 },
  hint: { fontSize: 13, opacity: 0.6, marginTop: 4 },
});
