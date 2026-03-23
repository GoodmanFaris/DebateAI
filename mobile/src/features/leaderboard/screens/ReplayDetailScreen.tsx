import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { getPublicReplay, PublicReplay, ReplayMessage } from "../../../api/leaderboard";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#34C759",
  medium: "#FF9500",
  hard: "#FF3B30",
};

export default function ReplayDetailScreen({
  sessionId,
}: {
  sessionId: number;
}) {
  const router = useRouter();
  const [replay, setReplay] = useState<PublicReplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchReplay() {
      try {
        const data = await getPublicReplay(sessionId);
        if (!cancelled) {
          setReplay(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load replay. It may not be public.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReplay();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !replay) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || "Replay not found."}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const difficultyColor = DIFFICULTY_COLORS[replay.difficulty] ?? "#999";

  return (
    <View style={styles.container}>
      <Pressable style={styles.backLink} onPress={() => router.back()}>
        <Text style={styles.backLinkText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.scenarioTitle}>{replay.scenario_title}</Text>
        <View style={styles.metaRow}>
          <Text
            style={[
              styles.difficultyBadge,
              { backgroundColor: difficultyColor },
            ]}
          >
            {replay.difficulty.charAt(0).toUpperCase() +
              replay.difficulty.slice(1)}
          </Text>
          <Text style={styles.byLine}>by @{replay.username}</Text>
        </View>
        {replay.outcome ? (
          <Text style={styles.outcome}>Outcome: {replay.outcome}</Text>
        ) : null}
        {replay.total_score != null ? (
          <Text style={styles.score}>
            Score: {replay.total_score.toFixed(1)}
          </Text>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Conversation</Text>

      {replay.messages.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No messages in this replay.</Text>
        </View>
      ) : (
        <FlatList
          data={replay.messages}
          keyExtractor={(item, index) => `${item.turn_index}-${item.role}-${index}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isUser = item.role === "user";
            return (
              <View
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={[
                    styles.roleLabel,
                    isUser && styles.userRoleLabel,
                  ]}
                >
                  {isUser ? "User" : "AI"} · Turn {item.turn_index}
                </Text>
                <Text
                  style={[
                    styles.messageText,
                    isUser && styles.userMessageText,
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  error: {
    color: "#FF3B30",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 56,
  },
  backLink: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  backLinkText: {
    color: "#007AFF",
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  scenarioTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
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
  byLine: {
    fontSize: 13,
    color: "#666",
  },
  outcome: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  score: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "85%",
  },
  userBubble: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
  },
  aiBubble: {
    backgroundColor: "#F0F0F0",
    alignSelf: "flex-start",
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
    color: "#999",
  },
  userRoleLabel: {
    color: "rgba(255,255,255,0.7)",
  },
  messageText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
});
