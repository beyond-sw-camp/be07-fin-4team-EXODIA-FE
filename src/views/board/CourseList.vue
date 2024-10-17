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
        <v-btn class="searchBtn" icon @click="searchFilter(searchQuery)">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </v-col>
      
    </v-row>
  
    <v-row justify="end" style="margin-top: 20px;">
      <v-col cols="12" style="text-align: right;">
        <v-btn v-if="isHrDepartment()" icon @click="openCreateModal" color="rgba(122, 86, 86, 0.2)">
          <v-icon>mdi-plus-circle</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  
    <!-- 테이블 헤더 -->
    <v-row class="mb-2" style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:4px; color:#444444; font-weight:400;">
      <v-col cols="3"><strong>강좌명</strong></v-col>
      <v-col cols="3"><strong>내용</strong></v-col>
      <v-col cols="2"><strong>생성일</strong></v-col>
      <v-col cols="2"><strong>참여자</strong></v-col>
      <v-col cols="2" v-if="isHrDepartment()"><strong>관리</strong></v-col>
    </v-row>
  
    <!-- 강좌 리스트 -->
    <v-row
      v-for="(course, index) in filteredCourses"
      :key="index"
      class="course-row"
      outlined
      style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:300;"
      @click="openEnrollModal(course)"
    >
      <v-col cols="3" >{{ course.courseName }}</v-col>
      <v-col cols="3">{{ course.content }}</v-col>
      <v-col cols="2">{{ course.createCourse }}</v-col>
      <v-col cols="2">{{ course.remainingParticipants }} / {{ course.maxParticipants }}</v-col>
      <v-col cols="2" v-if="isHrDepartment()">
        <v-btn icon @click.stop="openEditModal(course)">
          <v-icon>mdi-pencil</v-icon> <!-- 강좌 수정 아이콘 -->
        </v-btn>
        <v-btn icon @click.stop="deleteCourse(course.id)">
          <v-icon>mdi-delete</v-icon> <!-- 강좌 삭제 아이콘 -->
        </v-btn>
      </v-col>
    </v-row>
  
    <!-- 강좌 생성 모달 -->
    <v-dialog v-model="showModal" max-width="600">
        <v-card>
            <v-card-title class="headline grey lighten-2">
                <span class="text-h5 font-weight-bold">강좌 생성</span>
            </v-card-title>

            <v-card-text class="py-6 px-10">
                <v-text-field v-model="newCourse.courseName" label="강좌명" required outlined></v-text-field>
                <v-textarea v-model="newCourse.content" label="내용" rows="3" outlined required></v-textarea>
                <v-text-field v-model="newCourse.courseUrl" label="강좌URL" required outlined></v-text-field>
                <v-text-field v-model="newCourse.maxParticipants" label="최대 참가자 수" type="number" required outlined></v-text-field>
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn color="red lighten-2" text @click="closeModal">취소</v-btn>
                <v-btn color="primary" text @click="createCourse">생성</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- 강좌 수정 모달 -->
    <v-dialog v-model="showEditModal" max-width="600">
        <v-card>
            <v-card-title class="headline grey lighten-2">
                <span class="text-h5 font-weight-bold">강좌 수정</span>
            </v-card-title>

            <v-card-text class="py-6 px-10">
                <v-text-field v-model="editCourse.courseName" label="강좌명" required outlined></v-text-field>
                <v-textarea v-model="editCourse.content" label="내용" rows="3" outlined required></v-textarea>
                <v-text-field v-model="editCourse.courseUrl" label="강좌URL" required outlined></v-text-field>
                <v-text-field v-model="editCourse.maxParticipants" label="최대 참가자 수" type="number" required outlined></v-text-field>
            </v-card-text>

            <v-card-actions class="justify-end">
                <v-btn color="red lighten-2" text @click="closeEditModal">취소</v-btn>
                <v-btn color="primary" text @click="updateCourse">수정</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

<!-- 강좌 신청 모달 -->
<v-dialog v-model="showEnrollModal" max-width="600">
  <v-card elevation="10" class="rounded-lg">
    <v-card-title class="headline grey lighten-4 py-4">
      <span class="text-h5 font-weight-bold">강좌 신청</span>
    </v-card-title>

    <v-card-text class="py-8 px-12">
      <v-row class="mb-4">
        <v-col cols="4">
          <strong>강좌명</strong>
        </v-col>
        <v-col cols="8">
          {{ selectedCourse.courseName }}
        </v-col>
      </v-row>
      <v-row class="mb-4">
        <v-col cols="4">
          <strong>내용</strong>
        </v-col>
        <v-col cols="8">
          {{ selectedCourse.content }}
        </v-col>
      </v-row>
      <v-row class="mb-4">
        <v-col cols="4">
          <strong>URL</strong>
        </v-col>
        <v-col cols="8">
          <a :href="selectedCourse.courseUrl" target="_blank" class="blue--text text--darken-2">{{ selectedCourse.courseUrl }}</a>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4">
          <strong>신청인원</strong>
        </v-col>
        <v-col cols="8">
          {{ selectedCourse.remainingParticipants ? (selectedCourse.maxParticipants - selectedCourse.remainingParticipants) : 0 }} / {{ selectedCourse.maxParticipants }}
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions class="justify-end px-10 pb-6">
      <v-btn color="red darken-1" class="white--text" @click="closeEnrollModal">취소</v-btn>
      <v-btn color="blue darken-2" class="white--text" @click="enrollCourse">신청</v-btn>
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
        showEditModal: false,
        showEnrollModal: false,
        selectedCourse: {},
        newCourse: {
          courseName: "",
          content: "",
          courseUrl: "",
          maxParticipants: 0,
        },
        editCourse: {
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
      async fetchUserInfo() {
        try {
          const token = localStorage.getItem('token');
          const userNum = localStorage.getItem('userNum');
          const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/profile/${userNum}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const user = response.data;
          console.log('User Info:', user);
          localStorage.setItem('departmentName', user.departmentName);
          localStorage.setItem('positionId', user.positionId);
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      },
      isHrDepartment() {
        const departmentName = localStorage.getItem('departmentName');
        return departmentName === '인사팀';
      },
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
      openEditModal(course) {
        this.editCourse = { ...course };
        this.showEditModal = true;
      },
      closeEditModal() {
        this.showEditModal = false;
      },
      updateCourse() {
        axios
          .put(`/course/update/${this.editCourse.id}`, this.editCourse)
          .then((response) => {
            const index = this.courses.findIndex(course => course.id === response.data.id);
            if (index !== -1) {
              this.courses.splice(index, 1, response.data);
            }
            this.closeEditModal();
          })
          .catch((error) => {
            console.error("Failed to update course:", error);
          });
      },
      openEnrollModal(course) {
        this.selectedCourse = course;
        this.showEnrollModal = true;
      },
      closeEnrollModal() {
        this.showEnrollModal = false;
      },
      enrollCourse() {
        axios
          .post(`/course/register/${this.selectedCourse.id}`)
          .then((response) => {
            alert(response.data);
            this.closeEnrollModal();
            this.fetchCourses();
          })
          .catch((error) => {
            console.error("Failed to enroll in course:", error);
          });
      },
      deleteCourse(courseId) {
        axios
          .put(`/course/delete/${courseId}`)
          .then(() => {
            this.courses = this.courses.filter(course => course.id !== courseId);
          })
          .catch((error) => {
            console.error("Failed to delete course:", error);
          });
      },
    },
    mounted() {
      this.fetchUserInfo().then(() => this.fetchCourses());
      console.log('Fetching user info...');
      this.fetchUserInfo();
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

  .v-btn--icon.v-btn--density-default {
    margin-left: 10px;
    width: calc(var(--v-btn-height) + 12px);
    height: calc(var(--v-btn-height) + 12px);
    box-shadow: none;
}
.v-btn--icon.v-btn--density-default :hover{

    box-shadow: none;
}
  </style>
