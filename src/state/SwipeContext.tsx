import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import type { User } from "../types";

interface SwipeContextType {
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  likedUsers: User[];
  setLikedUsers: React.Dispatch<React.SetStateAction<User[]>>;
  passedUsers: User[];
  setPassedUsers: React.Dispatch<React.SetStateAction<User[]>>;

  // Helper functions
  addLikedUser: (user: User) => void;
  addPassedUser: (user: User) => void;
  removeLikedUser: (userId: string) => void;
  removePassedUser: (userId: string) => void;
  resetIndex: () => void;
  incrementIndex: () => void;
  decrementIndex: () => void;
}

const SwipeContext = createContext<SwipeContextType | undefined>(undefined);

export function SwipeProvider({ children }: { children: ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [likedUsers, setLikedUsers] = useState<User[]>([]);
  const [passedUsers, setPassedUsers] = useState<User[]>([]);

  const addLikedUser = useCallback((user: User) => {
    setLikedUsers((prev) => [...prev, user]);
  }, []);

  const addPassedUser = useCallback((user: User) => {
    setPassedUsers((prev) => [...prev, user]);
  }, []);

  const removeLikedUser = useCallback((userId: string) => {
    setLikedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const removePassedUser = useCallback((userId: string) => {
    setPassedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const resetIndex = useCallback(() => {
    setCurrentIndex(0);
  }, []);

  const incrementIndex = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const decrementIndex = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const value = {
    currentIndex,
    setCurrentIndex,
    users,
    setUsers,
    likedUsers,
    setLikedUsers,
    passedUsers,
    setPassedUsers,
    addLikedUser,
    addPassedUser,
    removeLikedUser,
    removePassedUser,
    resetIndex,
    incrementIndex,
    decrementIndex,
  };

  return (
    <SwipeContext.Provider value={value}>{children}</SwipeContext.Provider>
  );
}

export function useSwipeContext() {
  const context = useContext(SwipeContext);
  if (context === undefined) {
    throw new Error("useSwipeContext must be used within a SwipeProvider");
  }
  return context;
}
