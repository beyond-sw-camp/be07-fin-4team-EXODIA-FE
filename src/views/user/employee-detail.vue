<template>
    <v-container>
      <v-row>
        <v-col>
          <h1>직원 상세 정보</h1>
        </v-col>
      </v-row>
  
      <!-- 프로필 이미지 표시 -->
      <v-row>
        <v-col cols="12" class="text-center">
          <v-avatar size="150">
            <img :src="userDetail.profileImage" alt="프로필 이미지" v-if="userDetail.profileImage" />
          </v-avatar>
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
            readonly
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
  
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.email"
            label="이메일"
            readonly
          ></v-text-field>
        </v-col>
  
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.phone"
            label="전화번호"
            readonly
          ></v-text-field>
        </v-col>
      </v-row>
  
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.hireType"
            label="고용 유형"
            readonly
          ></v-text-field>
        </v-col>
  
        <v-col cols="12" md="6">
          <v-text-field
            v-model="userDetail.annualLeave"
            label="잔여 휴가"
            readonly
          ></v-text-field>
        </v-col>
      </v-row>
  
      <v-row>
        <v-col cols="12">
          <v-btn @click="goBack" color="primary">목록으로 돌아가기</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "EmployeeDetail",
    data() {
      return {
        userDetail: {},
      };
    },
    methods: {
      async fetchUserDetail() {
        const userNum = this.$route.params.userNum;
        try {
          const response = await axios.get(`/user/list/${userNum}`);
          this.userDetail = response.data;
        } catch (error) {
          console.error("직원 정보를 불러오는 중 오류가 발생했습니다:", error);
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
  
  .text-center {
    text-align: center;
  }
  </style>
  