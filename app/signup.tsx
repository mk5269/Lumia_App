// app/signup.tsx
import axios, { isAxiosError } from 'axios'; //
import { Link, router } from 'expo-router'; //
import React, { useEffect, useState } from 'react'; //
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
// eslint-disable-next-line import/namespace
import { API_BASE_URL, API_ENDPOINTS } from '../constants/api'; //로그인 상수 처리리

const SignupScreen: React.FC = () => {
  const [userId, setUserId] = useState<string>(''); //
  const [password, setPassword] = useState<string>(''); //
  const [passwordConfirm, setPasswordConfirm] = useState<string>(''); //
  const [username, setUsername] = useState<string>(''); //
  const [email, setEmail] = useState<string>(''); //
  const [passwordMismatch, setPasswordMismatch] = useState<boolean>(false); //

  useEffect(() => { //
    if (passwordConfirm && password !== passwordConfirm) { //
      setPasswordMismatch(true); //
    } else { //
      setPasswordMismatch(false); //
    }
  }, [password, passwordConfirm]); //

  const handleSignup = async () => { //
    console.log('Signup attempt:', { userId, password, passwordConfirm, username, email }); //

    if (passwordMismatch) { //
      Alert.alert('오류', '비밀번호가 일치하지 않습니다.'); //
      return;
    }
    if (!userId || !password || !username || !email) { //
      Alert.alert('오류', '모든 필수 항목을 입력해주세요.'); //
      return;
    }
    // TODO: 추가적인 유효성 검사 (이메일 형식 등)

    // --- 백엔드 API 호출 ---
    const SIGNUP_API_URL = `${API_BASE_URL}${API_ENDPOINTS.SIGNUP}`;

    try {
      console.log(`[API 요청] POST ${SIGNUP_API_URL}`); //
      const response = await axios.post(SIGNUP_API_URL, { //
        userId: userId,
        password: password,
        username: username,
        email: email
      });

      console.log('[API 응답] 성공:', response.status, response.data); //
      Alert.alert('회원가입 성공', response.data || '회원가입이 완료되었습니다!'); //
      router.push('/login'); //

    } catch (error) {
      console.error("[API 오류] 회원가입 요청 실패:", error); //
      if (isAxiosError(error)) { //
        if (error.response) { //
          console.error("  - 서버 응답 상태:", error.response.status); //
          console.error("  - 서버 응답 데이터:", error.response.data); //
          Alert.alert('회원가입 실패', error.response.data || `오류 코드: ${error.response.status}`); //
        } else if (error.request) { //
          console.error("  - 응답 없음:", error.request); //
          Alert.alert('네트워크 오류', '서버로부터 응답을 받을 수 없습니다.'); //
        } else { //
          console.error('  - 요청 설정 오류:', error.message); //
          Alert.alert('요청 오류', '회원가입 요청 중 오류가 발생했습니다.'); //
        }
      } else { //
        Alert.alert('오류', '회원가입 처리 중 알 수 없는 오류가 발생했습니다.'); //
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>회원가입</Text>

        <TextInput style={styles.input} placeholder="사용할 아이디" value={userId} onChangeText={setUserId} autoCapitalize="none"/>
        <TextInput style={styles.input} placeholder="비밀번호" value={password} onChangeText={setPassword} secureTextEntry />

        <TextInput
          style={[
            styles.input, //
            passwordMismatch && styles.inputError //
          ]}
          placeholder="비밀번호 확인"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />

        <TextInput style={styles.input} placeholder="이름 (닉네임)" value={username} onChangeText={setUsername}/>
        <TextInput style={styles.input} placeholder="이메일 주소" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>가입하기</Text>
        </TouchableOpacity>

        <Link href="/login" style={styles.link}>
          <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E0F7FA', //
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center', //
    alignItems: 'center', //
    padding: 20, //
  },
  title: {
    fontSize: 28, //
    fontWeight: 'bold', //
    marginBottom: 30, //
    color: '#333', //
  },
  input: {
    width: '90%', //
    height: 50, //
    backgroundColor: 'white', //
    borderWidth: 1, //
    borderColor: '#ccc', //
    borderRadius: 25, //
    paddingHorizontal: 20, //
    marginBottom: 15, //
    fontSize: 16, //
    color: '#000', //
  },
  inputError: {
    color: 'red', //
  },
  button: {
    width: '90%', //
    height: 50, //
    backgroundColor: '#FF6F00', //
    borderRadius: 25, //
    justifyContent: 'center', //
    alignItems: 'center', //
    marginTop: 20, //
  },
  buttonText: {
    color: 'white', //
    fontSize: 18, //
    fontWeight: 'bold', //
  },
  link: {
    marginTop: 25, //
    fontSize: 14, //
  },
  linkText: {
     color: 'blue', //
     textDecorationLine: 'underline', //
  }
});

export default SignupScreen;