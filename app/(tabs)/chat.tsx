// app/(tabs)/chat.tsx
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
  View
} from 'react-native';

import character from '@/assets/images/chat_Image.png';
import TimeBasedBackground from '@/components/TimeBasedBackground';

const OPENAI_API_KEY = 'Bearer 123';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
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
        { role: 'system', content: '너는 친절한 도우미야.' },
        ...currentMessages,
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: OPENAI_API_KEY,
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
      const botMessage: Message = {
        role: 'assistant',
        content: data.choices?.[0]?.message?.content?.trim() || '음... 지금은 답변하기 조금 어려워요.',
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMsg: Message = {
        role: 'assistant',
        content: '죄송해요, 오류가 발생했어요. 다시 시도해 주세요!',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TimeBasedBackground>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.transparentHeaderSpacer} />
        <View style={styles.container}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.chatOutput}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg, idx) => {
              const isBot = msg.role === 'assistant';
              return (
                <View
                  key={idx}
                  style={isBot ? styles.botMessageRow : styles.userMessageRow}
                >
                  {isBot && <Image source={character} style={styles.botImage} />}
                  <View
                    style={[
                      styles.message,
                      isBot ? styles.botMessage : styles.userMessage,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isBot ? styles.botMessageText : styles.userMessageText,
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                </View>
              );
            })}

            {loading && (
              <View style={styles.botMessageRow}>
                <Image source={character} style={styles.botImage} />
                <View style={[styles.message, styles.botMessage]}>
                  <ActivityIndicator size="small" color="#555" />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.plusButton}>
              <Text style={styles.plusText}>＋</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="답장하기"
              multiline
              placeholderTextColor="#ccc"
            />

            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              disabled={loading}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TimeBasedBackground>
  );
};

const styles = StyleSheet.create({
  transparentHeaderSpacer: {
    height: Platform.OS === 'ios' ? 80 : 35,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  chatOutput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexGrow: 1,
  },
  message: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginVertical: 6,
  },
  userMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  botImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 6,
    marginBottom: 4,
  },
  userMessage: {
    backgroundColor: '#A882F7',
    borderTopRightRadius: 0,
  },
  botMessage: {
    backgroundColor: '#E6E6FA',
    borderTopLeftRadius: 0,
  },
  userMessageText: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  botMessageText: {
    color: '#333',
    fontSize: 16,
    lineHeight: 22,
  },
  messageText: {
    fontSize: 16,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 30,
    marginHorizontal: 10,
    marginBottom: 120,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  plusText: {
    fontSize: 20,
    color: 'white',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default ChatScreen;