<template>
  <v-container class="mt-5" style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 800px;">
    <h3 class="mb-4">답변</h3>

    <!-- 질문자 정보 -->
    <v-row>
      <v-col cols="6">
        <!-- 질문자가 익명일 경우 '익명'으로 표시 -->
        <v-text-field label="질문자" v-model="questionerName" readonly outlined />
      </v-col>
      <v-col cols="6">
        <!-- 부서명을 departmentName에서 직접 가져와서 표시 -->
        <v-text-field label="문의 부서" v-model="questionDetail.departmentName" readonly outlined />
      </v-col>
      <v-col cols="12">
        <v-text-field label="질문 날짜" v-model="formattedQuestionDate" readonly outlined />
      </v-col>
    </v-row>

    <!-- 질문 내용 -->
    <v-text-field label="제목" v-model="questionDetail.title" readonly outlined />
    <v-textarea label="질문 내용" v-model="questionDetail.questionText" rows="5" readonly outlined />

    <!-- 질문 첨부 파일 -->
    <v-row class="my-3">
      <v-btn
        v-if="questionDetail.qFiles && questionDetail.qFiles.length > 0"
        @click="downloadFile(questionDetail.qFiles[0].filePath)"
        color="primary"
      >
        첨부 파일 다운로드
      </v-btn>
    </v-row>

    <!-- 답변 작성 폼 -->
    <v-form @submit.prevent="submitAnswer">
      <v-textarea v-model="newAnswerText" label="답변 내용" rows="5" outlined required></v-textarea>
      <v-file-input
        v-model="answerFiles"
        multiple
        label="답변 파일 첨부"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        show-size
        outlined
      ></v-file-input>
      <v-btn v-create type="submit" class="mt-3">답변 등록</v-btn>
    </v-form>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      questionDetail: {}, // 질문 및 답변 세부 정보 객체
      newAnswerText: '', // 새로운 답변 내용
      answerFiles: [], // 새로운 답변 첨부 파일
      formattedQuestionDate: '', // 질문 작성 날짜 포맷팅된 값
      answerMaxLength: 5000, // 답변 최대 길이 제한
    };
  },
  computed: {
    // 질문자가 익명인지 여부에 따라 표시할 이름 설정
    questionerName() {
      return this.questionDetail.anonymous ? '익명' : this.questionDetail.questionUserName;
    }
  },
  created() {
    this.fetchQuestionDetails();
  },
  methods: {
    // 질문 세부 정보 가져오기
    async fetchQuestionDetails() {
      const questionId = this.$route.params.id;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/qna/detail/${questionId}`);
        this.questionDetail = response.data.result;
        this.formattedQuestionDate = new Date(this.questionDetail.createdAt).toLocaleString();
      } catch (error) {
        console.error('질문 정보를 불러오는 중 오류가 발생했습니다:', error);
        alert('질문 정보를 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 답변 작성 또는 수정
    async submitAnswer() {
      if (this.newAnswerText.length > this.answerMaxLength) {
        alert(`답변은 최대 ${this.answerMaxLength}자까지 작성할 수 있습니다. 현재 ${this.newAnswerText.length}자를 입력하셨습니다.`);
        return;
      }

      const questionId = this.$route.params.id;
      const userNum = localStorage.getItem("userNum");

      try {
        const formData = new FormData();
        formData.append('answerText', this.newAnswerText);
        formData.append('userNum', userNum);

        if (this.answerFiles && this.answerFiles.length > 0) {
          this.answerFiles.forEach((file) => {
            formData.append('files', file);
          });
        }

        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/qna/answer/${questionId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        alert('답변이 성공적으로 등록되었습니다.');
        this.$router.push(`/qna/detail/${questionId}`);
      } catch (error) {
        console.error('답변 등록 중 오류가 발생했습니다:', error);
        alert('답변을 등록하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 파일 다운로드
    downloadFile(filePath) {
      try {
        const link = document.createElement('a');
        link.href = filePath;
        link.download = filePath.split('/').pop();
        link.click();
        alert('파일 다운로드가 시작되었습니다.');
      } catch (error) {
        console.error('파일 다운로드 중 오류가 발생했습니다:', error);
        alert('파일 다운로드 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },
  },
};
</script>

<style scoped>
.v-container {
  max-width: 800px;
  margin: auto;
}
</style>
