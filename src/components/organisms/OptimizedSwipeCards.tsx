/**
 * OPTIMIZED: Swipe Cards Implementation
 * Menggunakan infinite query dengan ultra-smooth performance
 */

import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  useInfiniteRecommendedPeople,
  useRefreshRecommendedPeople,
} from "../../hooks/use-recommended-people";
import type { User } from "../../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OptimizedSwipeCardsProps {
  onSwipe?: (user: User, direction: "left" | "right") => void;
  onSuperLike?: (user: User) => void;
  renderCard: (
    user: User,
    index: number,
    totalCards: number
  ) => React.ReactElement;
}

export const OptimizedSwipeCards: React.FC<OptimizedSwipeCardsProps> = ({
  onSwipe,
  onSuperLike,
  renderCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { refresh, refreshSilently } = useRefreshRecommendedPeople();

  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteRecommendedPeople(10); // Load 10 per batch

  // OPTIMIZATION: Calculate visible cards (current + next 2)
  const visibleCards = useMemo(() => {
    if (!data?.users) return [];
    return data.users.slice(currentIndex, currentIndex + 3);
  }, [data?.users, currentIndex]);

  // AUTO LOAD MORE: Saat mendekati akhir stack
  const checkAndLoadMore = useCallback(() => {
    if (!data?.users) return;

    const remainingCards = data.users.length - currentIndex;

    // Load more saat remaining cards < 5 dan masih ada next page
    if (remainingCards < 5 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    data?.users,
    currentIndex,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  // Handle swipe dengan optimistic update
  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!data?.users || currentIndex >= data.users.length) return;

      const currentUser = data.users[currentIndex];

      // Optimistic update UI dulu
      setCurrentIndex((prev) => prev + 1);

      // Callback ke parent
      onSwipe?.(currentUser, direction);

      // Check if need load more
      checkAndLoadMore();
    },
    [data?.users, currentIndex, onSwipe, checkAndLoadMore]
  );

  const handleSuperLike = useCallback(() => {
    if (!data?.users || currentIndex >= data.users.length) return;

    const currentUser = data.users[currentIndex];

    // Optimistic update
    setCurrentIndex((prev) => prev + 1);

    // Callback ke parent
    onSuperLike?.(currentUser);

    // Check if need load more
    checkAndLoadMore();
  }, [data?.users, currentIndex, onSuperLike, checkAndLoadMore]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF5864" />
        <Text style={styles.loadingText}>Finding matches...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load recommendations</Text>
        <Text style={styles.retryText} onPress={refresh}>
          Tap to retry
        </Text>
      </View>
    );
  }

  // No more cards
  if (!data?.users || currentIndex >= data.users.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyTitle}>That's everyone!</Text>
        <Text style={styles.emptySubtitle}>
          Check back later for new people
        </Text>
        <Text
          style={styles.retryText}
          onPress={() => {
            setCurrentIndex(0);
            refreshSilently();
          }}
        >
          Refresh
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cards Stack - render hanya yang visible */}
      {visibleCards.map((user, index) => {
        const cardIndex = currentIndex + index;
        const isTopCard = index === 0;

        return (
          <View
            key={user.id}
            style={[
              styles.card,
              {
                zIndex: visibleCards.length - index,
                // Scale & position effect untuk cards di belakang
                transform: [
                  { scale: 1 - index * 0.03 },
                  { translateY: index * -10 },
                ],
                opacity: 1 - index * 0.2,
              },
            ]}
          >
            {renderCard(user, cardIndex, data.users.length)}
          </View>
        );
      })}

      {/* Loading indicator saat fetch next page */}
      {isFetchingNextPage && (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#FF5864" />
          <Text style={styles.loadingMoreText}>Loading more...</Text>
        </View>
      )}

      {/* Debug info (remove di production) */}
      {__DEV__ && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Card: {currentIndex + 1}/{data.users.length}
          </Text>
          <Text style={styles.debugText}>
            Total: {data.totalUsers} | Cached: {data.users.length}
          </Text>
          <Text style={styles.debugText}>
            Has More: {hasNextPage ? "Yes" : "No"}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  card: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.9,
    height: "80%",
    alignSelf: "center",
    top: "10%",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 10,
  },
  retryText: {
    marginTop: 10,
    fontSize: 16,
    color: "#FF5864",
    fontWeight: "600",
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  loadingMoreContainer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  debugInfo: {
    position: "absolute",
    top: 40,
    left: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 10,
    borderRadius: 8,
  },
  debugText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "monospace",
  },
});

export default OptimizedSwipeCards;
