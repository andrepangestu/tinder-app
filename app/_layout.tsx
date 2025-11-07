import "react-native-gesture-handler";
import "react-native-reanimated";

import { SplashScreen } from "@/src/components/organisms";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RecoilRoot } from "recoil";

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (React Query v5 uses gcTime instead of cacheTime)
    },
  },
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading assets/fonts/etc
    async function prepare() {
      try {
        // Load fonts, assets, etc here
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appReady && splashAnimationFinished) {
      ExpoSplashScreen.hideAsync();
      // Navigate to home screen after splash
      router.replace("/(tabs)");
    }
  }, [appReady, splashAnimationFinished, router]);

  const showSplash = !appReady || !splashAnimationFinished;

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
          {showSplash && (
            <SplashScreen onFinish={() => setSplashAnimationFinished(true)} />
          )}
        </SafeAreaProvider>
      </RecoilRoot>
    </QueryClientProvider>
  );
}
