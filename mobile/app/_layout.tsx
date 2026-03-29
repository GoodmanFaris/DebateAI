import { useEffect, useState } from "react";
import { Redirect, Slot, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/src/lib/queryClient";
import { useAuthStore } from "@/src/store/auth.store";
import { useTutorialStore } from "@/src/store/tutorial.store";
import { getToken, removeToken } from "@/src/utils/tokenStorage";
import { getMe } from "@/src/api/auth";
import SplashScreen from "@/src/components/SplashScreen";

export default function RootLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const loadTutorialState = useTutorialStore((s) => s.loadTutorialState);
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

      await Promise.all([authCheck(), loadTutorialState(), minDelay]);
      setIsReady(true);
    }

    bootstrap();
  }, []);

  const inAuthGroup = segments[0] === "(auth)";

  if (!isReady) {
    return (
      <QueryClientProvider client={queryClient}>
        <SplashScreen />
        <StatusBar style="light" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {!isAuthenticated && !inAuthGroup ? (
        <Redirect href="/(auth)/login" />
      ) : isAuthenticated && inAuthGroup ? (
        <Redirect href="/(tabs)" />
      ) : (
        <>
          <Slot />
          <StatusBar style="auto" />
        </>
      )}
    </QueryClientProvider>
  );
}
