import { atom, selector } from "recoil";
import type { User } from "../types";

// Current swipe index
export const currentSwipeIndexState = atom<number>({
  key: "currentSwipeIndexState",
  default: 0,
});

// All fetched users from API
export const usersState = atom<User[]>({
  key: "usersState",
  default: [],
});

// Current page for pagination
export const currentPageState = atom<number>({
  key: "currentPageState",
  default: 1,
});

// Liked users
export const likedUsersState = atom<User[]>({
  key: "likedUsersState",
  default: [],
});

// Passed users
export const passedUsersState = atom<User[]>({
  key: "passedUsersState",
  default: [],
});

// Selector to check if we need to load more users
export const shouldLoadMoreSelector = selector({
  key: "shouldLoadMoreSelector",
  get: ({ get }) => {
    const currentIndex = get(currentSwipeIndexState);
    const users = get(usersState);

    // Load more when we're 2 cards away from the end
    return currentIndex >= users.length - 2;
  },
});

// Selector to get current and next user
export const currentUsersSelector = selector({
  key: "currentUsersSelector",
  get: ({ get }) => {
    const currentIndex = get(currentSwipeIndexState);
    const users = get(usersState);

    return {
      current: users[currentIndex] || null,
      next: users[currentIndex + 1] || null,
    };
  },
});
