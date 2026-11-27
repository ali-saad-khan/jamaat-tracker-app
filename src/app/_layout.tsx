import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";

import { migrate } from "@/data/migrations";
import { configureNotificationHandler } from "@/services/reminders";
import { PrayerTimesProvider } from "@/state/prayer-times";
import { SettingsProvider } from "@/state/settings";
import { ErrorBoundary } from "@/ui/error-boundary";

configureNotificationHandler();

function Loading() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
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
              <Stack screenOptions={{ headerShown: false }} />
            </PrayerTimesProvider>
          </SettingsProvider>
        </SQLiteProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
