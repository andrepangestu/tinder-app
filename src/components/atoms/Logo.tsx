import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
}

export function Logo({
  size = 120,
  showText = true,
  textColor = "#FFFFFF",
}: LogoProps) {
  return (
    <View style={styles.container}>
      {/* Tinder logo from assets */}
      <View style={[styles.logoContainer, { width: size, height: size }]}>
        <Image
          source={require("@/assets/images/tinder-logo.png")}
          style={{ width: size, height: size }}
          contentFit="contain"
        />
      </View>

      {showText && (
        <ThemedText type="title" style={[styles.appName, { color: textColor }]}>
          Tinder
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "transparent",
  },
  appName: {
    marginTop: 16,
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});
