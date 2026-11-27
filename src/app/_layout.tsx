import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { Suspense } from "react";
import { ActivityIndicator, View } from "react-native";

import { migrate } from "@/data/migrations";
import { ErrorBoundary } from "@/ui/error-boundary";

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
          <Stack screenOptions={{ headerShown: false }} />
        </SQLiteProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
