import { useSQLiteContext } from "expo-sqlite";
import { ScrollView, StyleSheet } from "react-native";

import { setStatus } from "@/data/entries";
import type { Prayer } from "@/domain/prayers";
import { nextStatus, summarizeDay } from "@/domain/status";
import { useEntries } from "@/hooks/use-entries";
import { useToday } from "@/hooks/use-today";
import { useI18n } from "@/state/i18n";
import { usePrayerTimes } from "@/state/prayer-times";
import { DayEditor } from "@/ui/day-editor";
import { useTheme } from "@/ui/theme";
import { Text } from "@/ui/themed";

export default function TodayScreen() {
  const db = useSQLiteContext();
  const { t } = useI18n();
  const theme = useTheme();
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
      <Text style={[styles.summary, { color: theme.subtext }]}>
        {t("today.summary", { ...summary })}
      </Text>
      {status === "stale" && (
        <Text style={[styles.note, { color: theme.warn }]}>{t("times.stale")}</Text>
      )}
      {status === "unavailable" && (
        <Text style={[styles.note, { color: theme.warn }]}>
          {t(error === "city_not_found" ? "times.unavailableCity" : "times.unavailableNetwork")}
        </Text>
      )}
      <DayEditor
        entries={entries}
        times={timeDays[today]}
        onCycle={(p) => void cycle(p)}
        onClear={(p) => void clear(p)}
      />
      <Text style={[styles.hint, { color: theme.subtext }]}>{t("today.hint")}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 12 },
  date: { fontSize: 26, fontWeight: "700" },
  summary: { fontSize: 15 },
  note: { fontSize: 13 },
  hint: { fontSize: 13, marginTop: 4 },
});
