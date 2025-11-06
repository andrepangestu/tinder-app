// User profile types
export interface User {
  id: string;
  name: string;
  age: number;
  distance: number;
  photos: string[];
  bio?: string;
  verified?: boolean;
}

// Match types
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  timestamp: Date;
}

// Swipe action types
export type SwipeAction = "like" | "pass" | "superlike" | "rewind";
