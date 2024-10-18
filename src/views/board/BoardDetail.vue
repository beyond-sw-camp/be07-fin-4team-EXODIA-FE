<template>
  <v-container class="mt-5 board-container" fluid>
    <!-- 질문 상세보기 카드 -->
    <div class="pa-4 mb-5" v-if="questionDetail">
      <h3 class="text-h5 font-weight-bold">
        {{ questionDetail.title }}
      </h3>
      <v-divider></v-divider>

      <div class="pa-3">
        <!-- 작성자 정보 -->
        <div class="meta-info-section d-flex justify-space-between align-center mb-3">
          <div>
            <p><strong>작성자:</strong> {{ questionDetail.anonymous ? '익명' : questionDetail.questionUserName }}</p>
            <p><strong>문의 부서:</strong> {{ questionDetail.departmentName }}</p>
            <p><strong>작성 시간:</strong> {{ formatDate(questionDetail.createdAt) }}</p>
            <p><strong>수정 시간:</strong> {{ formatDate(questionDetail.updatedAt) }}</p>
          </div>
          <div>
            <!-- 수정 및 답변하기 버튼 -->
            <v-btn v-if="isQuestionAuthor" class="mr-2 btn_solid" @click="goToEditQuestion" small>
              <v-icon left>mdi-pencil</v-icon> 질문 수정
            </v-btn>
            <v-btn v-if="!questionDetail.answerText" @click="goToAnswerPage" class="btn_comment_ok" small>
              <v-icon left>mdi-comment-plus</v-icon> 답변하기
            </v-btn>
          </div>
        </div>

        <!-- 질문 내용 -->
        <div class="board-body">
          <p class="text-h6 font-weight-bold">질문 내용:</p>
          <p class="text-body-1">{{ questionDetail.questionText }}</p>
        </div>

        <!-- 질문 첨부 파일 -->
        <div v-if="questionDetail.qFiles && questionDetail.qFiles.length > 0" class="mb-4 file-list-section">
          <v-divider></v-divider>
          <h3 class="text-h6 font-weight-bold">질문 첨부 파일</h3>
          <v-list>
            <v-list-item v-for="(file, index) in questionDetail.qFiles" :key="index" class="file-item">
              <v-list-item-content>
                <v-list-item-title @click="downloadFile(file.filePath)" class="file-link">
                  <v-icon left>mdi-file</v-icon> {{ file.fileName }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>
      </div>
    </div>

    <!-- 답변 섹션 -->
    <div class="pa-4 mb-5 answer-card" v-if="questionDetail && questionDetail.answerText">
      <h3 class="text-h6 font-weight-bold">
        답변
      </h3>
      <v-divider></v-divider>
      <div class="pa-3">
        <p><strong>답변자:</strong> {{ questionDetail.answerUserName }}</p>
        <p><strong>답변 시간:</strong> {{ formatDate(questionDetail.answeredAt) }}</p>
        <p class="text-body-1">{{ questionDetail.answerText }}</p>

        <!-- 답변 첨부 파일 -->
        <div v-if="questionDetail.aFiles && questionDetail.aFiles.length > 0" class="mb-4 file-list-section">
          <v-divider></v-divider>
          <h3 class="text-h6 font-weight-bold">답변 첨부 파일</h3>
          <v-list>
            <v-list-item v-for="(file, index) in questionDetail.aFiles" :key="index" class="file-item">
              <v-list-item-content>
                <v-list-item-title @click="downloadFile(file.filePath)" class="file-link">
                  <v-icon left>mdi-file</v-icon> {{ file.fileName }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </div>

        <!-- 답변 수정 버튼 -->
        <v-btn v-if="isAnswerAuthor" class="mt-3 btn_solid" @click="goToEditAnswer" small>
          <v-icon left>mdi-pencil</v-icon> 답변 수정
        </v-btn>
      </div>
    </div>

    <!-- 댓글 섹션 -->
    <div v-if="isFamilyEventCategory" class="comment-section">
      <h3 class="section-title">댓글</h3>
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

      <v-form v-if="isLoggedIn" @submit.prevent="submitComment" class="comment-form mt-4">
        <v-textarea label="댓글 작성" v-model="newCommentContent" required outlined></v-textarea>
        <v-btn class="btn_comment_ok mt-2" @click="submitComment">댓글 작성</v-btn>
      </v-form>
    </div>

    <!-- 오류 메시지 표시 -->
    <v-alert type="error" v-if="error" class="mt-4">{{ error }}</v-alert>
  </v-container>
</template>


<script>
import axios from 'axios';

export default {
  data() {
    return {
      questionDetail: null,
      comments: [], // comments를 빈 배열로 초기화
      newCommentContent: '',
      isLoggedIn: false, // isLoggedIn을 초기화
      error: null,
      userNum: localStorage.getItem('userNum')
    };
  },
  computed: {
    isQuestionAuthor() {
      return this.questionDetail && this.questionDetail.questionUserNum === this.userNum;
    },
    isAnswerAuthor() {
      return this.questionDetail && this.questionDetail.answerUserNum === this.userNum;
    },
    isFamilyEventCategory() {
      return this.questionDetail?.category === 'FAMILY_EVENT';
    }
  },
  methods: {
    decodeToken() {
      this.userNum = localStorage.getItem('userNum');
      this.isLoggedIn = !!this.userNum;
      if (!this.userNum) {
        this.$router.push('/login');
      }
    },
    async fetchQuestionDetail() {
      const questionId = this.$route.params.id;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/qna/detail/${questionId}`);
        this.questionDetail = response.data.result;
        this.comments = this.questionDetail.comments || []; // 서버에서 댓글 데이터를 받아 comments에 저장
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
      if (!this.newCommentContent.trim()) {
        alert('댓글 내용을 입력하세요.');
        return;
      }

      const qnaId = this.$route.params.id;
      const newComment = {
        content: this.newCommentContent,
        question_id: qnaId,
        userNum: this.userNum,
      };

      try {
        await axios.post(`http://localhost:8087/comment/create`, newComment);
        this.newCommentContent = '';
        this.fetchQuestionDetail(); // 댓글 작성 후 새로고침
      } catch (error) {
        console.error('댓글 작성에 실패했습니다:', error.response ? error.response.data : error);
        alert('댓글 작성에 실패했습니다.');
      }
    },
    async deleteComment(commentId) {
      if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        try {
          await axios.get(`${process.env.VUE_APP_API_BASE_URL}/comment/delete/${commentId}`, {
            params: { userNum: this.userNum }
          });
          alert("댓글이 성공적으로 삭제되었습니다.");
          this.fetchQuestionDetail();
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
            isEdited: true
          })
          .then(() => this.fetchQuestionDetail())
          .catch((error) => {
            console.error("댓글 수정에 실패했습니다:", error);
            this.error = '댓글 수정에 실패했습니다.';
          });
      }
    },
    formatDate(date) {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      return new Date(date).toLocaleDateString('ko-KR', options).replace(/\//g, '.');
    },
    downloadFile(filePath) {
      const link = document.createElement('a');
      link.href = filePath;
      link.download = filePath.split('/').pop();
      link.click();
    }
  },
  created() {
    this.decodeToken();
    this.fetchQuestionDetail();
  }
};
</script>


<style scoped>
.board-container {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 12px;
}

.board-title {
  margin-bottom: 20px;
  color: #000;
}

.meta-info-section {
  font-size: 0.9rem;
  color: #777;
}

.board-body {
  width: 100%;         
  max-width: 800px;      
  min-height: 400px;     
  height: auto;           
  padding: 20px;         
  border-radius: 8px;     
  overflow: hidden;       
}

.tag-section {
  margin-top: 20px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-list-section {
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.file-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-item {
  flex: 0 1 30%;
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.file-preview {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 8px;
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
  margin-top: 20px;
}

.btn_solid {
  background-color: #3f51b5 !important;
  color: #ffffff !important;
  border-radius: 8px;
}

.btn_st2 {
  background-color: #424242 !important;
  color: #ffffff;
  border-radius: 8px;
}

.btn_del {
  background-color: #f27885 !important;
  color: white;
  border-radius: 8px;
}

.btn_comment_ok {
  background-color: #5087c7 !important;
  color: white;
  border-radius: 8px;
}

.tbl_list {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0px;
}

.tbl_list th,
.tbl_list td {
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid #000;
  text-align: left;
}

.tbl_list th {
  background-color: #f4f4f4;
}

.tbl_list tr:hover {
  background-color: #ababab;
}

.btn_write {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 16px;
  background-color: #949494;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.btn_write:hover {
  background-color: #722121;
}

.v-pagination {
  margin-top: 20px;
}

.v-pagination .v-pagination__item {
  border: none;
  color: #722121;
}

.v-pagination .v-pagination__item--active {
  font-weight: bold;
  background-color: #c5e1a5;
  color: white;
}

.drawer-open {
  transition: margin-right 0.3s ease;
  margin-right: 200px;
}
</style>
