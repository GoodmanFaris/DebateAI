import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../../store/auth.store";
import { getProfile } from "../../../api/profile";
import colors from "../../../constants/colors";
import MascotTutorial from "../../../components/MascotTutorial";
import { useTutorialStore } from "../../../store/tutorial.store";

const XP_PER_LEVEL = 100;

export default function ProfileScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);
  const completeTutorial = useTutorialStore((s) => s.completeTutorial);

  const {
    data: profile,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    staleTime: 2 * 60 * 1000,
  });

  const error = queryError ? "Could not load profile." : "";

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Profile not found."}</Text>
        <Pressable style={styles.logoutButton} onPress={clearAuth}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    );
  }

  const xpProgress = (profile.xp % XP_PER_LEVEL) / XP_PER_LEVEL;

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
        {/* Avatar + identity */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {profile.avatar_url ? (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {profile.display_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {profile.is_premium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PRO</Text>
              </View>
            )}
          </View>

          <Text style={styles.displayName}>{profile.display_name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {profile.region ? (
            <Text style={styles.region}>{profile.region}</Text>
          ) : null}
        </View>

        {/* XP progress */}
        <View style={styles.xpSection}>
          <View style={styles.xpLabelRow}>
            <Text style={styles.xpLevel}>Level {profile.level}</Text>
            <Text style={styles.xpCount}>{profile.xp} XP</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${xpProgress * 100}%` }]}
            />
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard label="Level" value={String(profile.level)} />
          <StatCard label="Daily Streak" value={`${profile.current_streak}d`} />
          <StatCard label="Sessions" value={String(profile.total_sessions)} />
          <StatCard
            label="Avg Score"
            value={profile.average_score.toFixed(1)}
          />
        </View>

        {/* Buttons */}
        <Pressable
          style={styles.editButton}
          onPress={() => router.push("/profile/edit")}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={clearAuth}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </ScrollView>

      <MascotTutorial step={9} />
      <MascotTutorial step={10} onNext={completeTutorial} />
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  errorText: {
    color: colors.primaryRed,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 100,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(74, 144, 217, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(74, 144, 217, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primaryBlue,
  },
  premiumBadge: {
    position: "absolute",
    bottom: 0,
    right: -4,
    backgroundColor: "#AF52DE",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  displayName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    marginBottom: 4,
  },
  region: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
  },

  // XP
  xpSection: {
    marginBottom: 28,
  },
  xpLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  xpLevel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  xpCount: {
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primaryBlue,
    borderRadius: 3,
  },

  // Stats grid
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
  },

  // Buttons
  editButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: colors.primaryRed,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
