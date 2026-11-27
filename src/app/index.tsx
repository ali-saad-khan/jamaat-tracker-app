import { StyleSheet, Text, View } from "react-native";

import { PRAYERS } from "@/domain/prayers";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jamaat Tracker</Text>
      <Text style={styles.subtitle}>Foundation ready. {PRAYERS.length} prayers to track.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  title: { fontSize: 28, fontWeight: "700" },
  subtitle: { fontSize: 16, opacity: 0.7 },
});
