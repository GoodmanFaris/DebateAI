import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { getScenario, ScenarioDetail } from "../../../api/scenarios";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#34C759",
  medium: "#FF9500",
  hard: "#FF3B30",
};

export default function ScenarioIntroScreen({
  scenarioId,
}: {
  scenarioId: number;
}) {
  const [scenario, setScenario] = useState<ScenarioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !scenario) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || "Scenario not found."}</Text>
      </View>
    );
  }

  const difficultyColor = DIFFICULTY_COLORS[scenario.difficulty] ?? "#999";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.badgeRow}>
        <Text
          style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}
        >
          {scenario.difficulty.charAt(0).toUpperCase() +
            scenario.difficulty.slice(1)}
        </Text>
        {scenario.is_premium && (
          <Text style={styles.premiumBadge}>Premium</Text>
        )}
      </View>

      <Text style={styles.title}>{scenario.title}</Text>
      <Text style={styles.description}>{scenario.short_description}</Text>

      {scenario.full_description ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Background</Text>
          <Text style={styles.sectionText}>{scenario.full_description}</Text>
        </View>
      ) : null}

      {scenario.opening_context ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Context</Text>
          <Text style={styles.sectionText}>{scenario.opening_context}</Text>
        </View>
      ) : null}

      <View style={styles.detailsCard}>
        <DetailRow label="Your Role" value={scenario.user_role} />
        <DetailRow label="AI Role" value={scenario.ai_role} />
        <DetailRow label="Goal" value={scenario.goal} />
        <DetailRow label="Max Turns" value={String(scenario.max_turns)} />
      </View>

      <Pressable
        style={styles.startButton}
        onPress={() => console.log("Start session for scenario:", scenario.id)}
      >
        <Text style={styles.startButtonText}>Start Session</Text>
      </Pressable>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
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
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  difficultyBadge: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  premiumBadge: {
    color: "#AF52DE",
    fontSize: 12,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#AF52DE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
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
  detailsCard: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#666",
    flex: 2,
    textAlign: "right",
  },
  startButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  error: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
  },
});
