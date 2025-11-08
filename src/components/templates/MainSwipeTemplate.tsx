import { ActionButtons } from "@/src/components/molecules/ActionButtons";
import { NoMoreCardsScreen, SwipeCard } from "@/src/components/organisms";
import type { SwipeCardRef } from "@/src/components/organisms/SwipeCard";
import { useInfiniteRecommendedPeople } from "@/src/hooks";
import { dislikePerson, likePerson } from "@/src/services/api";
import {
  currentSwipeIndexState,
  likedUsersState,
  passedUsersState,
  shouldLoadMoreSelector,
  usersState,
} from "@/src/state";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { LogoHeader } from "../atoms/LogoHeader";

export function MainSwipeTemplate() {
  // Recoil state
  const [currentIndex, setCurrentIndex] = useRecoilState(
    currentSwipeIndexState
  );
  const [users, setUsers] = useRecoilState(usersState);
  const setLikedUsers = useSetRecoilState(likedUsersState);
  const setPassedUsers = useSetRecoilState(passedUsersState);
  const shouldLoadMore = useRecoilValue(shouldLoadMoreSelector);

  // Ref to track current index for immediate access (avoid stale closure)
  const currentIndexRef = useRef(currentIndex);

  // Ref to current card for button animations
  const swipeCardRef = useRef<SwipeCardRef>(null);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteRecommendedPeople(5);

  useEffect(() => {
    if (data?.users && data.users.length > 0) {
      setUsers(data.users);
    }
  }, [data, setUsers]);

  useEffect(() => {
    if (shouldLoadMore && hasNextPage && !isFetchingNextPage) {
      console.log("Auto-loading next page...");
      fetchNextPage();
    }
  }, [shouldLoadMore, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSwipeLeft = useCallback(() => {
    const idx = currentIndexRef.current;
    const currentUser = users[idx];

    console.log(
      "Swiped left (Pass):",
      currentUser?.name,
      "ID:",
      currentUser?.id,
      "currentIndex:",
      idx
    );

    if (currentUser) {
      setPassedUsers((prev) => [...prev, currentUser]);

      dislikePerson(Number(currentUser.id)).catch((error) => {
        console.error("Failed to send dislike:", error);
      });
    }

    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;

      if (nextIndex >= users.length) {
        console.log("No more cards!");
      }

      return nextIndex;
    });
  }, [users, setPassedUsers, setCurrentIndex]);

  const handleSwipeRight = useCallback(() => {
    const idx = currentIndexRef.current;
    const currentUser = users[idx];

    console.log(
      "Swiped right (Like):",
      currentUser?.name,
      "ID:",
      currentUser?.id,
      "currentIndex:",
      idx
    );

    if (currentUser) {
      setLikedUsers((prev) => [...prev, currentUser]);

      // 📡 Send like to API (fire and forget, non-blocking)
      likePerson(Number(currentUser.id)).catch((error) => {
        console.error("Failed to send like:", error);
        // Silently fail - user experience not affected
      });
    }

    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;

      if (nextIndex >= users.length) {
        console.log("No more cards!");
      }

      return nextIndex;
    });
  }, [users, setLikedUsers, setCurrentIndex]);

  const handleRewind = useCallback(() => {
    if (currentIndex > 0) {
      console.log(
        "Rewinding from index:",
        currentIndex,
        "to:",
        currentIndex - 1
      );

      const previousUser = users[currentIndex - 1];
      if (previousUser) {
        setLikedUsers((prev) => prev.filter((u) => u.id !== previousUser.id));
        setPassedUsers((prev) => prev.filter((u) => u.id !== previousUser.id));
      }

      setCurrentIndex((prevIndex) => prevIndex - 1);
    } else {
      console.log("Already at first card, cannot rewind");
    }
  }, [currentIndex, users, setLikedUsers, setPassedUsers, setCurrentIndex]);

  const handlePass = useCallback(() => {
    if (swipeCardRef.current) {
      swipeCardRef.current.swipeLeft();
    } else {
      handleSwipeLeft();
    }
  }, [handleSwipeLeft]);

  const handleLike = useCallback(() => {
    if (swipeCardRef.current) {
      swipeCardRef.current.swipeRight();
    } else {
      handleSwipeRight();
    }
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

        if (index === currentIndex || index === currentIndex + 1) {
          const isTopCard = index === currentIndex;
          const zIndex = isTopCard ? 2 : 1;
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
                ref={isTopCard ? swipeCardRef : null}
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

      <LogoHeader size={100} />

      <View style={styles.cardContainer}>{renderCards}</View>

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
