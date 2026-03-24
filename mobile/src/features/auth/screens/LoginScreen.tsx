import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../store/auth.store";
import { login, getMe } from "../../../api/auth";
import { useGoogleAuth } from "../../../hooks/useGoogleAuth";
import { AxiosError } from "axios";
import colors from "../../../constants/colors";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();
  const google = useGoogleAuth();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const { access_token } = await login({ email, password });
      const user = await getMe(access_token);
      setAuth(access_token, user);
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail: string }>;
      setError(
        axiosErr.response?.data?.detail ?? "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgba(231, 76, 60, 0.18)", "transparent"]}
        style={styles.topGlow}
      />
      <LinearGradient
        colors={["transparent", "rgba(74, 144, 217, 0.18)"]}
        style={styles.bottomGlow}
      />

      <View style={styles.inner}>
        <View style={styles.brand}>
          <Image
            source={require("../../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>
            <Text style={styles.debate}>Debate</Text>
            <Text style={styles.ai}>AI</Text>
          </Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            editable={!loading}
          />
          <Pressable
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible((v) => !v)}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={20}
              color="rgba(255,255,255,0.4)"
            />
          </Pressable>
        </View>

        <Pressable
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Log In</Text>
          )}
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {google.error ? (
          <Text style={styles.error}>{google.error}</Text>
        ) : null}

        <Pressable
          style={[styles.googleButton, google.loading && styles.buttonDisabled]}
          onPress={google.handleGoogleLogin}
          disabled={loading || google.loading}
        >
          {google.loading ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push("/register")} disabled={loading}>
          <Text style={styles.registerLink}>
            Don't have an account?{" "}
            <Text style={styles.registerLinkAccent}>Register</Text>
          </Text>
        </Pressable>
      </View>
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
  inner: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  brand: {
    alignItems: "center",
    marginBottom: 36,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
  },
  debate: {
    color: colors.primaryBlue,
  },
  ai: {
    color: colors.primaryRed,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.45)",
  },
  error: {
    color: colors.primaryRed,
    textAlign: "center",
    marginBottom: 14,
    fontSize: 14,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 14,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 48,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    marginHorizontal: 12,
    color: "rgba(255,255,255,0.3)",
    fontSize: 13,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 28,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  googleButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "500",
  },
  registerLink: {
    textAlign: "center",
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
  registerLinkAccent: {
    color: colors.primaryBlue,
    fontWeight: "600",
  },
});
