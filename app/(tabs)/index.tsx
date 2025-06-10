// app/(tabs)/index.tsx
import { useAuth } from '@/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedCharacter from '../../components/AnimatedCharacter';
import TimeBasedBackground from '../../components/TimeBasedBackground';
 
import { API_BASE_URL, API_ENDPOINTS } from '../../constants/api';
 
import { schedulePushNotification } from '../notifications';

interface QuestionDto {
  questionId: number;
  questionText: string;
  questionType: string;
}
interface NewMessageResponseDto {
  hasNewMessage: boolean;
  newMessage: QuestionDto | null;
}
const icons = { shop: require('../../assets/images/shop_icon.png'), hospital: require('../../assets/images/music_icon.png'), settings: require('../../assets/images/set.png'), egg: require('../../assets/images/Character_1.png'), flower: require('../../assets/images/Flower.png'), seed: require('../../assets/images/seeds.png'), };

const NEXT_NOTIFICATION_TIMESTAMP_KEY = 'next_notification_timestamp';

const checkAndRescheduleNotification = async (token: string | null) => {
    if (!token) return;

    try {
        const timestampStr = await AsyncStorage.getItem(NEXT_NOTIFICATION_TIMESTAMP_KEY);

        // --- 1. 예약된 알림이 없을 경우 (신규 사용자 또는 앱 재설치) ---
        if (!timestampStr) {
            console.log('No notification scheduled. Setting up the first one...');
            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GET_USER_SETTINGS}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const settings = response.data;

            if (settings.pushNotificationEnabled && settings.notificationTime) {
                const [hour, minute] = settings.notificationTime.split(':').map(Number);
                const firstNotificationDate = new Date();
                firstNotificationDate.setHours(hour);
                firstNotificationDate.setMinutes(minute);
                firstNotificationDate.setSeconds(0);

                // 만약 기본 설정 시간(오후 1시)이 이미 지났다면, 첫 알림은 다음 날로 예약
                if (firstNotificationDate.getTime() < new Date().getTime()) {
                    firstNotificationDate.setDate(firstNotificationDate.getDate() + 1);
                }
                await schedulePushNotification(firstNotificationDate, true);
            }
            return; // 첫 알림 예약을 마쳤으므로 함수 종료
        }
        
        // --- 2. 예약된 알림이 있을 경우 (기존 사용자) ---
        const scheduledTimestamp = parseInt(timestampStr, 10);
        const now = new Date().getTime();

        // 이미 예약된 시간이 과거라면 (즉, 알림이 이미 발생했다면)
        if (scheduledTimestamp < now) {
            console.log('Notification has passed, rescheduling for the next day...');
            // 서버에서 사용자의 알림 설정 시간을 다시 가져옴
            const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.GET_USER_SETTINGS}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const settings = response.data;
            if (settings.pushNotificationEnabled && settings.notificationTime) {
                const [hour, minute] = settings.notificationTime.split(':').map(Number);
                const nextNotificationDate = new Date();
                nextNotificationDate.setDate(nextNotificationDate.getDate() + 1); // 다음 날로 설정
                nextNotificationDate.setHours(hour);
                nextNotificationDate.setMinutes(minute);
                nextNotificationDate.setSeconds(0);

                await schedulePushNotification(nextNotificationDate, true);
            }
        }
    } catch (error) {
        console.error("Failed to check and reschedule notification:", error);
    }
};

const MainScreen: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<QuestionDto | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isFetchingOnDemand, setIsFetchingOnDemand] = useState(false);

  const router = useRouter();
  const { token } = useAuth();

  const fetchQuestion = useCallback(async (isManuallyTriggered = false) => {
    if (!token) {
      if (isManuallyTriggered) Alert.alert("오류", "로그인이 필요합니다.");
      setCurrentQuestion({ questionId: 0, questionText: "로그인하고 루미아와 대화해보세요!", questionType: "SYSTEM" });
      return;
    }
    if (isManuallyTriggered) setIsLoadingQuestion(true);
    try {
      const response = await axios.get<NewMessageResponseDto>(`${API_BASE_URL}${API_ENDPOINTS.GET_QUESTION}`, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data && response.data.newMessage) {
        setCurrentQuestion(response.data.newMessage);
        setShowNewMessageIndicator(response.data.hasNewMessage);
      } else if (isManuallyTriggered) {
        Alert.alert("알림", "오늘은 더 이상 새로운 정기 질문이 없어요.");
      }
    } catch (error) {
      if (isManuallyTriggered) Alert.alert('오류', '질문을 가져오는 중 오류가 발생했습니다.');
    } finally {
      if (isManuallyTriggered) setIsLoadingQuestion(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchQuestion(false);
        checkAndRescheduleNotification(token);
      }
    }, [fetchQuestion, token])
  );
  
  const handleOnDemandQuestion = async () => {
      if (!token || isFetchingOnDemand) return;
      setIsFetchingOnDemand(true);
      try {
          const response = await axios.get<NewMessageResponseDto>(`${API_BASE_URL}${API_ENDPOINTS.GET_ON_DEMAND_QUESTION}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data && response.data.newMessage) {
              setCurrentQuestion(response.data.newMessage);
              setShowNewMessageIndicator(false);
          }
      } catch (error: any) {
          if (axios.isAxiosError(error) && error.response) {
              Alert.alert("알림", error.response.data);
          } else {
              Alert.alert("오류", "추가 질문을 가져오는 중 오류가 발생했습니다.");
          }
      } finally {
          setIsFetchingOnDemand(false);
      }
  };
  
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) { Alert.alert('알림', '답변을 입력해주세요.'); return; }
    if (!currentQuestion || !token) { Alert.alert('오류', '답변을 저장하기 위한 정보가 부족합니다.'); return; }
    
    setIsSubmittingAnswer(true);
    try {
      await axios.post(`${API_BASE_URL}${API_ENDPOINTS.SAVE_ANSWER}`, { questionId: currentQuestion.questionId, content: userAnswer }, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('기록 완료!', '네 이야기가 기록되었어.');
      setUserAnswer('');
      setIsModalVisible(false);
      setCurrentQuestion(null);
    } catch (error) {
      Alert.alert('오류', '답변 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };
  
  const handleShopPress = () => Alert.alert('상점', '상점 기능은 준비 중입니다.');
  const handleHospitalPress = () => router.push('/healing');
  const handleSettingsPress = () => router.push('/settings');
  const handleOpenQuestionModal = () => {
    if (!currentQuestion) {
      Alert.alert("알림", "표시할 질문이 없거나 로딩 중입니다.", [
        // 질문이 없는 상태에서는 '추가 질문 받기' 버튼을 누르도록 유도
        { text: "다른 이야기 할래?", onPress: () => handleOnDemandQuestion() },
        { text: "확인" }
      ]);
      return;
    }
    setIsModalVisible(true);
    setShowNewMessageIndicator(false);
  };
  const handleCancelAnswer = () => { setUserAnswer(''); setIsModalVisible(false); };
  
  const renderCharacterContent = () => (<View style={styles.characterContainer}><AnimatedCharacter source={icons.egg} style={styles.characterImage} onCharacterPress={handleOpenQuestionModal} />{showNewMessageIndicator && currentQuestion && (<TouchableOpacity style={styles.newMessageIconContainer} onPress={handleOpenQuestionModal}><View style={styles.tempNewMessageIcon}><Text style={styles.tempNewMessageIconText}>!</Text></View></TouchableOpacity>)}</View>);
  
  const renderMessageArea = () => {
    if (isLoadingQuestion && !isModalVisible) {
      return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />;
    }
    if (showNewMessageIndicator && currentQuestion) {
      return (<View style={styles.messagePromptContainer}><Text style={styles.messagePromptText}>새로운 이야기가 도착했어요!</Text><Text style={styles.messagePromptHintText}>(캐릭터를 눌러 확인해보세요)</Text></View>);
    }
    if (currentQuestion && !isModalVisible) {
      return (<TouchableOpacity style={styles.questionBubble} onPress={handleOpenQuestionModal}><Text style={styles.questionText}>{currentQuestion.questionText}</Text></TouchableOpacity>);
    }
    if (!currentQuestion && !isModalVisible) {
      return (
        <View style={styles.noQuestionContainer}>
          <Text style={styles.noQuestionText}>오늘은 어떤 이야기를 해볼까요?</Text>
          <TouchableOpacity style={styles.onDemandButton} onPress={handleOnDemandQuestion} disabled={isFetchingOnDemand}>
            {isFetchingOnDemand 
                ? <ActivityIndicator color="#fff" /> 
                : <Text style={styles.onDemandButtonText}>다른 이야기 할래?</Text>
            }
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <TimeBasedBackground><SafeAreaView style={styles.safeArea}>
      <View style={styles.header}><View style={styles.headerLeft}><View style={styles.coinContainer}><View style={styles.coinContent}><Image source={icons.seed} style={styles.coinImage} /><Text style={styles.coinText}>210</Text></View></View></View><View style={styles.headerRight}><TouchableOpacity onPress={handleShopPress} style={styles.iconButton}><View style={styles.iconShadow}><Image source={icons.shop} style={styles.headerIcon} /></View></TouchableOpacity><TouchableOpacity onPress={handleHospitalPress} style={styles.iconButton}><View style={styles.iconShadow}><Image source={icons.hospital} style={styles.headerIcon} /></View></TouchableOpacity><TouchableOpacity onPress={handleSettingsPress} style={styles.iconButton}><View style={styles.iconShadow}><Image source={icons.settings} style={styles.headerIcon} /></View></TouchableOpacity></View></View>
      <View style={styles.content}>
        <View style={styles.mainInteractionArea}>
            {renderCharacterContent()}
            {renderMessageArea()}
        </View>
      </View>
      {isModalVisible && currentQuestion && (<View style={StyleSheet.absoluteFillObject} pointerEvents="auto"><Modal animationType="fade" transparent={true} visible={isModalVisible} onRequestClose={handleCancelAnswer}><TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => { if (!isSubmittingAnswer) { Keyboard.dismiss(); handleCancelAnswer(); } }}><TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}><View style={styles.modalContent}><Text style={styles.modalQuestionText}>{currentQuestion.questionText}</Text><TextInput style={styles.modalTextInput} placeholder="네 생각을 편하게 이야기해줘..." placeholderTextColor="#888" multiline numberOfLines={4} value={userAnswer} onChangeText={setUserAnswer} /><View style={styles.modalButtonContainer}><Button title="다음에 할래" onPress={handleCancelAnswer} color="#FF6347" /><View style={{ width: 20 }} /><Button title="마음 속에 담아둘게" onPress={handleSubmitAnswer} disabled={isSubmittingAnswer} /></View></View></TouchableWithoutFeedback></TouchableOpacity></Modal></View>)}
    </SafeAreaView></TimeBasedBackground>
  );
};

const styles = StyleSheet.create({
  onDemandButton: { backgroundColor: '#1E88E5', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, marginTop: 10, },
  onDemandButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold', },
  safeArea: { flex: 1, backgroundColor: 'transparent' }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: Platform.OS === 'android' ? 25 : 10, height: 60 }, headerLeft: { flexDirection: 'row' }, headerRight: { flexDirection: 'row', alignItems: 'center' }, coinContainer: { backgroundColor: 'rgba(255, 255, 255, 0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginLeft: 15 }, coinContent: { flexDirection: 'row', alignItems: 'center' }, coinImage: { width: 18, height: 18, marginRight: 6 }, coinText: { fontSize: 16, fontWeight: '600', color: '#333' }, iconButton: { padding: 2, marginLeft: 10 }, headerIcon: { width: 35, height: 35, resizeMode: 'contain' }, iconShadow: { backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 30, padding: 4 }, content: { flex: 1, paddingBottom: 50 }, mainInteractionArea: { flex: 1, alignItems: 'center', justifyContent: 'center' }, characterContainer: { position: 'relative', alignItems: 'center', marginBottom: 10, marginTop: 320 }, characterImage: { width: 120, height: 120, resizeMode: 'contain' }, newMessageIconContainer: { position: 'absolute', top: -5, right: -5, zIndex: 1 }, tempNewMessageIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' }, tempNewMessageIconText: { color: 'white', fontWeight: 'bold', fontSize: 18 }, messagePromptContainer: { backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 20, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3.84, elevation: 3, marginHorizontal: 30, maxWidth: '90%', alignSelf: 'center' }, messagePromptText: { fontSize: 17, fontWeight: '600', color: '#336699', textAlign: 'center' }, messagePromptHintText: { fontSize: 13, color: '#555', textAlign: 'center', marginTop: 5 }, questionBubble: { backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 20, marginHorizontal: 30, minHeight: 60, alignItems: 'center', justifyContent: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, maxWidth: '90%', alignSelf: 'center' }, questionText: { fontSize: 16, color: '#333333', textAlign: 'center', lineHeight: 22 },
  noQuestionContainer: { alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.85)', borderRadius: 15, marginHorizontal: 30, maxWidth: '90%', alignSelf: 'center' },
  noQuestionText: { fontSize: 17, color: '#527289', textAlign: 'center', marginBottom: 15 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.55)' }, modalContent: { width: '90%', maxWidth: 380, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 4.65, elevation: 8 }, modalQuestionText: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 25, textAlign: 'center', lineHeight: 26 }, modalTextInput: { width: '100%', minHeight: 100, maxHeight: 150, padding: 15, backgroundColor: '#F9F9F9', borderColor: '#D0D0D0', borderWidth: 1, borderRadius: 12, textAlignVertical: 'top', fontSize: 16, lineHeight: 22, color: '#333', marginBottom: 30 }, modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
});

export default MainScreen;