import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { migrate } from "@/data/migrations";
import { configureNotificationHandler } from "@/services/reminders";
import { PrayerTimesProvider } from "@/state/prayer-times";
import { useI18n } from "@/state/i18n";
import { SettingsProvider } from "@/state/settings";
import { useTheme } from "@/ui/theme";
import { ErrorBoundary } from "@/ui/error-boundary";

configureNotificationHandler();

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}

/** Applies the theme and the writing direction to the whole app. */
function Shell() {
  const theme = useTheme();
  const { isRTL } = useI18n();
  return (
    <View style={{ flex: 1, direction: isRTL ? "rtl" : "ltr", backgroundColor: theme.background }}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <SQLiteProvider databaseName="jamaat.db" onInit={migrate} useSuspense>
          <SettingsProvider>
            <PrayerTimesProvider>
              <Shell />
            </PrayerTimesProvider>
          </SettingsProvider>
        </SQLiteProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
