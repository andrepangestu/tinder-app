import { Logo } from "@/src/components/atoms/Logo";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NoMoreCardsScreenProps {
  onRestart?: () => void;
}

export function NoMoreCardsScreen({ onRestart }: NoMoreCardsScreenProps) {
  return (
    <View style={styles.container}>
      <Logo size={120} showText={false} textColor="#FF6B6B" />

      <Text style={styles.title}>All Profiles Viewed</Text>

      <Text style={styles.subtitle}>You have seen all available profiles</Text>

      {/* Info Text */}
      <Text style={styles.infoText}>
        Check back later for new profiles, or change your search preferences
      </Text>

      {/* Restart Button (optional) */}
      {onRestart && (
        <TouchableOpacity style={styles.button} onPress={onRestart}>
          <Text style={styles.buttonText}>🔄 View Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    marginTop: 30,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },
  infoText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});
