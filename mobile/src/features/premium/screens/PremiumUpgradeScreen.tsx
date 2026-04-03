import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePurchase } from "../../../hooks/usePurchase";
import colors from "../../../constants/colors";

const BENEFITS = [
  { icon: "analytics-outline" as const, text: "Full coach analysis after every session" },
  { icon: "trending-up-outline" as const, text: "Detailed tone and opponent breakdowns" },
  { icon: "flash-outline" as const, text: "Key moments and better response suggestions" },
  { icon: "trophy-outline" as const, text: "Winning move recommendations" },
];

export default function PremiumUpgradeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { purchase, loading, error } = usePurchase();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(175, 82, 222, 0.25)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={styles.topGlow}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color={colors.primaryBlue} />
          <Text style={styles.backLinkText}>Back</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.proBadge}>
            <Ionicons name="diamond" size={14} color="#AF52DE" />
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
          <Text style={styles.heading}>Upgrade to Premium</Text>
          <Text style={styles.subheading}>
            Get the full coaching experience and improve faster.
          </Text>
        </View>

        <View style={styles.benefitsList}>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={b.icon} size={18} color="#AF52DE" />
              </View>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.pricePer}>per month</Text>
          <Text style={styles.priceNote}>Cancel anytime via Google Play</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.subscribeButton, loading && styles.buttonDisabled]}
          onPress={purchase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.subscribeButtonText}>Subscribe — $4.99 / month</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 32,
  },
  backLinkText: {
    color: colors.primaryBlue,
    fontSize: 15,
    fontWeight: "600",
  },
  header: {
    marginBottom: 32,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(175,82,222,0.12)",
    borderWidth: 1,
    borderColor: "rgba(175,82,222,0.4)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 14,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#AF52DE",
    letterSpacing: 0.8,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 22,
  },
  benefitsList: {
    gap: 14,
    marginBottom: 28,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  benefitIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(175,82,222,0.1)",
    borderWidth: 1,
    borderColor: "rgba(175,82,222,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  benefitText: {
    flex: 1,
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 21,
  },
  priceCard: {
    backgroundColor: "rgba(175,82,222,0.08)",
    borderWidth: 1,
    borderColor: "rgba(175,82,222,0.25)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  price: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  pricePer: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },
  priceNote: {
    fontSize: 12,
    color: "rgba(255,255,255,0.25)",
    marginTop: 8,
  },
  error: {
    color: colors.primaryRed,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  cta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "rgba(25,30,39,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  subscribeButton: {
    backgroundColor: "#AF52DE",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  subscribeButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
