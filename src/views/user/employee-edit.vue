<template>
    <v-container>
      <v-row>
        <v-col>
          <h1>직원 정보 수정</h1>
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
          ></v-file-input>
        </v-col>
      </v-row>
  
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.userNum"
            label="사번"
            readonly
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.name"
            label="이름"
          ></v-text-field>
        </v-col>
      </v-row>
  
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.departmentName"
            label="부서"
            readonly
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.positionName"
            label="직급"
            readonly
          ></v-text-field>
        </v-col>
      </v-row>
  
      <!-- 연락처 및 이메일 -->
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.email"
            label="이메일"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.phone"
            label="전화번호"
          ></v-text-field>
        </v-col>
      </v-row>
  
      <!-- 고용 유형 및 잔여 휴가 -->
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="userDetail.hireType"
            :items="hireTypeOptions"
            label="고용 유형"
          ></v-select>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.annualLeave"
            label="잔여 휴가"
          ></v-text-field>
        </v-col>
      </v-row>
  
      <!-- 수정 및 취소 버튼 -->
      <v-row>
        <v-col cols="12">
          <v-btn @click="updateUser" color="primary">수정 완료</v-btn>
          <v-btn @click="goBack" color="secondary">취소</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "EmployeeEdit",
    data() {
      return {
        userDetail: {
          userNum: '',
          name: '',
          departmentName: '',
          positionName: '',
          email: '',
          phone: '',
          profileImage: '',
          hireType: '',
          annualLeave: 0,
        },
        hireTypeOptions: ['정규직', '계약직', '인턴', '파트타임'],
      };
    },
    methods: {
      async fetchUserDetail() {
        const userNum = this.$route.params.userNum;
        try {
          const response = await axios.get(`/user/list/${userNum}`);
          if (response.data) {
            this.userDetail = response.data;
          } else {
            console.error("유효한 직원 정보가 없습니다.");
          }
        } catch (error) {
          console.error("직원 정보를 불러오는 중 오류가 발생했습니다:", error);
        }
      },
      async updateUser() {
        const userNum = this.$route.params.userNum;
        try {
          const response = await axios.put(`/user/list/${userNum}`, this.userDetail);
          alert("수정 완료");
          this.$router.push("/employee-management");
          console.log(response);
        } catch (error) {
          console.error("직원 정보를 수정하는 중 오류가 발생했습니다:", error);
        }
      },
      goBack() {
        this.$router.push("/employee-management");
      },
    },
    mounted() {
      this.fetchUserDetail();
    },
  };
  </script>
  
  <style scoped>
  h1 {
    margin-bottom: 20px;
  }
  
  .v-text-field {
    margin-bottom: 20px;
  }
  
  .v-btn {
    margin-top: 20px;
  }
  </style>
  