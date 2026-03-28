import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { useTutorialStore } from "../store/tutorial.store";
import { TUTORIAL_STEPS } from "../constants/tutorialSteps";
import colors from "../constants/colors";

type Props = {
  step: number;
  onNext?: () => void;
};

export default function MascotTutorial({ step, onNext }: Props) {
  const tutorialActive = useTutorialStore((s) => s.tutorialActive);
  const tutorialStep = useTutorialStore((s) => s.tutorialStep);
  const nextStep = useTutorialStore((s) => s.nextStep);
  const skipTutorial = useTutorialStore((s) => s.skipTutorial);

  if (!tutorialActive || tutorialStep !== step) return null;

  const config = TUTORIAL_STEPS[step];
  if (!config) return null;

  function handleNext() {
    if (onNext) {
      onNext();
    } else {
      nextStep();
    }
  }

  const isCenter = config.position === "center";
  const isBottom = config.position === "bottom";

  return (
    <View
      style={[
        styles.overlay,
        isCenter && styles.overlayCenter,
        isBottom && styles.overlayBottom,
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.card}>
        <Image source={config.image} style={styles.mascot} resizeMode="contain" />
        <Text style={styles.message}>{config.message}</Text>

        <View style={styles.actions}>
          <Pressable style={styles.skipButton} onPress={skipTutorial}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
          {config.showNext && (
            <Pressable style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextText}>{config.nextLabel ?? "Next"}</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 24,
    zIndex: 999,
  },
  overlayCenter: {
    justifyContent: "center",
    paddingTop: 0,
  },
  overlayBottom: {
    justifyContent: "flex-end",
    paddingTop: 0,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: "#1E2433",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 340,
  },
  mascot: {
    width: 56,
    height: 56,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  skipText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "600",
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryBlue,
  },
  nextText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "700",
  },
});
