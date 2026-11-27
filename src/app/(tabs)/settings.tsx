import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import {
  CALCULATION_METHODS,
  type ReminderOffset,
  type School,
  type StreakTarget,
} from "@/data/settings";
import { PRAYERS } from "@/domain/prayers";
import { useToday } from "@/hooks/use-today";
import { requestReminderPermission } from "@/services/reminders";
import { usePrayerTimes } from "@/state/prayer-times";
import { useSettings } from "@/state/settings";
import { Chips } from "@/ui/chips";
import { PRAYER_NAMES } from "@/ui/labels";

export default function SettingsScreen() {
  const { ready } = useSettings();
  // Wait for the saved settings so the text fields start with the right values.
  return ready ? <SettingsForm /> : null;
}

function SettingsForm() {
  const { settings, update } = useSettings();
  const { days, status, error } = usePrayerTimes();
  const today = useToday();
  const [city, setCity] = useState(settings.city);
  const [country, setCountry] = useState(settings.country);
  const [permissionNote, setPermissionNote] = useState<string | null>(null);

  const times = days[today];
  const locationChanged = city.trim() !== settings.city || country.trim() !== settings.country;

  const toggleReminders = async (on: boolean) => {
    setPermissionNote(null);
    if (on && !(await requestReminderPermission())) {
      setPermissionNote(
        "Notifications are blocked. Allow them for this app in the phone settings.",
      );
      return;
    }
    await update({ remindersEnabled: on });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Location</Text>
      <TextInput
        style={styles.input}
        value={city}
        onChangeText={setCity}
        placeholder="City"
        accessibilityLabel="City"
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        value={country}
        onChangeText={setCountry}
        placeholder="Country"
        accessibilityLabel="Country"
        autoCapitalize="words"
      />
      <Pressable
        accessibilityRole="button"
        disabled={!locationChanged || !city.trim() || !country.trim()}
        onPress={() => void update({ city: city.trim(), country: country.trim() })}
        style={[
          styles.button,
          (!locationChanged || !city.trim() || !country.trim()) && styles.buttonOff,
        ]}
      >
        <Text style={styles.buttonText}>Save and check times</Text>
      </Pressable>

      <Chips
        label="Calculation method"
        options={CALCULATION_METHODS.map((m) => ({ value: m.id, label: m.name }))}
        value={settings.method}
        onChange={(method) => void update({ method })}
      />
      <Chips<School>
        label="Asr calculation"
        options={[
          { value: 1, label: "Hanafi (later)" },
          { value: 0, label: "Shafi (earlier)" },
        ]}
        value={settings.school}
        onChange={(school) => void update({ school })}
      />

      <View style={styles.card} accessibilityLiveRegion="polite">
        <Text style={styles.cardTitle}>
          Today in {settings.city}, {settings.country}
        </Text>
        {status === "loading" && <Text>Checking…</Text>}
        {times &&
          PRAYERS.map((p) => (
            <Text key={p}>
              {PRAYER_NAMES[p]}: {times[p]}
            </Text>
          ))}
        {status === "stale" && <Text style={styles.warn}>Saved times (could not refresh).</Text>}
        {status === "unavailable" && (
          <Text style={styles.warn}>
            {error === "city_not_found"
              ? "City not found. Check the spelling and country."
              : "Could not load times. Check your connection."}
          </Text>
        )}
      </View>

      <Text style={styles.heading}>Reminders</Text>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Remind me at prayer time</Text>
        <Switch
          value={settings.remindersEnabled}
          onValueChange={(on) => void toggleReminders(on)}
          accessibilityLabel="Remind me at prayer time"
        />
      </View>
      {permissionNote && <Text style={styles.warn}>{permissionNote}</Text>}
      {settings.remindersEnabled && (
        <Chips<ReminderOffset>
          label="Remind me"
          options={[
            { value: 0, label: "At prayer time" },
            { value: 5, label: "5 min before" },
            { value: 10, label: "10 min before" },
            { value: 15, label: "15 min before" },
          ]}
          value={settings.reminderOffsetMinutes}
          onChange={(reminderOffsetMinutes) => void update({ reminderOffsetMinutes })}
        />
      )}
      <Text style={styles.heading}>Streak</Text>
      <Chips<StreakTarget>
        label="A day counts toward the streak when"
        options={[
          { value: 5, label: "All 5 in congregation" },
          { value: 4, label: "4 or more" },
          { value: 3, label: "3 or more" },
        ]}
        value={settings.streakTarget}
        onChange={(streakTarget) => void update({ streakTarget })}
      />
      <Text style={styles.footnote}>
        Times use this phone&apos;s time zone. If you travel, they may be off until you change the
        city.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 14 },
  heading: { fontSize: 22, fontWeight: "700", marginTop: 6 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#9aa0a6",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: "#1b8a5a",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonOff: { opacity: 0.4 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#c4c7cc",
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  cardTitle: { fontWeight: "700", marginBottom: 4 },
  warn: { color: "#c0392b" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
  },
  switchLabel: { fontSize: 16, flex: 1 },
  footnote: { fontSize: 12, opacity: 0.6 },
});
