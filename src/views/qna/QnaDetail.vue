<template>
  <v-container class="mt-5">
    <v-row>
      <v-col cols="12">
        <v-card class="pa-3 mb-4">
          <h1 class="board-title">QnA 상세 보기</h1>
        </v-card>
      </v-col>
    </v-row>

    <!-- 질문 카드와 관련된 내용 -->
    <v-card class="pa-5" v-if="questionDetail">
      <div class="d-flex justify-space-between align-center mb-3">
        <h2 class="text-h4 font-weight-bold">{{ questionDetail.title }}</h2>
        <div>
          <!-- 질문 수정 버튼 (질문 작성자만 보이도록 설정) -->
          <v-btn v-if="isQuestionAuthor" class="mr-2" @click="goToEditQuestion" color="warning">질문 수정</v-btn>
          <!-- 답변이 작성되지 않은 경우에만 버튼 표시 -->
          <v-btn v-if="!questionDetail.answerText" @click="goToAnswerPage" color="primary">답변하기</v-btn>
        </div>
      </div>

      <!-- 질문 상세 내용 -->
      <v-row class="mb-5">
        <v-col cols="12">
          <v-card flat>
            <v-card-text>
              <div class="text-body-1">
                <p><strong>작성자:</strong> {{ questionDetail.anonymous ? '익명' : questionDetail.questionUserName }} | <strong>작성 시간:</strong> {{ formatDate(questionDetail.createdAt) }} | <strong>수정 시간:</strong> {{ formatDate(questionDetail.updatedAt) }}</p>
              </div>
              <p class="text-h5"><strong>질문 내용:</strong> <br>{{ questionDetail.questionText }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- 질문 파일 다운로드 및 미리보기 -->
      <v-row v-if="questionDetail.qFiles && questionDetail.qFiles.length > 0" class="mb-5">
        <v-col cols="12">
          <v-card flat>
            <v-card-title>질문 첨부 파일</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="(file, index) in questionDetail.qFiles" :key="index">
                  <v-list-item-content>
                    <!-- 파일이 이미지인 경우 미리보기, 아닌 경우 다운로드 링크로 표시 -->
                    <v-img v-if="isImage(file.fileName)" :src="file.filePath" class="mb-3" max-width="300" />
                    <v-list-item-title @click="downloadFile(file.filePath)" class="file-link" v-else>
                      <v-icon left>mdi-file</v-icon> {{ file.fileName }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-divider></v-divider>

      <!-- 답변 섹션 -->
      <v-row v-if="questionDetail.answerText" class="mb-5">
        <v-col cols="12">
          <v-card flat>
            <v-card-title>답변</v-card-title>
            <v-card-text>
              <div class="text-body-1">
                <p><strong>답변자:</strong> {{ questionDetail.answerUserName }} | <strong>답변 시간:</strong> {{ formatDate(questionDetail.answeredAt) }}</p>
                <p class="text-h5"><strong>답변 내용:</strong> <br>{{ questionDetail.answerText }}</p>
              </div>
              <!-- 답변 수정 버튼 (답변 작성자만 보이도록 설정) -->
              <v-btn v-if="isAnswerAuthor" class="mt-3" @click="goToEditAnswer" color="warning">답변 수정</v-btn>
            </v-card-text>

            <!-- 답변 파일 다운로드 및 미리보기 -->
            <v-card-actions v-if="questionDetail.aFiles && questionDetail.aFiles.length > 0">
              <v-card-title>답변 첨부 파일</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="(file, index) in questionDetail.aFiles" :key="index">
                    <v-list-item-content>
                      <!-- 파일이 이미지인 경우 미리보기, 아닌 경우 다운로드 링크로 표시 -->
                      <v-img v-if="isImage(file.fileName)" :src="file.filePath" class="mb-3" max-width="300" />
                      <v-list-item-title @click="downloadFile(file.filePath)" class="file-link" v-else>
                        <v-icon left>mdi-file</v-icon> {{ file.fileName }}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- 댓글 섹션 -->
      <v-row>
        <v-divider></v-divider>
        <v-col cols="12">
          <h4 class="text-h6 font-weight-bold">댓글</h4>
          <v-list two-line>
            <v-list-item v-for="comment in questionDetail.comments" :key="comment.id" class="py-2">
              <v-list-item-content class="comment-content">
                <div class="comment-text">
                  <v-list-item-title class="text-subtitle-1">{{ comment.content }}</v-list-item-title>
                  <v-list-item-subtitle>{{ comment.userName }} - {{ formatDate(comment.createdAt) }}</v-list-item-subtitle>
                </div>
                <v-list-item-action class="action-buttons">
                  <v-btn small text @click="editComment(comment)">수정</v-btn>
                  <v-btn small @click="deleteComment(comment.id)">삭제</v-btn>
                </v-list-item-action>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <!-- 댓글 작성 폼 -->
          <v-form @submit.prevent="submitComment" class="mt-3">
            <v-textarea label="댓글 작성" v-model="newComment" outlined required></v-textarea>
            <div class="mt-3 d-flex justify-end">
              <v-btn class="btn_solid" @click="goBack">목록으로</v-btn>
              <v-btn type="submit" class="btn_comment_ok">댓글작성</v-btn>
            </div>
          </v-form>
        </v-col>
      </v-row>
    </v-card>

    <!-- 오류 메시지 -->
    <v-alert type="error" v-if="error">{{ error }}</v-alert>
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
    // 현재 사용자가 질문의 작성자인지 여부 확인
    isQuestionAuthor() {
      return this.questionDetail && this.questionDetail.questionUserNum === this.userNum;
    },
    // 현재 사용자가 답변의 작성자인지 여부 확인
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
    isImage(fileName) {
      return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
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
      if (!date) return '';
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
      return new Date(date).toLocaleDateString('ko-KR', options);
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
.v-container {
  max-width: 900px;
  margin: 0 auto;
}
.v-list-item-title.file-link {
  cursor: pointer;
  color: green;
}
</style>
