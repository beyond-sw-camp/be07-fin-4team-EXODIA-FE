<template>
  <v-container class="board-container">
    <!-- Adjusted the title size and positioning -->
    <v-row justify="start">
      <v-col cols="12" md="6">
        <h1 class="board-title">{{ boardTitle }}</h1>
      </v-col>
    </v-row>

    <!-- 게시판 상단 검색 폼 - Adjusted layout and search bar size -->
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

        <!-- 작성하기 버튼을 검색바 오른쪽에 위치 -->
        <v-col cols="12" md="3" class="text-right">
          <v-btn v-if="isAdmin" class="btn_write" @click="createNewPost">
            작성하기
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <!-- 게시글 목록 테이블을 아래로 내리기 위해 mt-4 클래스 추가 -->
    <v-row justify="center" :class="{ 'drawer-open': drawer }" class="mt-4">
      <v-col cols="12">
        <v-row class="mb-2"
          style="background-color:rgba(122, 86, 86, 0.2);border-radius:15px ; padding:4px; color:#444444; font-weight:600;">
          <v-col cols="1"><strong>번호</strong></v-col>
          <v-col cols="4"><strong>제목</strong></v-col>
          <v-col cols="3"><strong>작성일</strong></v-col>
          <v-col cols="2"><strong>조회수</strong></v-col>
        </v-row>

        <v-row v-for="(item, index) in boardItems" :key="item.id" class="board"
          @click="goToDetail(item.id)"
          style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500">
          <v-col cols="1">{{ index + 1 + (currentPage - 1) * itemsPerPage }}</v-col>
          <v-col cols="4">{{ item.title }}</v-col>
          <v-col cols="3">{{ formatDate(item.createdAt) }}</v-col>
          <v-col cols="2">{{ item.hits }}</v-col>
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

      // 검색 필드 추가
      searchType: "all",
      searchQuery: "",
      searchOptions: [
        { text: "전체", value: "all" },
        { text: "제목", value: "title" },
      ],
      categoryOptions: [
        { text: "공지사항", value: "NOTICE" },
        { text: "경조사", value: "FAMILY_EVENT" },
      ],
    };
  },
  props: ["category"],
  watch: {
    currentPage(newPage, oldPage) {
      console.log("currentPage 값 변경됨 - 이전 값:", oldPage, "새 값:", newPage);
      this.fetchBoardItems();
    },
    category(newCategory) {
      this.currentCategory = newCategory;
      this.setBoardTitle();
      this.fetchBoardItems(); // 카테고리 변경 시 게시글 목록을 다시 불러옴
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
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/${this.currentCategory.toLowerCase()}/list`;
        const response = await axios.get(apiUrl, { params });
        if (response.data && response.data.result) {
          const result = response.data.result;
          this.boardItems = result.content;
          this.totalPages = result.totalPages;
        }
      } catch (error) {
        console.error("목록을 가져오는 중 오류가 발생했습니다:", error);
      }
    },
    onPageChange(newPage) {
      this.currentPage = newPage;
      this.fetchBoardItems();
    },
    setBoardTitle() {
      if (this.currentCategory === "familyevent") {
        this.boardTitle = "경조사";
      } else if (this.currentCategory === "notice") {
        this.boardTitle = "공지사항";
      } else {
        this.boardTitle = "게시판";
      }
    },
    formatDate(date) {
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      };
      return new Date(date).toLocaleDateString('ko-KR', options).replace(/\//g, '.');
    },
    createNewPost() {
      if (!this.isAdmin) {
        alert("관리자만 이 게시판에 글을 작성할 수 있습니다.");
        return;
      }
      this.$router.push({ name: "BoardCreate" });
    },
    goToDetail(id) {
      this.$router.push({ name: "BoardDetail", params: { id } });
    },
    performSearch() {
      this.currentPage = 1;
      this.fetchBoardItems();
    },
  },
};
</script>

<style scoped>
*:not(h1) {
  font-size: 14px;
}

.board-container {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 12px;
}

.board-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 120px; /* 간격을 넓히기 위해 margin-bottom 값을 40px로 설정 */
  color: #000;
}

.search-form {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 40px; /* 간격을 넓히기 위해 변경 */
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

.btn_write {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 16px;
  background-color: #949494;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 12px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease;
}

.btn_write:hover {
  background-color: #722121;
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
</style>
