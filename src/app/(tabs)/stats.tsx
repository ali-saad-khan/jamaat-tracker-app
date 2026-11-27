import { ScrollView, StyleSheet, View } from "react-native";

import { weekdayIndex } from "@/domain/dates";
import type { RangeStats } from "@/domain/stats";
import { useStats } from "@/hooks/use-stats";
import { useToday } from "@/hooks/use-today";
import { useSettings } from "@/state/settings";
import { useI18n } from "@/state/i18n";
import { STATUS_COLORS } from "@/ui/labels";
import { useTheme } from "@/ui/theme";
import { Text } from "@/ui/themed";

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

export default function StatsScreen() {
  const today = useToday();
  const { t, list } = useI18n();
  const theme = useTheme();
  const { settings } = useSettings();
  const stats = useStats(today, settings.streakTarget);

  if (!stats) return null;
  const target = settings.streakTarget;
  const unit = (n: number) => t(n === 1 ? "stats.day" : "stats.days");
  const dayNames = list("weekdaysChart");
  const caption = (r: RangeStats) =>
    t("stats.caption", {
      jamaat: r.jamaat,
      alone: r.alone,
      missed: r.missed,
      unmarked: r.unmarked,
    });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.pair}>
        <Card title={t("stats.current")} value={`${stats.current} ${unit(stats.current)}`} />
        <Card title={t("stats.best")} value={`${stats.best} ${unit(stats.best)}`} />
      </View>
      <Text style={[styles.footnote, { color: theme.subtext }]}>
        {target === 5 ? t("stats.footnoteAll") : t("stats.footnoteSome", { n: target })}
      </Text>

      <Text style={styles.heading}>{t("stats.last7")}</Text>
      <View
        style={styles.chart}
        accessible
        accessibilityLabel={t("stats.chartA11y", {
          counts: stats.bars.map((b) => b.jamaat).join(", "),
        })}
      >
        {stats.bars.map((b) => (
          <View key={b.date} style={styles.barColumn}>
            <Text style={styles.barCount}>{b.jamaat}</Text>
            <View style={[styles.barTrack, { backgroundColor: theme.track }]}>
              <View
                style={[
                  styles.bar,
                  { height: (b.jamaat / 5) * BAR_HEIGHT, backgroundColor: STATUS_COLORS.jamaat },
                ]}
              />
            </View>
            <Text style={[styles.barLabel, { color: theme.subtext }]}>
              {dayNames[weekdayIndex(b.date)]}
            </Text>
          </View>
        ))}
      </View>

      <Card
        title={t("stats.week")}
        value={t("stats.percent", { n: stats.week.jamaatPercent })}
        caption={caption(stats.week)}
      />
      <Card
        title={t("stats.last30")}
        value={t("stats.percent", { n: stats.month.jamaatPercent })}
        caption={caption(stats.month)}
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
  cardTitle: { fontSize: 13 },
  cardValue: { fontSize: 22, fontWeight: "700" },
  cardCaption: { fontSize: 12 },
  footnote: { fontSize: 12 },
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
  barLabel: { fontSize: 11 },
});
