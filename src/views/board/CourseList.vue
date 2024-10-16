<template>
    <v-row>
      <h1 style="margin:35px 0; font-weight:700">강좌 목록</h1>
    </v-row>
  
    <!-- 검색 및 강좌 생성 버튼 -->
    <v-row justify="center" style="margin:0; text-align:center;">

      <v-col cols="12" sm="6">
        <v-text-field v-model="searchQuery" variant="underlined" placeholder="검색어를 입력하세요" style="margin-bottom: 20px;"></v-text-field>
      </v-col>

      <v-col cols="6" sm="2" style="margin-left: -30px;">
        <v-btn class="searchBtn" @click="searchFilter(searchQuery)">
          검색
        </v-btn>
      </v-col>
      <v-col cols="6" sm="2" style="margin-left: -60px;">

        <!-- 강좌 생성 모달 -->
        <v-btn @click="openCreateModal" color="rgba(122, 86, 86, 0.2)">
          강좌 생성
        </v-btn>

      </v-col>
    </v-row>
  
    <!-- 테이블 헤더 -->
    <v-row class="mb-2" style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:4px; color:#444444; font-weight:400;">
      <v-col cols="3"><strong>강좌명</strong></v-col>
      <v-col cols="3"><strong>내용</strong></v-col>
      <v-col cols="2"><strong>생성일</strong></v-col>
      <v-col cols="1"><strong>최대인원</strong></v-col>
      <v-col cols="1"><strong>남은인원</strong></v-col>
    </v-row>
  
    <!-- 강좌 리스트 -->
    <v-row
      v-for="(course, index) in filteredCourses"
      :key="index"
      class="course-row"
      outlined
      style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:300;"
    >
      <v-col cols="3">{{ course.courseName }}</v-col>
      <v-col cols="3">{{ course.content }}</v-col>
      <v-col cols="2">{{ course.createCourse }}</v-col>
      <v-col cols="1">{{ course.maxParticipants }}</v-col>
      <v-col cols="1">{{ course.remainingParticipants }}</v-col>
    </v-row>
  
    <!-- 강좌 생성 모달 -->
    <v-dialog v-model="showModal" max-width="500">
      <v-card>
        <v-card-title>
          <span class="text-h5">강좌 생성</span>
        </v-card-title>
  
        <v-card-text>
          <v-text-field v-model="newCourse.courseName" label="강좌명" required></v-text-field>
          <v-text-field v-model="newCourse.content" label="내용" required></v-text-field>
          <v-text-field v-model="newCourse.courseUrl" label="강좌 URL" required></v-text-field>
          <v-text-field v-model="newCourse.maxParticipants" label="최대 참가자 수" type="number" required></v-text-field>
        </v-card-text>
  
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeModal">취소</v-btn>
          <v-btn color="blue darken-1" text @click="createCourse">생성</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        courses: [],
        searchQuery: "",
        showModal: false,
        newCourse: {
          courseName: "",
          content: "",
          courseUrl: "",
          maxParticipants: 0,
        },
      };
    },
    computed: {
      filteredCourses() {
        if (this.searchQuery) {
          return this.courses.filter((course) =>
            course.courseName.includes(this.searchQuery) || course.content.includes(this.searchQuery)
          );
        }
        return this.courses;
      },
    },
    methods: {
      fetchCourses() {
        axios
          .get("/course/list")
          .then((response) => {
            this.courses = response.data;
          })
          .catch((error) => {
            console.error("Failed to fetch courses:", error);
          });
      },
      searchFilter(query) {
        // 검색 필터를 적용하는 로직은 이미 computed에 구현됨
        console.log("Searching for:", query);
      },
      openCreateModal() {
        this.showModal = true;
      },
      closeModal() {
        this.showModal = false;
        this.resetForm();
      },
      resetForm() {
        this.newCourse = {
          courseName: "",
          content: "",
          courseUrl: "",
          maxParticipants: 0,
        };
      },
      createCourse() {
        axios
          .post("/course/create", this.newCourse)
          .then((response) => {
            this.courses.push(response.data);
            this.closeModal();
          })
          .catch((error) => {
            console.error("Failed to create course:", error);
          });
      },
    },
    mounted() {
      this.fetchCourses();
    },
  };
  </script>
  
  <style scoped>
  .course-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .course-row:hover {
    background-color: #f0f0f0;
  }
  
  .mb-2 {
    margin-bottom: 20px;
  }
  
  .v-row {
    text-align: center;
  }
  
  .searchBtn {
    margin-right: 10px;
  }
  </style>
  