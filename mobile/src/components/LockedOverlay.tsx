import { useEffect, useRef } from "react";
import { View, Text, Image, Pressable, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../constants/colors";

const madRedGuy = require("../../assets/images/madRedGuy.png");

type Props = {
  onUpgrade: () => void;
};

export default function LockedOverlay({ onUpgrade }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Faded preview of what coach analysis looks like */}
      <View style={styles.preview} pointerEvents="none">
        <View style={styles.fakeCard}>
          <View style={styles.fakeLine} />
          <View style={[styles.fakeLine, { width: "75%" }]} />
          <View style={[styles.fakeLine, { width: "90%" }]} />
        </View>
        <View style={styles.fakeCard}>
          <View style={[styles.fakeLine, { width: "50%" }]} />
          <View style={styles.fakeLine} />
          <View style={[styles.fakeLine, { width: "65%" }]} />
          <View style={[styles.fakeLine, { width: "80%" }]} />
        </View>
      </View>

      {/* Gradient fade covering preview */}
      <LinearGradient
        colors={["transparent", colors.backgroundPrimary]}
        style={styles.gradient}
      />

      {/* Lock card */}
      <View style={styles.card}>
        <Image source={madRedGuy} style={styles.mascot} resizeMode="contain" />
        <Text style={styles.mascotMessage}>You're missing something.</Text>
        <Text style={styles.cardTitle}>Unlock full feedback</Text>
        <Text style={styles.cardSubtitle}>
          See your tone, opponent analysis, key moments, and winning moves.
        </Text>
        <Pressable style={styles.upgradeButton} onPress={onUpgrade}>
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  preview: {
    paddingHorizontal: 20,
    paddingTop: 60,
    gap: 14,
    opacity: 0.18,
  },
  fakeCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  fakeLine: {
    height: 10,
    width: "100%",
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 80,
    height: 220,
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundPrimary,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  mascot: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  mascotMessage: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  upgradeButton: {
    backgroundColor: "#AF52DE",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  upgradeButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
