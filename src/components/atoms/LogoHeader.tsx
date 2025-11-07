import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

interface LogoHeaderProps {
  size?: number;
}

export function LogoHeader({ size = 120 }: LogoHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Tinder logo from assets */}
      <View style={[styles.logoContainer, { width: size, height: size }]}>
        <Image
          source={require("@/assets/images/tinder-logo-text.png")}
          style={{ width: size, height: size }}
          contentFit="contain"
        />
      </View>
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
});
