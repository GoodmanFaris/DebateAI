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
  getUserDailyReplays,
  UserDailyReplays,
  DailySlot,
} from "../../../api/leaderboard";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#34C759",
  medium: "#FF9500",
  hard: "#FF3B30",
};

export default function UserDailyReplaysScreen({
  username,
  displayName,
}: {
  username: string;
  displayName: string;
}) {
  const router = useRouter();
  const [data, setData] = useState<UserDailyReplays | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchReplays() {
      try {
        const result = await getUserDailyReplays(username);
        if (!cancelled) {
          setData(result);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load daily replays.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReplays();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || "User not found."}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  if (data.slots.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No daily challenge available today.</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable style={styles.backLink} onPress={() => router.back()}>
        <Text style={styles.backLinkText}>Back</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.displayName}>{data.display_name}</Text>
        <Text style={styles.username}>@{data.username}</Text>
      </View>

      <Text style={styles.sectionTitle}>Today's Daily Challenges</Text>

      {data.slots.map((slot) => (
        <SlotCard
          key={slot.difficulty}
          slot={slot}
          onPress={() => {
            if (slot.completed && slot.is_public_replay && slot.session_id) {
              router.push(`/leaderboard/replay/${slot.session_id}`);
            }
          }}
        />
      ))}
    </ScrollView>
  );
}

function SlotCard({
  slot,
  onPress,
}: {
  slot: DailySlot;
  onPress: () => void;
}) {
  const difficultyColor = DIFFICULTY_COLORS[slot.difficulty] ?? "#999";
  const isOpenable = slot.completed && slot.is_public_replay;

  return (
    <Pressable
      style={[styles.card, !isOpenable && styles.cardDisabled]}
      onPress={isOpenable ? onPress : undefined}
      disabled={!isOpenable}
    >
      <View style={styles.cardTop}>
        <Text style={styles.scenarioTitle} numberOfLines={1}>
          {slot.scenario_title}
        </Text>
        <Text
          style={[
            styles.difficultyBadge,
            { backgroundColor: difficultyColor },
          ]}
        >
          {slot.difficulty.charAt(0).toUpperCase() + slot.difficulty.slice(1)}
        </Text>
      </View>

      <View style={styles.cardBottom}>
        {slot.completed ? (
          <>
            {slot.total_score != null ? (
              <Text style={styles.score}>{slot.total_score.toFixed(1)}</Text>
            ) : null}
            {slot.outcome ? (
              <Text style={styles.outcome}>{slot.outcome}</Text>
            ) : null}
            <Text
              style={[
                styles.statusLabel,
                slot.is_public_replay
                  ? styles.publicLabel
                  : styles.privateLabel,
              ]}
            >
              {slot.is_public_replay ? "Public" : "Private"}
            </Text>
          </>
        ) : (
          <Text style={styles.notDoneLabel}>Not done</Text>
        )}
      </View>
    </Pressable>
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
  emptyText: {
    fontSize: 14,
    color: "#999",
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
  },
  content: {
    paddingTop: 56,
    paddingBottom: 40,
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
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  username: {
    fontSize: 15,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 24,
    marginBottom: 10,
  },
  cardDisabled: {
    opacity: 0.5,
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
  },
  score: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#007AFF",
  },
  outcome: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: "auto",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  publicLabel: {
    color: "#2E7D32",
    backgroundColor: "#E8F5E9",
  },
  privateLabel: {
    color: "#999",
    backgroundColor: "#F5F5F5",
  },
  notDoneLabel: {
    fontSize: 13,
    color: "#999",
    fontStyle: "italic",
  },
});
