// 앱이 통신할 백엔드 서버의 기본 주소 (자신의 PC IP로 수정)
export const API_BASE_URL = 'http://192.168.91.161:8080';

// 실제 백엔드 엔드포인트에 맞게 경로 전부 수정!
export const API_ENDPOINTS = {
  // 인증/계정 관련 (UserController)
  LOGIN: '/api/users/auth/login',           // ★
  SIGNUP: '/api/users/auth/signup',         // ★
  REFRESH_TOKEN: '/api/users/auth/refresh-token', // ★
  LOGOUT: '/api/users/auth/logout',         // (필요시)

  FIND_ID_BY_EMAIL: '/api/users/auth/find-id',

  // 사용자 설정/프로필 (UserController)
  GET_USER_SETTINGS: '/api/users/me/settings',
  UPDATE_USER_SETTINGS: '/api/users/me/settings',
  GET_USER_PROFILE: '/api/users/me/profile',
  UPDATE_USER_PROFILE: '/api/users/me/profile',
  UPDATE_EMAIL: '/api/users/me/email',
  UPDATE_PASSWORD: '/api/users/me/password',

  // 질문 (QuestionController)
  GET_QUESTION: '/api/questions/for-me',

  // 답변 (AnswerController)

  SAVE_ANSWER: '/api/answers',
  GET_MY_ANSWERS: '/api/answers/my-records',

  
  // === 게시글 (PostController) ===
  GET_POSTS_LIST: '/api/posts/list', // GET, 예: /api/posts/list?page=0&size=5
  CREATE_POST: '/api/posts/write',   // POST
  // 게시글 ID가 필요한 엔드포인트들은 함수 형태로 정의
  GET_POST_DETAIL: (postId: number | string) => `/api/posts/${postId}`,    // GET
  UPDATE_POST: (postId: number | string) => `/api/posts/${postId}`,      // PUT
  DELETE_POST: (postId: number | string) => `/api/posts/${postId}`,      // DELETE

  // === 댓글 (CommentController) ===
  // 특정 게시글의 댓글 목록 조회
  GET_COMMENTS_FOR_POST: (postId: number | string) => `/api/posts/${postId}/comments`, // GET
  // 특정 게시글에 댓글 작성
  CREATE_COMMENT: (postId: number | string) => `/api/posts/${postId}/comments`, // POST
  // 특정 댓글 수정
  UPDATE_COMMENT: (commentId: number | string) => `/api/comments/${commentId}`,     // PUT
  // 특정 댓글 삭제
  DELETE_COMMENT: (commentId: number | string) => `/api/comments/${commentId}`,     // DELETE
};


