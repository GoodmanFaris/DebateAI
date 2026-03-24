import { useEffect, useState } from "react";
import { Redirect, Slot, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuthStore } from "@/src/store/auth.store";
import { getToken, removeToken } from "@/src/utils/tokenStorage";
import { getMe } from "@/src/api/auth";
import SplashScreen from "@/src/components/SplashScreen";

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 1000));

      const authCheck = async () => {
        try {
          const token = await getToken();
          if (!token) return;

          const user = await getMe(token);
          setAuth(token, user);
        } catch {
          await removeToken();
        }
      };

      await Promise.all([authCheck(), minDelay]);
      setIsReady(true);
    }

    bootstrap();
  }, []);

  if (!isReady) {
    return (
      <>
        <SplashScreen />
        <StatusBar style="light" />
      </>
    );
  }

  const inAuthGroup = segments[0] === "(auth)";

  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Slot />
      <StatusBar style="auto" />
    </>
  );
}
