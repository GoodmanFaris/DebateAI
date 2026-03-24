import { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  getCoachAnalysis,
  CoachAnalysis,
  KeyMoment,
  BetterResponse,
} from "../../../api/sessions";
import colors from "../../../constants/colors";

export default function CoachScreen({
  sessionId,
}: {
  sessionId: number;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [coach, setCoach] = useState<CoachAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchCoach() {
      try {
        const data = await getCoachAnalysis(sessionId);
        if (!cancelled) {
          setCoach(data);
          setError("");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load coach analysis.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCoach();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <LinearGradient
          colors={["rgba(175, 82, 222, 0.18)", "transparent"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingIconWrap}>
          <Ionicons name="analytics-outline" size={32} color="#AF52DE" />
        </View>
        <ActivityIndicator
          size="large"
          color="#AF52DE"
          style={{ marginTop: 20 }}
        />
        <Text style={styles.loadingText}>Generating coach analysis...</Text>
        <Text style={styles.loadingSubText}>This may take a moment</Text>
      </View>
    );
  }

  if (error || !coach) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || "Coach analysis not found."}</Text>
        <Pressable style={styles.errorButton} onPress={() => router.back()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Rich purple glow top-center */}
      <LinearGradient
        colors={["rgba(175, 82, 222, 0.28)", "transparent"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.45 }}
        style={styles.topGlow}
      />
      <LinearGradient
        colors={["rgba(74, 144, 217, 0.12)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.4, y: 0.5 }}
        style={styles.topLeftGlow}
      />
      <LinearGradient
        colors={["rgba(231, 76, 60, 0.1)", "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.6, y: 0.5 }}
        style={styles.topRightGlow}
      />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.proTag}>
            <Ionicons name="diamond" size={10} color="#AF52DE" />
            <Text style={styles.proTagText}>PRO</Text>
          </View>
          <Text style={styles.heading}>Coach Analysis</Text>
          <Text style={styles.subHeading}>
            Personalized breakdown of your performance
          </Text>
        </View>

        {/* Section cards */}
        {coach.overall_analysis ? (
          <SectionCard
            icon="eye-outline"
            iconColor="#AF52DE"
            title="Overall Analysis"
            text={coach.overall_analysis}
          />
        ) : null}

        {coach.tone_analysis ? (
          <SectionCard
            icon="mic-outline"
            iconColor={colors.primaryBlue}
            title="Tone Analysis"
            text={coach.tone_analysis}
          />
        ) : null}

        {coach.opponent_analysis ? (
          <SectionCard
            icon="hardware-chip-outline"
            iconColor="#FF9500"
            title="Opponent Analysis"
            text={coach.opponent_analysis}
          />
        ) : null}

        {coach.key_moments.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash-outline" size={15} color="#FF9500" />
              <Text style={[styles.sectionTitle, { color: "#FF9500" }]}>
                Key Moments
              </Text>
            </View>
            {coach.key_moments.map((km, i) => (
              <KeyMomentCard key={i} moment={km} index={i} />
            ))}
          </View>
        ) : null}

        {coach.better_responses.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={15} color={colors.primaryBlue} />
              <Text style={[styles.sectionTitle, { color: colors.primaryBlue }]}>
                Better Responses
              </Text>
            </View>
            {coach.better_responses.map((br, i) => (
              <BetterResponseCard key={i} response={br} index={i} />
            ))}
          </View>
        ) : null}

        {coach.winning_move ? (
          <WinningMoveCard text={coach.winning_move} />
        ) : null}
      </ScrollView>

      {/* Fixed back button */}
      <View style={[styles.ctaContainer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={16}
            color="rgba(255,255,255,0.7)"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.backButtonText}>Back to Results</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SectionCard({
  icon,
  iconColor,
  title,
  text,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconColor: string;
  title: string;
  text: string;
}) {
  return (
    <View style={[styles.card, { borderLeftColor: iconColor }]}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={14} color={iconColor} />
        <Text style={[styles.cardTitle, { color: iconColor }]}>{title}</Text>
      </View>
      <Text style={styles.cardBodyText}>{text}</Text>
    </View>
  );
}

function KeyMomentCard({
  moment,
  index,
}: {
  moment: KeyMoment;
  index: number;
}) {
  return (
    <View style={styles.momentCard}>
      <View style={styles.momentIndex}>
        <Text style={styles.momentIndexText}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.momentLabel}>Moment</Text>
        <Text style={styles.momentText}>{moment.moment}</Text>
        <Text style={[styles.momentLabel, { marginTop: 10 }]}>Impact</Text>
        <Text style={[styles.momentText, { color: "#FF9500" }]}>
          {moment.impact}
        </Text>
        <Text style={[styles.momentLabel, { marginTop: 10 }]}>Explanation</Text>
        <Text style={styles.momentText}>{moment.explanation}</Text>
      </View>
    </View>
  );
}

function BetterResponseCard({
  response,
  index,
}: {
  response: BetterResponse;
  index: number;
}) {
  return (
    <View style={styles.betterCard}>
      <View style={styles.betterRow}>
        <View style={[styles.betterTag, styles.betterTagOriginal]}>
          <Text style={styles.betterTagText}>Your Response</Text>
        </View>
        <Text style={styles.betterOriginalText}>{response.original}</Text>
      </View>
      <View style={styles.betterDivider}>
        <Ionicons name="arrow-down" size={12} color="rgba(255,255,255,0.2)" />
      </View>
      <View style={styles.betterRow}>
        <View style={[styles.betterTag, styles.betterTagSuggested]}>
          <Text style={[styles.betterTagText, { color: "#34C759" }]}>
            Suggested
          </Text>
        </View>
        <Text style={styles.betterSuggestedText}>{response.suggested}</Text>
      </View>
      <View style={styles.whyRow}>
        <Ionicons name="information-circle-outline" size={13} color={colors.primaryBlue} />
        <Text style={styles.whyText}>{response.why}</Text>
      </View>
    </View>
  );
}

function WinningMoveCard({ text }: { text: string }) {
  return (
    <View style={styles.winningCard}>
      <LinearGradient
        colors={["rgba(175,82,222,0.12)", "rgba(74,144,217,0.08)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
        borderRadius={16}
      />
      <View style={styles.winningHeader}>
        <Ionicons name="trophy-outline" size={16} color="#AF52DE" />
        <Text style={styles.winningTitle}>Winning Move</Text>
      </View>
      <Text style={styles.winningText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundPrimary,
  },
  topGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  topLeftGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "60%",
    height: 280,
  },
  topRightGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "60%",
    height: 280,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundPrimary,
    padding: 24,
  },
  loadingIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(175,82,222,0.12)",
    borderWidth: 1,
    borderColor: "rgba(175,82,222,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  loadingSubText: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
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
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  // Page header
  header: {
    marginBottom: 28,
  },
  proTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "rgba(175,82,222,0.12)",
    borderWidth: 1,
    borderColor: "rgba(175,82,222,0.4)",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 12,
  },
  proTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#AF52DE",
    letterSpacing: 0.8,
  },
  heading: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },

  // Simple section wrapper (for lists)
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  // Section card (overall/tone/opponent)
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderLeftWidth: 3,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cardBodyText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 23,
  },

  // Key moment cards
  momentCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  momentIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255,149,0,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,149,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  momentIndexText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF9500",
  },
  momentLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  momentText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 20,
  },

  // Better response cards
  betterCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  betterRow: {
    gap: 6,
  },
  betterTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
    marginBottom: 4,
  },
  betterTagOriginal: {
    backgroundColor: "rgba(231,76,60,0.1)",
    borderWidth: 1,
    borderColor: "rgba(231,76,60,0.25)",
  },
  betterTagSuggested: {
    backgroundColor: "rgba(52,199,89,0.1)",
    borderWidth: 1,
    borderColor: "rgba(52,199,89,0.25)",
  },
  betterTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primaryRed,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  betterOriginalText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    lineHeight: 20,
    fontStyle: "italic",
  },
  betterSuggestedText: {
    fontSize: 14,
    color: "#34C759",
    lineHeight: 20,
  },
  betterDivider: {
    alignItems: "center",
    paddingVertical: 6,
  },
  whyRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    alignItems: "flex-start",
  },
  whyText: {
    flex: 1,
    fontSize: 13,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 19,
  },

  // Winning move
  winningCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(175,82,222,0.3)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
  },
  winningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  winningTitle: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "#AF52DE",
  },
  winningText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 23,
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
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingVertical: 14,
  },
  backButtonText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontWeight: "600",
  },
});
