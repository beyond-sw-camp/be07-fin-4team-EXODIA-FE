<template>
  <v-container class="mt-5 qna-container">
    <!-- 질문 상세보기 카드 -->
    <v-card class="pa-4 mb-5" v-if="questionDetail">
      <v-card-title class="text-h5 font-weight-bold">
        {{ questionDetail.title }}
      </v-card-title>
      <v-divider></v-divider>

      <v-card-text class="pa-3">
        <!-- 작성자 정보 -->
        <div class="d-flex justify-space-between align-center mb-3">
          <div>
            <p><strong>작성자:</strong> {{ questionDetail.anonymous ? '익명' : questionDetail.questionUserName }}</p>
            <p><strong>작성 시간:</strong> {{ formatDate(questionDetail.createdAt) }}</p>
            <p><strong>수정 시간:</strong> {{ formatDate(questionDetail.updatedAt) }}</p>
          </div>
          <div>
            <!-- 수정 및 답변하기 버튼 -->
            <v-btn v-if="isQuestionAuthor" class="mr-2" @click="goToEditQuestion" color="orange darken-3" small>
              <v-icon left>mdi-pencil</v-icon> 질문 수정
            </v-btn>
            <v-btn v-if="!questionDetail.answerText" @click="goToAnswerPage" color="blue darken-1" small>
              <v-icon left>mdi-comment-plus</v-icon> 답변하기
            </v-btn>
          </div>
        </div>

        <!-- 질문 내용 -->
        <p class="text-h6 font-weight-bold">질문 내용:</p>
        <p class="text-body-1">{{ questionDetail.questionText }}</p>

        <!-- 질문 첨부 파일 -->
        <v-card flat v-if="questionDetail.qFiles && questionDetail.qFiles.length > 0" class="mb-4">
          <v-divider></v-divider>
          <v-card-title class="text-h6 font-weight-bold">질문 첨부 파일</v-card-title>
          <v-list>
            <v-list-item v-for="(file, index) in questionDetail.qFiles" :key="index">
              <v-list-item-content>
                <v-list-item-title @click="downloadFile(file.filePath)" class="file-link">
                  <v-icon left>mdi-file</v-icon> {{ file.fileName }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-card-text>
    </v-card>

    <!-- 답변 섹션 -->
    <v-card class="pa-4 mb-5" v-if="questionDetail && questionDetail.answerText">
      <v-card-title class="text-h6 font-weight-bold">
        답변
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-3">
        <p><strong>답변자:</strong> {{ questionDetail.answerUserName }}</p>
        <p><strong>답변 시간:</strong> {{ formatDate(questionDetail.answeredAt) }}</p>
        <p class="text-body-1">{{ questionDetail.answerText }}</p>
        <!-- 답변 첨부 파일 -->
        <v-card flat v-if="questionDetail.aFiles && questionDetail.aFiles.length > 0" class="mb-4">
          <v-divider></v-divider>
          <v-card-title class="text-h6 font-weight-bold">답변 첨부 파일</v-card-title>
          <v-list>
            <v-list-item v-for="(file, index) in questionDetail.aFiles" :key="index">
              <v-list-item-content>
                <v-list-item-title @click="downloadFile(file.filePath)" class="file-link">
                  <v-icon left>mdi-file</v-icon> {{ file.fileName }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- 답변 수정 버튼 -->
        <v-btn v-if="isAnswerAuthor" class="mt-3" @click="goToEditAnswer" color="orange darken-3" small>
          <v-icon left>mdi-pencil</v-icon> 답변 수정
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- 댓글 섹션 -->
    <v-card class="pa-4" v-if="questionDetail && questionDetail.comments && questionDetail.comments.length > 0">
      <v-card-title class="text-h6 font-weight-bold">
        댓글
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <!-- 댓글 목록 -->
        <v-list two-line>
          <v-list-item v-for="comment in questionDetail.comments" :key="comment.id" class="py-2">
            <v-list-item-content>
              <v-list-item-title class="text-subtitle-1">{{ comment.content }}</v-list-item-title>
              <v-list-item-subtitle>{{ comment.userName }} - {{ formatDate(comment.createdAt) }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action v-if="comment.userNum === userNum">
              <v-btn small text @click="editComment(comment)">수정</v-btn>
              <v-btn small text color="red" @click="deleteComment(comment.id)">삭제</v-btn>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- 댓글 작성 폼 -->
    <v-card v-if="questionDetail" class="pa-4 mt-4">
      <v-card-title class="text-h6 font-weight-bold">
        댓글 작성
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-form @submit.prevent="submitComment" class="mt-3">
          <v-textarea label="댓글 작성" v-model="newComment" outlined required></v-textarea>
          <div class="mt-3 d-flex justify-end">
            <v-btn class="btn_solid mr-2" @click="goBack">목록으로</v-btn>
            <v-btn type="submit" class="btn_comment_ok" color="blue darken-1">댓글 작성</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- 오류 메시지 표시 -->
    <v-alert type="error" v-if="error" class="mt-4">{{ error }}</v-alert>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      questionDetail: null, // 질문 및 답변 세부 정보
      newComment: '', // 댓글 작성 필드
      error: null, // 오류 메시지
      userNum: '', // 사용자 사번
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
      if (!this.userNum) {
        this.$router.push('/login');
      }
    },
    async fetchQuestionDetail() {
      const questionId = this.$route.params.id;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/qna/detail/${questionId}`);
        this.questionDetail = response.data.result;

        // 익명 여부에 따라 작성자 정보를 '익명'으로 변경
        if (this.questionDetail.anonymous) {
          this.questionDetail.questionUserName = '익명';
        }

        this.questionDetail.qFiles = response.data.result.qfiles || [];
        this.questionDetail.aFiles = response.data.result.afiles || [];
      } catch (error) {
        this.error = error.response ? error.response.data.message : '질문 정보를 불러오는 중 오류가 발생했습니다.';
        console.error("Error fetching question detail:", error);
      }
    },
    goToEditQuestion() {
      this.$router.push(`/qna/update/question/${this.$route.params.id}`);
    },
    goToEditAnswer() {
      this.$router.push(`/qna/update/answer/${this.$route.params.id}`);
    },
    goToAnswerPage() {
      const questionId = this.$route.params.id;
      this.$router.push(`/qna/answer/${questionId}`);
    },
    async submitComment() {
      const questionId = this.$route.params.id;
      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/comment/create`, {
          question_id: questionId,
          content: this.newComment,
          userNum: this.userNum,
        });
        this.newComment = '';
        this.fetchQuestionDetail(); // 댓글 작성 후 새로고침
      } catch (error) {
        console.error("댓글 등록 오류:", error.response ? error.response.data : error);
        this.error = error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : '댓글 등록에 실패했습니다.';
      }
    },
    async deleteComment(commentId) {
      if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        try {
          await axios.get(`${process.env.VUE_APP_API_BASE_URL}/comment/delete/${commentId}`, {
            params: { userNum: this.userNum }
          });
          alert("댓글이 성공적으로 삭제되었습니다.");
          this.fetchQuestionDetail(); // 삭제 후 댓글 목록 다시 불러오기
        } catch (error) {
          console.error("댓글 삭제에 실패했습니다:", error);
          this.error = '댓글 삭제에 실패했습니다.';
        }
      }
    },
    editComment(comment) {
      const updatedContent = prompt("댓글을 수정하세요:", comment.content);
      if (updatedContent && updatedContent !== comment.content) {
        axios
          .put(`${process.env.VUE_APP_API_BASE_URL}/comment/update/${comment.id}`, {
            content: updatedContent,
            userNum: this.userNum,
          })
          .then(() => this.fetchQuestionDetail()) // 댓글 수정 후 새로고침
          .catch((error) => {
            console.error("댓글 수정에 실패했습니다:", error);
            this.error = '댓글 수정에 실패했습니다.';
          });
      }
    },
    goBack() {
      this.$router.push('/qna/list');
    },
    formatDate(date) {
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      };
      
      // toLocaleDateString을 사용하여 형식 변경 (ex: 2024.10.11)
      return new Date(date).toLocaleDateString('ko-KR', options).replace(/\//g, '.');
    },
    downloadFile(filePath) {
      const link = document.createElement('a');
      link.href = filePath;
      link.download = filePath.split('/').pop();
      link.click();
    },
  },
  created() {
    this.decodeToken();
    this.fetchQuestionDetail();
  },
};
</script>

<style scoped>
/* 전체 컨테이너 스타일 */
.qna-container {
  max-width: 900px;
  margin: 0 auto;
}

/* 제목 및 질문 섹션 스타일 */
.board-title {
  font-size: 24px;
  font-weight: bold;
  color: #3f51b5;
  margin-bottom: 20px;
}

/* 파일 링크 스타일 */
.file-link {
  cursor: pointer;
  color: #007bff;
  text-decoration: underline;
}

/* 답변 카드 스타일 */
.answer-card {
  background-color: #e3f2fd;
}

/* 댓글 관련 스타일 */
.comment-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 댓글 작성 및 버튼 스타일 */
.btn_solid {
  background-color: #1976d2;
  color: #fff;
}

.btn_comment_ok {
  background-color: #43a047;
  color: #fff;
}

.v-btn:hover {
  opacity: 0.8;
}
</style>
