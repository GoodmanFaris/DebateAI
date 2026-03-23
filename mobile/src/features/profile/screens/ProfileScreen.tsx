import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../../store/auth.store";
import { getProfile, ProfileData } from "../../../api/profile";

export default function ProfileScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      setProfile(data);
      setError("");
    } catch {
      setError("Could not load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || "Profile not found."}</Text>
        <Pressable style={styles.logoutButton} onPress={clearAuth}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.displayName}>{profile.display_name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.is_premium ? (
          <Text style={styles.premiumBadge}>Premium</Text>
        ) : null}
        {profile.region ? (
          <Text style={styles.region}>{profile.region}</Text>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Stats</Text>
      <View style={styles.statsRow}>
        <StatBox label="Level" value={String(profile.level)} />
        <StatBox label="XP" value={String(profile.xp)} />
        <StatBox label="Streak" value={String(profile.current_streak)} />
        <StatBox label="Best" value={String(profile.best_streak)} />
      </View>

      <Text style={styles.sectionTitle}>Performance</Text>
      <View style={styles.card}>
        <InfoRow label="Total Sessions" value={String(profile.total_sessions)} />
        <InfoRow label="Total Wins" value={String(profile.total_wins)} />
        <InfoRow
          label="Average Score"
          value={profile.average_score.toFixed(1)}
        />
      </View>

      <Pressable
        style={styles.editButton}
        onPress={() => router.push("/profile/edit")}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={clearAuth}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
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
    marginBottom: 16,
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
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  premiumBadge: {
    color: "#AF52DE",
    fontSize: 12,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#AF52DE",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  region: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    padding: 16,
    gap: 14,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  infoValue: {
    fontSize: 14,
    color: "#666",
  },
  editButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
