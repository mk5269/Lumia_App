//app/boardDetail/[id].tsx
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
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

interface PostDetail {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  userId: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  userId: string;
}

const BoardDetail = () => {
  const { id: postIdFromParams } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { token } = useAuth();

  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState('');
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);
  
  const getCurrentUserId = () => {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload).sub;
    } catch (e) {
      console.error("Failed to decode token or get user ID (boardDetail.tsx):", e);
      return null;
    }
  };
  const currentUserId = getCurrentUserId();

  const fetchPostDetail = useCallback(async () => {
    if (!postIdFromParams) return;
    setLoading(true); 
    try {
      const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.GET_POST_DETAIL(postIdFromParams)}`;
      console.log('게시글 상세 조회 요청 (boardDetail.tsx):', apiUrl);
      const res = await axios.get<PostDetail>(apiUrl);
      setPost(res.data);
    } catch (error) {
      console.error('게시글 상세 정보 로딩 실패 (boardDetail.tsx):', error);
      Alert.alert("오류", "게시글 정보를 불러오는 데 실패했습니다.");
    }
  }, [postIdFromParams]);

  const fetchComments = useCallback(async () => {
    if (!postIdFromParams) return;
    try {
      const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.GET_COMMENTS_FOR_POST(postIdFromParams)}`;
      console.log('댓글 목록 조회 요청 (boardDetail.tsx):', apiUrl);
      const res = await axios.get<Comment[]>(apiUrl);
      setComments(res.data);
    } catch (error) {
      console.error('댓글 목록 로딩 실패 (boardDetail.tsx):', error);
    }
  }, [postIdFromParams]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true); 
      await fetchPostDetail();
      await fetchComments();
      setLoading(false); 
    };
    if (postIdFromParams) {
      loadData();
    } else {
      Alert.alert("오류", "게시글 ID가 올바르지 않습니다.");
      if(navigation.canGoBack()) router.back(); else router.replace('/board');
      setLoading(false);
    }
  }, [postIdFromParams, fetchPostDetail, fetchComments]);


  const handleSubmitComment = async () => {
    if (!commentInput.trim() || !token || !postIdFromParams) {
        Alert.alert("입력 오류", "댓글 내용을 입력해주세요.");
        return;
    }
    if (isSubmittingComment) return;
    setIsSubmittingComment(true);

    try {
      const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.CREATE_COMMENT(postIdFromParams)}`;
      console.log('댓글 작성 요청 (boardDetail.tsx):', apiUrl, { content: commentInput });
      await axios.post(
        apiUrl,
        { content: commentInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentInput('');
      Keyboard.dismiss();
      await fetchComments(); 
    } catch (error: any) {
      console.error('댓글 작성 실패 (boardDetail.tsx):', error.response?.data || error.message);
      Alert.alert("오류", error.response?.data?.message || "댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // ===== 이 부분이 수정되었습니다 =====
  const handleEditPost = () => {
    if (!postIdFromParams) return;
        router.push(`/boardEdit/${postIdFromParams}` as any);
  };
  // ===============================

  const handleDeletePost = async () => {
    if (!token || !postIdFromParams) return;
    Alert.alert(
      "게시글 삭제",
      "정말로 이 게시글을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.DELETE_POST(postIdFromParams)}`;
              console.log('게시글 삭제 요청 (boardDetail.tsx):', apiUrl);
              await axios.delete(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert("성공", "게시글이 삭제되었습니다.");
              router.back();
            } catch (error: any) {
              console.error('게시글 삭제 실패 (boardDetail.tsx):', error.response?.data || error.message);
              Alert.alert("오류", error.response?.data?.message || "게시글 삭제 중 오류가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token) return;
     Alert.alert(
      "댓글 삭제",
      "정말로 이 댓글을 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "삭제",
          style: "destructive",
          onPress: async () => {
            try {
              const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.DELETE_COMMENT(commentId)}`;
              console.log('댓글 삭제 요청 (boardDetail.tsx):', apiUrl);
              await axios.delete(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
              });
              await fetchComments(); 
            } catch (error: any) {
              console.error('댓글 삭제 실패 (boardDetail.tsx):', error.response?.data || error.message);
              Alert.alert("오류", error.response?.data?.message || "댓글 삭제 실패");
            }
          },
        },
      ]
    );
  };

  const handleUpdateComment = async () => {
    if (!editedCommentContent.trim() || editingCommentId === null || !token) { 
        Alert.alert("입력 오류", "수정할 댓글 내용을 입력해주세요.");
        return;
    }
    if(isUpdatingComment) return;
    setIsUpdatingComment(true);

    try {
      const apiUrl = `${API_BASE_URL}${API_ENDPOINTS.UPDATE_COMMENT(editingCommentId)}`; 
      console.log('댓글 수정 요청 (boardDetail.tsx):', apiUrl, { content: editedCommentContent });
      await axios.put(
        apiUrl,
        { content: editedCommentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      setEditedCommentContent('');
      await fetchComments(); 
    } catch (error: any) {
      console.error('댓글 수정 실패 (boardDetail.tsx):', error.response?.data || error.message);
      Alert.alert("오류", error.response?.data?.message || "댓글 수정 실패");
    } finally {
        setIsUpdatingComment(false);
    }
  };

  const isPostAuthor = post?.userId === currentUserId;

  const renderCommentItem = ({ item }: { item: Comment }) => {
    const isCommentAuthor = item.userId === currentUserId;
    return (
      <View style={styles.commentBox}>
        <View style={styles.commentHeaderRow}>
            <Text style={styles.commentUser}>{item.userId}</Text>
            <Text style={styles.commentMeta}>
            {' · '}{new Date(item.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Text>
        </View>
        {editingCommentId === item.id ? (
          <>
            <TextInput
              value={editedCommentContent}
              onChangeText={setEditedCommentContent} 
              style={styles.inputInline}
              multiline
              placeholder="댓글 수정..."
              placeholderTextColor="#64748B"
              autoFocus
            />
            <View style={styles.editCommentActions}>
              <TouchableOpacity style={[styles.smallButton, styles.saveButton]} onPress={handleUpdateComment} disabled={isUpdatingComment}>
                <Text style={styles.buttonText}>{isUpdatingComment ? "저장중..." : "저장"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallButton, styles.cancelButton]}
                onPress={() => {
                    setEditingCommentId(null); 
                    setEditedCommentContent(''); 
                }}
                disabled={isUpdatingComment}
              >
                <Text style={styles.buttonText}>취소</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.commentContent}>{item.content}</Text>
            {isCommentAuthor && (
              <View style={styles.iconButtonGroup}>
                <TouchableOpacity onPress={() => {
                  setEditingCommentId(item.id);
                  setEditedCommentContent(item.content);
                }} style={styles.iconButton}>
                    <Feather name="edit-3" size={18} color="#A5B4FC" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteComment(item.id)} style={styles.iconButton}>
                    <Feather name="trash-2" size={18} color="#F87171" />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  if (loading || !post) {
    return (
      <SafeAreaView style={[styles.center, styles.containerBackground]}>
        <ActivityIndicator size="large" color="#E2E8F0" />
      </SafeAreaView>
    );
  }

  if (!postIdFromParams) {
    return (
      <SafeAreaView style={[styles.center, styles.containerBackground]}>
        <Text style={styles.errorText}>게시글 정보를 불러올 수 없습니다.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, styles.containerBackground]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <FlatList
          ListHeaderComponent={() => (
            <ScrollView contentContainerStyle={styles.postContentContainer}>
              <View style={styles.titleRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{post.category}</Text>
                </View>
                <Text style={styles.title}>{post.title}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>작성자: {post.userId}</Text>
                <Text style={styles.metaText}>
                  {new Date(post.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </View>

              {isPostAuthor && (
                <View style={styles.authorActionsContainer}>
                  <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEditPost}>
                    <Feather name="edit" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>수정</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeletePost}>
                    <Feather name="trash" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>삭제</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.contentDivider} />
              <Text style={styles.body}>{post.content}</Text>
              <View style={styles.contentDivider} />
              <Text style={styles.commentsTitle}>댓글 {comments.length}개</Text>
            </ScrollView>
          )}
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.commentsListContainer}
          ListEmptyComponent={
            <View style={styles.emptyCommentsContainer}>
                <Text style={styles.emptyCommentsText}>아직 댓글이 없어요. 첫 댓글을 남겨보세요!</Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />

        {editingCommentId === null && (
          <View style={styles.commentInputSection}>
            <TextInput
              placeholder="따뜻한 댓글을 남겨주세요 :)"
              style={styles.input}
              value={commentInput}
              onChangeText={setCommentInput}
              multiline
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity
              style={[styles.submitButton, (isSubmittingComment || !commentInput.trim()) && styles.submitButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={isSubmittingComment || !commentInput.trim()}
            >
              <Text style={styles.submitButtonText}>{isSubmittingComment ? "등록중" : "등록"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default BoardDetail;

// 스타일 정의는 이전과 동일합니다.
const styles = StyleSheet.create({
  containerBackground: { 
    backgroundColor: '#1E293B', 
  },
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#E2E8F0',
    fontSize: 16,
  },
  postContentContainer: { 
    paddingBottom: 10,
  },
  // postContainer는 이제 ScrollView의 style이므로, 필요하다면 여기서 paddingHorizontal 등을 설정
  // FlatList의 ListHeaderComponent는 ScrollView이므로, ScrollView의 스타일링은 postContainer 보다 postContentContainer에 집중
  titleRow: {
    paddingHorizontal: 20, // ScrollView 내부 컨텐츠에 패딩 적용
    paddingTop: 20,        // ScrollView 내부 컨텐츠에 패딩 적용
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap', 
  },
  categoryBadge: {
    backgroundColor: '#38BDF8', 
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12, 
    marginRight: 10,
  },
  categoryText: {
    fontSize: 13,
    color: '#0F172A', 
    fontWeight: '600',
  },
  title: {
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#F1F5F9', 
    flexShrink: 1,
  },
  metaRow: {
    paddingHorizontal: 20, // ScrollView 내부 컨텐츠에 패딩 적용
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155', 
    paddingBottom: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#94A3B8', 
  },
  authorActionsContainer: {
    paddingHorizontal: 20, // ScrollView 내부 컨텐츠에 패딩 적용
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10, 
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: '#3B82F6', 
  },
  deleteButton: {
    backgroundColor: '#EF4444', 
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  contentDivider: { 
    marginHorizontal: 20, // ScrollView 내부 컨텐츠에 패딩 적용
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 16,
  },
  body: {
    paddingHorizontal: 20, // ScrollView 내부 컨텐츠에 패딩 적용
    fontSize: 17, 
    color: '#CBD5E1', 
    lineHeight: 28, 
    paddingVertical: 10, 
  },
  commentsTitle: {
    fontSize: 20, 
    fontWeight: 'bold',
    marginTop: 24, 
    marginBottom: 16,
    color: '#E2E8F0',
    paddingHorizontal: 20, // commentsListContainer와 맞추기 위해 추가
  },
  commentsListContainer: { 
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 160 : 140, 
  },
  commentBox: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#27374D', 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'baseline', 
    marginBottom: 6,
  },
  commentUser: {
    fontSize: 15, 
    fontWeight: 'bold',
    color: '#A5B4FC', 
  },
  commentMeta: { 
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 4,
  },
  commentContent: {
    fontSize: 15, 
    color: '#F1F5F9',
    lineHeight: 22,
  },
  iconButtonGroup: { 
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10, 
    gap: 16,
  },
  iconButton: {
    padding: 4, 
  },
  inputInline: { 
    backgroundColor: '#334155',
    color: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  editCommentActions: { 
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  smallButton: { 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: '#2563EB', 
  },
  cancelButton: {
    backgroundColor: '#4B5563', 
  },
  buttonText: { 
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  commentInputSection: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#1E293B', 
    marginBottom: 100,
  },
  input: { 
    flex: 1,
    backgroundColor: '#334155', 
    borderRadius: 20, 
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginRight: 10,
    color: '#F1F5F9', 
    minHeight: 40, 
    maxHeight: 100, 
    fontSize: 15,
  },
  submitButton: { 
    backgroundColor: '#4F46E5', 
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#4B5563', 
  },
  submitButtonText: { 
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyCommentsContainer: {
      paddingVertical: 30,
      alignItems: 'center',
  },
  emptyCommentsText: {
      color: '#94A3B8',
      fontSize: 15,
  }
});