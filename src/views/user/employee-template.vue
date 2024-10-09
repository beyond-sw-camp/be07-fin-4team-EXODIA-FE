<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 v-if="isDetailMode">직원 세부 정보</h1>
        <h1 v-else-if="isEditMode">직원 수정</h1>
        <h1 v-else>직원 등록</h1>
      </v-col>
    </v-row>

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

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.userNum" label="사번" :readonly="isEditMode || isDetailMode"></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.name" label="이름" :readonly="isDetailMode"></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.departmentName" label="부서" readonly></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.positionName" label="직급" readonly></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.email" label="이메일" :readonly="isDetailMode"></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field v-model="userDetail.phone" label="전화번호" :readonly="isDetailMode"></v-text-field>
      </v-col>
    </v-row>

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

    <v-row v-if="!isDetailMode">
      <v-col cols="12">
        <v-btn @click="saveUser" color="primary">{{ isEditMode ? '수정 완료' : '등록 완료' }}</v-btn>
        <v-btn @click="goBack" color="secondary">취소</v-btn>
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
}
,

    async saveUser() {
      const userNum = this.$route.params.userNum;
      const token = localStorage.getItem("token");

      if (!token) {
        alert("토큰이 만료되었습니다. 다시 로그인해주세요.");
        this.$router.push("/login");
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        console.log("Saving User Data:", this.userDetail); 
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
        if (error.response && error.response.status === 401) {
          alert("권한이 없습니다. 다시 로그인해주세요.");
          this.$router.push("/login");
        }
      }
    },

    goBack() {
      this.$router.push("/employee-management");
    },
  },
  mounted() {
    const path = this.$route.path;
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
