<template>
  <v-container class="mt-5 white-background qna-container">
    <v-form @submit.prevent="updateQuestion">
      <!-- 질문 제목 -->
      <div class="pa-4 white-background mb-4">
        <v-text-field
          label="제목"
          v-model="question.title"
          required
          outlined
          dense
        ></v-text-field>
      </div>

      <!-- 질문 내용 -->
      <div class="pa-4 white-background mb-4">
        <v-textarea
          label="질문 내용"
          v-model="question.questionText"
          required
          outlined
          dense
        ></v-textarea>
      </div>

      <!-- 파일 선택 -->
      <div class="pa-4 white-background mb-4">
        <v-file-input
          label="파일 선택 (선택사항)"
          @change="onFileChange"
          accept="*/*"
          multiple
          outlined
          dense
        ></v-file-input>
      </div>

      <!-- 기존 및 새 파일 목록 미리보기 -->
      <div class="pa-4 white-background mb-4" v-if="previewFiles.length > 0">
        <p>첨부 파일 목록:</p>
        <ul>
          <li v-for="(file, index) in previewFiles" :key="index">{{ file.name }}</li>
        </ul>
      </div>

      <!-- 미리보기 이미지 -->
      <v-img v-if="previewImageSrc" :src="previewImageSrc" max-width="200" class="my-3"/>

      <!-- 제출 및 취소 버튼 -->
      <div class="pa-4 white-background mb-4">
        <v-btn type="submit" color="primary">수정 완료</v-btn>
        <v-btn color="secondary" @click="goBack">취소</v-btn>
      </div>
    </v-form>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      question: {
        title: '',
        questionText: '',
        files: [], // 기존 파일 목록
        qFiles: [], // 새로 추가된 파일 리스트 (초기값 빈 배열)
      },
      previewFiles: [], // 새로 선택된 파일 미리보기 리스트
      previewImageSrc: null, // 이미지 미리보기 경로
    };
  },
  created() {
    this.fetchQuestionDetail();
  },
  methods: {
    // 질문 상세 정보를 서버에서 가져오는 메서드
    async fetchQuestionDetail() {
      const questionId = this.$route.params.id;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/qna/detail/${questionId}`);
        this.question = response.data.result;

        // qFiles가 null일 경우 빈 배열로 설정
        this.question.qFiles = Array.isArray(this.question.qFiles) ? this.question.qFiles : [];

        // 기존 파일을 미리보기 목록에 추가
        if (this.question.qFiles.length > 0) {
          this.previewFiles = this.question.qFiles.map((file) => ({
            name: file.fileName,
            filePath: file.filePath,
          }));
        }
      } catch (error) {
        alert('질문 정보를 불러오는 중 오류가 발생했습니다.');
        this.$router.push(`/qna/detail/${questionId}`);
      }
    },
    // 파일 선택 시 처리 메서드
    onFileChange(event) {
      const files = event?.target?.files || event?.dataTransfer?.files;
      if (files && files.length > 0) {
        this.question.qFiles = Array.from(files); // 새로 선택된 파일 리스트 저장
        this.previewFiles = Array.from(files); // 미리보기 목록 업데이트
        this.previewImage(files[0]); // 첫 번째 파일로 이미지 미리보기 업데이트
      } else {
        this.question.qFiles = []; // qFiles가 null이 되지 않도록 빈 배열로 초기화
        this.previewFiles = [];
        this.previewImageSrc = null;
      }
    },
    // 이미지 미리보기 메서드
    previewImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageSrc = e.target.result;
      };
      reader.readAsDataURL(file);
    },
    // 질문 수정 요청 메서드
    async updateQuestion() {
      const formData = new FormData();
      formData.append('title', this.question.title);
      formData.append('questionText', this.question.questionText);

      // qFiles가 null인 경우 빈 배열로 대체
      const filesToUpload = this.question.qFiles ? this.question.qFiles : [];

      // 파일들을 FormData에 추가
      filesToUpload.forEach((file) => {
        formData.append('files', file);
      });

      // 사용자 ID (userNum)를 로컬 스토리지에서 가져옴
      const userNum = localStorage.getItem("userNum");

      if (!userNum) {
        alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
        return;
      }

      // 사용자 ID 추가
      formData.append('userNum', userNum);

      try {
        await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/qna/update/question/${this.$route.params.id}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        alert('질문이 성공적으로 수정되었습니다!');
        this.$router.push(`/qna/detail/${this.$route.params.id}`);
      } catch (error) {
        alert('질문 수정에 실패했습니다.');
        console.error(error);
      }
    },
    // 이전 페이지로 돌아가기
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
  background-color: #ffffff; /* 전체 컨테이너 배경색 흰색으로 설정 */
  padding: 20px;
  border-radius: 12px;
}

/* 각 섹션의 배경을 흰색으로 설정 */
.white-background {
  background-color: #ffffff;
}

/* 마진 설정 */
.my-3 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
