import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface ActionButtonsProps {
  onRewind: () => void;
  onPass: () => void;
  onLike: () => void;
}

export function ActionButtons({
  onRewind,
  onPass,
  onLike,
}: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      {/* Rewind button */}
      <TouchableOpacity
        style={[styles.button, styles.smallButton]}
        onPress={onRewind}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../../assets/images/rewind.png")}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Pass button (X) */}
      <TouchableOpacity
        style={[styles.button, styles.largeButton, styles.passButton]}
        onPress={onPass}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../../assets/images/pass.png")}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Like button (Heart) */}
      <TouchableOpacity
        style={[styles.button, styles.largeButton, styles.likeButton]}
        onPress={onLike}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../../assets/images/like.png")}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 20,
  },
  button: {
    borderRadius: 999,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  smallButton: {
    width: 56,
    height: 56,
  },
  largeButton: {
    width: 70,
    height: 70,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  rewindIcon: {
    fontSize: 28,
    color: "#FFD700",
    fontWeight: "bold",
  },
  xIcon: {
    fontSize: 36,
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  heartIcon: {
    fontSize: 36,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  passButton: {
    borderWidth: 2,
    borderColor: "#FF6B6B",
  },
  likeButton: {
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
});
