//app/(tabs)/board.tsx
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useRouter, type Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
// API_ENDPOINTS를 추가로 import 합니다.
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';

interface ChecklistItem {
  id: number;
  title: string;
  category: string;
  userId: string;
  // 필요하다면 createdAt 등 PostResponseDto에 있는 다른 필드들도 추가할 수 있습니다.
}

const PAGE_SIZE = 2;

const ChecklistScreen = () => {
  const [data, setData] = useState<ChecklistItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const fetchData = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GET_POSTS_LIST}`, {
        params: { page: pageNum, size: PAGE_SIZE, sort: 'id,DESC' },
      });
      setData(res.data.content);
      setTotalPages(res.data.totalPages);
      if (pageNum === 0 && data.length > 0) {
         flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    } catch (error) {
      console.error('게시글 목록 데이터 로딩 실패 (board.tsx):', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData(page);
    }, [page])
  );

  const getPagination = () => {
    const current = page + 1;
    const maxVisible = 3;
    const pages: (number | string)[] = [];

    if (totalPages <= 1) return [];

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end === totalPages && (end - start + 1) < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
    }
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="menu" size={28} color="black" />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>List</Text>
          <Text style={styles.subtitle}>Message</Text>
        </View>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => router.push('/boardForm' as Href)}
        >
          <Ionicons name="arrow-up-circle" size={24} color="#D97B7B" />
        </TouchableOpacity>
      </View>

      {loading && data.length === 0 ? (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={data}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => router.push(`/boardDetail/${item.id}` as Href)}>
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.cardLeft}>
                    <Ionicons name="checkbox-outline" size={22} color="black" />
                    <Text style={styles.cardCategory}>[{item.category}]</Text>
                    <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                  </View>
                  <Text style={styles.cardUser}>{item.userId}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            totalPages > 0 ? (
                <View style={styles.pagination}>
                <TouchableOpacity
                    onPress={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    style={page === 0 ? styles.invisibleButton : styles.pageArrow}
                >
                    <Ionicons name="chevron-back" size={24} color={page === 0 ? "transparent" : "black"} />
                </TouchableOpacity>

                {getPagination().map((item, idx) =>
                    item === '...' ? (
                    <Text key={`dots-${idx}`} style={styles.pageDots}>...</Text>
                    ) : (
                    <TouchableOpacity key={`page-${item}`} onPress={() => setPage(Number(item) - 1)}>
                        <Text
                            style={[
                                styles.pageNumber,
                                Number(item) === page + 1 && styles.activePage,
                            ]}
                        >
                        {item}
                        </Text>
                    </TouchableOpacity>
                    )
                )}

                <TouchableOpacity
                    onPress={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    style={page >= totalPages - 1 ? styles.invisibleButton : styles.pageArrow}
                >
                    <Ionicons name="chevron-forward" size={24} color={page >= totalPages - 1 ? "transparent" : "black"} />
                </TouchableOpacity>
                </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && data.length === 0 ? (
                <View style={styles.emptyListContainer}>
                    <Text style={styles.emptyListText}>표시할 게시글이 없어요.</Text>
                    <Text style={styles.emptyListSubText}>첫 번째 게시글을 작성해보세요!</Text>
                </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ChecklistScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    // Platform.OS를 사용하는 부분
    paddingTop: Platform.OS === 'android' ? 25 : 40,
  },
  // 이하 스타일은 이전과 동일하게 유지됩니다.
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'serif',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: 'gray',
    fontStyle: 'italic',
  },
  uploadButton: {
    backgroundColor: '#FCE0E0',
    borderRadius: 12,
    padding: 5,
  },
  card: {
    backgroundColor: '#fefefe',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    gap: 8,
  },
  cardCategory: {
    fontWeight: 'bold',
    color: '#D97B7B',
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 14,
    flexShrink: 1,
  },
  cardUser: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'right',
    marginLeft: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 10,
    gap: 10,
  },
  pageArrow: {
    paddingHorizontal: 8,
  },
  pageNumber: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  pageDots: {
    fontSize: 16,
    color: '#999',
    paddingHorizontal: 6,
    alignSelf: 'center',
  },
  activePage: {
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#D97B7B',
  },
  invisibleButton: {
    paddingHorizontal: 8,
    opacity: 0,
    pointerEvents: 'none',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyListText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  emptyListSubText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  }
});