<template>
  <v-container class="board-container">
    <h1 class="board-title">{{ boardTitle }}</h1>

    <!-- 게시판 상단 검색 폼 -->
    <v-form ref="form" class="search-form d-flex mb-4">
      <!-- 검색 범위 선택 -->
      <v-col cols="12" md="2">
        <v-select
          v-model="searchType"
          :items="searchOptions"
          item-title="text"
          item-value="value"
          label="검색 범위"
          required
        ></v-select>
      </v-col>

      <!-- 검색어 입력 -->
      <v-col cols="12" md="8">
        <v-text-field
          v-model="searchQuery"
          label="검색어를 입력하세요."
          append-icon="mdi-magnify"
          @click:append="performSearch"
          required
        ></v-text-field>
      </v-col>

      <!-- 작성하기 버튼을 같은 행에 정렬 -->
      <v-col cols="12" md="2" class="text-right">
        <v-btn class="btn_write" @click="createNewPost">
          작성하기
        </v-btn>
      </v-col>
    </v-form>

    <!-- 게시글 목록 테이블 -->
    <table class="tbl_list">
      <colgroup>
        <!-- 각 열의 너비를 설정 -->
        <col width="10%" />
        <col width="50%" />
        <col width="15%" />
        <col width="15%" />
        <col width="10%" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col" class="text-center">번호</th>
          <th scope="col" class="text-left">제목</th>
          <th scope="col" class="text-center">부서명</th>
          <th scope="col" class="text-center">작성자</th>
          <th scope="col" class="text-center">작성일</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in boardItems" :key="item.id">
          <td class="text-center">{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
          <td @click="goToDetail(item.id)" class="text-left subject">{{ item.title }}</td>
          <!-- 부서명 및 작성자 정보를 API 응답 필드에 맞춰 변경 -->
          <td class="text-center">{{ item.departmentName || 'N/A' }}</td>
          <td class="text-center">{{ item.anonymous ? '익명' : item.questionUserName || 'N/A' }}</td>
          <td class="text-center">{{ formatDate(item.createdAt) }}</td>
        </tr>
      </tbody>
    </table>

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
        { text: "부서명", value: "department" },
        { text: "작성자", value: "author" },
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
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/qna/list`;
        const response = await axios.get(apiUrl, { params });

        // API 응답 데이터 확인
        console.log("API 응답 데이터:", response.data);

        if (response.data && response.data.result) {
          const result = response.data.result;

          if (result && result.content) {
            this.boardItems = result.content;
            this.totalPages = result.totalPages;
          } else {
            console.error("API 응답에 올바른 데이터가 없습니다.");
            this.boardItems = []; // 빈 배열로 초기화
            this.totalPages = 1; // 페이지 수 초기화
          }
        }
      } catch (error) {
        console.error("목록을 가져오는 중 오류가 발생했습니다:", error);
        this.boardItems = []; // 오류 발생 시 빈 배열로 초기화
        this.totalPages = 1; // 오류 발생 시 페이지 수 초기화
      }
    },

    onPageChange(newPage) {
      this.currentPage = newPage;
      this.$nextTick(() => {
        this.fetchBoardItems();
      });
    },
    setBoardTitle() {
      this.boardTitle = "Q&A";
    },
    formatDate(date) {
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      };
      
      // toLocaleDateString을 사용하여 형식 변경 (ex: 2024.10.11)
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
  margin-bottom: 20px;
  color: #000000;
  border-bottom: 2px solid #000000;
  padding-bottom: 10px;
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
}

.btn_write:hover {
  background-color: #722121;
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
</style>
