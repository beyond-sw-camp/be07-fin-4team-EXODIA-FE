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
            <!-- 질문자가 익명일 경우 '익명'으로 표시 -->
            <v-text-field 
              label="질문자" 
              v-model="questionerName" 
              readonly 
            />
          </v-col>
          <v-col cols="6">
            <!-- 부서명을 departmentName에서 직접 가져와서 표시 -->
            <v-text-field label="문의 부서" v-model="questionDetail.departmentName" readonly />
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

        <!-- 답변 작성 폼 -->
        <v-form v-if="canAnswer" @submit.prevent="submitAnswer">
          <v-textarea v-model="newAnswerText" label="답변 내용" rows="5" required></v-textarea>
          <v-file-input v-model="answerFiles" multiple label="답변 파일 첨부" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" show-size></v-file-input>
          <v-btn color="success" type="submit" class="mt-3">답변 등록</v-btn>
        </v-form>
        <v-alert v-else type="error" class="mt-3">
          답변 권한이 없습니다. 동일 부서 또는 상위 부서에서만 답변이 가능합니다.
        </v-alert>
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
      newAnswerText: '', // 새로운 답변 내용
      answerFiles: [], // 새로운 답변 첨부 파일
      formattedQuestionDate: '', // 질문 작성 날짜 포맷팅된 값
      userDepartment: null, // 현재 사용자 부서
      departmentTree: [], // 전체 부서 트리
      canAnswer: false, // 답변 가능 여부
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
    this.userDepartment = localStorage.getItem('userDepartment'); // 사용자 부서를 가져옴
    this.fetchDepartmentTree();
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

        // 질문한 부서와 사용자의 부서를 비교하여 답변 가능 여부 확인
        this.checkAnswerPermission();
      } catch (error) {
        console.error('질문 정보를 불러오는 중 오류가 발생했습니다:', error);
      }
    },

    // 부서 트리 가져오기
    async fetchDepartmentTree() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/department/hierarchy`);
        this.departmentTree = response.data;
      } catch (error) {
        console.error('부서 트리를 가져오는 중 오류가 발생했습니다:', error);
      }
    },

    // 부모-자식 관계를 고려하여 답변 가능 여부 확인
    checkAnswerPermission() {
      const questionDepartmentId = this.questionDetail.departmentId;
      const userDepartmentId = this.userDepartment;

      // 상위 부서인지 여부 확인
      if (!questionDepartmentId || !userDepartmentId) {
        console.error('부서 정보가 없습니다.');
        this.canAnswer = false;
        return;
      }

      this.canAnswer = this.isParentDepartment(questionDepartmentId, userDepartmentId) || questionDepartmentId === userDepartmentId;

      // 로그 출력으로 상태를 확인해봄
      console.log('부서 답변 가능 여부:', this.canAnswer, '사용자 부서:', userDepartmentId, '문의 부서:', questionDepartmentId);
    },

    // 부서 트리에서 상위 부서인지 확인하는 함수
    isParentDepartment(parentId, childId) {
      const departmentMap = {};

      // 부서 트리를 순회하며 부모-자식 관계 매핑
      const mapDepartments = (departments) => {
        departments.forEach(department => {
          departmentMap[department.id] = department.parentId || null;
          if (department.children && department.children.length) {
            mapDepartments(department.children);
          }
        });
      };

      mapDepartments(this.departmentTree);

      // 상위 부서를 찾을 때까지 순회
      let currentParent = departmentMap[childId];
      while (currentParent) {
        if (currentParent === parentId) return true;
        currentParent = departmentMap[currentParent];
      }

      return false;
    },

    // 답변 작성 또는 수정
    async submitAnswer() {
      const questionId = this.$route.params.id;
      const userNum = localStorage.getItem("userNum"); // 사용자 ID를 로컬 스토리지에서 가져옴
      try {
        const formData = new FormData();
        formData.append('answerText', this.newAnswerText);
        formData.append('userNum', userNum);

        if (this.answerFiles && this.answerFiles.length > 0) {
          this.answerFiles.forEach((file) => {
            formData.append('files', file);
          });
        }

        const response = await axios.post(
          `${process.env.VUE_APP_API_BASE_URL}/qna/answer/${questionId}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        console.log('답변 등록 성공:', response.data);
        this.$router.push(`/qna/detail/${questionId}`);
      } catch (error) {
        console.error('답변 등록 중 오류가 발생했습니다:', error);
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
