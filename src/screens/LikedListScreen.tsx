// 1. Import React
import React from "react";

// 2. Import View, FlatList, Text, StyleSheet, SafeAreaView
import {
  Dimensions,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 3. Import komponen kartu profil
import { ProfileCard } from "../components/atoms/ProfileCard";

// Tipe data untuk user
interface LikedUser {
  id: string;
  name: string;
  age: number;
  image: string;
  distance: number;
  verified?: boolean;
}

// 4. Buat array 'MOCK_DATA' untuk data tiruan
const MOCK_DATA: LikedUser[] = [
  {
    id: "1",
    name: "Andre",
    age: 30,
    image: "https://picsum.photos/200/300?random=1",
    distance: 2,
    verified: true,
  },
  {
    id: "2",
    name: "Sarah",
    age: 28,
    image: "https://picsum.photos/200/300?random=2",
    distance: 5,
  },
  {
    id: "3",
    name: "Diana",
    age: 26,
    image: "https://picsum.photos/200/300?random=3",
    distance: 3,
    verified: true,
  },
  {
    id: "4",
    name: "Jessica",
    age: 29,
    image: "https://picsum.photos/200/300?random=4",
    distance: 7,
  },
  {
    id: "5",
    name: "Michael",
    age: 32,
    image: "https://picsum.photos/200/300?random=5",
    distance: 4,
    verified: true,
  },
  {
    id: "6",
    name: "Emma",
    age: 27,
    image: "https://picsum.photos/200/300?random=6",
    distance: 6,
  },
  {
    id: "7",
    name: "Olivia",
    age: 25,
    image: "https://picsum.photos/200/300?random=7",
    distance: 8,
  },
  {
    id: "8",
    name: "Sophia",
    age: 31,
    image: "https://picsum.photos/200/300?random=8",
    distance: 3,
    verified: true,
  },
  {
    id: "9",
    name: "James",
    age: 33,
    image: "https://picsum.photos/200/300?random=9",
    distance: 9,
  },
  {
    id: "10",
    name: "Isabella",
    age: 24,
    image: "https://picsum.photos/200/300?random=10",
    distance: 5,
    verified: true,
  },
];

// Hitung ukuran kartu untuk grid 2 kolom
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 kolom dengan padding

// 5. Buat komponen LikedListScreen
export default function LikedListScreen() {
  // Buat fungsi 'renderProfileCard' yang menerima { item }
  const renderProfileCard = ({ item }: { item: LikedUser }) => {
    // Return ProfileCard dengan styling untuk grid
    return (
      <View style={styles.cardWrapper}>
        <ProfileCard
          name={item.name}
          age={item.age}
          distance={item.distance}
          photoUrl={item.image}
          verified={item.verified}
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

      {/* Render <FlatList> */}
      <FlatList
        data={MOCK_DATA}
        renderItem={renderProfileCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
});
