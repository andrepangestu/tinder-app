import { ProfileCard } from "@/src/components/atoms/ProfileCard";
import type { User } from "@/src/types";
import React, { useRef } from "react";
import { Animated, Dimensions, PanResponder, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeCardProps {
  user: User;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

export function SwipeCard({
  user,
  onSwipeLeft,
  onSwipeRight,
  isTop,
}: SwipeCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          // Swipe right - Like
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          // Swipe left - Pass
          forceSwipe("left");
        } else {
          // Return to original position
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: "left" | "right") => {
    const x = direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      if (direction === "right") {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
      position.setValue({ x: 0, y: 0 });
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const cardStyle = {
    ...position.getLayout(),
    transform: [{ rotate }],
  };

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[styles.card, cardStyle, !isTop && styles.cardBehind]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <ProfileCard
        name={user.name}
        age={user.age}
        distance={user.distance}
        photoUrl={user.photos[0]}
        verified={user.verified}
      />

      {/* Like label */}
      <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
        <Animated.Text style={styles.likeText}>LIKE</Animated.Text>
      </Animated.View>

      {/* Nope label */}
      <Animated.View style={[styles.nopeLabel, { opacity: nopeOpacity }]}>
        <Animated.Text style={styles.nopeText}>NOPE</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
  },
  cardBehind: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
  likeLabel: {
    position: "absolute",
    top: 50,
    left: 40,
    borderWidth: 5,
    borderColor: "#4CAF50",
    borderRadius: 8,
    padding: 10,
    transform: [{ rotate: "-20deg" }],
  },
  likeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  nopeLabel: {
    position: "absolute",
    top: 50,
    right: 40,
    borderWidth: 5,
    borderColor: "#FF6B6B",
    borderRadius: 8,
    padding: 10,
    transform: [{ rotate: "20deg" }],
  },
  nopeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
});
