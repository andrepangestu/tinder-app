// User profile types
export interface User {
  id: string;
  name: string;
  age: number;
  location: string;
  photos: string[];
}

// Match types
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  timestamp: Date;
}

// Swipe action types
export type SwipeAction = "like" | "pass" | "rewind";
