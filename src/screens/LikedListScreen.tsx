import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProfileCard } from "../components/atoms/ProfileCard";
import { useInfiniteLikedPeople } from "../hooks";
import type { User } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const ShimmerCard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.shimmerCard}>
        <Animated.View
          style={[
            styles.shimmerImage,
            {
              opacity,
            },
          ]}
        />
        <View style={styles.shimmerContent}>
          <Animated.View style={[styles.shimmerTitle, { opacity }]} />
          <Animated.View style={[styles.shimmerSubtitle, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

// 5. Buat komponen LikedListScreen
export default function LikedListScreen() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteLikedPeople(10);

  useFocusEffect(
    useCallback(() => {
      console.log("🔄 Liked screen focused - refetching data");
      refetch();
    }, [refetch])
  );

  const renderProfileCard = useCallback(({ item }: { item: User }) => {
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

  const keyExtractor = useCallback(
    (item: User, index: number) => `liked-${item.id}-${index}`,
    []
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;

      const paddingToBottom = 20;
      const isCloseToBottom =
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - paddingToBottom;

      if (isCloseToBottom && hasNextPage && !isFetchingNextPage) {
        console.log("🎯 Loading next page from scroll");
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage && !hasNextPage) {
      return (
        <View style={styles.footerLoader}>
          <Text style={styles.noMoreText}>No more profiles</Text>
        </View>
      );
    }

    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.shimmerContainer}>
        <View style={styles.shimmerRow}>
          <ShimmerCard />
          <ShimmerCard />
        </View>
      </View>
    );
  }, [isFetchingNextPage, hasNextPage]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Liked Profiles</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading liked profiles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Liked Profiles</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Liked Profiles</Text>
        {data?.totalUsers !== undefined && (
          <Text style={styles.countText}>
            {data.totalUsers} {data.totalUsers === 1 ? "person" : "people"}
          </Text>
        )}
      </View>

      {likedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No liked profiles yet</Text>
          <Text style={styles.emptySubtext}>
            Swipe right on profiles you like
          </Text>
        </View>
      ) : (
        <FlatList
          data={likedUsers}
          renderItem={renderProfileCard}
          keyExtractor={keyExtractor}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          onRefresh={refetch}
          refreshing={isLoading && likedUsers.length === 0}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </SafeAreaView>
  );
}

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
  noMoreText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  // Shimmer styles
  shimmerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  shimmerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  shimmerCard: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    overflow: "hidden",
  },
  shimmerImage: {
    width: "100%",
    height: "75%",
    backgroundColor: "#E0E0E0",
  },
  shimmerContent: {
    padding: 12,
    gap: 8,
  },
  shimmerTitle: {
    height: 16,
    width: "70%",
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
  shimmerSubtitle: {
    height: 12,
    width: "50%",
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
  },
});
