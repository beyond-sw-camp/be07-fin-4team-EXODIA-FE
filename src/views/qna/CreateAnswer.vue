<template>
  <v-container class="mt-5">
    <v-card>
      <v-card-title>
        <h3>QnA 상세 보기</h3>
      </v-card-title>

      <v-card-text>
        <!-- 질문자 정보 -->
        <v-row>
          <v-col cols="6">
            <v-text-field label="질문자" v-model="questionDetail.questionUserName" readonly />
          </v-col>
          <v-col cols="6">
            <!-- 부서명을 department 객체의 id 대신 직접 보여줍니다. -->
            <v-text-field label="부서명" v-model="departmentName" readonly />
          </v-col>
          <v-col cols="12">
            <v-text-field label="질문 날짜" v-model="formattedQuestionDate" readonly />
          </v-col>
        </v-row>

        <!-- 질문 내용 -->
        <v-text-field label="제목" v-model="questionDetail.title" readonly />
        <v-textarea label="질문 내용" v-model="questionDetail.questionText" rows="5" readonly />

        <!-- 질문 첨부 파일 -->
        <v-card-actions>
          <v-btn v-if="questionDetail.qFiles && questionDetail.qFiles.length > 0" @click="downloadFile(questionDetail.qFiles[0].filePath)" color="primary">
            첨부 파일 다운로드
          </v-btn>
        </v-card-actions>

        <!-- 답변 내용 -->
        <v-card class="mt-5" v-if="questionDetail.answerText">
          <v-card-title>답변</v-card-title>
          <v-card-text>{{ questionDetail.answerText }}</v-card-text>
          <v-card-actions>
            <v-btn v-if="questionDetail.aFiles && questionDetail.aFiles.length > 0" @click="downloadFile(questionDetail.aFiles[0].filePath)" color="primary">
              첨부 파일 다운로드
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- 답변 작성 폼 -->
        <v-form @submit.prevent="submitAnswer">
          <v-textarea v-model="newAnswerText" label="답변 내용" rows="5" required></v-textarea>
          <v-file-input v-model="answerFiles" multiple label="답변 파일 첨부" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" show-size></v-file-input>
          <v-btn color="success" type="submit" class="mt-3">답변 등록</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      questionDetail: {}, // 질문 및 답변 세부 정보 객체
      departmentName: '', // 부서명 표시
      newAnswerText: '', // 새로운 답변 내용
      answerFiles: [], // 새로운 답변 첨부 파일
      formattedQuestionDate: '', // 질문 작성 날짜 포맷팅된 값
    };
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

        // 질문 작성 날짜를 포맷팅하여 저장
        this.formattedQuestionDate = new Date(this.questionDetail.createdAt).toLocaleString();

        // departmentName은 department 필드 값으로 설정
        this.departmentName = this.getDepartmentName(this.questionDetail.department);
      } catch (error) {
        console.error('질문 정보를 불러오는 중 오류가 발생했습니다:', error);
      }
    },
    // 부서 ID를 통해 부서명 얻기
    getDepartmentName(departmentId) {
      const departments = {
        1: '인사팀',
        2: '개발팀',
        3: '기획팀',
        4: '영업팀',
        5: '경영지원팀'
      };
      return departments[departmentId] || '부서명 없음';
    },
    // 답변 작성 또는 수정
    async submitAnswer() {
      const questionId = this.$route.params.id;
      try {
        // 서버로 전송할 FormData 객체 생성
        const formData = new FormData();
        formData.append('answerText', this.newAnswerText); // DTO에서 필요한 answerText 필드 추가

        // 첨부된 파일들을 FormData에 추가
        if (this.answerFiles && this.answerFiles.length > 0) {
          this.answerFiles.forEach((file) => {
            formData.append('files', file);
          });
        }

        // 서버로 POST 요청 전송 (파일 업로드를 포함하기 위해 Content-Type을 multipart/form-data로 설정)
        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/qna/answer/${questionId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        console.log('답변 등록 성공:', response.data);

        // 답변 등록 후, 해당 질문글의 상세 보기 페이지로 이동
        this.$router.push(`/qna/detail/${questionId}`);

      } catch (error) {
        console.error('답변 등록 중 오류가 발생했습니다:', error);

        // 404 오류 발생 시 URL 확인 안내
        if (error.response && error.response.status === 404) {
          console.error("요청한 URL을 찾을 수 없습니다. URL이 올바른지 확인하세요.");
        }
      }
    },
    // 파일 다운로드
    downloadFile(filePath) {
      const link = document.createElement('a');
      link.href = filePath;
      link.download = filePath.split('/').pop();
      link.click();
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
