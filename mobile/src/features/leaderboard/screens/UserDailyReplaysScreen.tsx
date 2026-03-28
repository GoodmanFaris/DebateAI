import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  getUserDailyReplays,
  UserDailyReplays,
  DailySlot,
} from "../../../api/leaderboard";
import colors from "../../../constants/colors";

const DIFFICULTY_CONFIG: Record<
  string,
  { color: string; glow: string; label: string }
> = {
  easy: { color: "#34C759", glow: "rgba(52,199,89,0.12)", label: "Easy" },
  medium: { color: "#FF9500", glow: "rgba(255,149,0,0.12)", label: "Medium" },
  hard: {
    color: colors.primaryRed,
    glow: "rgba(231,76,60,0.12)",
    label: "Hard",
  },
};

const OUTCOME_LABELS: Record<string, { label: string; color: string }> = {
  success: { label: "Win", color: "#34C759" },
  partial: { label: "Partial", color: "#FF9500" },
  fail: { label: "Loss", color: colors.primaryRed },
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
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "User not found."}</Text>
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

  const initial = data.display_name.charAt(0).toUpperCase();

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
        {/* Back */}
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={18}
            color={colors.primaryBlue}
          />
          <Text style={styles.backLinkText}>Leaderboard</Text>
        </Pressable>

        {/* User header */}
        <View style={styles.header}>
          {data.avatar_url ? (
            <Image source={{ uri: data.avatar_url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <Text style={styles.displayName}>{data.display_name}</Text>
          <Text style={styles.username}>@{data.username}</Text>
        </View>

        {/* Section label */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Today's Challenges</Text>
          <View style={styles.datePill}>
            <Ionicons
              name="calendar-outline"
              size={11}
              color="rgba(255,255,255,0.35)"
            />
            <Text style={styles.datePillText}>Daily</Text>
          </View>
        </View>

        {/* Slot cards */}
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

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function SlotCard({
  slot,
  onPress,
}: {
  slot: DailySlot;
  onPress: () => void;
}) {
  const cfg = DIFFICULTY_CONFIG[slot.difficulty] ?? {
    color: "#999",
    glow: "rgba(153,153,153,0.1)",
    label: slot.difficulty,
  };
  const isOpenable = slot.completed && slot.is_public_replay;
  const outcome = slot.outcome ? OUTCOME_LABELS[slot.outcome] : null;

  return (
    <Pressable
      style={[
        styles.card,
        { borderColor: cfg.color, backgroundColor: cfg.glow },
        !isOpenable && styles.cardDisabled,
      ]}
      onPress={isOpenable ? onPress : undefined}
      disabled={!isOpenable}
    >
      {/* Top: difficulty label + open icon */}
      <View style={styles.cardTop}>
        <View
          style={[
            styles.difficultyBadge,
            { backgroundColor: `${cfg.color}22`, borderColor: cfg.color },
          ]}
        >
          <Text style={[styles.difficultyText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
        {isOpenable && (
          <Ionicons
            name="play-circle-outline"
            size={20}
            color={cfg.color}
          />
        )}
      </View>

      {/* Scenario title */}
      <Text style={styles.scenarioTitle} numberOfLines={2}>
        {slot.scenario_title}
      </Text>

      {/* Bottom: state-dependent content */}
      <View style={styles.cardBottom}>
        {!slot.completed ? (
          <View style={styles.statusPill}>
            <Ionicons
              name="time-outline"
              size={12}
              color="rgba(255,255,255,0.3)"
            />
            <Text style={styles.notDoneText}>Not done</Text>
          </View>
        ) : !slot.is_public_replay ? (
          <View style={styles.statusPill}>
            <Ionicons
              name="lock-closed-outline"
              size={12}
              color="rgba(255,255,255,0.3)"
            />
            <Text style={styles.privateText}>Private</Text>
          </View>
        ) : (
          <View style={styles.scoreRow}>
            {slot.total_score != null && (
              <Text style={[styles.score, { color: cfg.color }]}>
                {slot.total_score.toFixed(1)}
              </Text>
            )}
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
            <View style={styles.publicPill}>
              <Ionicons name="eye-outline" size={12} color="#34C759" />
              <Text style={styles.publicText}>Public</Text>
            </View>
          </View>
        )}
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
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  scroll: {
    paddingTop: 56,
    paddingHorizontal: 24,
  },

  // Back link
  backLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 24,
  },
  backLinkText: {
    color: colors.primaryBlue,
    fontSize: 15,
    fontWeight: "600",
  },

  // User header
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(74,144,217,0.15)",
    borderWidth: 2,
    borderColor: "rgba(74,144,217,0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primaryBlue,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
  },

  // Section row
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  datePillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.35)",
  },

  // Cards
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  cardDisabled: {
    opacity: 0.45,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
  scenarioTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 14,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
  },

  // State pills
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  notDoneText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "500",
  },
  privateText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "500",
  },

  // Score row (public)
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  score: {
    fontSize: 20,
    fontWeight: "700",
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
  publicPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
    backgroundColor: "rgba(52,199,89,0.1)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  publicText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#34C759",
  },
});
