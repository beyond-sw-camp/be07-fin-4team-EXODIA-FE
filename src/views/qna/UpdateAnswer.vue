<template>
  <v-container class="mt-5">
    <v-form @submit.prevent="updateAnswer">
      <!-- 답변 내용 입력 -->
      <v-textarea
        label="답변 내용"
        v-model="answer.answerText"
        required
        outlined
        dense
      ></v-textarea>

      <!-- 파일 선택 -->
      <v-file-input
        label="파일 선택 (선택사항)"
        @change="onFileChange"
        accept="*/*"
        multiple
        outlined
        dense
      ></v-file-input>

      <!-- 기존 파일 및 새 파일 미리보기 -->
      <div v-if="previewFiles.length > 0">
        <p>첨부 파일 목록:</p>
        <ul>
          <li v-for="(file, index) in previewFiles" :key="index">{{ file.name }}</li>
        </ul>
      </div>

      <v-btn type="submit" color="primary">수정 완료</v-btn>
      <v-btn color="secondary" @click="goBack">취소</v-btn>
    </v-form>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      answer: {
        answerText: '', // 답변 내용
        files: [], // 새로 선택된 파일 리스트
      },
      previewFiles: [], // 미리보기용 파일 리스트
    };
  },
  created() {
    this.fetchAnswerDetail();
  },
  methods: {
    // 서버에서 답변 상세 정보를 가져오는 메서드
    async fetchAnswerDetail() {
      const questionId = this.$route.params.id;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/qna/detail/${questionId}`);
        const detail = response.data.result;
        
        // 기존의 답변 내용과 파일 목록을 저장
        this.answer.answerText = detail.answerText || '';
        this.answer.files = detail.aFiles ? detail.aFiles.map(file => ({
          name: file.fileName,
          filePath: file.filePath,
        })) : [];

        // 파일 미리보기용 리스트 업데이트
        this.previewFiles = this.answer.files;
      } catch (error) {
        alert('답변 정보를 불러오는 중 오류가 발생했습니다.');
        this.$router.push(`/qna/detail/${questionId}`);
      }
    },
    // 파일 변경 시 처리 메서드
    onFileChange(event) {
      const files = event?.target?.files || event?.dataTransfer?.files;
      if (files && files.length > 0) {
        this.answer.files = Array.from(files); // 새로 선택된 파일 리스트 저장
        this.previewFiles = Array.from(files); // 미리보기용 파일 리스트 업데이트
      } else {
        this.answer.files = [];
        this.previewFiles = [];
      }
    },
    // 답변 수정 요청 메서드
    async updateAnswer() {
      const formData = new FormData();
      formData.append('answerText', this.answer.answerText);

      // 새로 선택된 파일들을 FormData에 추가
      this.answer.files.forEach((file) => {
        formData.append('files', file);
      });

      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/qna/update/answer/${this.$route.params.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        alert('답변이 성공적으로 수정되었습니다!');
        this.$router.push(`/qna/detail/${this.$route.params.id}`);
      } catch (error) {
        alert('답변 수정에 실패했습니다.');
      }
    },
    // 이전 페이지로 돌아가는 메서드
    goBack() {
      const questionId = this.$route.params.id;
      this.$router.push(`/qna/detail/${questionId}`);
    },
  },
};
</script>

<style scoped>
.v-container {
  max-width: 800px;
  margin: 0 auto;
}
.my-3 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
