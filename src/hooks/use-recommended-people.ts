import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import {
  fetchRecommendedPeople,
  prefetchNextPage,
  type ApiPerson,
} from "../services/api";
import type { User } from "../types";

// Transform API person to User type
function transformApiPersonToUser(person: ApiPerson): User {
  return {
    id: String(person.id),
    name: person.name,
    age: person.age,
    location: person.location || "",
    photos: person.photos || [],
  };
}

// ============================================
// RECOMMENDED: Use Infinite Query for Best Performance
// ============================================
export function useInfiniteRecommendedPeople(perPage: number = 5) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["infiniteRecommendedPeople", perPage],
    queryFn: ({ pageParam = 1, signal }) =>
      fetchRecommendedPeople(pageParam, perPage, signal),

    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },

    initialPageParam: 1,

    // PERFORMANCE OPTIMIZATIONS:

    // 1. Stale-while-revalidate: Show cached data instantly while refetching
    staleTime: 2 * 60 * 1000, // 2 menit - data dianggap fresh
    gcTime: 10 * 60 * 1000, // 10 menit - cache time (dulu cacheTime)

    // 2. Refetch strategy untuk keep data fresh
    refetchOnMount: false, // Jangan refetch jika data masih fresh
    refetchOnWindowFocus: false, // Jangan refetch saat window focus
    refetchOnReconnect: true, // Refetch saat internet reconnect

    // 3. Retry strategy untuk network failure
    retry: 2, // Retry 2x jika gagal
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // 4. Error handling
    throwOnError: false, // Jangan throw error, handle via query.error

    // 5. Select/Transform data secara optimal
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      // Flatten semua users dari semua pages dengan memoization
      users: data.pages.flatMap((page) =>
        page.data.map(transformApiPersonToUser)
      ),
      // Metadata berguna untuk UI
      totalUsers: data.pages[0]?.total ?? 0,
      hasMore:
        data.pages[data.pages.length - 1]?.current_page <
        data.pages[data.pages.length - 1]?.last_page,
    }),
  });

  // AUTO PREFETCH next page saat user hampir habis scroll
  useEffect(() => {
    if (query.hasNextPage && !query.isFetchingNextPage && query.data) {
      const currentPage = query.data.pageParams[
        query.data.pageParams.length - 1
      ] as number;
      const nextPage = currentPage + 1;

      // Prefetch di background - simple approach
      prefetchNextPage(nextPage, perPage).catch(() => {
        // Silent fail untuk prefetch
      });
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.data, perPage]);

  return query;
}

// ============================================
// ALTERNATIVE: Simple Query (untuk single page)
// ============================================
// Gunakan ini jika hanya perlu 1 page saja (tidak recommend untuk list banyak)
export function useRecommendedPeople(page: number = 1, perPage: number = 5) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["recommendedPeople", page, perPage],
    queryFn: ({ signal }) => fetchRecommendedPeople(page, perPage, signal),

    // Performance optimizations
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 2,

    select: (data) => ({
      ...data,
      data: data.data.map(transformApiPersonToUser),
    }),
  });

  // Prefetch next page
  useEffect(() => {
    if (query.data && query.data.current_page < query.data.last_page) {
      queryClient.prefetchQuery({
        queryKey: ["recommendedPeople", page + 1, perPage],
        queryFn: ({ signal }) =>
          fetchRecommendedPeople(page + 1, perPage, signal),
      });
    }
  }, [query.data, page, perPage, queryClient]);

  return query;
}

// ============================================
// OPTIMIZED HOOKS untuk use cases spesifik
// ============================================

// Hook untuk get single user by ID dari cache (super fast, no network)
export function useRecommendedPersonById(userId: string) {
  const queryClient = useQueryClient();

  return useMemo(() => {
    const cachedData = queryClient.getQueryData<{
      pages: Array<{ data: ApiPerson[] }>;
    }>(["infiniteRecommendedPeople", 5]);

    if (!cachedData) return null;

    const person = cachedData.pages
      .flatMap((page) => page.data)
      .find((p) => String(p.id) === userId);

    return person ? transformApiPersonToUser(person) : null;
  }, [userId, queryClient]);
}

// Hook untuk invalidate & refetch (useful setelah swipe action)
export function useRefreshRecommendedPeople() {
  const queryClient = useQueryClient();

  return {
    refresh: () => {
      queryClient.invalidateQueries({
        queryKey: ["infiniteRecommendedPeople"],
      });
      queryClient.invalidateQueries({
        queryKey: ["recommendedPeople"],
      });
    },
    refreshSilently: () => {
      queryClient.refetchQueries({
        queryKey: ["infiniteRecommendedPeople"],
        type: "active",
      });
    },
  };
}
