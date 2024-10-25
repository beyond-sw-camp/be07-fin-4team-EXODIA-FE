<template>
  <v-container class="mt-5 board-container" fluid>
    <!-- 질문 상세보기 카드 -->
    <div class="pa-4 mb-5" v-if="questionDetail">
      <h3 class="text-h5 font-weight-bold">
        {{ questionDetail.title }}
      </h3>

      <!-- 작성자 정보 한 줄로 나열 -->
      <div class="pa-3 meta-info-inline d-flex justify-space-between align-center mb-3">
        <div>
          <p>
            <strong>작성자:</strong> {{ questionDetail.anonymous ? '익명' : questionDetail.questionUserName }}
            | <strong>문의 부서:</strong> {{ questionDetail.departmentName }}
            | <strong>작성 시간:</strong> {{ formatDate(questionDetail.createdAt) }}
            <span v-if="questionDetail.updatedAt"> 
              | <strong>수정 시간:</strong> {{ formatDate(questionDetail.updatedAt) }}
            </span>
          </p>
        </div>
        <div>
          <!-- 수정 및 답변하기 버튼 -->
          <v-btn v-update class="mr-2" v-if="isQuestionAuthor" @click="goToEditQuestion" small>
            수정
          </v-btn>
          <v-btn v-create v-if="!questionDetail.answerText" @click="goToAnswerPage" small>
            답변하기
          </v-btn>
        </div>
      </div>

      <v-divider></v-divider> <!-- 상단 구분선 -->

      <!-- 질문 내용 -->
      <div class="board-body">
        <p class="text-body-1">{{ questionDetail.questionText }}</p>
      </div>

      <v-divider></v-divider> <!-- 질문과 답변 구분선 -->
      <p v-if="questionDetail.answeredAt" class="meta-info-section mt-2">
        <strong>답변자:</strong> {{ questionDetail.answerUserName }} | <strong>답변 시간:</strong> {{ formatDate(questionDetail.answeredAt) }}
      </p>
      
      <!-- 답변 내용 및 수정 버튼 -->
      <div v-if="questionDetail.answerText" class="board-body" style="background-color: transparent;">
        <div class="d-flex justify-space-between align-center mb-3">
          <div>
            <!-- 답변 내용 -->
            <p class="text-body-1">{{ questionDetail.answerText }}</p>
            <!-- 답변자 정보 및 답변 시간 -->
          </div>
          <!-- 답변 작성자와 현재 로그인된 유저가 동일할 경우 수정 버튼 표시 -->
          <v-btn v-if="isAnswerAuthor" class="btn_solid" @click="goToEditAnswer" small>
            수정
          </v-btn>
        </div>
      </div>

    </div>

    <v-divider></v-divider> <!-- 답변과 댓글 작성 구분선 -->

    <!-- 댓글 작성 폼 -->
    <v-form v-if="isLoggedIn" @submit.prevent="submitComment" class="comment-form mt-4">
      <v-textarea label="댓글 작성" v-model="newCommentContent" required outlined></v-textarea>
      <v-btn v-create class="mt-2" @click="submitComment">댓글 작성</v-btn>
    </v-form>

    <!-- 댓글 섹션 -->
    <div class="comment-section">
      <v-list two-line v-if="comments && comments.length > 0">
        <v-list-item v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-content">
            <div class="comment-meta">
              <p class="comment-text">{{ comment.content }}</p>
              <small>
                사번: {{ comment.userNum }} - {{ formatDate(comment.createdAt) }}
                <span v-if="comment.isEdited">(수정됨)</span>
              </small>
            </div>
            <div v-if="comment.userNum === userNum" class="action-buttons">
              <v-btn small text @click="editComment(comment)">수정</v-btn>
              <v-btn small text color="red" @click="deleteComment(comment.id)">삭제</v-btn>
            </div>
          </div>
        </v-list-item>
      </v-list>
    </div>
  </v-container>
</template>



<script>
import axios from 'axios';

export default {
  data() {
    return {
      questionDetail: null,
      newCommentContent: '',
      comments: [],
      isLoggedIn: false,
      error: null,
      userNum: localStorage.getItem('userNum'), // 현재 로그인한 유저의 ID
    };
  },
  computed: {
    isQuestionAuthor() {
      return this.questionDetail && this.questionDetail.questionUserNum === this.userNum;
    },
    isAnswerAuthor() {
      return this.questionDetail && this.questionDetail.answerUserNum === this.userNum;
    },
  },
  methods: {
    decodeToken() {
      this.userNum = localStorage.getItem('userNum');
      this.isLoggedIn = !!this.userNum;
      if (!this.userNum) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        this.$router.push('/login');
      }
    },
    async fetchQuestionDetail() {
      const questionId = this.$route.params.id;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/qna/detail/${questionId}`);
        this.questionDetail = response.data.result;
        this.comments = response.data.result.comments || [];
      } catch (error) {
        this.error = error.response ? error.response.data.message : '질문 정보를 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.';
        alert(this.error);
      }
    },
    goToEditQuestion() {
      this.$router.push(`/qna/update/question/${this.$route.params.id}`);
    },
    goToAnswerPage() {
      const questionId = this.$route.params.id;
      this.$router.push(`/qna/answer/${questionId}`);
    },
    goToEditAnswer() {
      const questionId = this.$route.params.id;
      this.$router.push(`/qna/update/answer/${questionId}`);
    },
    async submitComment() {
      if (!this.newCommentContent.trim()) {
        alert('댓글 내용을 입력해주세요.');
        return;
      }
      const qnaId = this.$route.params.id;
      const newComment = {
        content: this.newCommentContent,
        question_id: qnaId,
        userNum: this.userNum,
      };
      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/comment/create`, newComment);
        this.newCommentContent = '';
        this.fetchQuestionDetail();
        alert('댓글이 성공적으로 등록되었습니다.');
      } catch (error) {
        alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    },
    async deleteComment(commentId) {
      if (confirm("이 댓글을 삭제하시겠습니까?")) {
        try {
          await axios.get(`${process.env.VUE_APP_API_BASE_URL}/comment/delete/${commentId}`, {
            params: { userNum: this.userNum }
          });
          alert("댓글이 삭제되었습니다.");
          this.fetchQuestionDetail();
        } catch (error) {
          alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
        }
      }
    },
    editComment(comment) {
      const updatedContent = prompt("댓글을 수정하세요:", comment.content);
      if (updatedContent && updatedContent !== comment.content) {
        axios.put(`${process.env.VUE_APP_API_BASE_URL}/comment/update/${comment.id}`, {
          content: updatedContent,
          userNum: this.userNum,
          isEdited: true,
        })
          .then(() => {
            const updatedCommentIndex = this.comments.findIndex(c => c.id === comment.id);
            if (updatedCommentIndex !== -1) {
              this.comments[updatedCommentIndex].content = updatedContent;
              this.comments[updatedCommentIndex].isEdited = true;
            }
            alert('댓글이 성공적으로 수정되었습니다.');
          })
          .catch(() => {
            alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
          });
      }
    },
    formatDate(date) {
      return new Date(date)
        .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/\.\s/g, '.') // 중간에 붙는 공백을 없앰
        .replace(/\.$/, ''); // 마지막에 붙는 '.'을 없앰
    },
  },
  created() {
    this.decodeToken();
    this.fetchQuestionDetail();
  },
};
</script>

<style scoped>
.board-container {
  padding: 20px;
}

.meta-info-section {
  font-size: 0.9rem;
  color: #777;
}

.board-body {
  width: 100%;
  max-width: 1500px;
  min-height: 400px;
  padding: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.comment-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
}

.comment-item {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.comment-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.comment-form {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
}

.align-right {
  margin-left: auto;
  /* 수정 버튼을 오른쪽 끝으로 정렬 */
  display: flex;
  justify-content: flex-end;
}
</style>
