<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 v-if="isDetailMode">직원 세부 정보</h1>
        <h1 v-else-if="isEditMode">직원 수정</h1>
        <h1 v-else>직원 등록</h1>
      </v-col>
    </v-row>

    <!-- 프로필 이미지 -->
    <v-row>
      <v-col cols="12" class="text-center">
        <v-avatar size="150">
          <img :src="userDetail.profileImage || '/default-profile.png'" alt="프로필 이미지" />
        </v-avatar>
      </v-col>
      <v-col cols="12">
        <v-file-input
          v-model="userDetail.profileImage"
          label="프로필 이미지"
          accept="image/*"
          v-if="!isDetailMode"
        ></v-file-input>
      </v-col>
    </v-row>

    <!-- 사번 및 이름 -->
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.userNum" label="사번" :readonly="isEditMode || isDetailMode"></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.name" label="이름" :readonly="isDetailMode"></v-text-field>
      </v-col>
    </v-row>

    <!-- 부서 및 직급 선택 -->
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="userDetail.departmentId"
          :items="departmentOptions"
          item-text="name"
          item-value="id"
          label="부서"
          :disabled="isDetailMode"
          required
        ></v-select>
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="userDetail.positionId"
          :items="positionOptions"
          item-text="name"
          item-value="id"
          label="직급"
          :disabled="isDetailMode"
          required
        ></v-select>
      </v-col>
    </v-row>

    <!-- 이메일 및 전화번호 -->
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.email" label="이메일" :readonly="isDetailMode"></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.phone" label="전화번호" :readonly="isDetailMode"></v-text-field>
      </v-col>
    </v-row>

    <!-- 고용 유형 및 잔여 휴가 -->
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="userDetail.hireType"
          :items="hireTypeOptions"
          label="고용 유형"
          :disabled="isDetailMode"
        ></v-select>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.annualLeave" label="잔여 휴가" :readonly="isDetailMode"></v-text-field>
      </v-col>
    </v-row>

    <!-- 버튼 (수정/등록 완료, 취소) -->
    <v-row v-if="!isDetailMode">
      <v-col cols="12">
        <v-btn @click="saveUser" class="green--text">{{ isEditMode ? '수정 완료' : '등록 완료' }}</v-btn>
        <v-btn @click="goBack" class="red--text">취소</v-btn>
      </v-col>
    </v-row>
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
      isEditMode: false,
      isDetailMode: false,
    };
  },
  methods: {
    async fetchUserDetail() {
      const userNum = this.$route.params.userNum;
      try {
        const response = await axios.get(`/user/list/${userNum}`);
        if (response.data) {
          this.userDetail = {
            ...response.data,
            departmentId: response.data.department ? response.data.department.id : null,
            positionId: response.data.position ? response.data.position.id : null,
          };
        } else {
          console.error("유효한 직원 정보가 없습니다.");
        }
      } catch (error) {
        console.error("직원 정보를 불러오는 중 오류가 발생했습니다:", error);
      }
    },

    async fetchDepartments() {
      try {
        const response = await axios.get('/department/hierarchy');
        this.departmentOptions = response.data;
      } catch (error) {
        console.error('부서 목록을 불러오는 중 오류가 발생했습니다:', error);
      }
    },

    async fetchPositions() {
      try {
        const response = await axios.get('/positions');  
        this.positionOptions = response.data;
        console.log("직급 목록:", this.positionOptions);  // 콘솔로 직급 목록 출력
      } catch (error) {
        console.error('직급 목록을 불러오는 중 오류가 발생했습니다:', error);
      }
    },


    async saveUser() {
  const userNum = this.$route.params.userNum;
  const token = localStorage.getItem("token");

  if (!token) {
    alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
    this.$router.push("/login");
    return;
  }

  if (!this.userDetail.departmentId || !this.userDetail.positionId) {
    alert("부서와 직급을 선택해주세요.");
    return;
  }

  // 확인용 콘솔 로그
  console.log("Selected Department ID:", this.userDetail.departmentId);
  console.log("Selected Position ID:", this.userDetail.positionId);

  if (!this.userDetail.profileImage) {
    this.userDetail.profileImage = null;
  }

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    if (this.isEditMode) {
      await axios.put(`/user/list/${userNum}`, this.userDetail, config);
      alert("수정 완료");
    } else {
      await axios.post("/user/register", this.userDetail, config);
      alert("등록 완료");
    }

    this.$router.push("/employee-management");
  } catch (error) {
    console.error("직원 정보를 저장하는 중 오류가 발생했습니다:", error);
    if (error.response) {
      alert(error.response.data.status_message);  // 서버에서 받은 오류 메시지 표시
    }
  }
},


    goBack() {
      this.$router.push("/employee-management");
    },
  },
  mounted() {
    const path = this.$route.path;
    this.fetchDepartments();  // 부서 목록 로드
    this.fetchPositions();    // 직급 목록 로드

    if (path.includes("detail")) {
      this.isDetailMode = true;
      this.fetchUserDetail();
    } else if (path.includes("edit")) {
      this.isEditMode = true;
      this.fetchUserDetail();
    }
  },
};
</script>

<style scoped>
.v-btn {
  margin-right: 10px;
}

.green--text {
  color: #4caf50 !important;
}

.red--text {
  color: #f44336 !important;
}
</style>
