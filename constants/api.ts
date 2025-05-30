// app/constants/api.ts

// 앱이 통신할 백엔드 서버의 기본 주소입니다.
// 만약 로컬에서 테스트 중이라면, PC의 IP 주소와 Spring Boot 서버의 포트 번호를 사용합니다.
export const API_BASE_URL = 'http://192.168.10.18:8080'; // ❗ 본인의 실제 PC IP 주소로 변경해주세요!

// API 기능별 상세 주소(엔드포인트)들을 모아둔 객체입니다.
export const API_ENDPOINTS = {
  // 인증 관련
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  REFRESH_TOKEN: '/api/auth/refresh-token', // <<< 이 줄을 추가합니다.


  // 사용자 설정 관련
  GET_USER_SETTINGS: '/api/users/me/settings',
  UPDATE_USER_SETTINGS: '/api/users/me/settings',

  GET_USER_PROFILE: '/api/users/me/profile', // 기존 프로필 경로 유지
  UPDATE_USER_PROFILE: '/api/users/me/profile', // 기존 프로필 경로 유지
  UPDATE_EMAIL: '/api/users/me/email', // 기존 프로필 경로 유지
  UPDATE_PASSWORD: '/api/users/me/password', // 기존 프로필 경로 유지

  // 질문 및 답변 관련 엔드포인트는 UserController가 아닌 별도 컨트롤러에 있을 수 있으므로 확인 필요
  // 만약 UserController에 있다면 /api/users/questions/... 와 같이 변경 필요
  GET_QUESTION: '/api/questions/for-me', // 현재 QuestionController는 @RequestMapping("/api/questions")
  SAVE_ANSWER: '/api/answers',             // 현재 AnswerController는 @RequestMapping("/api/answers")
  GET_MY_ANSWERS: '/api/answers/my-records',

  // 필요하다면 다른 API 엔드포인트들도 여기에 추가합니다.
  // 예: LOGOUT: '/api/auth/logout', // 백엔드에 로그아웃 API가 있다면 추가
};

// 사용 예시 (다른 파일에서):
// import { API_BASE_URL, API_ENDPOINTS } from '../constants/api';
//
// const loginUrl = `<span class="math-inline">\{API\_BASE\_URL\}</span>{API_ENDPOINTS.LOGIN}`;
// const refreshTokenUrl = `<span class="math-inline">\{API\_BASE\_URL\}</span>{API_ENDPOINTS.REFRESH_TOKEN}`;
