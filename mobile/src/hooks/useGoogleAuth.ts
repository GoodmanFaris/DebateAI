import { useState } from "react";
import * as AuthSession from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { useAuthStore } from "../store/auth.store";
import { googleAuth, getMe } from "../api/auth";
import config from "../constants/config";

WebBrowser.maybeCompleteAuthSession();

const redirectUri = makeRedirectUri({
  scheme: "mobile",
});

export function useGoogleAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [, , promptAsync] = AuthSession.useAuthRequest({
    clientId: config.googleClientId,
    redirectUri,
    scopes: ["openid", "profile", "email"],
  });

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      const result = await promptAsync();

      if (result.type !== "success") {
        setLoading(false);
        if (result.type === "cancel" || result.type === "dismiss") {
          return;
        }
        setError("Google sign-in failed.");
        return;
      }

      const idToken = result.params?.id_token;
      if (!idToken) {
        setError("Could not get Google token.");
        setLoading(false);
        return;
      }

      const { access_token } = await googleAuth(idToken);
      const user = await getMe(access_token);
      setAuth(access_token, user);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else {
        setError("Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return { handleGoogleLogin, loading, error };
}
