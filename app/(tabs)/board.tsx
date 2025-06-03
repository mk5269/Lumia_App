// app/(tabs)/board.tsx
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';

const PAGE_SIZE = 5;

const BoardScreen = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();

  const fetchData = async (pageNum) => {
    try {
      const res = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GET_POSTS_LIST}`, {
        params: { page: pageNum, size: PAGE_SIZE, sort: 'id,DESC' },
      });
      setData(res.data.content);
      setTotalPages(res.data.totalPages);
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
      >
        {/* 좌측 화살표 */}
        {page > 0 && (
          <TouchableOpacity
            style={[styles.arrowButton, { left: 20 }]}
            onPress={() => setPage(page - 1)}
          >
            <Image
              source={require('../../assets/images/chat_back.png')}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        )}

        {/* 우측 화살표 */}
        {page < totalPages - 1 && (
          <TouchableOpacity
            style={[styles.arrowButton, { right: 20 }]}
            onPress={() => setPage(page + 1)}
          >
            <Image
              source={require('../../assets/images/chat_forward.png')}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>
        )}

        {/* 사과들 */}
        <View style={styles.appleContainer}>
          {data.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/boardDetail/${item.id}`)}
              style={[styles.appleWrapper, { top: 140 + index * 70, left: 140 + (index % 2) * 60 }]}
            >
              <Image
                source={require('../../assets/images/chat_apple.png')}
                style={styles.appleIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default BoardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleContainer: {
    position: 'absolute',
    top: 120,
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
  arrowButton: {
    position: 'absolute',
    top: 40,
    zIndex: 10,
  },
  arrowIcon: {
    width: 60,
    height: 60,
  },
});