import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/auth.store";
import {
  getDailyChallenges,
  ChallengeScenario,
} from "../../../api/challenges";
import { getProfile } from "../../../api/profile";
import colors from "../../../constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DIFFICULTY_CONFIG: Record<
  string,
  { color: string; glow: string; label: string }
> = {
  easy: { color: "#34C759", glow: "rgba(52, 199, 89, 0.18)", label: "Easy" },
  medium: {
    color: "#FF9500",
    glow: "rgba(255, 149, 0, 0.18)",
    label: "Medium",
  },
  hard: {
    color: colors.primaryRed,
    glow: "rgba(231, 76, 60, 0.18)",
    label: "Hard",
  },
};

// Orb positions: easy top-left, medium top-right (offset lower), hard bottom-center
const ORB_LAYOUT = [
  { top: 0, left: 0 },
  { top: 75, right: 0 },
  { top: 260, alignSelf: "center" as const },
];

const ORB_SIZE = (SCREEN_WIDTH - 48 - 16) / 2;

function ChallengeOrb({
  scenario,
  position,
  delay,
  onPress,
}: {
  scenario: ChallengeScenario;
  position: (typeof ORB_LAYOUT)[number];
  delay: number;
  onPress: () => void;
}) {
  const cfg = DIFFICULTY_CONFIG[scenario.difficulty] ?? {
    color: "#999",
    glow: "rgba(153,153,153,0.15)",
    label: scenario.difficulty,
  };

  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, {
            toValue: -8,
            duration: 2200,
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View
      style={[
        styles.orbWrapper,
        { width: ORB_SIZE, height: ORB_SIZE + 48 },
        position,
        { transform: [{ translateY: float }] },
      ]}
    >
      <Pressable style={styles.orbPressable} onPress={onPress}>
        {/* Outer glow ring */}
        <View
          style={[
            styles.orbGlow,
            {
              width: ORB_SIZE,
              height: ORB_SIZE,
              borderRadius: ORB_SIZE / 2,
              backgroundColor: cfg.glow,
              borderColor: cfg.color,
            },
          ]}
        >
          {/* Inner surface */}
          <View
            style={[
              styles.orbInner,
              {
                width: ORB_SIZE - 20,
                height: ORB_SIZE - 20,
                borderRadius: (ORB_SIZE - 20) / 2,
              },
            ]}
          >
            <Text style={styles.orbTitle} numberOfLines={2}>
              {scenario.title}
            </Text>
            <Text style={styles.orbDescription} numberOfLines={2}>
              {scenario.short_description}
            </Text>
            {scenario.is_premium && (
              <Text style={styles.orbPremium}>PRO</Text>
            )}
          </View>
        </View>

        {/* Difficulty label below orb */}
        <View style={[styles.orbLabel, { borderColor: cfg.color }]}>
          <Text style={[styles.orbLabelText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");

  const {
    data: daily,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["dailyChallenges"],
    queryFn: getDailyChallenges,
    staleTime: 5 * 60 * 1000,
  });

  const error = queryError ? "Could not load daily challenges." : "";

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      try {
        const profileData = await getProfile();
        if (!cancelled) setDisplayName(profileData.display_name);
      } catch {
        // profile name is non-critical, fail silently
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const challenges: ChallengeScenario[] = daily
    ? [daily.easy, daily.medium, daily.hard]
    : [];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(74, 144, 217, 0.2)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={styles.topLeftGlow}
      />
      <LinearGradient
        colors={["rgba(231, 76, 60, 0.2)", "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={styles.topRightGlow}
      />

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require("../../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerText}>
          <Text style={styles.greeting}>
            Hey, {displayName || "Debater"} 👋
          </Text>
          <Text style={styles.subGreeting}>Ready for today's challenges?</Text>
        </View>
      </View>

      {/* Section title */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Daily Challenges</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Today</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {daily && (
        <View style={styles.orbField}>
          {challenges.map((scenario, i) => (
            <ChallengeOrb
              key={scenario.id}
              scenario={scenario}
              position={ORB_LAYOUT[i]}
              delay={i * 700}
              onPress={() =>
                router.push(
                  `/scenario/${scenario.id}?dailyChallengeId=${daily.id}`
                )
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  topLeftGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "70%",
    height: 280,
  },
  topRightGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "70%",
    height: 280,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  subGreeting: {
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    marginTop: 2,
  },

  // Section row
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
  },
  liveText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: colors.primaryRed,
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },

  // Orb field
  orbField: {
    position: "relative",
    width: "100%",
    height: 480,
  },
  orbWrapper: {
    position: "absolute",
    alignItems: "center",
  },
  orbPressable: {
    alignItems: "center",
  },
  orbGlow: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  orbInner: {
    backgroundColor: "rgba(25, 30, 39, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  orbTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 6,
    lineHeight: 18,
  },
  orbDescription: {
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    lineHeight: 14,
  },
  orbPremium: {
    fontSize: 9,
    fontWeight: "700",
    color: "#AF52DE",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  orbLabel: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  orbLabelText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
