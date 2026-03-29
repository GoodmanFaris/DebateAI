import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  getLeaderboard,
  LeaderboardEntry,
  LeaderboardType,
} from "../../../api/leaderboard";
import colors from "../../../constants/colors";
import MascotTutorial from "../../../components/MascotTutorial";
import MascotBubble from "../../../components/MascotBubble";
import { useTutorialStore } from "../../../store/tutorial.store";

const redGuy = require("../../../../assets/images/redHuy.png");

const TABS: { key: LeaderboardType; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "global", label: "Global" },
  { key: "local", label: "Local" },
];

const RANK_ACCENTS: Record<number, { color: string; bg: string }> = {
  1: { color: "#FFD700", bg: "rgba(255, 215, 0, 0.08)" },
  2: { color: "#C0C0C0", bg: "rgba(192, 192, 192, 0.08)" },
  3: { color: "#CD7F32", bg: "rgba(205, 127, 50, 0.08)" },
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LeaderboardType>("daily");
  const nextStep = useTutorialStore((s) => s.nextStep);

  const {
    data: entries = [],
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["leaderboard", activeTab],
    queryFn: () => getLeaderboard(activeTab),
    staleTime: 60 * 1000,
  });

  console.log("[Leaderboard] entries:", JSON.stringify(entries.slice(0, 3)));

  const error = queryError ? "Could not load leaderboard." : "";

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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => `${item.rank}-${item.username}`}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <View style={styles.header}>
                <Text style={styles.heading}>Leaderboard</Text>
                <Text style={styles.subheading}>Top performers today</Text>
              </View>

              <View style={styles.tabRow}>
                {TABS.map((tab) => (
                  <Pressable
                    key={tab.key}
                    style={[
                      styles.tab,
                      activeTab === tab.key && styles.tabActive,
                    ]}
                    onPress={() => setActiveTab(tab.key)}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === tab.key && styles.tabTextActive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {entries.length === 0 && (
                <View style={styles.emptyBlock}>
                  <MascotBubble
                    mascot={redGuy}
                    message="Be the first."
                    size={72}
                    animation="float"
                  />
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <LeaderboardRow
              item={item}
              onPress={() =>
                router.push(
                  `/leaderboard/${item.username}?displayName=${encodeURIComponent(item.display_name)}`
                )
              }
            />
          )}
        />
      )}

      <MascotTutorial
        step={8}
        onNext={() => {
          nextStep();
          router.push("/(tabs)/profile");
        }}
      />
    </View>
  );
}

function LeaderboardRow({
  item,
  onPress,
}: {
  item: LeaderboardEntry;
  onPress: () => void;
}) {
  const accent = RANK_ACCENTS[item.rank];
  const isTopThree = item.rank <= 3;
  const initial = item.display_name.charAt(0).toUpperCase();

  return (
    <Pressable
      style={[styles.row, isTopThree && { backgroundColor: accent.bg }]}
      onPress={onPress}
    >
      {/* Rank */}
      <View style={styles.rankContainer}>
        {isTopThree ? (
          <Text style={[styles.rankTopThree, { color: accent.color }]}>
            {item.rank}
          </Text>
        ) : (
          <Text style={styles.rank}>{item.rank}</Text>
        )}
      </View>

      {/* Avatar */}
      {item.avatar_url ? (
        <Image
          source={{ uri: item.avatar_url }}
          style={[
            styles.avatar,
            isTopThree && { borderColor: accent.color, borderWidth: 1.5 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            isTopThree && { borderColor: accent.color, borderWidth: 1.5 },
          ]}
        >
          <Text style={[styles.avatarText, isTopThree && { color: accent.color }]}>
            {initial}
          </Text>
        </View>
      )}

      {/* Name + username */}
      <View style={styles.nameColumn}>
        <Text style={styles.displayName} numberOfLines={1}>
          {item.avatar_url ?? "NO URL"}
        </Text>
        <Text style={styles.username}>@{item.username}</Text>
      </View>

      {/* Score */}
      <Text
        style={[styles.score, isTopThree && { color: accent.color }]}
      >
        {item.score.toFixed(1)}
      </Text>
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
  },
  errorText: {
    color: colors.primaryRed,
    fontSize: 14,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 100,
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
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  tabActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.4)",
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  emptyBlock: {
    alignItems: "center",
    paddingTop: 48,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  rankContainer: {
    width: 32,
    alignItems: "center",
  },
  rank: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.35)",
  },
  rankTopThree: {
    fontSize: 16,
    fontWeight: "700",
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
  },
  nameColumn: {
    flex: 1,
  },
  displayName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  username: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    marginTop: 2,
  },
  score: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryBlue,
    marginLeft: 12,
  },
});
