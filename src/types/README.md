# Types

TypeScript type definitions.

## Planned Types:

```typescript
// user.types.ts
export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  location: Location;
  preferences: Preferences;
}

// match.types.ts
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  timestamp: Date;
  chatId?: string;
}

// chat.types.ts
export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  read: boolean;
}
```
