import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getSessionResult,
  SessionResultResponse,
} from "../../../api/sessions";
import { useAuthStore } from "../../../store/auth.store";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#34C759",
  medium: "#FF9500",
  hard: "#FF3B30",
};

export default function SessionResultScreen({
  sessionId,
}: {
  sessionId: number;
}) {
  const router = useRouter();
  const isPremium = useAuthStore((s) => s.user?.is_premium ?? false);
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
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  if (error || !result) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || "Results not found."}</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={styles.backButtonText}>Go Home</Text>
        </Pressable>
      </View>
    );
  }

  const difficultyColor = DIFFICULTY_COLORS[result.difficulty] ?? "#999";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.heading}>Session Results</Text>

      <Text style={styles.scenarioTitle}>{result.scenario_title}</Text>
      <Text style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
        {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}
      </Text>

      {result.outcome ? (
        <View style={styles.outcomeCard}>
          <Text style={styles.outcomeLabel}>Outcome</Text>
          <Text style={styles.outcomeValue}>{result.outcome}</Text>
        </View>
      ) : null}

      {result.total_score != null ? (
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Total Score</Text>
          <Text style={styles.scoreValue}>
            {result.total_score.toFixed(1)}
          </Text>
        </View>
      ) : null}

      {result.summary ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.sectionText}>{result.summary}</Text>
        </View>
      ) : null}

      {result.pros ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strengths</Text>
          <Text style={styles.sectionText}>{result.pros}</Text>
        </View>
      ) : null}

      {result.cons ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas to Improve</Text>
          <Text style={styles.sectionText}>{result.cons}</Text>
        </View>
      ) : null}

      {result.improvement_tips ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips</Text>
          <Text style={styles.sectionText}>{result.improvement_tips}</Text>
        </View>
      ) : null}

      <Pressable
        style={[styles.coachButton, !isPremium && styles.coachButtonDisabled]}
        onPress={() => {
          if (isPremium) {
            router.push(`/session/coach/${sessionId}`);
          }
        }}
        disabled={!isPremium}
      >
        <Text style={styles.coachButtonText}>
          {isPremium ? "Coach Analysis" : "Coach Analysis (Premium)"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.homeButton}
        onPress={() => router.replace("/(tabs)")}
      >
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  error: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  scenarioTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 20,
  },
  outcomeCard: {
    backgroundColor: "#F0F4FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  outcomeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  outcomeValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scoreCard: {
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  coachButton: {
    backgroundColor: "#AF52DE",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  coachButtonDisabled: {
    opacity: 0.4,
  },
  coachButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  homeButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  homeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
