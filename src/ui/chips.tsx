import { Pressable, StyleSheet, Text, View } from "react-native";

interface Props<T extends string | number> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange(value: T): void;
}

/** A row of single-choice buttons with a label. */
export function Chips<T extends string | number>({ label, options, value, onChange }: Props<T>) {
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
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{o.label}</Text>
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
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#9aa0a6",
    alignItems: "center",
    justifyContent: "center",
  },
  chipSelected: { backgroundColor: "#1b8a5a", borderColor: "#1b8a5a" },
  chipText: { fontSize: 15 },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
});
