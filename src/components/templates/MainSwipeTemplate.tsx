import { Logo } from "@/src/components/atoms/Logo";
import { ActionButtons } from "@/src/components/molecules/ActionButtons";
import { SwipeCard } from "@/src/components/organisms/SwipeCard";
import type { User } from "@/src/types";
import { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";

// Mock data - replace with real API data later
const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "에스더",
    age: 30,
    distance: 24,
    photos: ["https://picsum.photos/400/600?random=1"],
    verified: true,
    bio: "Love traveling and coffee",
  },
  {
    id: "2",
    name: "Sarah",
    age: 28,
    distance: 15,
    photos: ["https://picsum.photos/400/600?random=2"],
    verified: false,
    bio: "Yoga enthusiast",
  },
  {
    id: "3",
    name: "Jessica",
    age: 26,
    distance: 8,
    photos: ["https://picsum.photos/400/600?random=3"],
    verified: true,
    bio: "Foodie and photographer",
  },
];

interface MainSwipeTemplateProps {
  users?: User[];
}

export function MainSwipeTemplate({
  users = MOCK_USERS,
}: MainSwipeTemplateProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cards = users;

  const handleSwipeLeft = () => {
    console.log("Swiped left (Pass):", cards[currentIndex]?.name);
    setCurrentIndex(currentIndex + 1);
  };

  const handleSwipeRight = () => {
    console.log("Swiped right (Like):", cards[currentIndex]?.name);
    setCurrentIndex(currentIndex + 1);
  };

  const handleRewind = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePass = () => {
    handleSwipeLeft();
  };

  const handleLike = () => {
    handleSwipeRight();
  };

  const renderCards = () => {
    if (currentIndex >= cards.length) {
      return (
        <View style={styles.noMoreCards}>
          <Logo size={100} showText={false} textColor="#FF6B6B" />
        </View>
      );
    }

    return cards
      .map((user, index) => {
        if (index < currentIndex) {
          return null;
        }

        if (index === currentIndex || index === currentIndex + 1) {
          return (
            <SwipeCard
              key={user.id}
              user={user}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              isTop={index === currentIndex}
            />
          );
        }

        return null;
      })
      .reverse();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Logo */}
      <View style={styles.header}>
        <Logo size={40} showText={false} textColor="#FF6B6B" />
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>{renderCards()}</View>

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
