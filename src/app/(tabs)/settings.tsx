import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";

import {
  CALCULATION_METHODS,
  type Language,
  type ReminderOffset,
  type School,
  type StreakTarget,
  type ThemeChoice,
} from "@/data/settings";
import { PRAYERS } from "@/domain/prayers";
import { useToday } from "@/hooks/use-today";
import { requestReminderPermission } from "@/services/reminders";
import { useI18n } from "@/state/i18n";
import { usePrayerTimes } from "@/state/prayer-times";
import { useSettings } from "@/state/settings";
import { Chips } from "@/ui/chips";
import { useTheme } from "@/ui/theme";
import { Text } from "@/ui/themed";

export default function SettingsScreen() {
  const { ready } = useSettings();
  // Wait for the saved settings so the text fields start with the right values.
  return ready ? <SettingsForm /> : null;
}

function SettingsForm() {
  const { settings, update } = useSettings();
  const { t } = useI18n();
  const theme = useTheme();
  const { days, status, error } = usePrayerTimes();
  const today = useToday();
  const [city, setCity] = useState(settings.city);
  const [country, setCountry] = useState(settings.country);
  const [permissionNote, setPermissionNote] = useState<string | null>(null);

  const times = days[today];
  const canSave =
    (city.trim() !== settings.city || country.trim() !== settings.country) &&
    city.trim() !== "" &&
    country.trim() !== "";

  const toggleReminders = async (on: boolean) => {
    setPermissionNote(null);
    if (on && !(await requestReminderPermission())) {
      setPermissionNote(t("settings.blocked"));
      return;
    }
    await update({ remindersEnabled: on });
  };

  const input = [styles.input, { borderColor: theme.inputBorder, color: theme.text }];

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>{t("settings.location")}</Text>
      <TextInput
        style={input}
        value={city}
        onChangeText={setCity}
        placeholder={t("settings.city")}
        placeholderTextColor={theme.subtext}
        accessibilityLabel={t("settings.city")}
        autoCapitalize="words"
      />
      <TextInput
        style={input}
        value={country}
        onChangeText={setCountry}
        placeholder={t("settings.country")}
        placeholderTextColor={theme.subtext}
        accessibilityLabel={t("settings.country")}
        autoCapitalize="words"
      />
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSave }}
        disabled={!canSave}
        onPress={() => void update({ city: city.trim(), country: country.trim() })}
        style={[styles.button, { backgroundColor: theme.primary }, !canSave && styles.buttonOff]}
      >
        <Text style={[styles.buttonText, { color: theme.onPrimary }]}>{t("settings.save")}</Text>
      </Pressable>

      <Chips
        label={t("settings.method")}
        options={CALCULATION_METHODS.map((m) => ({ value: m.id, label: m.name }))}
        value={settings.method}
        onChange={(method) => void update({ method })}
      />
      <Chips<School>
        label={t("settings.asr")}
        options={[
          { value: 1, label: t("settings.hanafi") },
          { value: 0, label: t("settings.shafi") },
        ]}
        value={settings.school}
        onChange={(school) => void update({ school })}
      />

      <View
        style={[styles.card, { borderColor: theme.border, backgroundColor: theme.card }]}
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.cardTitle}>
          {t("settings.todayIn", { city: settings.city, country: settings.country })}
        </Text>
        {status === "loading" && <Text>{t("settings.checking")}</Text>}
        {times &&
          PRAYERS.map((p) => (
            <Text key={p}>
              {t(`prayer.${p}`)}: {times[p]}
            </Text>
          ))}
        {status === "stale" && <Text style={{ color: theme.warn }}>{t("settings.saved")}</Text>}
        {status === "unavailable" && (
          <Text style={{ color: theme.warn }}>
            {t(error === "city_not_found" ? "settings.cityNotFound" : "settings.noConnection")}
          </Text>
        )}
      </View>

      <Text style={styles.heading}>{t("settings.reminders")}</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t("settings.remindMe")}</Text>
        <Switch
          value={settings.remindersEnabled}
          onValueChange={(on) => void toggleReminders(on)}
          accessibilityLabel={t("settings.remindMe")}
        />
      </View>
      {permissionNote && <Text style={{ color: theme.warn }}>{permissionNote}</Text>}
      {settings.remindersEnabled && (
        <Chips<ReminderOffset>
          label={t("settings.offsetLabel")}
          options={[
            { value: 0, label: t("settings.at") },
            { value: 5, label: t("settings.before", { n: 5 }) },
            { value: 10, label: t("settings.before", { n: 10 }) },
            { value: 15, label: t("settings.before", { n: 15 }) },
          ]}
          value={settings.reminderOffsetMinutes}
          onChange={(reminderOffsetMinutes) => void update({ reminderOffsetMinutes })}
        />
      )}

      <Text style={styles.heading}>{t("settings.streak")}</Text>
      <Chips<StreakTarget>
        label={t("settings.streakLabel")}
        options={[
          { value: 5, label: t("settings.streak5") },
          { value: 4, label: t("settings.streak4") },
          { value: 3, label: t("settings.streak3") },
        ]}
        value={settings.streakTarget}
        onChange={(streakTarget) => void update({ streakTarget })}
      />

      <Text style={styles.heading}>{t("settings.appearance")}</Text>
      <Chips<Language>
        label={t("settings.language")}
        options={[
          { value: "en", label: "English" },
          { value: "ur", label: "اردو" },
        ]}
        value={settings.language}
        onChange={(language) => void update({ language })}
      />
      <Chips<ThemeChoice>
        label={t("settings.theme")}
        options={[
          { value: "system", label: t("settings.themeSystem") },
          { value: "light", label: t("settings.themeLight") },
          { value: "dark", label: t("settings.themeDark") },
        ]}
        value={settings.theme}
        onChange={(theme_) => void update({ theme: theme_ })}
      />

      <Text style={[styles.footnote, { color: theme.subtext }]}>{t("settings.zoneNote")}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14 },
  heading: { fontSize: 22, fontWeight: "700", marginTop: 6 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontSize: 16 },
  button: { minHeight: 48, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  buttonOff: { opacity: 0.4 },
  buttonText: { fontSize: 16, fontWeight: "600" },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, padding: 14, gap: 4 },
  cardTitle: { fontWeight: "700", marginBottom: 4 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  switchLabel: { fontSize: 16, flex: 1 },
  footnote: { fontSize: 12 },
});
