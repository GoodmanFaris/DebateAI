import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../../store/auth.store";
import { usePurchase } from "../../../hooks/usePurchase";
import colors from "../../../constants/colors";

const together = require("../../../../assets/images/toghetherGuys.png");

const FEATURES = [
  { icon: "analytics-outline" as const, label: "AI Coach feedback after every session" },
  { icon: "time-outline" as const, label: "Full session history" },
  { icon: "flash-outline" as const, label: "Tone, opponent & key moment analysis" },
  { icon: "trophy-outline" as const, label: "Winning move recommendations" },
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isPremium = useAuthStore((s) => s.user?.is_premium ?? false);
  const { purchase, loading, error } = usePurchase();

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  // Navigate back automatically after successful purchase
  useEffect(() => {
    if (isPremium) router.back();
  }, [isPremium]);

  function handlePressIn() {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }

  function handlePressOut() {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(175,82,222,0.2)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.45 }}
        style={styles.topGlow}
      />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Mascot */}
          <View style={styles.mascotRow}>
            <Image source={together} style={styles.mascot} resizeMode="contain" />
            <Text style={styles.mascotMessage}>Stop holding back.</Text>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Unlock full potential</Text>
          <Text style={styles.subtitle}>Improve faster with AI coaching</Text>

          {/* Feature list */}
          <View style={styles.features}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon} size={16} color="#AF52DE" />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>$4.99</Text>
            <Text style={styles.pricePer}> / month</Text>
          </View>
          <Text style={styles.priceNote}>Cancel anytime via Google Play</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        {/* Fixed CTA */}
        <View style={[styles.cta, { paddingBottom: insets.bottom + 16 }]}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              style={[styles.ctaButton, loading && styles.ctaButtonDisabled]}
              onPress={purchase}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.ctaButtonText}>Upgrade to Premium</Text>
              )}
            </Pressable>
          </Animated.View>

          <Pressable style={styles.laterButton} onPress={() => router.back()} disabled={loading}>
            <Text style={styles.laterText}>Maybe later</Text>
          </Pressable>
        </View>
      </Animated.View>
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
    height: 320,
  },
  content: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingTop: 64,
    alignItems: "center",
  },

  // Mascot
  mascotRow: {
    alignItems: "center",
    marginBottom: 28,
  },
  mascot: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  mascotMessage: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    fontStyle: "italic",
  },

  // Heading
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    marginBottom: 36,
    lineHeight: 22,
  },

  // Features
  features: {
    width: "100%",
    gap: 14,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(175,82,222,0.1)",
    borderWidth: 1,
    borderColor: "rgba(175,82,222,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  featureLabel: {
    flex: 1,
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
  },

  // Price
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  pricePer: {
    fontSize: 16,
    color: "rgba(255,255,255,0.4)",
  },
  priceNote: {
    fontSize: 12,
    color: "rgba(255,255,255,0.25)",
    marginBottom: 20,
  },

  error: {
    color: colors.primaryRed,
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },

  // CTA
  cta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "rgba(25,30,39,0.97)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    gap: 4,
  },
  ctaButton: {
    backgroundColor: "#AF52DE",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaButtonDisabled: {
    opacity: 0.5,
  },
  ctaButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  laterButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  laterText: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
  },
});
