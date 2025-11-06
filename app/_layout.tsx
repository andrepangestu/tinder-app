import { SplashScreen } from "@/src/components/organisms";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

// Prevent the splash screen from auto-hiding before asset loading is complete.
ExpoSplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);

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
    }
  }, [appReady, splashAnimationFinished]);

  const showSplash = !appReady || !splashAnimationFinished;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {showSplash && (
        <SplashScreen onFinish={() => setSplashAnimationFinished(true)} />
      )}
    </>
  );
}
