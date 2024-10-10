<template>
  <v-container class="mt-5">
    <v-card>
      <v-card-title>
        <h3>QnA 질문 등록하기</h3>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submitQuestion">
          <!-- 질문 제목 -->
          <v-text-field label="제목" v-model="questionTitle" required />

          <!-- 질문 내용 -->
          <v-textarea label="질문 내용" v-model="questionText" rows="5" required />

          <!-- 질문 파일 (선택사항) -->
          <v-file-input ref="fileInput" @change="onFileChange" label="질문 파일 (선택사항)" accept="*/*" multiple />

          <!-- 파일 미리보기 -->
          <div v-if="previewFiles.length > 0">
            <p>미리보기:</p>
            <ul>
              <li v-for="(file, index) in previewFiles" :key="index">{{ file.name }}</li>
            </ul>
          </div>


          <!-- 익명 여부 설정 -->
          <v-checkbox v-model="anonymous" label="익명으로 작성" />

          <!-- 부서 선택 버튼 -->
          <div>
            <h4>부서 선택</h4>
            <v-row>
              <!-- 각 부서 버튼을 생성하고, 클릭 시 부서 ID를 선택하도록 함 -->
              <v-col cols="12" md="3" v-for="department in flattenedDepartments" :key="department.id">
                <v-btn
                  :color="selectedDepartment && selectedDepartment.id === department.id ? 'primary' : 'grey'"
                  @click="selectDepartment(department)"
                  class="my-2"
                  block
                >
                  {{ department.name }}
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <!-- 선택한 부서명 표시 -->
          <div v-if="selectedDepartment">
            <p>선택된 부서: <strong>{{ getSelectedDepartmentName() }}</strong></p>
          </div>

          <v-btn type="submit" color="primary" class="mt-3">질문 제출</v-btn>
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
      questionTitle: '', // 질문 제목
      questionText: '', // 질문 내용
      selectedDepartment: null, // 선택한 부서 객체
      departments: [], // 부서 계층 목록
      flattenedDepartments: [], // 버튼에 표시될 평탄화된 부서 목록
      files: [], // 첨부 파일 리스트
      previewFiles: [], // 첨부 파일 미리보기 리스트
      anonymous: false, // 익명 여부
    };
  },
  mounted() {
    this.fetchDepartments(); // 컴포넌트가 마운트될 때 부서 목록을 불러옵니다.
  },
  methods: {
    // 부서 목록을 불러오는 메서드 (한 번만 불러오도록 설정)
    async fetchDepartments() {
      try {
        if (this.flattenedDepartments.length === 0) {  // 중복 호출 방지
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/department/hierarchy`);
          console.log("API 응답 데이터:", response.data); // 응답 데이터를 콘솔에 출력하여 확인
          this.departments = response.data;

          // 평탄화된 부서 목록 생성 및 출력
          this.flattenedDepartments = this.flattenDepartmentHierarchy(this.departments);
          console.log("평탄화된 부서 목록:", this.flattenedDepartments);
        }
      } catch (error) {
        console.error('부서 목록을 불러오는 중 오류가 발생했습니다:', error);
        this.departments = []; // 오류 발생 시 빈 배열로 초기화
      }
    },

    // 부서 계층을 평탄화하여 버튼 목록에 사용 가능한 배열로 변환
    flattenDepartmentHierarchy(departments, level = 0) {
      let result = [];
      departments.forEach(department => {
        result.push({ id: department.id, name: department.name, level });
        if (department.children && department.children.length > 0) {
          result = result.concat(this.flattenDepartmentHierarchy(department.children, level + 1));
        }
      });
      return result;
    },

    // 부서 선택 메서드
    selectDepartment(department) {
      this.selectedDepartment = department;  // 선택된 부서 객체를 저장
    },

    // 선택된 부서명을 가져오는 메서드
    getSelectedDepartmentName() {
      return this.selectedDepartment ? this.selectedDepartment.name : '선택된 부서가 없습니다';
    },

    // 파일 변경 시 처리 메서드
    onFileChange(event) {
      const files = event?.target?.files || event?.dataTransfer?.files;
      if (files && files.length > 0) {
        this.files = Array.from(files);
        this.previewFiles = Array.from(files);
      } else {
        this.files = [];
        this.previewFiles = [];
      }
    },


    async submitQuestion() {
  if (!this.selectedDepartment) {
    alert('부서를 선택해주세요.');
    return;
  }

  // DTO를 JSON 객체로 만듦
  const dto = {
    title: this.questionTitle,
    questionText: this.questionText,
    departmentId: this.selectedDepartment.id, // 부서 ID만 전달
    anonymous: this.anonymous,
  };

  // FormData에 DTO 객체와 파일 추가
  const formData = new FormData();
  formData.append('dto', JSON.stringify(dto)); // JSON 형태로 변환하여 문자열로 전송
  this.files.forEach(file => {
    formData.append('files', file);
  });

  try {
    console.log('질문 등록 데이터:', formData);
    await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/qna/create`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    alert('질문이 성공적으로 등록되었습니다!');
    this.$router.push({ name: 'QnaList' });
  } catch (error) {
    const errorMessage = error.response && error.response.data ? error.response.data.message : '질문 등록에 실패했습니다.';
    alert(errorMessage);
    console.error('오류 세부사항:', error);
  }
}



,
  },
};
</script>

<style scoped>
.v-container {
  max-width: 600px;
  margin: auto;
}

.btn_write {
  padding: 12px 25px;
  background-color: #f27885;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn_write:hover {
  background-color: #fa5263;
}
</style>
