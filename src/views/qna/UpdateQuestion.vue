<template>
  <v-container class="mt-5 white-background qna-container" fluid>
    <v-form @submit.prevent="updateQuestion">
      <!-- 질문 제목 -->
      <div class="pa-4 white-background mb-4">
        <v-text-field label="제목" v-model="question.title" required outlined dense></v-text-field>
      </div>

      <!-- 질문 내용 -->
      <div class="pa-4 white-background mb-4">
        <v-textarea label="질문 내용" v-model="question.questionText" required outlined dense></v-textarea>
      </div>

      <!-- 파일 선택 -->
      <div class="pa-4 white-background mb-4">
        <v-file-input label="파일 선택 (선택사항)" @change="onFileChange" accept="*/*" multiple outlined dense></v-file-input>
      </div>

      <!-- 기존 및 새 파일 목록 미리보기 -->
      <div class="pa-4 white-background mb-4" v-if="previewFiles.length > 0">
        <p>첨부 파일 목록:</p>
        <ul>
          <li v-for="(file, index) in previewFiles" :key="index">{{ file.name }}</li>
        </ul>
      </div>

      <!-- 미리보기 이미지 -->
      <v-img v-if="previewImageSrc" :src="previewImageSrc" max-width="200" class="my-3" />

      <!-- 제출 및 취소 버튼 -->
      <div class="pa-4 white-background mb-4">
        <v-row justify="end">
          <v-col cols="auto">
            <v-btn v-create type="submit">수정</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn v-delete @click="goBack">취소</v-btn>
          </v-col>
        </v-row>
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
        title: '', // 질문 제목
        questionText: '', // 질문 내용
        files: [], // 기존 파일 목록
        qFiles: [], // 새로 추가된 파일 리스트
      },
      previewFiles: [], // 새로 선택된 파일 미리보기 리스트
      previewImageSrc: null, // 이미지 미리보기 경로
      titleMaxLength: 100, // 제목 최대 길이
      textMaxLength: 5000, // 내용 최대 길이
    };
  },
  created() {
    this.fetchQuestionDetail(); // 컴포넌트가 로드될 때 질문 정보를 불러옴
  },
  methods: {
    // 서버에서 질문 상세 정보를 가져오는 메서드
    async fetchQuestionDetail() {
      const questionId = this.$route.params.id; // URL에서 질문 ID 가져오기
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/qna/detail/${questionId}`);
        this.question = response.data.result;

        // qFiles가 null일 경우 빈 배열로 설정
        this.question.qFiles = Array.isArray(this.question.qFiles) ? this.question.qFiles : [];

        // 기존 파일들을 미리보기 목록에 추가
        if (this.question.qFiles.length > 0) {
          this.previewFiles = this.question.qFiles.map((file) => ({
            name: file.fileName,
            filePath: file.filePath,
          }));
        }
      } catch (error) {
        alert('질문 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.');
        this.$router.push(`/qna/detail/${questionId}`); // 오류 발생 시 질문 상세 페이지로 이동
      }
    },

    // 파일 선택 시 처리하는 메서드
    onFileChange(event) {
      const files = event?.target?.files || event?.dataTransfer?.files;
      if (files && files.length > 0) {
        this.question.qFiles = Array.from(files); // 새로 선택된 파일 리스트 저장
        this.previewFiles = Array.from(files); // 미리보기 목록 업데이트
        this.previewImage(files[0]); // 첫 번째 파일로 이미지 미리보기 업데이트
      } else {
        this.question.qFiles = []; // 선택된 파일이 없을 경우 빈 배열로 설정
        this.previewFiles = [];
        this.previewImageSrc = null;
      }
    },

    // 이미지 미리보기를 위한 메서드
    previewImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageSrc = e.target.result; // 미리보기 이미지 경로 설정
      };
      reader.readAsDataURL(file);
    },

    // 질문 수정 요청 메서드
    async updateQuestion() {
      // 제목 길이 확인 (디버깅 로그 추가)
      console.log(`제목 길이: ${this.question.title.length}, 최대 길이: ${this.titleMaxLength}`);
      if (this.question.title.length > this.titleMaxLength) {
        alert(`제목은 최대 ${this.titleMaxLength}자까지 입력 가능합니다. 현재 길이: ${this.question.title.length}자`);
        return;  // 제목 길이 초과 시 함수 종료
      }

      // 내용 길이 확인 (디버깅 로그 추가)
      console.log(`내용 길이: ${this.question.questionText.length}, 최대 길이: ${this.textMaxLength}`);
      if (this.question.questionText.length > this.textMaxLength) {
        alert(`내용은 최대 ${this.textMaxLength}자까지 입력 가능합니다. 현재 길이: ${this.question.questionText.length}자`);
        return;  // 내용 길이 초과 시 함수 종료
      }

      const formData = new FormData();
      formData.append('title', this.question.title);
      formData.append('questionText', this.question.questionText);

      const filesToUpload = this.question.qFiles || []; // 파일이 없을 경우 빈 배열로 대체

      // 선택된 파일들을 FormData에 추가
      filesToUpload.forEach((file) => {
        formData.append('files', file);
      });

      // 사용자 ID (userNum)를 로컬 스토리지에서 가져옴
      const userNum = localStorage.getItem("userNum");
      if (!userNum) {
        alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
        return;
      }

      formData.append('userNum', userNum); // 사용자 ID 추가

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
        alert('질문이 성공적으로 수정되었습니다!'); // 성공 메시지
        this.$router.push(`/qna/detail/${this.$route.params.id}`); // 수정 후 질문 상세 페이지로 이동
      } catch (error) {
        alert('질문 수정에 실패했습니다. 다시 시도해 주세요.'); // 실패 메시지
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
  max-width: 100%;
  margin: 0 auto;
  background-color: #ffffff;
  /* 전체 컨테이너 배경색 흰색으로 설정 */
  padding: 20px;
  border-radius: 12px;
}

/* 각 섹션의 배경을 흰색으로 설정 */
.white-background {
  background-color: #ffffff;
}

/* 버튼 색상 설정 */
.submit-button {
  background-color: #8B4513;
  /* 갈색으로 설정 */
  color: white;
}

.cancel-button {
  background-color: white;
  border: 1px solid #ccc;
  color: black;
}
</style>
