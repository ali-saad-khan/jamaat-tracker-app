import { Pressable, StyleSheet, Text, View } from "react-native";

import type { PrayerTimes } from "@/data/prayer-times";
import { PRAYERS, type Prayer } from "@/domain/prayers";
import type { DayEntries } from "@/domain/status";
import { PRAYER_NAMES, markColor, markLabel } from "@/ui/labels";

interface Props {
  entries: DayEntries;
  times?: PrayerTimes;
  /** Tap: move to the next status. */
  onCycle(prayer: Prayer): void;
  /** Long-press: clear the mark. */
  onClear(prayer: Prayer): void;
}

/** The five prayer rows for one day. Used for today and for editing a past day. */
export function DayEditor({ entries, times, onCycle, onClear }: Props) {
  return (
    <View style={styles.list}>
      {PRAYERS.map((prayer) => {
        const mark = entries[prayer] ?? null;
        return (
          <Pressable
            key={prayer}
            accessibilityRole="button"
            accessibilityLabel={`${PRAYER_NAMES[prayer]}: ${markLabel(mark)}. Tap to change.`}
            onPress={() => onCycle(prayer)}
            onLongPress={() => onClear(prayer)}
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
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
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
  time: { fontSize: 15, opacity: 0.65, marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: "#fff", fontWeight: "600" },
});
