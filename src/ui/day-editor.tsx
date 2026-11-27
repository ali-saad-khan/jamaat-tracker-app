import { Pressable, StyleSheet, View } from "react-native";

import type { PrayerTimes } from "@/data/prayer-times";
import { PRAYERS, type Prayer } from "@/domain/prayers";
import type { DayEntries } from "@/domain/status";
import { useI18n } from "@/state/i18n";
import { markColor } from "@/ui/labels";
import { useTheme } from "@/ui/theme";
import { Text } from "@/ui/themed";

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
  const { t } = useI18n();
  const theme = useTheme();
  return (
    <View style={styles.list}>
      {PRAYERS.map((prayer) => {
        const mark = entries[prayer] ?? null;
        const statusLabel = t(mark ? `status.${mark}` : "status.none");
        return (
          <Pressable
            key={prayer}
            accessibilityRole="button"
            accessibilityLabel={t("row.a11y", {
              prayer: t(`prayer.${prayer}`),
              status: statusLabel,
            })}
            onPress={() => onCycle(prayer)}
            onLongPress={() => onClear(prayer)}
            style={({ pressed }) => [
              styles.row,
              { borderColor: theme.border, backgroundColor: theme.card },
              pressed && styles.rowPressed,
            ]}
          >
            <View>
              <Text style={styles.prayer}>{t(`prayer.${prayer}`)}</Text>
              {times && (
                <Text style={[styles.time, { color: theme.subtext }]}>{times[prayer]}</Text>
              )}
            </View>
            <View style={[styles.badge, { backgroundColor: markColor(mark) }]}>
              <Text style={styles.badgeText}>{statusLabel}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowPressed: { opacity: 0.6 },
  prayer: { fontSize: 20, fontWeight: "600" },
  time: { fontSize: 15, marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  badgeText: { color: "#ffffff", fontWeight: "600" },
});
