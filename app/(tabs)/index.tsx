import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import TimeBasedBackground from '../../components/TimeBasedBackground';
//main branch
import {
  Alert,
  Button,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedCharacter from '../../components/AnimatedCharacter';
import { useMusic } from '../../context/MusicContext';

const icons = {
  shop: require('../../assets/images/shop_icon.png'),
  hospital: require('../../assets/images/music_icon.png'),
  settings: require('../../assets/images/set.png'),
  sun: require('../../assets/images/sun_icon.png'),
  egg: require('../../assets/images/Character_1.png'),
  flower: require('../../assets/images/Flower.png'),
  seed: require('../../assets/images/seeds.png'),
};

const sampleQuestions = [
  { id: 1, text: '혹시 고민하는 걱정거리가 있어?' },
  { id: 2, text: '오늘 가장 즐거웠던 순간은 언제였나요?' },
  { id: 3, text: '지금 가장 먹고 싶은 음식은 무엇인가요?' },
];

const MainScreen: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<{ id: number; text: string } | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const router = useRouter();

  const { isMusicOn, selectedMusic } = useMusic();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * sampleQuestions.length);
    setCurrentQuestion(sampleQuestions[randomIndex]);
  }, []);

  const handleShopPress = () => console.log('Shop pressed');
  const handleHospitalPress = () => router.push('/healing');
  const handleSettingsPress = () => router.push('/settings');

  const handleQuestionPress = () => setIsModalVisible(true);

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) {
      Alert.alert('알림', '답변을 입력해주세요.');
      return;
    }
    console.log(`Question ID: ${currentQuestion?.id}, Answer: "${userAnswer}"`);
    Alert.alert('기록 완료!', '네 이야기가 기록되었어.');
    setUserAnswer('');
    setIsModalVisible(false);
  };

  const handleCancelAnswer = () => {
    setUserAnswer('');
    setIsModalVisible(false);
  };

  return (
    <TimeBasedBackground>
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.coinContainer}>
            <View style={styles.coinContent}>
              <Image source={icons.seed} style={styles.coinImage} />
              <Text style={styles.coinText}>210</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShopPress} style={styles.iconButton}>
            <View style={styles.iconShadow}>
              <Image source={icons.shop} style={styles.headerIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleHospitalPress} style={styles.iconButton}>
            <View style={styles.iconShadow}>
              <Image source={icons.hospital} style={styles.headerIcon} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSettingsPress} style={styles.iconButton}>
            <View style={styles.iconShadow}>
              <Image source={icons.settings} style={styles.headerIcon} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* 메인 캐릭터 영역 */}
      <View style={styles.content}>
      
        <AnimatedCharacter source={icons.egg} style={styles.characterImage} />
        {currentQuestion && (
          <TouchableOpacity style={styles.questionBubble} onPress={handleQuestionPress}>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 질문 모달 */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents={isModalVisible ? 'auto' : 'box-none'}>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={handleCancelAnswer}
        >
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleCancelAnswer}>
            <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>
              {currentQuestion && <Text style={styles.modalQuestionText}>{currentQuestion.text}</Text>}
              <TextInput
                style={styles.modalTextInput}
                placeholder="여기에 답변을 입력하세요..."
                placeholderTextColor="#888"
                multiline
                numberOfLines={4}
                value={userAnswer}
                onChangeText={setUserAnswer}
              />
              <View style={styles.modalButtonContainer}>
                <Button title="취소" onPress={handleCancelAnswer} color="#FF6347" />
                <View style={{ width: 20 }} />
                <Button title="기록하기" onPress={handleSubmitAnswer} />
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
    </TimeBasedBackground>
  );
};

const styles = StyleSheet.create({
  background: {
  flex: 1,
  resizeMode: 'cover',
},
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 25 : 10,
    height: 60,
  },
  headerLeft: {
    flexDirection: 'row',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
     marginLeft: 15, 
  },
  coinContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinImage: {
    width: 18,
    height: 18,
    marginRight: 6,
  },
  coinText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  iconButton: {
    padding: 2,
    marginLeft: 10,
  },
  headerIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  iconShadow: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 30,
    padding: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
  },

  characterImage: {
    width: 100,
    height: 150,
    marginBottom: 20,
    marginTop: 240, // 👉 위에서 여백 추가
  },
  questionBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  modalContent: {
    width: 300,
    minHeight: 280,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalQuestionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalTextInput: {
    width: '100%',
    minHeight: 80,
    maxHeight: 120,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 20,
    color: '#333',
    marginBottom: 25,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
});

export default MainScreen;
