/**
 * Contoh penggunaan optimal useInfiniteRecommendedPeople
 * dengan best performance practices
 */

import React, { useCallback, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useInfiniteRecommendedPeople } from "../../hooks/use-recommended-people";
import type { User } from "../../types";

interface RecommendedPeopleListProps {
  perPage?: number;
  onPersonPress?: (user: User) => void;
  renderItem: (item: User, index: number) => React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
}

export const RecommendedPeopleList: React.FC<RecommendedPeopleListProps> = ({
  perPage = 10,
  onPersonPress,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
}) => {
  const {
    data,
    error,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteRecommendedPeople(perPage);

  // Ref untuk prevent duplicate fetch
  const isFetchingRef = useRef(false);

  // Optimized onEndReached handler
  const handleLoadMore = useCallback(() => {
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      !isFetchingRef.current &&
      !isLoading
    ) {
      isFetchingRef.current = true;
      fetchNextPage().finally(() => {
        isFetchingRef.current = false;
      });
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  // Memoized render item dengan useCallback untuk prevent re-render
  const renderListItem = useCallback(
    ({ item, index }: { item: User; index: number }) => {
      return renderItem(item, index);
    },
    [renderItem]
  );

  // Memoized key extractor
  const keyExtractor = useCallback((item: User) => item.id, []);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF5864" />
        <Text style={styles.loadingText}>Loading recommended people...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
        <Text style={styles.retryText} onPress={() => refetch()}>
          Tap to retry
        </Text>
      </View>
    );
  }

  // Empty state
  if (!data?.users || data.users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No recommendations available</Text>
      </View>
    );
  }

  // Footer component untuk loading more indicator
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#FF5864" />
      </View>
    );
  };

  return (
    <FlatList
      data={data.users}
      renderItem={renderListItem}
      keyExtractor={keyExtractor}
      // PERFORMANCE OPTIMIZATIONS:

      // 1. Pagination
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5} // Trigger saat 50% dari bottom
      // 2. List optimizations
      removeClippedSubviews={true} // Unmount offscreen items
      maxToRenderPerBatch={10} // Render max 10 items per batch
      updateCellsBatchingPeriod={50} // Batch updates setiap 50ms
      initialNumToRender={10} // Render 10 items awal
      windowSize={5} // Keep 5 screens worth of items in memory
      // 3. Performance flags
      getItemLayout={
        // Jika semua item punya height yang sama, uncomment ini:
        // (data, index) => ({
        //   length: ITEM_HEIGHT,
        //   offset: ITEM_HEIGHT * index,
        //   index,
        // })
        undefined
      }
      // 4. Components
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        <>
          {renderFooter()}
          {ListFooterComponent}
        </>
      }

      // 5. Pull to refresh (optional)
      // onRefresh={refetch}
      // refreshing={isLoading}
    />
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: "#FF5864",
    textDecorationLine: "underline",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
  },
  footerContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default RecommendedPeopleList;
