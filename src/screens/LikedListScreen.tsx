// 1. Import React
import React from "react";

// 2. Import View, FlatList, Text, StyleSheet
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
import { likedUsersState } from "../state";

// 3. Import komponen kartu profil
import { ProfileCard } from "../components/atoms/ProfileCard";
import type { User } from "../types";

// Hitung ukuran kartu untuk grid 2 kolom
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 kolom dengan padding

// 5. Buat komponen LikedListScreen
export default function LikedListScreen() {
  // Get liked users from Recoil state
  const likedUsers = useRecoilValue(likedUsersState);

  // Buat fungsi 'renderProfileCard' yang menerima { item }
  const renderProfileCard = ({ item }: { item: User }) => {
    // Return ProfileCard dengan styling untuk grid
    return (
      <View style={styles.cardWrapper}>
        <ProfileCard
          name={item.name}
          age={item.age}
          distance={item.location}
          photoUrl={item.photos[0] || "https://picsum.photos/200/300"}
          width={CARD_WIDTH}
          height={CARD_WIDTH * 1.4}
        />
      </View>
    );
  };

  // Di dalam return utama:
  return (
    // Gunakan <SafeAreaView> sebagai pembungkus utama
    <SafeAreaView style={styles.container}>
      {/* Tampilkan judul */}
      <Text style={styles.title}>Likes by User</Text>

      {/* Empty state */}
      {likedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No liked profiles yet</Text>
          <Text style={styles.emptySubtext}>
            Swipe right on profiles you like
          </Text>
        </View>
      ) : (
        /* Render <FlatList> */
        <FlatList
          data={likedUsers}
          renderItem={renderProfileCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// 6. Buat StyleSheet di bawah komponen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 16,
    marginTop: 20,
    color: "#000",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
