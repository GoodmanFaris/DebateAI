import { View, Text, StyleSheet } from "react-native";

export default function PremiumBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>PRO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "rgba(175,82,222,0.15)",
    borderWidth: 1,
    borderColor: "rgba(175,82,222,0.5)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    shadowColor: "#AF52DE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: 10,
    fontWeight: "700",
    color: "#AF52DE",
    letterSpacing: 0.8,
  },
});
