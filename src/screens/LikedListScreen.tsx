// 1. Import React
import React, { useCallback } from "react";

// 2. Import View, FlatList, Text, StyleSheet
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useInfiniteLikedPeople } from "../hooks";

// 3. Import komponen kartu profil
import { ProfileCard } from "../components/atoms/ProfileCard";
import type { User } from "../types";

// Hitung ukuran kartu untuk grid 2 kolom
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 kolom dengan padding

// 5. Buat komponen LikedListScreen
export default function LikedListScreen() {
  // Fetch liked users from API with infinite scroll
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteLikedPeople(10); // 10 items per page

  // Buat fungsi 'renderProfileCard' yang menerima { item }
  const renderProfileCard = useCallback(({ item }: { item: User }) => {
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
  }, []);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render footer (loading indicator for load more)
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FF6B6B" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Likes by User</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading liked profiles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Likes by User</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>Failed to load liked profiles</Text>
          <Text style={styles.errorDetail}>
            {error instanceof Error ? error.message : "Unknown error"}
          </Text>
          <Text style={styles.retryText} onPress={() => refetch()}>
            Tap to retry
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const likedUsers = data?.users || [];

  // Di dalam return utama:
  return (
    // Gunakan <SafeAreaView> sebagai pembungkus utama
    <SafeAreaView style={styles.container}>
      {/* Tampilkan judul */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Likes by User</Text>
        {data?.totalUsers !== undefined && (
          <Text style={styles.countText}>
            {data.totalUsers} {data.totalUsers === 1 ? "person" : "people"}
          </Text>
        )}
      </View>

      {/* Empty state */}
      {likedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No liked profiles yet</Text>
          <Text style={styles.emptySubtext}>
            Swipe right on profiles you like
          </Text>
        </View>
      ) : (
        /* Render <FlatList> with load more */
        <FlatList
          data={likedUsers}
          renderItem={renderProfileCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          // Pull to refresh
          onRefresh={refetch}
          refreshing={isLoading}
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
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  countText: {
    fontSize: 14,
    color: "#666",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 8,
    textAlign: "center",
  },
  errorDetail: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  retryText: {
    fontSize: 16,
    color: "#FF6B6B",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: "#666",
  },
});
