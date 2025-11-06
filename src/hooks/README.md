# Hooks

Custom React hooks untuk logic reusable.

## Current Hooks:

- ✅ `use-color-scheme.ts` - Hook untuk detect light/dark mode
- ✅ `use-color-scheme.web.ts` - Platform-specific untuk web
- ✅ `use-theme-color.ts` - Hook untuk get themed colors

## Usage:

```typescript
import { useColorScheme, useThemeColor } from "@/src/hooks";

// Detect color scheme
const colorScheme = useColorScheme(); // 'light' | 'dark'

// Get themed color
const backgroundColor = useThemeColor({}, "background");
```

## Future Hooks untuk Tinder App:

- `useSwipe.ts` - Handle swipe gestures
- `useMatch.ts` - Manage match logic
- `useChat.ts` - Chat functionality
- `useProfile.ts` - Profile data management
- `useLocation.ts` - Location services
- `useAuth.ts` - Authentication logic
