// app/(tabs)/chat.tsx (첫 번째 테스트: catch 블록 수정)

import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import character from '@/assets/images/chat_Image.png';

// API 키는 실제 앱에서는 백엔드 서버를 통해 API를 호출하거나, 보안 처리된 환경 변수를 사용해야 합니다.
const OPENAI_API_KEY = 'Bearer 123';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = { role: 'user', content: userInput };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setUserInput('');
    setLoading(true);

    try {
      const messagesForAPI = [
        { role: 'system', content: '너는 친절한 도우미야.' } as Message,
        ...currentMessages
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': OPENAI_API_KEY,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messagesForAPI,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      const botMessageContent = data.choices?.[0]?.message?.content?.trim() || '음... 지금은 답변하기 조금 어려워요.';
      const botMessage: Message = {
        role: 'assistant',
        content: botMessageContent,
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (err: any) {
      console.error("API Error:", err);
      // === 수정된 부분: 에러 메시지 단순화 ===
      const simplifiedErrorMessage: Message = {
        role: 'assistant',
        content: '죄송해요, API 요청 중 오류가 발생했습니다. 다시 시도해주세요.', // 고정된 문자열로 변경
      };
      setMessages(prevMessages => [...prevMessages, simplifiedErrorMessage]);
      // ===================================
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.header}>
            <Text style={styles.title}>AI 상담봇</Text>
          </View>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatOutput}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, idx) => {
              if (msg.role === 'assistant') {
                return (
                  <View key={idx} style={styles.botMessageRow}>
                    <Image source={character} style={styles.botImage} />
                    <View style={[styles.message, styles.botMessage]}>
                      <Text style={styles.messageText}>{msg.content}</Text>
                    </View>
                  </View>
                );
              } else if (msg.role === 'user') {
                return (
                  <View key={idx} style={[styles.message, styles.userMessage]}>
                    <Text style={styles.messageText}>{msg.content}</Text>
                  </View>
                );
              }
              return null;
            })}

            {loading && (
              <View style={styles.botMessageRow}>
                <Image source={character} style={styles.botImage} />
                <View style={[styles.message, styles.botMessage]}>
                  <ActivityIndicator size="small" color="#333" />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput
              style={styles.textInput}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="무엇이든 상담해 줄게!"
              multiline
              placeholderTextColor="#888"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
              <Text style={styles.sendButtonText}>전송</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
};

// 스타일 정의는 이전과 동일하게 유지됩니다.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 25 : 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  title: {
    marginTop: Platform.OS === 'ios' ? 20 : 0,
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  chatOutput: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexGrow: 1,
  },
  message: {
    maxWidth: '80%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 5,
    minHeight: 40,
    justifyContent: 'center',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    marginRight: 10,
  },
  botMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  botImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 5,
  },
  botMessage: {
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#fff', // 사용자 메시지는 흰색 텍스트
    // 봇 메시지는 아래 스타일에서 color를 오버라이드 하거나,
    // botMessage 스타일에 color: '#000' 등을 추가해야 합니다.
    // 혹은, Text 컴포넌트에 직접 조건부 스타일을 적용합니다.
    // 예: <Text style={[styles.messageText, msg.role === 'assistant' && styles.botMessageText]}>{msg.content}</Text>
  },
  // botMessageText: { color: '#000' }, // 봇 메시지 텍스트 색상 예시

  inputArea: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
    fontSize: 16,
    backgroundColor: 'white',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ChatScreen;