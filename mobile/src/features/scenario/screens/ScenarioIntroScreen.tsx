import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getScenario, ScenarioDetail } from "../../../api/scenarios";
import { startSession } from "../../../api/sessions";
import colors from "../../../constants/colors";

const DIFFICULTY_CONFIG: Record<string, { color: string; label: string }> = {
  easy: { color: "#34C759", label: "Easy" },
  medium: { color: "#FF9500", label: "Medium" },
  hard: { color: colors.primaryRed, label: "Hard" },
};

export default function ScenarioIntroScreen({
  scenarioId,
  dailyChallengeId,
}: {
  scenarioId: number;
  dailyChallengeId?: number;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchScenario() {
      try {
        const data = await getScenario(scenarioId);
        if (!cancelled) {
          setScenario(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load scenario details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchScenario();
    return () => {
      cancelled = true;
    };
  }, [scenarioId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  if (error || !scenario) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Scenario not found."}</Text>
      </View>
    );
  }

  const diff = DIFFICULTY_CONFIG[scenario.difficulty] ?? {
    color: "#999",
    label: scenario.difficulty,
  };

  async function handleStart() {
    if (!scenario) return;
    setStarting(true);
    try {
      const session = await startSession(scenario.id, dailyChallengeId);
      router.push(
        `/session/${session.session_id}?title=${encodeURIComponent(scenario.title)}&openingContext=${encodeURIComponent(session.opening_context)}&maxTurns=${session.max_turns}`
      );
    } catch {
      Alert.alert("Error", "Could not start session. Please try again.");
    } finally {
      setStarting(false);
    }
  }

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

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>
            <Text style={styles.appNameBlue}>Debate</Text>
            <Text style={styles.appNameRed}>AI</Text>
          </Text>
        </View>

        {/* Badge row */}
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: `${diff.color}22`, borderColor: diff.color },
            ]}
          >
            <Text style={[styles.difficultyText, { color: diff.color }]}>
              {diff.label}
            </Text>
          </View>
          {scenario.is_premium && (
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>PRO</Text>
            </View>
          )}
        </View>

        {/* Title + description */}
        <Text style={styles.title}>{scenario.title}</Text>
        <Text style={styles.description}>{scenario.short_description}</Text>

        {/* Context section */}
        {scenario.opening_context ? (
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Context</Text>
            <Text style={styles.contextText}>{scenario.opening_context}</Text>
          </View>
        ) : null}

        {scenario.full_description ? (
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Background</Text>
            <Text style={styles.contextText}>{scenario.full_description}</Text>
          </View>
        ) : null}

        {/* Info grid */}
        <View style={styles.infoGrid}>
          <InfoCard
            icon="person-outline"
            label="Your Role"
            value={scenario.user_role}
          />
          <InfoCard
            icon="hardware-chip-outline"
            label="AI Role"
            value={scenario.ai_role}
          />
          <InfoCard
            icon="flag-outline"
            label="Goal"
            value={scenario.goal}
          />
          <InfoCard
            icon="chatbubbles-outline"
            label="Max Turns"
            value={String(scenario.max_turns)}
          />
        </View>

        {/* Spacer so content clears the fixed button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed bottom CTA */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.startButton, starting && styles.startButtonDisabled]}
          disabled={starting}
          onPress={handleStart}
        >
          {starting ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.startButtonText}>Start Session</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoCard}>
      <Ionicons
        name={icon}
        size={16}
        color="rgba(255,255,255,0.3)"
        style={{ marginBottom: 6 }}
      />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundPrimary,
  },
  errorText: {
    color: colors.primaryRed,
    fontSize: 14,
    textAlign: "center",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
  },
  logo: {
    width: 28,
    height: 28,
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
  },
  appNameBlue: {
    color: colors.primaryBlue,
  },
  appNameRed: {
    color: colors.primaryRed,
  },

  // Badges
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "700",
  },
  premiumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(175, 82, 222, 0.15)",
    borderWidth: 1,
    borderColor: "#AF52DE",
  },
  premiumText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#AF52DE",
  },

  // Title
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 22,
    marginBottom: 24,
  },

  // Context
  contextCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  contextLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.35)",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  contextText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 21,
  },

  // Info grid
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  infoCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 14,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.3)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    lineHeight: 18,
  },

  // CTA
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 12,
    backgroundColor: "rgba(25, 30, 39, 0.92)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  startButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
  },
});
