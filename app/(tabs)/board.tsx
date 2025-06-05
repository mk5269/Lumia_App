import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';

const PAGE_SIZE = 3;

interface PostItem {
  id: number;
  title: string;
  category: string;
  userId: string;
}

const BoardScreen = () => {
  const [data, setData] = useState<PostItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchData = async (pageNum: number) => {
    try {
      const res = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GET_POSTS_LIST}`, {
        params: { page: pageNum, size: PAGE_SIZE, sort: 'id,DESC' },
      });
      setData(res.data.content);
      setTotalPages(res.data.totalPages); // API에서 전체 페이지 수 동적으로 받아오기
    } catch (error) {
      console.error('게시글 목록 로딩 실패:', error);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  // 페이지네이션에서 보여줄 최대 버튼 개수
  const MAX_PAGE_BUTTONS = 5;

  // 현재 페이지 기준으로 보여줄 페이지 버튼 배열 생성
  const getPageButtons = () => {
    let start = Math.max(0, page - Math.floor(MAX_PAGE_BUTTONS / 2));
    let end = start + MAX_PAGE_BUTTONS;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(0, end - MAX_PAGE_BUTTONS);
    }

    const pages = [];
    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/chat_tree.png')}
        resizeMode="cover"
        style={styles.background}
      >
        {/* 어두운 반투명 오버레이 */}
        <View style={styles.overlay} />
        {/* 배경에 표시될 사과 이미지들 (터치 기능 없음) */}
        <View style={styles.backgroundApplesContainer}>
          {data.map((item, index) => (
            <View
              key={`bg-apple-${item.id}`}
              style={[
                styles.backgroundAppleWrapper,
                {
                  top: 240 + index * 70,
                  left: 90 + (index % 2) * 180,
                },
              ]}
            >
              <Image
                source={require('../../assets/images/chat_apple.png')}
                style={styles.backgroundAppleIcon}
              />
            </View>
          ))}
        </View>

        {/* 게시글 목록 (ScrollView) */}
        <ScrollView contentContainerStyle={styles.listContainer}>
          {data.length > 0 ? (
            data.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/boardDetail/${item.id}`)}
                style={styles.postItem}
              >
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postCategory}>카테고리: {item.category}</Text>
                <Text style={styles.postUser}>작성자: {item.userId}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyMessage}>게시글이 없습니다.</Text>
          )}
        </ScrollView>

        {/* 페이지 화살표 + 숫자 버튼 */}
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => page > 0 && setPage(page - 1)}
            style={styles.arrowButton}
            disabled={page === 0}
          >
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>

          {getPageButtons().map((pageIndex) => (
            <TouchableOpacity
              key={pageIndex}
              onPress={() => setPage(pageIndex)}
              style={[
                styles.pageButton,
                page === pageIndex && styles.pageButtonActive,
              ]}
            >
              <Text style={styles.pageButtonText}>{pageIndex + 1}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => page < totalPages - 1 && setPage(page + 1)}
            style={styles.arrowButton}
            disabled={page === totalPages - 1}
          >
            <Text style={styles.arrowText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* 글쓰기 + 버튼 */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push('/boardForm')}
        >
          <Text style={styles.floatingButtonText}>＋</Text>
        </TouchableOpacity>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default BoardScreen;

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: 0,
  },
  background: {
    top: -60,
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 180,
  },
  backgroundApplesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 300,
    zIndex: 0,
  },
  backgroundAppleWrapper: {
    position: 'absolute',
  },
  backgroundAppleIcon: {
    width: 50,
    height: 50,
    opacity: 0.8,
  },
  listContainer: {
    width: width * 0.9,
    alignItems: 'center',
    paddingTop: 160,
  },
  postItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 2,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  postCategory: {
    fontSize: 14,
    color: '#444',
    marginBottom: 3,
  },
  postUser: {
    fontSize: 12,
    color: '#555',
  },
  emptyMessage: {
    marginTop: 50,
    fontSize: 16,
    color: 'rgba(0,0,0,0.7)',
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 10,
    borderRadius: 5,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    width: '100%',
    bottom: -60,
    zIndex: 1,
  },
  pageButton: {
    marginHorizontal: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(238, 238, 238, 0.85)',
    borderRadius: 10,
  },
  pageButtonActive: {
    backgroundColor: 'rgba(255, 204, 0, 0.85)',
  },
  pageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  arrowButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: 'rgba(221, 221, 221, 0.85)',
    borderRadius: 8,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  floatingButton: {
    position: 'absolute',
    right: 30,
    bottom: 220,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff6666',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    zIndex: 1,
  },
  floatingButtonText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
});
