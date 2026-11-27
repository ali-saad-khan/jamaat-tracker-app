import { Pressable, StyleSheet, View } from "react-native";

import { Text } from "@/ui/themed";
import { useTheme } from "@/ui/theme";

interface Props<T extends string | number> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange(value: T): void;
}

/** A row of single-choice buttons with a label. */
export function Chips<T extends string | number>({ label, options, value, onChange }: Props<T>) {
  const theme = useTheme();
  return (
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={String(o.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(o.value)}
              style={[
                styles.chip,
                { borderColor: theme.inputBorder },
                selected && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
            >
              <Text
                style={[styles.chipText, selected && { color: theme.onPrimary, fontWeight: "600" }]}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  label: { fontSize: 15, fontWeight: "600" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: { fontSize: 15 },
});
