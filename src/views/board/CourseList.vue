<template>
  <v-container class="container">
    <v-row class="mb-12" style="padding-left:30px">
      <h1>이벤트</h1>
    </v-row>

    <!-- 검색 및 이벤트 생성 버튼 -->
    <v-row justify="center" style="margin:0; text-align:center;">
      <v-col cols="12" sm="6">
        <v-text-field v-model="searchQuery" variant="underlined" placeholder="검색어를 입력하세요"></v-text-field>
      </v-col>

      <v-col cols="6" sm="2" style="margin-left: -30px;">
        <v-btn class="searchBtn" icon @click="searchFilter(searchQuery)">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row justify="end" style="margin-top: 20px;">
      <v-col cols="12" style="text-align: right;">
        <v-btn v-if="isHrAdmin()" icon @click="openCreateModal">
          <v-icon size="32">mdi-plus-circle</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-2"
      style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:10px; color:#444444; font-weight:600;">
      <v-col class="header-cell" style="width: 40%; text-align: center;"><strong>이벤트명</strong></v-col>
      <v-col class="header-cell" style="width: 20%; text-align: center;"><strong>생성일</strong></v-col>
      <v-col class="header-cell" style="width: 15%; text-align: center;"><strong>참여인원</strong></v-col>
      <v-col class="header-cell" style="width: 25%; text-align: center;" v-if="isHrAdmin()"><strong>관리</strong></v-col>
    </v-row>

    <v-row v-for="(course, index) in filteredCourses" :key="index" class="course-row" outlined
      style="border-bottom:1px solid #E7E4E4; padding:10px; font-weight:400; align-items: center; transition: background-color 0.2s ease;">
      <!-- 강좌명 컬럼에 긴 텍스트가 수평으로 스크롤되도록 애니메이션 추가 -->
      <v-col class="cell-content single-line"
        style="width: 40%; text-align: center; position: relative; overflow: hidden;" @click="openEnrollModal(course)">
        <span
          style="display: inline-block; white-space: nowrap; position: absolute; animation: scrollText 10s linear infinite;">
          {{ course.courseName }}
        </span>
      </v-col>

      <v-col class="cell-content" style="width: 20%; text-align: center;">
        {{ formatDate(course.createdAt) }}
      </v-col>
      <v-col class="cell-content" style="width: 15%; text-align: center;">
        {{ course.currentParticipants }} / {{ course.maxParticipants }}
      </v-col>

      <v-col class="cell-content" style="width: 25%; display: flex; justify-content: center;" v-if="isHrAdmin()">
        <v-btn icon @click.stop="openEditModal(course)" class="icon-btn">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn icon @click.stop="deleteCourse(course.id)" class="icon-btn">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        <v-btn icon @click.stop="fetchParticipants(course.id)" class="icon-btn">
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-pagination v-model="currentPage" :length="totalPages" @change="onPageChange" class="my-4"></v-pagination>


    <!-- 신청자 정보 조회 모달 -->
    <v-dialog v-model="showParticipantsModal" max-width="600">
      <v-card elevation="5" class="rounded-lg">
        <v-card-title class="grey lighten-4 py-4">
          <span class="text-h5 font-weight-bold">신청자 목록</span>
        </v-card-title>
        <v-card-text class="py-4 px-6">
          <v-list dense>
            <v-list-item v-for="participant in participants" :key="participant.userNum" class="mb-4">
              <v-list-item-content>
                <v-list-item-title class="font-weight-bold">{{ participant.userName }}</v-list-item-title>
                <v-list-item-subtitle class="grey--text text--darken-1">사번: {{ participant.userNum
                  }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn v-delete dark @click="closeParticipantsModal">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 이벤트 생성 모달 -->
    <v-dialog v-model="showModal" max-width="600">
      <v-card>
        <v-card-title class="headline grey lighten-2">
          <span class="text-h5 font-weight-bold">이벤트 생성</span>
        </v-card-title>
        <v-card-text class="py-6 px-10">
          <v-text-field v-model="newCourse.courseName" label="이벤트명" required outlined></v-text-field>
          <v-textarea v-model="newCourse.content" label="내용" rows="3" outlined required></v-textarea>
          <v-text-field v-model="newCourse.courseUrl" label="이벤트 상품" required outlined></v-text-field>
          <v-text-field v-model="newCourse.maxParticipants" label="최대 참가자 수" type="number" required
            outlined></v-text-field>
          <v-text-field v-model="newCourse.startTime" label="시작 시간" type="datetime-local" required outlined></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn v-create text @click="createCourse">생성</v-btn>
          <v-btn v-delete text @click="closeModal">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 이벤트 수정 모달 -->
    <v-dialog v-model="showEditModal" max-width="600">
      <v-card>
        <v-card-title class="headline grey lighten-2">
          <span class="text-h5 font-weight-bold">이벤트 수정</span>
        </v-card-title>
        <v-card-text class="py-6 px-10">
          <v-text-field v-model="editCourse.courseName" label="이벤트명" required outlined></v-text-field>
          <v-textarea v-model="editCourse.content" label="내용" rows="3" outlined required></v-textarea>
          <v-text-field v-model="editCourse.courseUrl" label="강좌URL" required outlined></v-text-field>
          <v-text-field v-model="editCourse.maxParticipants" label="최대 참가자 수" type="number" required
            outlined></v-text-field>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn v-create text @click="updateCourse">수정</v-btn>
          <v-btn v-delete text @click="closeEditModal">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 이벤트 신청 모달 -->
    <v-dialog v-model="showEnrollModal" max-width="600">
      <v-card elevation="10" class="rounded-lg">
        <v-card-title class="headline grey lighten-4 py-4">
          <span class="text-h5 font-weight-bold">이벤트 신청</span>
        </v-card-title>
        <v-card-text class="py-8 px-12">
          <v-row class="mb-4">
            <v-col cols="4"><strong>이벤트명</strong></v-col>
            <v-col cols="8">{{ selectedCourse.courseName }}</v-col>
          </v-row>
          <v-row class="mb-4">
            <v-col cols="4"><strong>내용</strong></v-col>
            <v-col cols="8">{{ selectedCourse.content }}</v-col>
          </v-row>
          <v-row class="mb-4">
            <v-col cols="4"><strong>이벤트URL</strong></v-col>
            <v-col cols="8">
              <a :href="selectedCourse.courseUrl" target="_blank" class="blue--text text--darken-2">{{
                selectedCourse.courseUrl }}</a>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4"><strong>신청인원</strong></v-col>
            <v-col cols="8">{{ selectedCourse.currentParticipants }} / {{ selectedCourse.maxParticipants }}</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end px-10 pb-6">
          <v-btn color="red darken-1" class="white--text" @click="closeEnrollModal">취소</v-btn>
          <v-btn color="blue darken-2" class="white--text" @click="enrollCourse">신청</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script>
import axios from "axios";

export default {
  data() {
    return {
      courses: [], // 강의 목록
      participants: [], // 신청자 목록
      showParticipantsModal: false, // 신청자 모달 상태
      searchQuery: "", // 검색어
      showModal: false, // 강의 생성 모달 상태
      showEditModal: false, // 강의 수정 모달 상태
      showEnrollModal: false, // 강의 신청 모달 상태
      selectedCourse: {}, // 선택된 강의
      currentPage: 1, // 현재 페이지 번호
      totalPages: 1, // 총 페이지 수
      itemsPerPage: 10, // 페이지당 항목 수
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
    // 검색어에 따른 필터링된 강의 목록
    filteredCourses() {
      if (this.searchQuery) {
        return this.courses.filter(
          (course) =>
            course.courseName.includes(this.searchQuery) ||
            course.content.includes(this.searchQuery)
        );
      }
      return this.courses;
    },
  },
  methods: {
    // 강의 참가자 목록 불러오기
    fetchParticipants(courseId) {
      axios
        .get(`/course/${courseId}/participants`)
        .then((response) => {
          this.participants = response.data;
          this.showParticipantsModal = true;
        })
        .catch((error) => {
          console.error("참가자를 불러오기 실패:", error);
          alert("참가자 목록을 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.");
        });
    },

    // 참가자 모달 닫기
    closeParticipantsModal() {
      this.showParticipantsModal = false;
    },

    // 사용자 정보 불러오기
    async fetchUserInfo() {
      try {
        const token = localStorage.getItem("token");
        const userNum = localStorage.getItem("userNum");
        const response = await axios.get(
          `${process.env.VUE_APP_API_BASE_URL}/user/profile/${userNum}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const user = response.data;
        console.log(user);
      } catch (error) {
        console.error("사용자 정보를 불러오는 데 실패했습니다:", error);
        alert("사용자 정보를 불러오는 중 문제가 발생했습니다. 다시 로그인해주세요.");
      }
    },

    // 인사팀 여부 확인
    isHrAdmin() {
      const departmentId = localStorage.getItem("departmentId");
      return departmentId === "4";
    },

    // 강의 목록 불러오기 (페이징 처리)
    fetchCourses() {
      axios
        .get("/course/list", {
          params: {
            page: this.currentPage - 1, // API에서는 0 기반 페이지로 전달
            size: this.itemsPerPage,
          },
        })
        .then((response) => {
          this.courses = response.data.content;
          this.totalPages = response.data.totalPages;
        })
        .catch((error) => {
          console.error("강의 정보를 불러오는데 실패하였습니다:", error);
          alert("강의 목록을 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.");
        });
    },

    onPageChange(newPage) {
      this.currentPage = newPage;
      this.fetchCourses(); // 새 페이지를 API로 요청
    },

    // 강의 검색 필터
    searchFilter(query) {
      console.log("Searching for:", query);
      this.currentPage = 1; // 검색 시 페이지를 초기화
      this.fetchCourses();
    },

    // 강의 생성 모달 열기
    openCreateModal() {
      this.showModal = true;
    },

    // 모달 닫기
    closeModal() {
      this.showModal = false;
      this.resetForm();
    },

    // 강의 생성 폼 초기화
    resetForm() {
      this.newCourse = {
        courseName: "",
        content: "",
        courseUrl: "",
        maxParticipants: 0,
        startTime: null,
      };
    },

    // 강의 생성
    createCourse() {
      if (this.newCourse.maxParticipants < 1) {
        alert("최대 참가자 수는 1명 이상이어야 합니다.");
        return;
      }
      axios
        .post("/course/create", this.newCourse)
        .then((response) => {
          this.courses.push(response.data);
          this.closeModal();
          alert("강의가 성공적으로 생성되었습니다.");
          this.fetchCourses(); // 목록 새로고침
        })
        .catch((error) => {
          console.error("강의 생성 실패:", error);
          alert("강의 생성 중 문제가 발생했습니다. 다시 시도해주세요.");
        });
    },

    // 강의 수정 모달 열기
    openEditModal(course) {
      this.editCourse = { ...course };
      axios
        .get(`/course/${course.id}/participants`)
        .then((response) => {
          this.editCourse.hasParticipants = response.data.length > 0;
          this.showEditModal = true;
        })
        .catch((error) => {
          console.error("참여자 조회 실패:", error);
        });
    },

    // 강의 수정 모달 닫기
    closeEditModal() {
      this.showEditModal = false;
    },

    // 강의 수정
    updateCourse() {
      if (
        this.editCourse.hasParticipants &&
        this.editCourse.maxParticipants !== this.originalMaxParticipants
      ) {
        alert("참여자가 있으므로 수정할 수 없습니다.");
        return;
      }
      axios
        .put(`/course/update/${this.editCourse.id}`, this.editCourse)
        .then((response) => {
          const index = this.courses.findIndex(
            (course) => course.id === response.data.id
          );
          if (index !== -1) {
            this.courses.splice(index, 1, response.data);
          }
          this.closeEditModal();
          alert("강의가 성공적으로 수정되었습니다.");
        })
        .catch((error) => {
          console.error("강의 내역 업데이트 실패:", error);
          alert("강의 수정 중 문제가 발생했습니다. 다시 시도해주세요.");
        });
    },

    // 강의 신청 모달 열기
    openEnrollModal(course) {
      this.selectedCourse = course;
      this.showEnrollModal = true;
    },

    // 강의 신청 모달 닫기
    closeEnrollModal() {
      this.showEnrollModal = false;
    },

    // 강의 신청
    enrollCourse() {
      if (this.selectedCourse.currentParticipants >= this.selectedCourse.maxParticipants) {
        alert("참가자가 최대 인원에 도달하여 더 이상 신청할 수 없습니다.");
        return;
      }
      axios
        .post(`/course/register/${this.selectedCourse.id}`)
        .then((response) => {
          alert(response.data);
          this.closeEnrollModal();
          this.fetchCourses();
        })
        .catch((error) => {
          console.error("강의 신청 실패:", error);
          alert("강의 신청 중 문제가 발생했습니다. 다시 시도해주세요.");
        });
    },

    // 강의 삭제
    deleteCourse(courseId) {
      axios
        .put(`/course/delete/${courseId}`)
        .then(() => {
          this.courses = this.courses.filter((course) => course.id !== courseId);
          alert("강의가 성공적으로 삭제되었습니다.");
          this.fetchCourses(); // 목록 새로고침
        })
        .catch((error) => {
          console.error("강의 삭제 실패:", error);
          alert("강의 삭제 중 문제가 발생했습니다. 다시 시도해주세요.");
        });
    },

    // 날짜 포맷팅
    formatDate(date) {
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(date).toLocaleDateString("ko-KR", options);
    },
  },
  watch: {
    currentPage(newPage, oldPage) {
      console.log("currentPage 값 변경됨 - 이전 값:", oldPage, "새 값:", newPage);
      this.fetchCourses();
    },
    category(newCategory) {
      this.currentCategory = newCategory;
      this.fetchCourses();
    },

    "selectedCourse.currentParticipants"(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.fetchCourses();
      }
    },
  },
  // 컴포넌트가 마운트될 때 실행되는 메소드
  mounted() {
    this.fetchUserInfo().then(() => this.fetchCourses());
  },
};
</script>



<style scoped>
.container {
  padding: 20px;
  border-radius: 12px;
}

.v-btn {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-row>.v-col {
  display: flex;
  align-items: center;
  justify-content: center;
}

.course-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.course-row:hover {
  background-color: #f5f5f5;
}

.mb-2 {
  margin-bottom: 20px;
}

/* 헤더 및 내용의 열 너비 고정 */
.header-cell,
.cell-content {
  text-align: center;
}

.header-cell {
  font-weight: bold;
  color: #444;
}

.cell-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

/* 각 열의 고정 너비 설정 */
.header-cell:nth-child(1),
.cell-content:nth-child(1) {
  width: 40%;
  /* 강좌명 */
}

.header-cell:nth-child(2),
.cell-content:nth-child(2) {
  width: 20%;
  /* 생성일 */
}

.header-cell:nth-child(3),
.cell-content:nth-child(3) {
  width: 15%;
  /* 참여자 */
}

.header-cell:nth-child(4),
.cell-content:nth-child(4) {
  width: 25%;
  /* 관리 */
}

.single-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v-btn--icon.v-btn--density-default {
  margin-left: 10px;
  width: calc(var(--v-btn-height) + 12px);
  height: calc(var(--v-btn-height) + 12px);
  box-shadow: none;
}

.v-btn--icon.v-btn--density-default:hover {
  box-shadow: none;
}

.icon-btn {
  margin: 0 5px;
}

.v-list-item {
  display: flex;
  align-items: center;
}

.v-list-item-title {
  font-size: 20px;
}

.v-list-item-subtitle {
  font-size: 16px;
}

.v-btn {
  width: 120px;
  height: 40px;
  font-size: 16px;
  float: right;
}

.v-card-title {
  font-weight: bold;
  font-size: 22px;
  text-align: center;
}

@keyframes scrollText {
  0% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(-100%);
  }
}
</style>
