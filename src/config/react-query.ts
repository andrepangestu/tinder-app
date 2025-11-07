/**
 * React Query Configuration
 * Global configuration untuk optimal performance
 */

import { QueryClient } from "@tanstack/react-query";

// PRODUCTION-READY Configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // === PERFORMANCE OPTIMIZATIONS ===

      // Stale-while-revalidate strategy
      staleTime: 2 * 60 * 1000, // 2 minutes - data dianggap fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time

      // Refetch strategy
      refetchOnMount: false, // Don't refetch jika data masih fresh
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch saat reconnect internet

      // Retry logic
      retry: 2, // Retry 2x on failure
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s, max 30s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },

      // Error handling
      throwOnError: false, // Handle errors via query.error, jangan throw

      // === NETWORK OPTIMIZATIONS ===

      // Request deduplication window (automatic)
      // React Query auto-deduplicate requests dalam window ini
      // networkMode: 'online', // Only fetch when online (default)

      // === DEBUGGING (disable in production) ===
      // Enable ini untuk debugging
      ...(process.env.NODE_ENV === "development" &&
        {
          // refetchOnMount: true,
          // refetchOnWindowFocus: true,
        }),
    },
    mutations: {
      // Mutation config
      retry: 1, // Retry mutation 1x
      throwOnError: false,

      // Network mode untuk mutations
      // networkMode: 'online',
    },
  },
});

// === HELPER FUNCTIONS ===

/**
 * Clear all query cache
 * Gunakan saat logout atau perlu reset state
 */
export function clearAllCache() {
  queryClient.clear();
}

/**
 * Invalidate specific queries
 * Gunakan setelah mutation untuk refresh data
 */
export function invalidateRecommendedPeople() {
  queryClient.invalidateQueries({
    queryKey: ["infiniteRecommendedPeople"],
  });
  queryClient.invalidateQueries({
    queryKey: ["recommendedPeople"],
  });
}

/**
 * Prefetch recommended people
 * Gunakan saat anticipate user akan buka halaman
 */
export async function prefetchRecommendedPeople(perPage: number = 10) {
  const { fetchRecommendedPeople } = require("../services/api");

  await queryClient.prefetchInfiniteQuery({
    queryKey: ["infiniteRecommendedPeople", perPage],
    queryFn: async () => {
      return fetchRecommendedPeople(1, perPage);
    },
    initialPageParam: 1,
  });
}

/**
 * Get cache stats (for debugging)
 */
export function getCacheStats() {
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  return {
    totalQueries: queries.length,
    activeQueries: queries.filter((q) => q.isActive()).length,
    staleQueries: queries.filter((q) => q.isStale()).length,
    cacheSize: JSON.stringify(queries.map((q) => q.state.data)).length,
  };
}

// === REACT QUERY DEVTOOLS CONFIG ===
export const reactQueryDevtoolsConfig = {
  initialIsOpen: false,
  position: "bottom-right" as const,
  // Disable in production
  // process.env.NODE_ENV === 'production' && false,
};

export default queryClient;
