<template>
  <v-container class="board-container">
    <!-- Adjusted the title size and positioning -->
    <v-row justify="start">
      <v-col cols="12" md="6">
        <h1 class="board-title">{{ boardTitle }}</h1>
      </v-col>

      <!-- 매니저 관리 버튼 -->
      <v-col cols="12" md="6" class="d-flex justify-end">
        <v-btn class="btn_manager_management" @click="openManagerModal">
          매니저 관리
        </v-btn>
      </v-col>
    </v-row>

    <!-- 게시판 상단 검색 폼 -->
    <v-form ref="form" class="search-form d-flex mb-4">
      <v-row justify="center" align="center" class="w-100">
        <!-- 검색 범위 선택 -->
        <v-col cols="12" md="3">
          <v-select
            v-model="searchType"
            :items="searchOptions"
            variant="underlined"
            item-title="text"
            item-value="value"
            label="검색 범위"
            required
          ></v-select>
        </v-col>

        <!-- 검색어 입력 -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="searchQuery"
            variant="underlined"
            label="검색어를 입력하세요."
            append-icon="mdi-magnify"
            @click:append="performSearch"
            required
          ></v-text-field>
        </v-col>

        <!-- 작성하기 및 나의 질문 목록 버튼 -->
        <v-col cols="12" md="3" class="d-flex justify-end">
          <v-btn class="btn_write" @click="createNewPost">
            작성하기
          </v-btn>
          <v-btn class="btn_my_questions" @click="goToMyQuestions">
            나의 질문 목록
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <!-- Manager Modal -->
    <v-dialog v-model="showManagerModal" max-width="800px">
      <v-card>
        <v-card-title>매니저 관리</v-card-title>
        <v-card-text>
          <v-row>
            <!-- 유저 목록 -->
            <v-col cols="6">
              <h3>유저 목록</h3>
              <v-text-field
                v-model="userSearchQuery"
                append-icon="mdi-magnify"
                label="유저 검색"
                @input="searchUsers"
              ></v-text-field>
              <v-list dense>
                <v-list-item v-for="user in filteredUsers" :key="user.id">
                  <v-list-item-content>
                    <v-list-item-title>{{ user.name }}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon @click="addManager(user)">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-col>

            <!-- 매니저 목록 -->
            <v-col cols="6">
              <h3>매니저 목록</h3>
              <v-list dense>
                <v-list-item v-for="manager in managers" :key="manager.id">
                  <v-list-item-content>
                    <v-list-item-title>{{ manager.name }}</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn icon @click="removeManager(manager)">
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeManagerModal">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 게시글 목록 테이블 -->
    <v-row justify="center" class="mt-4">
      <v-col cols="12">
        <v-row class="mb-2"
          style="background-color:rgba(122, 86, 86, 0.2);border-radius:15px; padding:4px; color:#444444; font-weight:600;">
          <v-col cols="1"><strong>번호</strong></v-col>
          <v-col cols="9"><strong>제목</strong></v-col>
          <v-col cols="2"><strong>작성일</strong></v-col>
        </v-row>

        <v-row v-for="(item, index) in boardItems" :key="item.id" class="board"
          @click="goToDetail(item.id)"
          style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500">
          <v-col cols="1">{{ index + 1 + (currentPage - 1) * itemsPerPage }}</v-col>
          <v-col cols="9">{{ item.title }}</v-col>
          <v-col cols="2">{{ formatDate(item.createdAt) }}</v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 페이지네이션 -->
    <v-pagination v-model="currentPage" :length="totalPages" @change="onPageChange" class="my-4"></v-pagination>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      boardItems: [], // 게시글 목록 데이터
      currentPage: 1, // 현재 페이지 번호
      totalPages: 1, // 총 페이지 수
      itemsPerPage: 10, // 페이지당 항목 수
      isAdmin: false, // 관리자인지 여부
      userNum: null, // 현재 로그인된 사용자의 ID
      currentCategory: "", // URL에서 카테고리 가져오기
      boardTitle: "",
      showManagerModal: false,
      users: [], // 전체 유저 목록
      filteredUsers: [], // 검색된 유저 목록
      userSearchQuery: "", // 유저 검색 쿼리
      managers: [], // 매니저 목록

      // 검색 필드 추가
      searchType: "title + content", // 기본값은 제목과 내용으로 검색
      searchQuery: "",
      searchOptions: [
        { text: "전체", value: "title + content" },
        { text: "제목", value: "title" },
        { text: "내용", value: "content" },
      ],
    };
  },
  props: ["category"],
  watch: {
    currentPage() {
      this.fetchBoardItems();
    },
    category(newCategory) {
      this.currentCategory = newCategory;
      this.setBoardTitle();
      this.fetchBoardItems();
    },
  },
  created() {
    this.currentCategory = this.category || "NOTICE";
    this.checkUserRole();
    this.setBoardTitle();
    this.fetchBoardItems();
    this.userNum = localStorage.getItem("userNum");
  },
  methods: {
    checkUserRole() {
      const departmentId = localStorage.getItem("departmentId");
      this.isAdmin = departmentId === "4";
      this.userNum = localStorage.getItem("userNum");
    },
    async fetchBoardItems() {
      try {
        const params = {
          page: this.currentPage - 1,
          size: this.itemsPerPage,
          searchType: this.searchType,
          searchQuery: this.searchQuery || "",
        };
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/qna/list`;
        const response = await axios.get(apiUrl, { params });

        if (response.data && response.data.result) {
          const result = response.data.result;
          if (result && result.content) {
            this.boardItems = result.content;
            this.totalPages = result.totalPages;
          } else {
            this.boardItems = [];
            this.totalPages = 1;
          }
        }
      } catch (error) {
        this.boardItems = [];
        this.totalPages = 1;
        console.error("목록을 가져오는 중 오류가 발생했습니다:", error);
      }
    },
    async fetchUsersAndManagers() {
      try {
        const [userResponse, managerResponse] = await Promise.all([
          axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/list`),
          axios.get(`${process.env.VUE_APP_API_BASE_URL}/manager/list`)
        ]);

        const allUsers = userResponse.data;
        const managers = managerResponse.data;

        this.users = allUsers.filter(user => !managers.some(manager => manager.userNum === user.userNum));
        this.filteredUsers = [...this.users]; // 초기 상태에서 전체 유저 목록이 보이도록 설정
        this.managers = managers;
      } catch (error) {
        console.error("유저 또는 매니저 목록을 불러오는 중 오류가 발생했습니다.", error);
      }
    },
    async searchUsers() {
      try {
        const params = {
          search: this.userSearchQuery, // 검색어
          searchType: 'name', // 이름으로 검색
        };
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/search`, { params });
        
        // 검색된 유저 중에서 매니저가 아닌 유저들만 필터링
        const searchedUsers = response.data;
        this.filteredUsers = searchedUsers.filter(user => !this.managers.some(manager => manager.userNum === user.userNum));
      } catch (error) {
        console.error("유저 검색 중 오류 발생:", error);
      }
    },
    openManagerModal() {
      this.showManagerModal = true;
      this.fetchUsersAndManagers();
    },
    closeManagerModal() {
      this.showManagerModal = false;
    },
    addManager(user) {
      axios.post(`${process.env.VUE_APP_API_BASE_URL}/manager/save`, { userNum: user.userNum })
        .then((response) => {
          const addedManager = response.data;
          this.managers.push(addedManager);
          this.users = this.users.filter(u => u.userNum !== user.userNum);
          this.filteredUsers = this.filteredUsers.filter(u => u.userNum !== user.userNum);
        })
        .catch(error => {
          console.error("매니저 추가 중 오류 발생:", error);
        });
    },
    removeManager(manager) {
      axios.delete(`${process.env.VUE_APP_API_BASE_URL}/manager/delete/${manager.userNum}`)
        .then(() => {
          this.users.push(manager);
          this.managers = this.managers.filter(m => m.userNum !== manager.userNum);
          this.filteredUsers.push(manager);
        })
        .catch(error => {
          console.error("매니저 삭제 중 오류 발생:", error);
        });
    },
    onPageChange(newPage) {
      this.currentPage = newPage;
      this.fetchBoardItems();
    },
    setBoardTitle() {
      this.boardTitle = "Q&A";
    },
    formatDate(date) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(date).toLocaleDateString('ko-KR', options).replace(/\//g, '.');
    },
    createNewPost() {
      this.$router.push({ name: "CreateQuestion" });
    },
    goToDetail(id) {
      this.$router.push({ name: "QnaDetail", params: { id } });
    },
    performSearch() {
      this.currentPage = 1;
      this.fetchBoardItems();
    },
    goToMyQuestions() {
      this.$router.push({ name: "UserQuestions" });
    },
  },
};
</script>


<style scoped>
/* 전체 배경 및 컨테이너 스타일 */
.board-container {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 12px;
}

/* 제목 섹션 스타일 */
.board-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 120px;
  color: #000000;
}

/* 검색 바 스타일 */
.search-form {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 20px;
}

.v-select,
.v-text-field {
  flex: none;
  width: auto;
  margin-right: 20px;
}

.v-select .v-input__control,
.v-text-field .v-input__control {
  border: none;
  background: transparent;
}

/* 테이블 전체 스타일 */
.tbl_list {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0px;
}

.tbl_list th,
.tbl_list td {
  white-space: nowrap;
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid #000000;
  transform: none;
  box-sizing: border-box;
  zoom: 1;
}

.tbl_list th {
  background-color: #f4f4f4;
  text-align: left;
}

.tbl_list td.text-left {
  text-align: left;
}

.tbl_list td.text-center {
  text-align: center;
}

.tbl_list td.text-right {
  text-align: right;
}

.tbl_list tr:hover {
  background-color: #ababab;
}

/* 질문 작성하기 버튼 스타일 */
.btn_write {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #949494;
  color: rgb(255, 255, 255);
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
  padding: 12px 16px;
  margin-left: 10px;
}

.btn_write:hover {
  background-color: #722121;
}

/* 나의 질문 목록 버튼 스타일 */
.btn_my_questions {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #722121;
  color: rgb(255, 255, 255);
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
  padding: 12px 16px;
  margin-left: 10px;
}

.btn_my_questions:hover {
  background-color: #501010;
}

/* 페이지네이션 스타일 */
.v-pagination {
  margin-top: 20px;
}

.v-pagination .v-pagination__item {
  border: none;
  color: #722121;
}

.v-pagination .v-pagination__item--active {
  font-weight: bold;
  background-color: #c5e1a5;
  color: white;
}

.btn_manager_management {
  background-color: #0056b3;
  color: #ffffff;
  margin-left: 20px;
  border-radius: 8px;
}
</style>
