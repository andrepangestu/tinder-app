import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

interface ProfileCardProps {
  name: string;
  age: number;
  distance: number;
  photoUrl: string;
  verified?: boolean;
  width?: number;
  height?: number;
}

export function ProfileCard({
  name,
  age,
  distance,
  photoUrl,
  verified,
  width,
  height,
}: ProfileCardProps) {
  const cardStyle = [styles.card, width && height ? { width, height } : null];

  return (
    <View style={cardStyle}>
      <Image
        source={{ uri: photoUrl }}
        style={styles.image}
        contentFit="cover"
      />

      {/* Gradient overlay for text readability */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.gradient}
      />

      {/* User info at bottom */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <ThemedText type="title" style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText type="title" style={styles.age}>
            {age}
          </ThemedText>
          {verified && <ThemedText style={styles.verified}>✓</ThemedText>}
        </View>

        <View style={styles.locationRow}>
          <ThemedText style={styles.distance}>
            📍 {distance}km 거리에 있음
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
  },
  infoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  name: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 8,
  },
  age: {
    fontSize: 28,
    fontWeight: "400",
    color: "#fff",
    marginRight: 8,
  },
  verified: {
    fontSize: 24,
    color: "#1E90FF",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  distance: {
    fontSize: 16,
    color: "#fff",
  },
});
