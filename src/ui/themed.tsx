import { Text as RNText, type TextProps } from "react-native";

import { useTheme } from "@/ui/theme";

/** Text that follows the light or dark theme unless a colour is given. */
export function Text({ style, ...props }: TextProps) {
  const theme = useTheme();
  return <RNText {...props} style={[{ color: theme.text }, style]} />;
}
