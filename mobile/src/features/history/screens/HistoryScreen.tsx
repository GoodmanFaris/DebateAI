import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSessionHistory,
  updateSessionVisibility,
  SessionHistoryEntry,
} from "../../../api/history";
import colors from "../../../constants/colors";
import MascotTutorial from "../../../components/MascotTutorial";
import { useTutorialStore } from "../../../store/tutorial.store";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#34C759",
  medium: "#FF9500",
  hard: colors.primaryRed,
};

const OUTCOME_STYLES: Record<string, { color: string; label: string }> = {
  success: { color: "#34C759", label: "Win" },
  partial: { color: "#FF9500", label: "Partial" },
  fail: { color: colors.primaryRed, label: "Loss" },
};

export default function HistoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const nextStep = useTutorialStore((s) => s.nextStep);

  const {
    data: entries = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["history"],
    queryFn: getSessionHistory,
    staleTime: 2 * 60 * 1000,
  });

  const error = queryError ? "Could not load session history." : "";

  async function handleToggleVisibility(entry: SessionHistoryEntry) {
    const newValue = !entry.is_public_replay;
    setTogglingId(entry.session_id);

    try {
      await updateSessionVisibility(entry.session_id, newValue);
      queryClient.setQueryData<SessionHistoryEntry[]>(["history"], (old) =>
        (old ?? []).map((e) =>
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
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (entries.length === 0) {
    return (
      <View style={styles.centered}>
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
        <Ionicons
          name="chatbubbles-outline"
          size={48}
          color="rgba(255,255,255,0.15)"
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.emptyTitle}>No sessions yet</Text>
        <Text style={styles.emptySubtitle}>
          Start your first debate to see results here
        </Text>
      </View>
    );
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

      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.session_id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.heading}>History</Text>
            <Text style={styles.subheading}>Your past sessions</Text>
          </View>
        }
        renderItem={({ item }) => (
          <HistoryCard
            item={item}
            togglingId={togglingId}
            onPress={() => router.push(`/session/result/${item.session_id}`)}
            onToggle={() => handleToggleVisibility(item)}
          />
        )}
      />

      <MascotTutorial
        step={7}
        onNext={() => {
          nextStep();
          router.push("/(tabs)/leaderboard");
        }}
      />
    </View>
  );
}

function HistoryCard({
  item,
  togglingId,
  onPress,
  onToggle,
}: {
  item: SessionHistoryEntry;
  togglingId: number | null;
  onPress: () => void;
  onToggle: () => void;
}) {
  const difficultyColor = DIFFICULTY_COLORS[item.difficulty] ?? "#999";
  const outcome = item.outcome ? OUTCOME_STYLES[item.outcome] : null;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Top row: title + difficulty */}
      <View style={styles.cardTop}>
        <Text style={styles.scenarioTitle} numberOfLines={1}>
          {item.scenario_title}
        </Text>
        <Text
          style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}
        >
          {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
        </Text>
      </View>

      {/* Middle row: date + outcome + score */}
      <View style={styles.cardMid}>
        <Text style={styles.date}>
          {new Date(item.completed_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>

        {outcome && (
          <View
            style={[
              styles.outcomeBadge,
              { backgroundColor: `${outcome.color}22` },
            ]}
          >
            <Text style={[styles.outcomeText, { color: outcome.color }]}>
              {outcome.label}
            </Text>
          </View>
        )}

        {item.total_score != null && (
          <Text style={styles.score}>{item.total_score.toFixed(1)}</Text>
        )}
      </View>

      {/* Bottom row: visibility toggle */}
      <View style={styles.cardFooter}>
        <View style={styles.visibilityInfo}>
          <Ionicons
            name={item.is_public_replay ? "eye-outline" : "eye-off-outline"}
            size={13}
            color="rgba(255,255,255,0.3)"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.visibilityLabel}>
            {item.is_public_replay ? "Public" : "Private"}
          </Text>
        </View>

        <Pressable
          style={[
            styles.visibilityButton,
            item.is_public_replay && styles.visibilityButtonActive,
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={togglingId === item.session_id}
        >
          {togglingId === item.session_id ? (
            <ActivityIndicator size="small" color={colors.primaryBlue} />
          ) : (
            <Text
              style={[
                styles.visibilityButtonText,
                item.is_public_replay && styles.visibilityButtonTextActive,
              ]}
            >
              {item.is_public_replay ? "Make Private" : "Make Public"}
            </Text>
          )}
        </Pressable>
      </View>
    </Pressable>
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
  errorText: {
    color: colors.primaryRed,
    fontSize: 14,
    textAlign: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
  },
  header: {
    paddingTop: 64,
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },

  // Card
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scenarioTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    flex: 1,
    marginRight: 10,
  },
  difficultyBadge: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  cardMid: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
  },
  outcomeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  outcomeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  score: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryBlue,
    marginLeft: "auto",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 10,
  },
  visibilityInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  visibilityLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
  },
  visibilityButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    minWidth: 90,
    alignItems: "center",
  },
  visibilityButtonActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: "rgba(74, 144, 217, 0.12)",
  },
  visibilityButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
  },
  visibilityButtonTextActive: {
    color: colors.primaryBlue,
  },
});
