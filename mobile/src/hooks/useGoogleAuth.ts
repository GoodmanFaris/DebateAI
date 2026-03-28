import { useState } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useAuthStore } from "../store/auth.store";
import { googleAuth, getMe } from "../api/auth";
import config from "../constants/config";

GoogleSignin.configure({
  webClientId: config.googleWebClientId,
});

export function useGoogleAuth() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      const idToken = response.data?.idToken;
      if (!idToken) {
        setError("Could not get Google token.");
        setLoading(false);
        return;
      }

      const { access_token } = await googleAuth(idToken);
      const user = await getMe(access_token);
      setAuth(access_token, user);
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled, do nothing
      } else if (err.code === statusCodes.IN_PROGRESS) {
        // sign in already in progress
      } else if (err?.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return { handleGoogleLogin, loading, error };
}
