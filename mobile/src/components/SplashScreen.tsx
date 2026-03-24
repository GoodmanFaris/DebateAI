import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../constants/colors";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(231, 76, 60, 0.18)", "transparent"]}
        style={styles.topGlow}
      />

      <View style={styles.content}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>
          <Text style={styles.debate}>Debate</Text>
          <Text style={styles.ai}>AI</Text>
        </Text>
      </View>

      <LinearGradient
        colors={["transparent", "rgba(74, 144, 217, 0.18)"]}
        style={styles.bottomGlow}
      />
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
    height: 180,
  },
  bottomGlow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  debate: {
    color: colors.primaryBlue,
  },
  ai: {
    color: colors.primaryRed,
  },
});
