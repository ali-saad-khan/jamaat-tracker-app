import { Tabs } from "expo-router";
import { Text as RNText } from "react-native";

import { useI18n } from "@/state/i18n";
import { useTheme } from "@/ui/theme";

const icon = (glyph: string) =>
  function TabIcon() {
    return (
      <RNText accessibilityElementsHidden importantForAccessibility="no" style={{ fontSize: 20 }}>
        {glyph}
      </RNText>
    );
  };

export default function TabLayout() {
  const { t } = useI18n();
  const theme = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("tab.today"), tabBarIcon: icon("🕌") }} />
      <Tabs.Screen name="history" options={{ title: t("tab.history"), tabBarIcon: icon("📅") }} />
      <Tabs.Screen name="stats" options={{ title: t("tab.stats"), tabBarIcon: icon("📊") }} />
      <Tabs.Screen name="settings" options={{ title: t("tab.settings"), tabBarIcon: icon("⚙️") }} />
    </Tabs>
  );
}
