import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchLikedPeople, type ApiPerson } from "../services/api";
import type { User } from "../types";

// Transform API person to User type
function transformApiPersonToUser(person: ApiPerson): User {
  return {
    id: String(person.id),
    name: person.name,
    age: person.age,
    location: person.location,
    photos: [person.image_url],
  };
}

/**
 * Hook for fetching liked people with infinite scroll
 * @param perPage - Items per page (default: 10)
 */
export function useInfiniteLikedPeople(perPage: number = 10) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["likedPeople", perPage],
    queryFn: ({ pageParam = 1, signal }) =>
      fetchLikedPeople(pageParam, perPage, signal),

    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },

    initialPageParam: 1,

    // PERFORMANCE OPTIMIZATIONS
    staleTime: 1 * 60 * 1000, // 1 minute - liked list changes less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false,

    // Transform data
    select: (data) => ({
      pages: data.pages,
      pageParams: data.pageParams,
      // Flatten all users from all pages
      users: data.pages.flatMap((page) =>
        page.data.map(transformApiPersonToUser)
      ),
      // Metadata
      totalUsers: data.pages[0]?.total ?? 0,
      hasMore:
        data.pages[data.pages.length - 1]?.current_page <
        data.pages[data.pages.length - 1]?.last_page,
    }),
  });

  // Auto prefetch next page when approaching end
  useEffect(() => {
    if (query.hasNextPage && !query.isFetchingNextPage && query.data) {
      const currentPage = query.data.pageParams[
        query.data.pageParams.length - 1
      ] as number;
      const usersLoaded = query.data.users.length;

      // Prefetch when 80% scrolled
      if (usersLoaded > 0 && usersLoaded % perPage === 0) {
        const nextPage = currentPage + 1;
        queryClient.prefetchQuery({
          queryKey: ["likedPeople", perPage, nextPage],
          queryFn: ({ signal }) => fetchLikedPeople(nextPage, perPage, signal),
        });
      }
    }
  }, [
    query.hasNextPage,
    query.isFetchingNextPage,
    query.data,
    perPage,
    queryClient,
  ]);

  return query;
}

/**
 * Hook to refresh liked people list
 */
export function useRefreshLikedPeople() {
  const queryClient = useQueryClient();

  return {
    refresh: () => {
      queryClient.invalidateQueries({
        queryKey: ["likedPeople"],
      });
    },
    refreshSilently: () => {
      queryClient.refetchQueries({
        queryKey: ["likedPeople"],
        type: "active",
      });
    },
  };
}
