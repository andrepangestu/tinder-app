import { Logo } from "@/src/components/atoms/Logo";
import { ActionButtons } from "@/src/components/molecules/ActionButtons";
import { NoMoreCardsScreen, SwipeCard } from "@/src/components/organisms";
import { useInfiniteRecommendedPeople } from "@/src/hooks";
import {
  currentSwipeIndexState,
  likedUsersState,
  passedUsersState,
  shouldLoadMoreSelector,
  usersState,
} from "@/src/state";
import { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

export function MainSwipeTemplate() {
  // Recoil state
  const [currentIndex, setCurrentIndex] = useRecoilState(
    currentSwipeIndexState
  );
  const [users, setUsers] = useRecoilState(usersState);
  const setLikedUsers = useSetRecoilState(likedUsersState);
  const setPassedUsers = useSetRecoilState(passedUsersState);
  const shouldLoadMore = useRecoilValue(shouldLoadMoreSelector);

  // React Query - fetch data with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteRecommendedPeople(5);

  // Load initial data and update Recoil state
  useEffect(() => {
    if (data?.users && data.users.length > 0) {
      setUsers(data.users);
    }
  }, [data, setUsers]);

  // Auto-load more when approaching end
  useEffect(() => {
    if (shouldLoadMore && hasNextPage && !isFetchingNextPage) {
      console.log("Auto-loading next page...");
      fetchNextPage();
    }
  }, [shouldLoadMore, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSwipeLeft = useCallback(() => {
    const currentUser = users[currentIndex];
    console.log(
      "Swiped left (Pass):",
      currentUser?.name,
      "currentIndex:",
      currentIndex
    );

    // ✅ FIX: Update Recoil states OUTSIDE of state updater
    if (currentUser) {
      setPassedUsers((prev) => [...prev, currentUser]);
    }

    // Update index separately
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;

      // Log when no more cards
      if (nextIndex >= users.length) {
        console.log("No more cards!");
      }

      return nextIndex;
    });
  }, [users, currentIndex, setPassedUsers, setCurrentIndex]);

  const handleSwipeRight = useCallback(() => {
    const currentUser = users[currentIndex];
    console.log(
      "Swiped right (Like):",
      currentUser?.name,
      "currentIndex:",
      currentIndex
    );

    // ✅ FIX: Update Recoil states OUTSIDE of state updater
    if (currentUser) {
      setLikedUsers((prev) => [...prev, currentUser]);
    }

    // Update index separately
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;

      // Log when no more cards
      if (nextIndex >= users.length) {
        console.log("No more cards!");
      }

      return nextIndex;
    });
  }, [users, currentIndex, setLikedUsers, setCurrentIndex]);

  const handleRewind = useCallback(() => {
    if (currentIndex > 0) {
      console.log(
        "Rewinding from index:",
        currentIndex,
        "to:",
        currentIndex - 1
      );

      // ✅ FIX: Update Recoil states OUTSIDE of state updater
      const previousUser = users[currentIndex - 1];
      if (previousUser) {
        setLikedUsers((prev) => prev.filter((u) => u.id !== previousUser.id));
        setPassedUsers((prev) => prev.filter((u) => u.id !== previousUser.id));
      }

      // Update index separately
      setCurrentIndex((prevIndex) => prevIndex - 1);
    } else {
      console.log("Already at first card, cannot rewind");
    }
  }, [currentIndex, users, setLikedUsers, setPassedUsers, setCurrentIndex]);

  const handlePass = useCallback(() => {
    handleSwipeLeft();
  }, [handleSwipeLeft]);

  const handleLike = useCallback(() => {
    handleSwipeRight();
  }, [handleSwipeRight]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
  }, [setCurrentIndex]);

  const renderCards = useMemo(() => {
    if (currentIndex >= users.length) {
      console.log("Showing NoMoreCardsScreen");
      return <NoMoreCardsScreen onRestart={handleRestart} />;
    }

    const cardsToRender = users
      .map((user, index) => {
        if (index < currentIndex) {
          return null;
        }

        // Render current card and next card (if exists)
        if (index === currentIndex || index === currentIndex + 1) {
          const isTopCard = index === currentIndex;
          // Calculate z-index: top card should have higher z-index
          const zIndex = isTopCard ? 2 : 1;
          // Only top card should receive touch events
          const pointerEvents = isTopCard ? "auto" : "none";

          return (
            <View
              key={user.id}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                zIndex: zIndex,
              }}
              pointerEvents={pointerEvents}
            >
              <SwipeCard
                user={user}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isTop={isTopCard}
              />
            </View>
          );
        }

        return null;
      })
      .filter(Boolean);

    return cardsToRender;
  }, [currentIndex, users, handleSwipeLeft, handleSwipeRight, handleRestart]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading profiles...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Error loading profiles</Text>
          <Text style={styles.errorDetail}>
            {error instanceof Error ? error.message : "Unknown error"}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Logo */}
      <View style={styles.header}>
        <Logo size={40} showText={false} textColor="#FF6B6B" />
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>{renderCards}</View>

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <ActionButtons
          onRewind={handleRewind}
          onPass={handlePass}
          onLike={handleLike}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMoreCards: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 12,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FF6B6B",
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
