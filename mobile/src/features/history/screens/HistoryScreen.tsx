import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  getSessionHistory,
  updateSessionVisibility,
  SessionHistoryEntry,
} from "../../../api/history";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#34C759",
  medium: "#FF9500",
  hard: "#FF3B30",
};

export default function HistoryScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<SessionHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchHistory() {
      try {
        const data = await getSessionHistory();
        if (!cancelled) {
          setEntries(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load session history.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggleVisibility(entry: SessionHistoryEntry) {
    const newValue = !entry.is_public_replay;
    setTogglingId(entry.session_id);

    try {
      await updateSessionVisibility(entry.session_id, newValue);
      setEntries((prev) =>
        prev.map((e) =>
          e.session_id === entry.session_id
            ? { ...e, is_public_replay: newValue }
            : e
        )
      );
    } catch {
      Alert.alert("Error", "Could not update visibility. Please try again.");
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No sessions yet</Text>
        <Text style={styles.emptySubtitle}>
          Complete a debate session to see your history here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>History</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.session_id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/session/result/${item.session_id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.scenarioTitle} numberOfLines={1}>
                {item.scenario_title}
              </Text>
              <Text
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor:
                      DIFFICULTY_COLORS[item.difficulty] ?? "#999",
                  },
                ]}
              >
                {item.difficulty.charAt(0).toUpperCase() +
                  item.difficulty.slice(1)}
              </Text>
            </View>

            <View style={styles.cardBottom}>
              <Text style={styles.date}>
                {new Date(item.completed_at).toLocaleDateString()}
              </Text>
              {item.outcome ? (
                <Text style={styles.outcome}>{item.outcome}</Text>
              ) : null}
              {item.total_score != null ? (
                <Text style={styles.score}>
                  {item.total_score.toFixed(1)}
                </Text>
              ) : null}
            </View>

            <View style={styles.visibilityRow}>
              <Text style={styles.visibilityLabel}>
                {item.is_public_replay ? "Public" : "Private"}
              </Text>
              <Pressable
                style={[
                  styles.visibilityButton,
                  item.is_public_replay && styles.visibilityButtonActive,
                ]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(item);
                }}
                disabled={togglingId === item.session_id}
              >
                {togglingId === item.session_id ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text
                    style={[
                      styles.visibilityButtonText,
                      item.is_public_replay &&
                        styles.visibilityButtonTextActive,
                    ]}
                  >
                    {item.is_public_replay ? "Make Private" : "Make Public"}
                  </Text>
                )}
              </Pressable>
            </View>
          </Pressable>
        )}
      />
    </View>
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
  error: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
    color: "#333",
  },
  difficultyBadge: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: "#999",
  },
  outcome: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  score: {
    fontSize: 13,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: "auto",
  },
  visibilityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 8,
  },
  visibilityLabel: {
    fontSize: 12,
    color: "#999",
  },
  visibilityButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#DDD",
  },
  visibilityButtonActive: {
    borderColor: "#007AFF",
    backgroundColor: "#F0F4FF",
  },
  visibilityButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  visibilityButtonTextActive: {
    color: "#007AFF",
  },
});
