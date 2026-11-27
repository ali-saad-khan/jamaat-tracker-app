import { Component, type ReactNode } from "react";
import { Text, View } from "react-native";

interface Props {
  children: ReactNode;
}

/** Shows what went wrong (for example a failed database upgrade) instead of a blank screen. */
export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Something went wrong</Text>
        <Text selectable>{this.state.error.message}</Text>
      </View>
    );
  }
}
