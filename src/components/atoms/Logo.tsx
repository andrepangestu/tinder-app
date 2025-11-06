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
      {/* Tinder-style flame icon using emoji for now */}
      <View style={[styles.logoContainer, { width: size, height: size }]}>
        <ThemedText style={[styles.logoEmoji, { fontSize: size * 0.7 }]}>
          🔥
        </ThemedText>
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
  logoEmoji: {
    textAlign: "center",
  },
  appName: {
    marginTop: 16,
    fontSize: 48,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});
