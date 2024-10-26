<template>
  <v-container class="qna-container mt-5" fluid>
    <v-row justify="center" no-gutters>
      <v-col cols="12"> <!-- 여백을 없애고 전체 너비를 차지하게 설정 -->
        <!-- 타이틀 -->
        <div class="justify-center text-center mb-4">
          <h2 class="font-weight-bold">QnA 질문 등록</h2>
        </div>

        <!-- 질문 등록 폼 -->
        <v-form ref="form" @submit.prevent="submitQuestion">
          <!-- 질문 제목 -->
          <v-text-field v-model="questionTitle" label="제목" outlined placeholder="질문의 제목을 입력하세요" dense required
            class="mb-4" />

          <!-- 질문 내용 -->
          <v-textarea v-model="questionText" label="질문 내용" outlined rows="6" placeholder="질문의 내용을 입력하세요" dense required
            class="mb-4" />

          <!-- 부서 선택 (버튼형태) -->
          <div class="department-section mb-4">
            <h4>문의 부서 선택</h4>
            <v-row>
              <v-col cols="12" md="4" v-for="department in flattenedDepartments" :key="department.id" class="d-flex">
                <v-btn :color="selectedDepartment && selectedDepartment.id === department.id ? 'primary' : 'grey'"
                  @click="selectDepartment(department)" class="my-2 flex-grow-1" block>
                  {{ department.name }}
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <!-- 익명 여부 설정과 부서 설명 가이드라인 버튼 -->
          <v-row align="center" justify="space-between" class="mb-4">
            <v-col cols="8">
              <v-checkbox v-model="anonymous" label="익명으로 작성" />
            </v-col>
            <v-col cols="4" class="text-right">
              <v-btn v-list @click="openDepartmentGuide">
                부서 설명 보기
              </v-btn>
            </v-col>
          </v-row>

          <!-- 선택된 부서명 표시 -->
          <div v-if="selectedDepartment" class="selected-department mb-4">
            <p>선택된 부서: <strong>{{ getSelectedDepartmentName() }}</strong></p>
          </div>

          <!-- 파일 업로드 -->
          <v-file-input ref="fileInput" v-model="files" label="첨부 파일 (선택사항)" accept="*/*" outlined dense
            placeholder="파일을 업로드 하세요" multiple class="mb-4" />

          <!-- 파일 미리보기 리스트 -->
          <v-list v-if="previewFiles.length > 0" class="file-preview-list mb-4">
            <v-list-item v-for="(file, index) in previewFiles" :key="index">
              <v-list-item-content>{{ file.name }}</v-list-item-content>
            </v-list-item>
          </v-list>

          <!-- 제출 버튼 -->
          <v-btn type="submit" v-create class="submit-button mt-4" block>
            질문 등록하기
          </v-btn>
        </v-form>
      </v-col>
    </v-row>

    <!-- 부서 설명 모달 -->
    <v-dialog v-model="showDepartmentGuide" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-h5">부서 설명</span>
        </v-card-title>
        <v-card-text>
          <ul>
            <li v-for="department in departmentsInfo" :key="department.id">
              <strong>{{ department.name }}:</strong>
              <template v-if="isAdmin">
                <v-text-field v-model="department.description" label="부서 설명 수정" dense />
              </template>
              <template v-else>
                {{ department.description }}
              </template>
            </li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-create v-if="isAdmin" @click="saveDepartmentInfo">저장</v-btn>
          <v-btn v-delete @click="closeDepartmentGuide">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      flattenedDepartments: [], // 최하위 부서 목록
      files: [], // 첨부 파일 리스트
      previewFiles: [], // 첨부 파일 미리보기 리스트
      anonymous: false, // 익명 여부
      showDepartmentGuide: false, // 모달을 표시할지 여부
      departmentsInfo: [], // 각 부서의 설명 정보
      isAdmin: false, // 관리자인지 여부
      titleMaxLength: 300, // 제목 최대 길이
      contentMaxLength: 5000, // 내용 최대 길이
    };
  },
  mounted() {
    this.fetchDepartments(); // 컴포넌트가 마운트될 때 부서 목록을 불러옵니다.
    this.checkAdmin(); // 관리자인지 여부 확인
  },
  methods: {
    // 관리자인지 확인하는 메서드
    checkAdmin() {
      const departmentId = localStorage.getItem("departmentId");
      this.isAdmin = departmentId === "4"; // departmentId가 4일 경우 관리자
    },

    // 부서 설명 저장 메서드
    async saveDepartmentInfo() {
      try {
        const savePromises = this.departmentsInfo.map(department => {
          return axios.post(`${process.env.VUE_APP_API_BASE_URL}/department/update`, {
            departmentId: department.id, // JSON 바디에 departmentId 포함
            description: department.description
          });
        });

        await Promise.all(savePromises);
        alert('부서 설명이 성공적으로 저장되었습니다.');
        this.showDepartmentGuide = false;
      } catch (error) {
        console.error('부서 설명 저장 중 오류 발생:', error);
        alert('부서 설명을 저장하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 부서 목록과 설명을 불러오는 메서드
    async fetchDepartments() {
      try {
        if (this.flattenedDepartments.length === 0) { // 중복 호출 방지
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/department/hierarchy`);
          this.departments = response.data;

          // 최하위 부서만 필터링하여 평탄화된 부서 목록 생성
          this.flattenedDepartments = this.getLeafDepartments(this.departments);

          // 각 부서의 설명을 불러옴
          const departmentDescriptions = await Promise.all(
            this.flattenedDepartments.map(department =>
              axios.get(`${process.env.VUE_APP_API_BASE_URL}/department/description`, {
                params: { departmentId: department.id }
              })
            )
          );

          this.departmentsInfo = this.flattenedDepartments.map((department, index) => ({
            id: department.id,
            name: department.name,
            description: departmentDescriptions[index].data
          }));
        }
      } catch (error) {
        console.error('부서 목록을 불러오는 중 오류가 발생했습니다:', error);
        this.departments = []; // 오류 발생 시 빈 배열로 초기화
        alert('부서 목록을 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 최하위 부서만 가져오기 위한 메서드
    getLeafDepartments(departments) {
      let leafDepartments = [];

      departments.forEach(department => {
        // 자식이 없는 부서라면 최하위 부서이므로 추가
        if (!department.children || department.children.length === 0) {
          leafDepartments.push({
            id: department.id,
            name: department.name,
          });
        } else {
          // 자식 부서가 있다면, 자식 부서를 재귀적으로 조회하여 최하위 부서를 찾음
          leafDepartments = leafDepartments.concat(this.getLeafDepartments(department.children));
        }
      });

      return leafDepartments;
    },

    // 부서 선택 메서드
    selectDepartment(department) {
      this.selectedDepartment = department; // 선택된 부서 객체를 저장
    },

    // 선택된 부서명을 가져오는 메서드
    getSelectedDepartmentName() {
      return this.selectedDepartment ? this.selectedDepartment.name : '선택된 부서가 없습니다';
    },

    // 부서 설명 모달 열기
    openDepartmentGuide() {
      this.showDepartmentGuide = true;
    },

    // 부서 설명 모달 닫기
    closeDepartmentGuide() {
      this.showDepartmentGuide = false;
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

    // 질문 제출 메서드
    async submitQuestion() {
      // 제목 길이 검증
      if (this.questionTitle.length > this.titleMaxLength) {
        alert(`제목은 최대 ${this.titleMaxLength}자까지 작성할 수 있습니다. 현재 ${this.questionTitle.length}자를 입력하셨습니다.`);
        return;
      }

        // **제목이 비었는지 검증**
      if (this.questionTitle.trim() === '') {
        alert('질문의 제목을 입력하세요.');
        return;
      }

      // **내용이 비었는지 검증**
      if (this.questionText.trim() === '') {
        alert('질문의 내용을 입력하세요.');
        return;
      }

      // 내용 길이 검증
      if (this.questionText.length > this.contentMaxLength) {
        alert(`내용은 최대 ${this.contentMaxLength}자까지 작성할 수 있습니다. 현재 ${this.questionText.length}자를 입력하셨습니다.`);
        return;
      }

      if (!this.selectedDepartment) {
        alert('부서를 선택해주세요.');
        return;
      }

      // 사용자 ID (userNum)를 로컬 스토리지에서 가져옴
      const userNum = localStorage.getItem("userNum");

      if (!userNum) {
        alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
        return;
      }

      // DTO를 JSON 객체로 만듦
      const dto = {
        title: this.questionTitle,
        questionText: this.questionText,
        departmentId: this.selectedDepartment.id, // 부서 ID만 전달
        anonymous: this.anonymous,
      };

      // FormData에 DTO 객체와 파일, userNum 추가
      const formData = new FormData();
      formData.append('dto', JSON.stringify(dto)); // JSON 형태로 변환하여 문자열로 전송
      formData.append('userNum', userNum); // 사용자 ID 추가
      this.files.forEach(file => {
        formData.append('files', file);
      });

      try {
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
      }
    },
  },
};

</script>


<style scoped>
/* 전체 컨테이너 스타일 */
.qna-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
}

/* 제목, 내용, 파일 업로드 등의 입력 필드 스타일 */
.mb-4 {
  margin-bottom: 20px !important;
}

/* 부서 선택 섹션 스타일 */
.department-section h4 {
  margin-bottom: 16px;
}

.department-section .v-btn {
  margin: 5px;
}

/* 파일 미리보기 리스트 스타일 */
.file-preview-list {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 8px;
}

/* 제출 버튼 스타일 */
.submit-button {
  background-color: #1976D2;
  color: #fff;
}

.submit-button:hover {
  background-color: #1565C0;
}

/* 선택된 부서명 스타일 */
.selected-department {
  font-size: 16px;
  font-weight: bold;
}
</style>