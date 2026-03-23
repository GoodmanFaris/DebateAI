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
  getCoachAnalysis,
  CoachAnalysis,
  KeyMoment,
  BetterResponse,
} from "../../../api/sessions";

export default function CoachScreen({
  sessionId,
}: {
  sessionId: number;
}) {
  const router = useRouter();
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
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Generating coach analysis...</Text>
      </View>
    );
  }

  if (error || !coach) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || "Coach analysis not found."}</Text>
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
      <Text style={styles.heading}>Coach Analysis</Text>

      <Section title="Overall Analysis" text={coach.overall_analysis} />
      <Section title="Tone Analysis" text={coach.tone_analysis} />
      <Section title="Opponent Analysis" text={coach.opponent_analysis} />

      {coach.key_moments.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Moments</Text>
          {coach.key_moments.map((km, i) => (
            <KeyMomentCard key={i} moment={km} />
          ))}
        </View>
      ) : null}

      {coach.better_responses.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Better Responses</Text>
          {coach.better_responses.map((br, i) => (
            <BetterResponseCard key={i} response={br} />
          ))}
        </View>
      ) : null}

      <Section title="Winning Move" text={coach.winning_move} />

      <Pressable style={styles.backButtonLarge} onPress={() => router.back()}>
        <Text style={styles.backButtonLargeText}>Back to Results</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{text}</Text>
    </View>
  );
}

function KeyMomentCard({ moment }: { moment: KeyMoment }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Moment</Text>
      <Text style={styles.cardText}>{moment.moment}</Text>
      <Text style={styles.cardLabel}>Impact</Text>
      <Text style={styles.cardText}>{moment.impact}</Text>
      <Text style={styles.cardLabel}>Explanation</Text>
      <Text style={styles.cardText}>{moment.explanation}</Text>
    </View>
  );
}

function BetterResponseCard({ response }: { response: BetterResponse }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>Your Response</Text>
      <Text style={styles.cardText}>{response.original}</Text>
      <Text style={styles.cardLabel}>Suggested</Text>
      <Text style={[styles.cardText, styles.suggestedText]}>
        {response.suggested}
      </Text>
      <Text style={styles.cardLabel}>Why</Text>
      <Text style={styles.cardText}>{response.why}</Text>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
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
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  sectionText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 2,
    marginTop: 6,
  },
  cardText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  suggestedText: {
    color: "#2E7D32",
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
  backButtonLarge: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  backButtonLargeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
