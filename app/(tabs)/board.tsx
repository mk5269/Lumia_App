import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';

const PAGE_SIZE = 2;
const TOTAL_PAGES = 5; // 고정된 총 페이지 수

interface PostItem {
  id: number;
  title: string;
  category: string;
  userId: string;
}

const BoardScreen = () => {
  const [data, setData] = useState<PostItem[]>([]);
  const [page, setPage] = useState(0);
  const router = useRouter();

  const fetchData = async (pageNum: number) => {
    try {
      const res = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GET_POSTS_LIST}`, {
        params: { page: pageNum, size: PAGE_SIZE, sort: 'id,DESC' },
      });
      setData(res.data.content);
    } catch (error) {
      console.error('게시글 목록 로딩 실패:', error);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/chat_tree.png')}
        resizeMode="cover"
        style={styles.background}
        imageStyle={{ top: -60 }}
      >
        {/* 사과 아이템 */}
        <View style={styles.appleContainer}>
          {data.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/boardDetail/${item.id}`)}
              style={[
                styles.appleWrapper,
                { top: 140 + index * 70, left: 140 + (index % 2) * 60 },
              ]}
            >
              <Image
                source={require('../../assets/images/chat_apple.png')}
                style={styles.appleIcon}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* 페이지 화살표 + 숫자 버튼 */}
        <View style={styles.pagination}>
          {/* 왼쪽 화살표 */}
          <TouchableOpacity
            onPress={() => page > 0 && setPage(page - 1)}
            style={styles.arrowButton}
          >
            <Text style={styles.arrowText}>{'<'}</Text>
          </TouchableOpacity>

          {/* 페이지 숫자 */}
          {Array.from({ length: TOTAL_PAGES }, (_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setPage(i)}
              style={[
                styles.pageButton,
                page === i && styles.pageButtonActive,
              ]}
            >
              <Text style={styles.pageButtonText}>{i + 1}</Text>
            </TouchableOpacity>
          ))}

          {/* 오른쪽 화살표 */}
          <TouchableOpacity
            onPress={() => page < TOTAL_PAGES - 1 && setPage(page + 1)}
            style={styles.arrowButton}
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
  background: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  appleWrapper: {
    position: 'absolute',
  },
  appleIcon: {
    width: 50,
    height: 50,
  },
  pagination: {
    position: 'absolute',
    bottom: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageButton: {
    marginHorizontal: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 10,
  },
  pageButtonActive: {
    backgroundColor: '#ffcc00',
  },
  pageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  arrowButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 4,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  arrowText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    bottom: 250,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff6666',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
});
