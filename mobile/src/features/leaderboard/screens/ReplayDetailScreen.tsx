import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  getPublicReplay,
  PublicReplay,
  ReplayMessage,
} from "../../../api/leaderboard";
import colors from "../../../constants/colors";

const DIFFICULTY_CONFIG: Record<string, { color: string; label: string }> = {
  easy: { color: "#34C759", label: "Easy" },
  medium: { color: "#FF9500", label: "Medium" },
  hard: { color: colors.primaryRed, label: "Hard" },
};

const OUTCOME_CONFIG: Record<string, { color: string; label: string }> = {
  success: { color: "#34C759", label: "Win" },
  partial: { color: "#FF9500", label: "Partial" },
  fail: { color: colors.primaryRed, label: "Loss" },
};

export default function ReplayDetailScreen({
  sessionId,
}: {
  sessionId: number;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={styles.loadingText}>Loading replay...</Text>
      </View>
    );
  }

  if (error || !replay) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Replay not found."}</Text>
        <Pressable style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const diff = DIFFICULTY_CONFIG[replay.difficulty] ?? {
    color: "#999",
    label: replay.difficulty,
  };

  const outcome = replay.outcome
    ? (OUTCOME_CONFIG[replay.outcome] ?? { color: "#999", label: replay.outcome })
    : null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(74, 144, 217, 0.18)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={styles.topLeftGlow}
      />
      <LinearGradient
        colors={["rgba(231, 76, 60, 0.18)", "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
        style={styles.topRightGlow}
      />

      <FlatList
        data={replay.messages}
        keyExtractor={(item, index) =>
          `${item.turn_index}-${item.role}-${index}`
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 96 },
        ]}
        ListHeaderComponent={
          <Header replay={replay} diff={diff} outcome={outcome} insets={insets} />
        }
        renderItem={({ item }) => <MessageBubble item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No messages in this replay.</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Fixed back button */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={16}
            color={colors.textPrimary}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Header({
  replay,
  diff,
  outcome,
  insets,
}: {
  replay: PublicReplay;
  diff: { color: string; label: string };
  outcome: { color: string; label: string } | null;
  insets: { top: number };
}) {
  return (
    <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
      {/* Eyebrow */}
      <Text style={styles.eyebrow}>Public Replay</Text>

      {/* Scenario title */}
      <Text style={styles.scenarioTitle}>{replay.scenario_title}</Text>

      {/* By line — uses display_name from API */}
      <Text style={styles.byLine}>
        by{" "}
        <Text style={styles.byLineName}>{replay.display_name}</Text>
      </Text>

      {/* Badge row */}
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.diffBadge,
            { backgroundColor: `${diff.color}22`, borderColor: diff.color },
          ]}
        >
          <Text style={[styles.diffBadgeText, { color: diff.color }]}>
            {diff.label}
          </Text>
        </View>

        {outcome && (
          <View
            style={[
              styles.outcomeBadge,
              {
                backgroundColor: `${outcome.color}22`,
                borderColor: outcome.color,
              },
            ]}
          >
            <Text style={[styles.outcomeBadgeText, { color: outcome.color }]}>
              {outcome.label}
            </Text>
          </View>
        )}
      </View>

      {/* Score */}
      {replay.total_score != null && (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>
            {Math.round(replay.total_score)}
          </Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
      )}

      {/* Divider */}
      <View style={styles.divider} />

      <Text style={styles.conversationLabel}>Conversation</Text>
    </View>
  );
}

function MessageBubble({ item }: { item: ReplayMessage }) {
  const isUser = item.role === "user";

  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAI]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.roleLabel, isUser && styles.userRoleLabel]}>
          {isUser ? "User" : "AI"} · Turn {item.turn_index}
        </Text>
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.content}
        </Text>
      </View>
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

  // List
  listContent: {
    paddingHorizontal: 16,
    gap: 10,
  },

  // Header section
  header: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
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
    lineHeight: 28,
    marginBottom: 6,
  },
  byLine: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 14,
  },
  byLineName: {
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  diffBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  outcomeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  outcomeBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 52,
  },
  scoreMax: {
    fontSize: 20,
    fontWeight: "400",
    color: "rgba(255,255,255,0.3)",
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginBottom: 16,
  },
  conversationLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },

  // Chat bubbles — same style as SessionChatScreen
  bubbleRow: {
    flexDirection: "row",
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowAI: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    padding: 12,
  },
  userBubble: {
    backgroundColor: colors.primaryBlue,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderBottomLeftRadius: 4,
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  userRoleLabel: {
    color: "rgba(255,255,255,0.6)",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.85)",
  },
  userMessageText: {
    color: "#fff",
  },

  // Empty state
  emptyWrap: {
    paddingTop: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.3)",
  },

  // CTA
  ctaContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "rgba(25,30,39,0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  backButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryBlue,
    borderRadius: 14,
    paddingVertical: 14,
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
