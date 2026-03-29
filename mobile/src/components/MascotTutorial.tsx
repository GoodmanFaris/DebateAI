import { useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { useTutorialStore } from "../store/tutorial.store";
import { TUTORIAL_STEPS, MascotConfig } from "../constants/tutorialSteps";
import colors from "../constants/colors";

type Props = {
  step: number;
  onNext?: () => void;
};

type CardProps = {
  config: MascotConfig;
  cardPosition: "top" | "bottom";
  showActions: boolean;
  showNext: boolean;
  nextLabel?: string;
  onSkip: () => void;
  onNext: () => void;
};

function MascotCard({
  config,
  cardPosition,
  showActions,
  showNext,
  nextLabel,
  onSkip,
  onNext,
}: CardProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacity   = useRef(new Animated.Value(0)).current;
  const scale     = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Entry: fade in + scale up
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Float loop: gentle up/down
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -5,
          duration: 1600,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const isBottom = cardPosition === "bottom";

  const mascotStyle = [
    styles.mascot,
    isBottom ? styles.mascotBottom : styles.mascotTop,
    config.align === "right" ? styles.mascotRight : styles.mascotLeft,
    { transform: [{ translateY: floatAnim }] },
  ];

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        isBottom ? styles.cardWrapperBottom : styles.cardWrapperTop,
        { opacity, transform: [{ scale }] },
      ]}
    >
      {/* Mascot floats above card */}
      {!isBottom && (
        <Animated.Image
          source={config.mascot}
          style={mascotStyle}
          resizeMode="contain"
        />
      )}

      <View style={[styles.card, isBottom && styles.cardBottomVariant]}>
        <Text style={styles.message}>{config.message}</Text>

        {showActions && (
          <View style={styles.actions}>
            <Pressable style={styles.skipButton} onPress={onSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
            {showNext && (
              <Pressable style={styles.nextButton} onPress={onNext}>
                <Text style={styles.nextText}>{nextLabel ?? "Next"}</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Mascot floats below card */}
      {isBottom && (
        <Animated.Image
          source={config.mascot}
          style={mascotStyle}
          resizeMode="contain"
        />
      )}
    </Animated.View>
  );
}

export default function MascotTutorial({ step, onNext }: Props) {
  const tutorialActive = useTutorialStore((s) => s.tutorialActive);
  const tutorialStep   = useTutorialStore((s) => s.tutorialStep);
  const nextStep       = useTutorialStore((s) => s.nextStep);
  const skipTutorial   = useTutorialStore((s) => s.skipTutorial);

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

  const hasSecondary = !!config.secondary;
  const isCenter = config.position === "center" && !hasSecondary;
  const isBottom = config.position === "bottom" && !hasSecondary;

  return (
    <View
      style={[
        styles.overlay,
        isCenter   && styles.overlayCenter,
        isBottom   && styles.overlayBottom,
        hasSecondary && styles.overlayDual,
      ]}
      pointerEvents="box-none"
    >
      {/* Primary mascot card (always at top) */}
      <MascotCard
        config={config.primary}
        cardPosition="top"
        showActions={!hasSecondary}
        showNext={!hasSecondary && config.showNext}
        nextLabel={config.nextLabel}
        onSkip={skipTutorial}
        onNext={handleNext}
      />

      {/* Secondary mascot card (at bottom, holds action buttons for dual steps) */}
      {hasSecondary && (
        <MascotCard
          config={config.secondary!}
          cardPosition="bottom"
          showActions
          showNext={config.showNext}
          nextLabel={config.nextLabel}
          onSkip={skipTutorial}
          onNext={handleNext}
        />
      )}
    </View>
  );
}

const MASCOT_SIZE = 72;
const MASCOT_OVERLAP = 44;

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
    paddingTop: 80,
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
  overlayDual: {
    justifyContent: "space-between",
    paddingTop: 72,
    paddingBottom: 120,
  },

  // Card wrapper — reserves space for floating mascot
  cardWrapper: {
    width: "100%",
    maxWidth: 340,
    position: "relative",
  },
  cardWrapperTop: {
    marginTop: MASCOT_OVERLAP,
  },
  cardWrapperBottom: {
    marginBottom: MASCOT_OVERLAP,
  },

  // Mascot
  mascot: {
    width: MASCOT_SIZE,
    height: MASCOT_SIZE,
    position: "absolute",
    zIndex: 1,
  },
  mascotTop: {
    top: -MASCOT_OVERLAP,
  },
  mascotBottom: {
    bottom: -MASCOT_OVERLAP,
  },
  mascotLeft: {
    left: 16,
  },
  mascotRight: {
    right: 16,
  },

  // Card
  card: {
    backgroundColor: "#1E2433",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  cardBottomVariant: {
    paddingBottom: 20,
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
    justifyContent: "center",
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
