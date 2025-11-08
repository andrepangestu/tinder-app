import { ProfileCard } from "@/src/components/atoms/ProfileCard";
import type { User } from "@/src/types";
import React, { useEffect, useImperativeHandle, useRef } from "react";
import { Animated, Dimensions, PanResponder, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeCardProps {
  user: User;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
}

export interface SwipeCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
}

function SwipeCardComponent(
  { user, onSwipeLeft, onSwipeRight, isTop }: SwipeCardProps,
  ref: React.Ref<SwipeCardRef>
) {
  const position = useRef(new Animated.ValueXY()).current;
  const isMounted = useRef(true);
  const isTopRef = useRef(isTop);

  isTopRef.current = isTop;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  useEffect(() => {
    const prevValue = isTopRef.current;
    isTopRef.current = isTop;

    if (isTop && !prevValue) {
      position.setValue({ x: 0, y: 0 });
    }
  }, [isTop, user.name, user.id, position]);

  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [user.id, position, user.name]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, [user.name, user.id]);

  useImperativeHandle(ref, () => ({
    swipeLeft: () => forceSwipe("left"),
    swipeRight: () => forceSwipe("right"),
  }));

  const forceSwipe = (direction: "left" | "right") => {
    const x = direction === "right" ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 200,
      useNativeDriver: true,
    }).start((finished) => {
      if (finished && isMounted.current) {
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        const shouldRespond = isTopRef.current;
        return shouldRespond;
      },
      onPanResponderMove: (_, gesture) => {
        if (!isTopRef.current) {
          return;
        }
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (!isTopRef.current) {
          return;
        }
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
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
        distance={user.location}
        photoUrl={user.photos[0]}
      />

      <Animated.View style={[styles.likeLabel, { opacity: likeOpacity }]}>
        <Animated.Text style={styles.likeText}>LIKE</Animated.Text>
      </Animated.View>

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

function arePropsEqual(prevProps: SwipeCardProps, nextProps: SwipeCardProps) {
  const userChanged = prevProps.user.id !== nextProps.user.id;
  const isTopChanged = prevProps.isTop !== nextProps.isTop;
  return !userChanged && !isTopChanged;
}

export const SwipeCard = React.memo(
  React.forwardRef<SwipeCardRef, SwipeCardProps>(SwipeCardComponent),
  arePropsEqual
);
