import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/auth.store";
import {
  getDailyChallenges,
  ChallengeScenario,
  DailyChallengeResponse,
} from "../../../api/challenges";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#34C759",
  medium: "#FF9500",
  hard: "#FF3B30",
};

function ChallengeCard({
  scenario,
  onPress,
}: {
  scenario: ChallengeScenario;
  onPress: () => void;
}) {
  const color = DIFFICULTY_COLORS[scenario.difficulty] ?? "#999";

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={[styles.difficultyBadge, { backgroundColor: color }]}>
          {scenario.difficulty.charAt(0).toUpperCase() +
            scenario.difficulty.slice(1)}
        </Text>
        {scenario.is_premium && (
          <Text style={styles.premiumBadge}>Premium</Text>
        )}
      </View>
      <Text style={styles.cardTitle}>{scenario.title}</Text>
      <Text style={styles.cardDescription}>{scenario.short_description}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [daily, setDaily] = useState<DailyChallengeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchChallenges() {
      try {
        const data = await getDailyChallenges();
        if (!cancelled) {
          setDaily(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load daily challenges.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchChallenges();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>DebateAI</Text>
        <Text style={styles.welcome}>
          Welcome, {user?.email ?? "User"}!
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Daily Challenges</Text>

      {loading && <ActivityIndicator size="large" style={styles.loader} />}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {daily && (
        <View style={styles.cardList}>
          {([daily.easy, daily.medium, daily.hard] as ChallengeScenario[]).map(
            (scenario) => (
              <ChallengeCard
                key={scenario.id}
                scenario={scenario}
                onPress={() => router.push(`/scenario/${scenario.id}`)}
              />
            )
          )}
        </View>
      )}

      <Pressable style={styles.logoutButton} onPress={clearAuth}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  welcome: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  loader: {
    marginTop: 32,
  },
  error: {
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 16,
    fontSize: 14,
  },
  cardList: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: "#FF3B30",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 24,
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
});
