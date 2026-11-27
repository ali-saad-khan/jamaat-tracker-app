import { ScrollView, StyleSheet, Text, View } from "react-native";

import { weekdayIndex } from "@/domain/dates";
import type { RangeStats } from "@/domain/stats";
import { useStats } from "@/hooks/use-stats";
import { useToday } from "@/hooks/use-today";
import { useSettings } from "@/state/settings";
import { STATUS_COLORS } from "@/ui/labels";

const DAY_LETTERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const BAR_HEIGHT = 120;

function Card({ title, value, caption }: { title: string; value: string; caption?: string }) {
  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${title}: ${value}. ${caption ?? ""}`}
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {caption ? <Text style={styles.cardCaption}>{caption}</Text> : null}
    </View>
  );
}

function rangeCaption(s: RangeStats): string {
  return `${s.jamaat} in congregation · ${s.alone} alone · ${s.missed} missed · ${s.unmarked} not marked`;
}

export default function StatsScreen() {
  const today = useToday();
  const { settings } = useSettings();
  const stats = useStats(today, settings.streakTarget);

  if (!stats) return null;
  const target = settings.streakTarget;
  const unit = (n: number) => (n === 1 ? "day" : "days");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.pair}>
        <Card title="Current streak" value={`${stats.current} ${unit(stats.current)}`} />
        <Card title="Best streak" value={`${stats.best} ${unit(stats.best)}`} />
      </View>
      <Text style={styles.footnote}>
        A day counts when {target === 5 ? "all 5" : `at least ${target}`} prayers were in
        congregation. Change this in Settings.
      </Text>

      <Text style={styles.heading}>Last 7 days</Text>
      <View
        style={styles.chart}
        accessible
        accessibilityLabel={`Prayers in congregation per day: ${stats.bars.map((b) => b.jamaat).join(", ")}`}
      >
        {stats.bars.map((b) => (
          <View key={b.date} style={styles.barColumn}>
            <Text style={styles.barCount}>{b.jamaat}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  { height: (b.jamaat / 5) * BAR_HEIGHT, backgroundColor: STATUS_COLORS.jamaat },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{DAY_LETTERS[weekdayIndex(b.date)]}</Text>
          </View>
        ))}
      </View>

      <Card
        title="This week"
        value={`${stats.week.jamaatPercent}% in congregation`}
        caption={rangeCaption(stats.week)}
      />
      <Card
        title="Last 30 days"
        value={`${stats.month.jamaatPercent}% in congregation`}
        caption={rangeCaption(stats.month)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14 },
  pair: { flexDirection: "row", gap: 12 },
  card: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#c4c7cc",
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  cardTitle: { fontSize: 13, opacity: 0.7 },
  cardValue: { fontSize: 22, fontWeight: "700" },
  cardCaption: { fontSize: 12, opacity: 0.65 },
  footnote: { fontSize: 12, opacity: 0.6 },
  heading: { fontSize: 18, fontWeight: "700" },
  chart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 8 },
  barColumn: { flex: 1, alignItems: "center", gap: 4 },
  barCount: { fontSize: 12 },
  barTrack: {
    height: BAR_HEIGHT,
    width: "100%",
    justifyContent: "flex-end",
    backgroundColor: "#e7e9ec",
    borderRadius: 8,
    overflow: "hidden",
  },
  bar: { width: "100%", borderRadius: 8 },
  barLabel: { fontSize: 12, opacity: 0.7 },
});
