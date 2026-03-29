import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getSessionResult, SessionResultResponse } from "../../../api/sessions";
import { useAuthStore } from "../../../store/auth.store";
import colors from "../../../constants/colors";
import MascotTutorial from "../../../components/MascotTutorial";
import MascotBubble from "../../../components/MascotBubble";

const blueGuy      = require("../../../../assets/images/blueGuy.png");
const surprisedBlue = require("../../../../assets/images/SuprisedBlueGuy.png");
const redGuy       = require("../../../../assets/images/redHuy.png");
import { useTutorialStore } from "../../../store/tutorial.store";

const DIFFICULTY_CONFIG: Record<string, { color: string; label: string }> = {
  easy: { color: "#34C759", label: "Easy" },
  medium: { color: "#FF9500", label: "Medium" },
  hard: { color: colors.primaryRed, label: "Hard" },
};

const OUTCOME_CONFIG: Record<
  string,
  { color: string; label: string; icon: string }
> = {
  success: { color: "#34C759", label: "Success", icon: "checkmark-circle" },
  partial: { color: "#FF9500", label: "Partial", icon: "remove-circle" },
  fail: { color: colors.primaryRed, label: "Failed", icon: "close-circle" },
};

export default function SessionResultScreen({
  sessionId,
}: {
  sessionId: number;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isPremium = useAuthStore((s) => s.user?.is_premium ?? false);
  const tutorialActive = useTutorialStore((s) => s.tutorialActive);
  const tutorialStep = useTutorialStore((s) => s.tutorialStep);
  const nextStep = useTutorialStore((s) => s.nextStep);
  const goToStep = useTutorialStore((s) => s.goToStep);
  const [result, setResult] = useState<SessionResultResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchResult() {
      try {
        const data = await getSessionResult(sessionId);
        if (!cancelled) {
          setResult(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load session results.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchResult();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <MascotBubble
          mascot={blueGuy}
          message="Thinking..."
          size={80}
          animation="pulse"
        />
      </View>
    );
  }

  if (error || !result) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Results not found."}</Text>
        <Pressable
          style={styles.errorButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.errorButtonText}>Go Home</Text>
        </Pressable>
      </View>
    );
  }

  const diff = DIFFICULTY_CONFIG[result.difficulty] ?? {
    color: "#999",
    label: result.difficulty,
  };
  const outcome = result.outcome
    ? (OUTCOME_CONFIG[result.outcome] ?? {
        color: "#999",
        label: result.outcome,
        icon: "help-circle",
      })
    : null;

  const scorePercent =
    result.total_score != null ? Math.min(result.total_score, 100) / 100 : 0;
  const barColor = outcome?.color ?? colors.primaryBlue;

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
        <Text style={styles.eyebrow}>Session Result</Text>
        <Text style={styles.scenarioTitle}>{result.scenario_title}</Text>
        <View
          style={[
            styles.difficultyBadge,
            {
              backgroundColor: `${diff.color}22`,
              borderColor: diff.color,
            },
          ]}
        >
          <Text style={[styles.difficultyText, { color: diff.color }]}>
            {diff.label}
          </Text>
        </View>

        {/* Outcome reaction mascot */}
        <OutcomeMascot outcome={result.outcome} />

        {/* Score card */}
        <View style={styles.scoreSection}>
          {outcome && (
            <View style={styles.outcomeRow}>
              <Ionicons
                name={outcome.icon as any}
                size={18}
                color={outcome.color}
              />
              <Text style={[styles.outcomeLabel, { color: outcome.color }]}>
                {outcome.label}
              </Text>
            </View>
          )}

          <Text style={styles.scoreValue}>
            {result.total_score != null
              ? `${Math.round(result.total_score)}`
              : "—"}
            <Text style={styles.scoreMax}>/100</Text>
          </Text>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${scorePercent * 100}%`,
                  backgroundColor: barColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Summary */}
        {result.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.sectionText}>{result.summary}</Text>
          </View>
        ) : null}

        {/* Pros / Cons */}
        {(result.pros || result.cons) ? (
          <View style={styles.prosConsRow}>
            {result.pros ? (
              <View style={styles.prosConsCol}>
                <Text style={[styles.sectionTitle, { color: "#34C759" }]}>Pros</Text>
                <Text style={[styles.sectionText, { color: "#34C759" }]}>{result.pros}</Text>
              </View>
            ) : null}
            {result.cons ? (
              <View style={styles.prosConsCol}>
                <Text style={[styles.sectionTitle, { color: colors.primaryRed }]}>Cons</Text>
                <Text style={[styles.sectionText, { color: colors.primaryRed }]}>{result.cons}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Tips */}
        {result.improvement_tips ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: "#FF9500" }]}>Tips</Text>
            <Text style={styles.sectionText}>{result.improvement_tips}</Text>
          </View>
        ) : null}

        {/* Bottom spacer for fixed buttons */}
        <View style={{ height: 220 }} />
      </ScrollView>

      {/* Fixed bottom actions */}
      <View
        style={[styles.ctaContainer, { paddingBottom: insets.bottom + 12 }]}
      >
        <Pressable
          style={[styles.coachButton, !isPremium && styles.coachButtonDisabled]}
          onPress={() => {
            if (tutorialActive && tutorialStep === 5) nextStep();
            if (isPremium) router.push(`/session/coach/${sessionId}`);
          }}
          disabled={!isPremium}
        >
          <Ionicons
            name="analytics-outline"
            size={16}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.ctaButtonText}>
            {isPremium ? "Coach Analysis" : "Coach Analysis (Premium)"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.homeButton}
          onPress={() => {
            if (tutorialActive) nextStep();
            router.replace("/(tabs)");
          }}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </Pressable>
      </View>

      <MascotTutorial
        step={5}
        onNext={() => {
          if (isPremium) {
            nextStep();
          } else {
            goToStep(7);
            router.replace("/(tabs)/history");
          }
        }}
      />
    </View>
  );
}


const OUTCOME_MASCOT: Record<string, { mascot: any; message: string }> = {
  success: { mascot: surprisedBlue, message: "Nice work!" },
  partial: { mascot: blueGuy,       message: "Almost there." },
  fail:    { mascot: redGuy,        message: "You can do better." },
};

function OutcomeMascot({ outcome }: { outcome: string | null }) {
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const bounceScale  = useRef(new Animated.Value(1)).current;
  const shakeX       = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entryOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (outcome === "success") {
      Animated.sequence([
        Animated.delay(350),
        Animated.timing(bounceScale, { toValue: 1.1, duration: 120, useNativeDriver: true }),
        Animated.timing(bounceScale, { toValue: 1,   duration: 120, useNativeDriver: true }),
      ]).start();
    } else if (outcome === "fail") {
      Animated.sequence([
        Animated.delay(350),
        Animated.timing(shakeX, { toValue:  8, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -8, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:  6, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -6, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue:  0, duration: 55, useNativeDriver: true }),
      ]).start();
    }
  }, [outcome]);

  const cfg = outcome ? OUTCOME_MASCOT[outcome] : OUTCOME_MASCOT.partial;
  if (!cfg) return null;

  return (
    <Animated.View
      style={{
        alignItems: "center",
        marginBottom: 20,
        opacity: entryOpacity,
      }}
    >
      <Animated.Image
        source={cfg.mascot}
        style={{
          width: 72,
          height: 72,
          transform: [{ scale: bounceScale }, { translateX: shakeX }],
        }}
        resizeMode="contain"
      />
      <Text
        style={{
          marginTop: 8,
          fontSize: 14,
          fontWeight: "600",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {cfg.message}
      </Text>
    </Animated.View>
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
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
  errorText: {
    color: colors.primaryRed,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  errorButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },

  // Header
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  scenarioTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
    lineHeight: 28,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // Score card
  scoreSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  outcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  outcomeLabel: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  scoreValue: {
    fontSize: 80,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 88,
    marginBottom: 20,
  },
  scoreMax: {
    fontSize: 24,
    fontWeight: "400",
    color: "rgba(255,255,255,0.3)",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },

  // Pros / Cons columns
  prosConsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 24,
  },
  prosConsCol: {
    flex: 1,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 22,
  },

  // CTA
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: "rgba(25,30,39,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    gap: 8,
  },
  coachButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#AF52DE",
    borderRadius: 14,
    paddingVertical: 14,
  },
  coachButtonDisabled: {
    opacity: 0.35,
  },
  ctaButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  homeButton: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  homeButtonText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    fontWeight: "600",
  },
});
