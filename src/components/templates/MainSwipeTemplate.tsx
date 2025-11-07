import { Logo } from "@/src/components/atoms/Logo";
import { ActionButtons } from "@/src/components/molecules/ActionButtons";
import { NoMoreCardsScreen, SwipeCard } from "@/src/components/organisms";
import type { User } from "@/src/types";
import { useCallback, useMemo, useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock data - replace with real API data later
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Jessica",
    age: 26,
    distance: 8,
    photos: ["https://picsum.photos/400/600?random=3"],
    verified: true,
    bio: "Foodie and photographer",
  },
  {
    id: "2",
    name: "에스더",
    age: 30,
    distance: 24,
    photos: ["https://picsum.photos/400/600?random=1"],
    verified: true,
    bio: "Love traveling and coffee",
  },
  {
    id: "3",
    name: "Sarah",
    age: 28,
    distance: 15,
    photos: ["https://picsum.photos/400/600?random=2"],
    verified: false,
    bio: "Yoga enthusiast",
  },
  {
    id: "4",
    name: "BANG",
    age: 33,
    distance: 22,
    photos: ["https://picsum.photos/400/600?random=4"],
    verified: true,
    bio: "Foodie and MUKBANG",
  },
];

interface MainSwipeTemplateProps {
  users?: User[];
}

export function MainSwipeTemplate({
  users = MOCK_USERS,
}: MainSwipeTemplateProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipeLeft = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const currentUser = users[prevIndex];
      console.log(
        "Swiped left (Pass):",
        currentUser?.name,
        "prevIndex:",
        prevIndex
      );
      const nextIndex = prevIndex + 1;

      // Log when no more cards
      if (nextIndex >= users.length) {
        console.log("No more cards!");
      }

      return nextIndex;
    });
  }, [users]);

  const handleSwipeRight = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const currentUser = users[prevIndex];
      console.log(
        "Swiped right (Like):",
        currentUser?.name,
        "prevIndex:",
        prevIndex
      );
      const nextIndex = prevIndex + 1;

      // Log when no more cards
      if (nextIndex >= users.length) {
        console.log("No more cards!");
      }

      return nextIndex;
    });
  }, [users]);

  const handleRewind = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        console.log("Rewinding from index:", prevIndex, "to:", prevIndex - 1);
        return prevIndex - 1;
      }
      console.log("Already at first card, cannot rewind");
      return prevIndex;
    });
  }, []);

  const handlePass = useCallback(() => {
    handleSwipeLeft();
  }, [handleSwipeLeft]);

  const handleLike = useCallback(() => {
    handleSwipeRight();
  }, [handleSwipeRight]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
  }, []);

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

        console.log(`  -> Not in range`);
        return null;
      })
      .filter(Boolean);

    console.log("Total cards rendered:", cardsToRender.length);
    console.log("=== RENDER CARDS END ===");
    return cardsToRender;
  }, [currentIndex, users, handleSwipeLeft, handleSwipeRight, handleRestart]);

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
});
