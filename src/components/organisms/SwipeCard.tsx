import { ProfileCard } from "@/src/components/atoms/ProfileCard";
import type { User } from "@/src/types";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, PanResponder, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeCardProps {
  user: User;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

function SwipeCardComponent({
  user,
  onSwipeLeft,
  onSwipeRight,
  isTop,
}: SwipeCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const isMounted = useRef(true);
  const isTopRef = useRef(isTop);

  console.log(
    `🎴 Card ${user.name} (${user.id}) - Component render, isTop:`,
    isTop
  );

  // CRITICAL: Update isTopRef immediately before creating PanResponder
  isTopRef.current = isTop;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  // Update isTopRef when isTop changes
  useEffect(() => {
    const prevValue = isTopRef.current;
    isTopRef.current = isTop;
    console.log(
      `✅ Card ${user.name} (${user.id}) - isTop updated: ${prevValue} -> ${isTop}`
    );

    // Reset position when becoming top card
    if (isTop && !prevValue) {
      console.log(
        `🔄 Card ${user.name} (${user.id}) - Reset position (became top card)`
      );
      position.setValue({ x: 0, y: 0 });
    }
  }, [isTop, user.name, user.id, position]);

  // Reset position when user changes (new card appears)
  useEffect(() => {
    console.log(
      `🔄 Card ${user.name} (${user.id}) - Position reset (user changed)`
    );
    position.setValue({ x: 0, y: 0 });
  }, [user.id, position, user.name]);

  // Cleanup on unmount
  useEffect(() => {
    console.log(`🟢 Card ${user.name} (${user.id}) - Mounted`);
    isMounted.current = true;
    return () => {
      console.log(`🔴 Card ${user.name} (${user.id}) - Unmounted`);
      isMounted.current = false;
    };
  }, [user.name, user.id]);

  const forceSwipe = (direction: "left" | "right") => {
    const x = direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 200,
      useNativeDriver: true,
    }).start((finished) => {
      if (finished && isMounted.current) {
        // Call callback immediately after animation finishes
        if (direction === "right") {
          onSwipeRight();
        } else {
          onSwipeLeft();
        }
      }
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  // Create PanResponder once - it will read from isTopRef which gets updated
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        const shouldRespond = isTopRef.current;
        console.log(
          `${user.name} (${user.id}) - onStartShouldSetPanResponder, isTopRef.current:`,
          shouldRespond
        );
        return shouldRespond;
      },
      onPanResponderMove: (_, gesture) => {
        if (!isTopRef.current) {
          console.log(`${user.name} - Ignoring move, not top card`);
          return;
        }
        console.log(`${user.name} - Moving:`, gesture.dx, gesture.dy);
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (!isTopRef.current) {
          console.log(`${user.name} - Ignoring release, not top card`);
          return;
        }
        console.log(`${user.name} - Released at:`, gesture.dx);
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

  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
    ],
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
      style={[styles.card, animatedCardStyle, !isTop && styles.cardBehind]}
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
    width: "100%",
    height: "100%",
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

// Custom comparison function for React.memo
function arePropsEqual(prevProps: SwipeCardProps, nextProps: SwipeCardProps) {
  // Re-render if user changes or isTop changes
  const userChanged = prevProps.user.id !== nextProps.user.id;
  const isTopChanged = prevProps.isTop !== nextProps.isTop;

  console.log(`🔍 arePropsEqual for ${nextProps.user.name}:`, {
    userChanged,
    isTopChanged,
    shouldUpdate: userChanged || isTopChanged,
    prevIsTop: prevProps.isTop,
    nextIsTop: nextProps.isTop,
  });

  // Return true if props are equal (should NOT re-render)
  // Return false if props are different (should re-render)
  return !userChanged && !isTopChanged;
}

// Export with React.memo using custom comparison
export const SwipeCard = React.memo(SwipeCardComponent, arePropsEqual);
