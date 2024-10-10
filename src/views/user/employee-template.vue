<template>
  <v-container class="mt-5">
    <v-card v-if="dataLoaded || isRegisterMode" class="mx-auto" max-width="800">
      <v-card-title>
        <div v-if="isEditMode" class="text-right">
          <v-btn @click="deleteUser()" class="red--text">삭제</v-btn>
        </div>
        <h3 v-if="isEditMode">직원 수정</h3>
        <h3 v-else-if="isDetailMode">직원 세부 정보</h3>
        <h3 v-else>직원 등록</h3>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submitForm">
          <v-row>
            <!-- 사번 및 이름 -->
            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.userNum" label="사번" :readonly="isEditMode || isDetailMode" required />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.name" label="이름" :readonly="isDetailMode" required />
            </v-col>

            <!-- 부서 선택 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="userDetail.departmentId"
                :items="departmentOptions"
                item-title="name"
                item-value="id"
                label="부서"
                :disabled="isDetailMode"
                v-if="departmentOptions.length > 0"
              />
            </v-col>

            <!-- 직급 선택 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="userDetail.positionId"
                :items="positionOptions"
                item-title="name"
                item-value="id"
                label="직급"
                :disabled="isDetailMode"
                v-if="positionOptions.length > 0"
              />
            </v-col>

            <!-- 이메일 및 전화번호 -->
            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.email" label="이메일" :readonly="isDetailMode" />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.phone" label="전화번호" :readonly="isDetailMode" />
            </v-col>

            <!-- 고용 유형 및 잔여 휴가 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="userDetail.hireType"
                :items="hireTypeOptions"
                label="고용 유형"
                :disabled="isDetailMode"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field v-model="userDetail.annualLeave" label="잔여 휴가" :readonly="isDetailMode" />
            </v-col>

            <!-- 프로필 이미지 업로드 -->
            <v-col cols="12">
              <v-file-input
                label="프로필 이미지 업로드"
                v-model="userDetail.profileImage"
                accept="image/*"
                @change="onFileChange"
              />
              <v-img v-if="previewImageSrc" :src="previewImageSrc" max-width="200" />
            </v-col>

            <!-- 버튼들 -->
            <v-col cols="12" class="d-flex justify-space-between">
              <v-btn @click="goBack" outlined>목록으로</v-btn>
              <v-btn v-if="!isDetailMode" type="submit" color="primary">{{ isEditMode ? '수정 완료' : '등록 완료' }}</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "EmployeeForm",
  data() {
    return {
      userDetail: {
        userNum: '',
        name: '',
        departmentId: '',
        positionId: '',
        email: '',
        phone: '',
        profileImage: '',
        hireType: '',
        annualLeave: 0,
      },
      departmentOptions: [],  // 부서 목록
      positionOptions: [],    // 직급 목록
      hireTypeOptions: ['정규직', '계약직', '인턴', '파트타임'],
      previewImageSrc: null,
      isEditMode: false,
      isDetailMode: false,
      isRegisterMode: false,  // 등록 모드 추가
      dataLoaded: false,
    };
  },
  methods: {
    // URL에 따라 모드 설정
    setModeBasedOnRoute() {
      const routeName = this.$route.name;
      if (routeName === 'employee-edit') {
        this.isEditMode = true;
        this.isDetailMode = false;
        this.isRegisterMode = false;
      } else if (routeName === 'employee-detail') {
        this.isEditMode = false;
        this.isDetailMode = true;
        this.isRegisterMode = false;
      } else {
        this.isEditMode = false;
        this.isDetailMode = false;
        this.isRegisterMode = true;
      }
    },

    async fetchUserDetail() {
      const userNum = this.$route.params.userNum;
      if (!userNum) return;
      try {
        const response = await axios.get(`/user/list/${userNum}`);
        if (response.data) {
          this.userDetail = {
            ...response.data,
            departmentId: response.data.department ? response.data.department.id : null,
            positionId: response.data.position ? response.data.position.id : null,
          };
          this.previewImageSrc = response.data.profileImage || null;
        }
        this.setInitialValues();
        this.dataLoaded = true;
      } catch (error) {
        console.error("직원 정보를 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    setInitialValues() {
      if (this.userDetail.departmentId) {
        const foundDepartment = this.departmentOptions.find(
          (dept) => dept.id === this.userDetail.departmentId
        );
        this.userDetail.departmentId = foundDepartment ? foundDepartment.id : null;
      } else {
        console.error("Department ID is missing:", this.userDetail.departmentId);
      }

      if (this.userDetail.positionId) {
        const foundPosition = this.positionOptions.find(
          (pos) => pos.id === this.userDetail.positionId
        );
        this.userDetail.positionId = foundPosition ? foundPosition.id : null;
      } else {
        console.error("Position ID is missing:", this.userDetail.positionId);
      }
  },

    async fetchDepartments() {
      try {
        const response = await axios.get('/department');
        this.departmentOptions = response.data;
      } catch (error) {
        console.error('부서 목록을 불러오는 중 오류가 발생했습니다:', error);
      }
    },

    async fetchPositions() {
      try {
        const response = await axios.get('/positions');
        this.positionOptions = response.data;
      } catch (error) {
        console.error('직급 목록을 불러오는 중 오류가 발생했습니다:', error);
      }
    },

    onFileChange(event) {
      const files = event.target.files || event.dataTransfer.files;
      if (files && files.length > 0) {
        this.userDetail.profileImage = files[0];
        this.previewImage();
      } else {
        this.userDetail.profileImage = null;
        this.previewImageSrc = null;
      }
    },

    previewImage() {
      if (this.userDetail.profileImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImageSrc = e.target.result;
        };
        reader.readAsDataURL(this.userDetail.profileImage);
      } else {
        this.previewImageSrc = null;
      }
    },
    async submitForm() {
      console.log("Submitting with departmentId:", this.userDetail.departmentId);
  console.log("Submitting with positionId:", this.userDetail.positionId);

      const payload = {
        userNum: this.userDetail.userNum,
        name: this.userDetail.name,
        departmentId: this.userDetail.departmentId,
        positionId: this.userDetail.positionId,
        email: this.userDetail.email,
        phone: this.userDetail.phone,
        hireType: this.userDetail.hireType,
        annualLeave: this.userDetail.annualLeave,
      };

      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json', 
          }
        };

        if (this.isEditMode) {
          await axios.put(`/user/list/${this.$route.params.userNum}`, payload, config);
          alert("수정 완료");
        } else {
          await axios.post("/user/register", payload, config);
          alert("등록 완료");
        }

        this.$router.push("/employee-management");
      } catch (error) {
        console.error("직원 정보를 저장하는 중 오류가 발생했습니다:", error);
        if (error.response) {
          alert(error.response.data.status_message);
        }
      }
    },

    goBack() {
      this.$router.push("/employee-management");
    },
  },
  mounted() {
    this.setModeBasedOnRoute();
    this.fetchDepartments();
    this.fetchPositions();
    if (this.$route.params.userNum) {
      this.fetchUserDetail();
    }
  },
};
</script>

<style scoped>
.v-btn {
  margin-right: 10px;
}

.red--text {
  color: #f44336 !important;
}
</style>
