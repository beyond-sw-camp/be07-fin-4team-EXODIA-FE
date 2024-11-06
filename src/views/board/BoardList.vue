<template>
  <v-container class="board-container">
    <!-- Adjusted the title size and positioning -->
    <v-row class="mb-12" style="padding-left:30px">
      <h1>{{ boardTitle }}</h1>
    </v-row>

    <!-- 게시판 상단 검색 폼 -->
    <v-row justify="center" align="center">
      <v-col cols="2">
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

      <v-col cols="8">
        <v-text-field
          v-model="searchQuery"
          variant="underlined"
          label="검색어를 입력하세요."
          append-icon="mdi-magnify"
          @input="performSearch"
          required
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row justify="end">
      <v-col cols="12" class="text-right">
        <v-btn v-create v-if="isAdmin" @click="createNewPost">
          작성하기
        </v-btn>
      </v-col>
    </v-row>

    <!-- 게시글 목록 헤더 -->
    <v-row justify="center" class="mt-4">
      <v-col cols="12">
        <v-row class="mb-2 text-center"
          style="background-color:rgba(122, 86, 86, 0.2);border-radius:15px; padding:4px; color:#444444; font-weight:600;">
          <v-col cols="1"><strong>번호</strong></v-col>
          <v-col cols="8"><strong>제목</strong></v-col>
          <v-col cols="2"><strong>작성일</strong></v-col>
          <v-col cols="1"><strong>조회수</strong></v-col>
        </v-row>

        <!-- 고정 게시글 (첫 번째 페이지에서만 표시) -->
        <template v-if="currentPage === 1 && currentCategory === 'notice'">
          <v-row
            v-for="item in pinnedBoardItems"
            :key="'pinned-' + item.id"
            class="board"
            @click="goToDetail(item.id)"
            style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500"
          >
            <v-col cols="1" class="text-center">📌</v-col>
            <v-col cols="8" class="title-ellipsis text-start" style="max-width: 80%; display: inline-block;">
              {{ itemTitle(item) }}
            </v-col>
            <v-col cols="2" class="text-center">{{ formatDate(item.createdAt) }}</v-col>
            <v-col cols="1" class="text-center">{{ item.hits }}</v-col>
          </v-row>
        </template>

        <!-- 일반 게시글 -->
        <v-row
          v-for="(item, index) in sortedBoardItems"
          :key="item.id"
          class="board"
          @click="goToDetail(item.id)"
          style="padding:5px; font-weight:500; border-bottom:1px solid #E7E4E4;"
        >
          <v-col cols="1" class="text-center">
            {{ totalBoardCount - ((currentPage - 1) * itemsPerPage + index) }}
          </v-col>
          <v-col cols="8" class="title-ellipsis text-start">
            {{ item.title }}
          </v-col>
          <v-col cols="2" class="text-center">{{ formatDate(item.createdAt) }}</v-col>
          <v-col cols="1" class="text-center">{{ item.hits }}</v-col>
        </v-row>
        <v-divider v-if="index < sortedBoardItems.length - 1"></v-divider>

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
      boardItems: [], // 일반 게시글 데이터
      pinItems: [], // 고정된 게시글 데이터
      currentPage: 1, // 현재 페이지 번호
      totalPages: 1, // 총 페이지 수
      itemsPerPage: 10, // 페이지당 항목 수
      totalBoardCount: 0, // 전체 게시글 수
      isAdmin: false, // 관리자인지 여부
      userNum: null, // 현재 로그인된 사용자의 ID
      currentCategory: "", // URL에서 카테고리 가져오기
      boardTitle: "",
      searchType: "title + content", // 검색 타입을 기본값으로 설정
      searchQuery: "", // 검색어
      searchOptions: [
        { text: "전체", value: "title + content" },
        { text: "제목", value: "title" },
        { text: "내용", value: "content" },
        { text: "태그", value: "tags" },
      ],
      categoryOptions: [
        { text: "공지사항", value: "notice" },
        { text: "경조사", value: "family_event" },
      ],
    };
  },
  props: ["category"],
  computed: {
    sortedBoardItems() {
      return this.boardItems
        .filter(item => !item.pinned)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    pinnedBoardItems() {
      return this.pinItems.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
  },

  watch: {
    searchQuery() {
      this.performSearch();
    },
    currentPage(newPage, oldPage) {
      console.log("currentPage 값 변경됨 - 이전 값:", oldPage, "새 값:", newPage);
      this.fetchBoardItems();
    },
    '$route'(to) {
      // URL 변경 시 카테고리 추출 후 업데이트
      const newCategory = to.params.category;
      this.currentCategory = newCategory;
      this.setBoardTitle();         // 제목 업데이트
      this.fetchTotalBoardCount();   // 전체 게시물 수 업데이트
      this.fetchBoardItems();        // 게시물 목록 업데이트
    },
  },

  mounted() {
    this.currentCategory = this.category || "NOTICE";
    this.fetchPinItems().then(() => {
      this.fetchTotalBoardCount(); // 전체 게시물 수 가져오기
    });
    this.checkUserRole();
    this.setBoardTitle(); 
    this.fetchBoardItems();

    this.userNum = localStorage.getItem("userNum");
    this.performSearch();
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
          searchQuery: this.searchQuery || ""
        };
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/${this.currentCategory}/list`;
        const response = await axios.get(apiUrl, { params });
        if (response.data && response.data.result) {
          const result = response.data.result;
          this.boardItems = result.content;
          this.totalPages = result.totalPages;
        }
      } catch (error) {
        console.error("목록을 가져오는 중 오류가 발생했습니다:", error);
        alert("게시글 목록을 불러오는 중 문제가 발생했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.");
      }
    },

    // 고정 게시글을 서버에서 가져옴
    async fetchPinItems() {
      try {
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/pinned`;
        const response = await axios.get(apiUrl);
        if (response.data && response.data.result) {
          this.pinItems = response.data.result;
        }
      } catch (error) {
        alert("고정 게시글을 불러오는 중 문제가 발생했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.");
      }
    },

    // 전체 게시물 수를 서버에서 가져옴
    async fetchTotalBoardCount() {
      try {
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/totalCount`;
        const response = await axios.get(apiUrl, {
          params: { category: this.currentCategory }
        });
        if (response.data && response.data.result) {
          const currentCategoryFromUrl = window.location.pathname.split('/')[2]; // URL에서 카테고리 추출

          // category가 'notice'이면 고정 게시물 수를 제외한 값 설정
          if (currentCategoryFromUrl === 'notice') {
            this.totalBoardCount = response.data.result - this.pinItems.length;
          } else {
            this.totalBoardCount = response.data.result;
          }

          console.log(`현재 카테고리: ${currentCategoryFromUrl}, 고정 게시물 수: ${this.pinItems.length}`);
        }
      } catch (error) {
        console.error("전체 게시물 수를 가져오는 중 오류가 발생했습니다:", error);
      }
    },

    // 페이지 변경
    onPageChange(newPage) {
      this.currentPage = newPage;
      this.fetchBoardItems();
    },

    setBoardTitle() {
      if (this.currentCategory.toLowerCase() === "familyevent") {
        this.boardTitle = "경조사";
      } else if (this.currentCategory.toLowerCase() === "notice") {
        this.boardTitle = "공지사항";
      } else {
        this.boardTitle = "게시판";
      }
    },

    formatDate(date) {
      return new Date(date)
        .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
        .replace(/\.\s/g, ".")
        .replace(/\.$/, "");
    },

    itemTitle(item) {
      return item.pinned ? "" + item.title : item.title;
    },

    createNewPost() {
      if (!this.isAdmin) {
        alert("관리자만 새 글을 작성할 수 있습니다.");
        return;
      }
      this.$router.push({ name: "BoardCreate", params: { category: this.currentCategory } });
    },

    goToDetail(id) {
      this.$router.push({ name: "BoardDetail", params: { id } });
    },

    performSearch() {
      try {
        this.currentPage = 1;
        this.fetchBoardItems();
      } catch (error) {
        console.error("검색 중 오류가 발생했습니다:", error);
        alert("검색 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    },
  },
};
</script>



<style scoped>
/* 전체 배경 및 컨테이너 스타일 */
.board-container {
  padding: 20px;
  border-radius: 12px;
}

/* 검색 바 스타일 */
.search-form {
  display: flex;
  align-items: center;
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

.tbl_list {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 0px;
}

.tbl_list th,
.tbl_list td {
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid #000;
  text-align: left;
}

.tbl_list th {
  background-color: #f4f4f4;
}

.tbl_list tr:hover {
  background-color: #ababab;
}

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

.drawer-open {
  transition: margin-right 0.3s ease;
  margin-right: 200px;
}

.title-ellipsis {
  white-space: nowrap;
  /* 텍스트를 한 줄로 표시 */
  overflow: hidden;
  /* 넘치는 텍스트를 숨김 */
  text-overflow: ellipsis;
  /* 넘치는 부분을 '...'로 표시 */
  display: inline-block;
  /* 텍스트를 한 줄로 보이게 설정 */
}
</style>
