//app/boardEdit/[id].tsx
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform, // ActivityIndicator 추가
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

interface PostData {
  id: number;
  category: string;
  title: string;
  content: string;
}

// ===== 함수 이름이 "BoardEditScreen"으로 정확해야 합니다. =====
export default function BoardEditScreen() { // 여기가 수정되었습니다.
  const { token } = useAuth();
  const router = useRouter();
  const { id: postId } = useLocalSearchParams<{ id: string }>();

  const [category, setCategory] = useState('칭찬');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!postId) {
      Alert.alert("오류", "게시글 ID가 올바르지 않습니다.");
      router.replace('/board');
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.GET_POST_DETAIL(postId)}`;
        console.log('게시글 정보 조회 요청 (boardEdit.tsx):', apiUrl);
        const res = await axios.get<PostData>(apiUrl);
        const post = res.data;
        setCategory(post.category);
        setTitle(post.title);
        setContent(post.content);
      } catch (err) {
        console.error('게시글 불러오기 실패 (boardEdit.tsx):', err);
        Alert.alert('오류', '게시글 정보를 불러오는 데 실패했습니다. 이전 화면으로 돌아갑니다.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [postId, router]);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!title.trim() || !content.trim()) {
      Alert.alert('입력 오류', '제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (!token || !postId) {
      Alert.alert('오류', '요청에 필요한 정보(토큰 또는 게시글 ID)가 없습니다.');
      return;
    }
    setIsSubmitting(true);

    try {
      const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.UPDATE_POST(postId)}`;
      console.log('게시글 수정 요청 (boardEdit.tsx):', apiUrl, { category, title, content });
      await axios.put(
        apiUrl,
        { category, title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert('성공', '게시글이 성공적으로 수정되었습니다.');
      router.push('/board');
    } catch (error: any) {
      console.error('게시글 수정 실패 (boardEdit.tsx):', error.response?.data || error.message);
      Alert.alert('오류', error.response?.data?.message || error.response?.data ||'게시글 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>게시글 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView 
            contentContainerStyle={styles.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.pageTitle}>게시글 수정하기</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>글머리</Text>
            <View style={styles.pickerWrapper}>
              <Picker 
                selectedValue={category} 
                onValueChange={(itemValue) => setCategory(itemValue)} 
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="칭찬" value="칭찬" />
                <Picker.Item label="격려" value="격려" />
                <Picker.Item label="기타" value="기타" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.input}
              placeholder="제목을 입력하세요"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>내용</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="내용을 입력하세요"
              multiline
              value={content}
              onChangeText={setContent}
              placeholderTextColor="#888"
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitText}>{isSubmitting ? "수정 중..." : "수정 완료"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4A5568',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 120 : 50,
    width: '100%',
    color: '#2D3748',
  },
  pickerItem: {
     height: 120,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2D3748',
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});