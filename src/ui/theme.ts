import { useColorScheme } from "react-native";

import { useSettings } from "@/state/settings";

export interface Theme {
  dark: boolean;
  background: string;
  text: string;
  subtext: string;
  border: string;
  card: string;
  track: string;
  primary: string;
  onPrimary: string;
  warn: string;
  inputBorder: string;
}

export const LIGHT: Theme = {
  dark: false,
  background: "#ffffff",
  text: "#14181b",
  subtext: "#5b6168",
  border: "#c4c7cc",
  card: "#f6f7f8",
  track: "#e7e9ec",
  primary: "#1b8a5a",
  onPrimary: "#ffffff",
  warn: "#b3261e",
  inputBorder: "#8a9097",
};

export const DARK: Theme = {
  dark: true,
  background: "#0f1315",
  text: "#eceff1",
  subtext: "#a3abb2",
  border: "#3a4147",
  card: "#171c1f",
  track: "#262c30",
  primary: "#2fb57d",
  onPrimary: "#06130d",
  warn: "#ff8a80",
  inputBorder: "#6b737a",
};

export function useTheme(): Theme {
  const { settings } = useSettings();
  const system = useColorScheme();
  const dark = settings.theme === "dark" || (settings.theme === "system" && system === "dark");
  return dark ? DARK : LIGHT;
}
