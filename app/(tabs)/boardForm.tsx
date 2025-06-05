// app/(tabs)/boardForm.tsx
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
import { useAuth } from '../../context/AuthContext';

export default function BoardFormScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const [category, setCategory] = useState('칭찬');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.CREATE_POST}`;
      await axios.post(
        apiUrl,
        { category, title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle('');
      setContent('');
      setCategory('칭찬');
      router.push('/board');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

return (
  <SafeAreaView style={styles.container}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={60}
      >
        {/* 상단 고정 영역 */}
        <View style={styles.fixedHeader}>
          <Text style={styles.title}>Share My Light</Text>
          {/* 👇 귀여운 분리 라인 추가 */}
          <Text style={styles.separator}>
            ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆ ⋆
          </Text>
          <View style={styles.categoryContainer}>
            {['칭찬', '격려', '기타'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryButton,
                  category === item && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(item)}
              >
                
                <Text
                  style={[
                    styles.categoryText,
                    category === item && styles.categoryTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>


        </View>

        {/* 제목+내용만 스크롤 */}
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={styles.inputTitle}
            placeholder="제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#aaa"
          />

          <TextInput
            style={styles.inputContent}
            placeholder="당신의 이야기를 들려주세요"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#aaa"
          />
        </ScrollView>

        {/* 등록 버튼 */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Ionicons name="arrow-up" size={24} color="white" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F0', // 따뜻한 배경
  },
  scroll: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#FF8A65',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    gap: 40,
  },
  categoryButton: {
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#FFECD1',
    
    
  },
  categoryButtonActive: {
    backgroundColor: '#FFB88C',
  },
  categoryText: {
    fontSize: 16,
    color: '#6B4F4F',
  },
  categoryTextActive: {
    fontWeight: 'bold',
    color: '#fff',
  },
  fixedHeader: {
  paddingHorizontal: 20,
  paddingTop: 28,
},

  inputTitle: {
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#FFDAB9',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  separator: {
  textAlign: 'center',
  color: '#FFB88C',
  fontSize: 18,
  marginBottom: 5,
  fontWeight: 'bold',
},

  inputContent: {
    fontSize: 18,
    
    height: 420,
    borderWidth: 1,
    borderColor: '#FFDAB9',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 40,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 94,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF8A65',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
});
