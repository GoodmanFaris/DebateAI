import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  ImageSourcePropType,
  ViewStyle,
} from "react-native";
import colors from "../constants/colors";

type Props = {
  mascot: ImageSourcePropType;
  message?: string;
  size?: number;
  animation?: "float" | "pulse";
  layout?: "vertical" | "horizontal";
  autoHide?: number;   // ms after mount, then fade out
  style?: ViewStyle;
};

export default function MascotBubble({
  mascot,
  message,
  size = 56,
  animation = "float",
  layout = "vertical",
  autoHide,
  style,
}: Props) {
  const floatAnim    = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const entryScale   = useRef(new Animated.Value(0.95)).current;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Entry: fade in + scale
    Animated.parallel([
      Animated.timing(entryOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(entryScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (animation === "float") {
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
    } else {
      // Pulse: opacity breathes 1.0 → 0.4 → 1.0
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    if (autoHide) {
      const t = setTimeout(() => {
        Animated.timing(entryOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setHidden(true));
      }, autoHide);
      return () => clearTimeout(t);
    }
  }, []);

  if (hidden) return null;

  // Image gets float (vertical) or pulse
  const imageStyle: any = {
    width: size,
    height: size,
    ...(animation === "float" && layout === "vertical" && {
      transform: [{ translateY: floatAnim }],
    }),
    ...(animation === "pulse" && { opacity: pulseAnim }),
  };

  if (layout === "horizontal") {
    // Whole bubble floats together (message + mascot)
    return (
      <Animated.View
        style={[
          styles.row,
          style,
          {
            opacity: entryOpacity,
            transform: [
              { scale: entryScale },
              ...(animation === "float" ? [{ translateY: floatAnim }] : []),
            ] as any,
          },
        ]}
      >
        {message && (
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>{message}</Text>
          </View>
        )}
        <Animated.Image source={mascot} style={imageStyle} resizeMode="contain" />
      </Animated.View>
    );
  }

  // Vertical: mascot on top, message below
  return (
    <Animated.View
      style={[
        styles.column,
        style,
        {
          opacity: entryOpacity,
          transform: [{ scale: entryScale }] as any,
        },
      ]}
    >
      <Animated.Image source={mascot} style={imageStyle} resizeMode="contain" />
      {message && <Text style={styles.messageText}>{message}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: "center",
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bubble: {
    backgroundColor: "#1E2433",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: 180,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textPrimary,
    lineHeight: 18,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
  },
});
