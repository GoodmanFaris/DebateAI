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
import {
  getLeaderboard,
  LeaderboardEntry,
  LeaderboardType,
} from "../../../api/leaderboard";

const TABS: { key: LeaderboardType; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "global", label: "Global" },
  { key: "local", label: "Local" },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LeaderboardType>("daily");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard(activeTab);
        if (!cancelled) {
          setEntries(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load leaderboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Leaderboard</Text>

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

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No entries yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to make it on the board!
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => `${item.rank}-${item.username}`}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push(
                  `/leaderboard/${item.username}?displayName=${encodeURIComponent(item.display_name)}`
                )
              }
            >
              <Text style={styles.rank}>#{item.rank}</Text>
              <View style={styles.nameColumn}>
                <Text style={styles.displayName} numberOfLines={1}>
                  {item.display_name}
                </Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              <Text style={styles.score}>{item.score.toFixed(1)}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  tabTextActive: {
    color: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  rank: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    width: 44,
  },
  nameColumn: {
    flex: 1,
  },
  displayName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  username: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  score: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginLeft: 12,
  },
});
