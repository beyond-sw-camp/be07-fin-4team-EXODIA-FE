<template>
  <v-container class="board-container">
    <h1 class="board-title">{{ boardTitle }}</h1>

    <!-- 게시판 상단 검색 폼 -->
    <v-form ref="form" class="d-flex mb-4">
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
    </v-form>

    <!-- 게시글 목록 테이블 -->
    <table class="tbl_list">
      <thead>
        <tr>
          <th scope="col">번호</th>
          <th scope="col">제목</th>
          <th scope="col">작성자</th> <!-- 컬럼명 유지 -->
          <th scope="col">작성일</th>
          <th scope="col">조회수</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in boardItems" :key="item.id">
          <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
          <td @click="goToDetail(item.id)" class="text_left subject">{{ item.title }}</td>
          <td>관리자</td> <!-- 작성자를 모두 '관리자'로 표시 -->
          <td>{{ formatDate(item.createdAt) }}</td>
          <td>{{ item.hits }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 작성하기 버튼을 목록 하단에 배치 -->
    <v-row class="d-flex justify-end">
      <v-btn 
        v-if="isAdmin" 
        class="btn_write mt-4"
        @click="createNewPost"
      >
        작성하기
      </v-btn>
    </v-row>

    <!-- 페이지네이션 -->
    <v-pagination
    v-model="currentPage"
    :length="totalPages"
    @change="onPageChange"
    class="my-4"
    ></v-pagination>
  

  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      boardItems: [], // 게시글 목록 데이터
      currentPage: 1, // 현재 페이지 번호
      totalPages: 1, // 총 페이지 수
      itemsPerPage: 10, // 페이지당 항목 수
      isAdmin: false, // 관리자인지 여부
      userNum: null, // 현재 로그인된 사용자의 ID
      category: '', // URL에서 카테고리 가져오기
      boardTitle: '',

      // 검색 필드 추가
      searchType: 'all',
      searchQuery: '',
      searchOptions: [
        { text: "전체", value: "all" },
        { text: "제목", value: "title" },
        { text: "작성자", value: "user_num" },
      ],
      categoryOptions: [
        { text: '공지사항', value: 'NOTICE' },
        { text: '경조사', value: 'FAMILY_EVENT' }
      ],
    };
  },
  watch: {
    currentPage(newPage, oldPage) {
      console.log("currentPage 값 변경됨 - 이전 값:", oldPage, "새 값:", newPage);
      this.fetchBoardItems();
    }
  },
  created() {
    // URL에서 카테고리 값을 가져와 초기 설정
    this.category = this.$route.params.category || 'NOTICE';
    this.checkUserRole(); // 사용자 권한 확인 및 설정
    this.setBoardTitle(); // 초기 제목 설정
    this.fetchBoardItems(); // 컴포넌트 생성 시 게시글 목록을 가져옴
    this.userId = localStorage.getItem('userId'); // 로컬스토리지에서 userId 가져오기
  },
  methods: {
    checkUserRole() {
      // 로컬스토리지에서 departmentId 값을 가져옴
      const departmentId = localStorage.getItem('departmentId');
      console.log("Department ID:", departmentId); // 콘솔 로그로 값 확인

      // departmentId 값이 4이면 관리자로 설정
      this.isAdmin = departmentId === '4';
      
      // 추가로 필요한 사용자 정보 설정
      this.userNum = localStorage.getItem('userNum');
    },
    async fetchBoardItems() {
  try {
    // API 요청 파라미터를 설정할 때 currentPage 값을 명시적으로 지정
    const params = {
      page: this.currentPage - 1, // 페이지 번호를 0부터 시작하기 위해 1을 뺍니다.
      size: this.itemsPerPage,
      searchType: this.searchType,
      searchQuery: this.searchQuery || '', // 검색어가 없을 때 빈 문자열로 처리
    };
    console.log("fetchBoardItems 호출됨 - currentPage:", this.currentPage); // currentPage 확인
    console.log("API 요청 파라미터:", params); // 요청 파라미터 확인
    
    const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/${this.category.toLowerCase()}/list`;
    const response = await axios.get(apiUrl, { params });
    console.log("응답 데이터 전체:", response.data);
    
    // 응답 데이터 처리
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
  console.log("onPageChange 메서드 호출됨 - 새로운 페이지 번호:", newPage);
  this.currentPage = newPage;
  this.$nextTick(() => {
    console.log("onPageChange - nextTick 후 currentPage:", this.currentPage);
    this.fetchBoardItems(); // 페이지가 변경될 때 게시글 목록을 다시 불러옵니다.
  });
},



    setBoardTitle() {
      // URL에서 가져온 category 값을 기준으로 제목 설정
      if (this.category === 'FAMILY_EVENT') {
        this.boardTitle = '경조사';
      } else if (this.category === 'NOTICE') {
        this.boardTitle = '공지사항';
      } else {
        this.boardTitle = '게시판';
      }
    },
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    createNewPost() {
      if (!this.isAdmin) {
        alert('관리자만 이 게시판에 글을 작성할 수 있습니다.');
        return;
      }

      // 게시글 작성 페이지로 이동 시 카테고리를 경로로 전달
      this.$router.push({ name: 'BoardCreate' });
    },
    goToDetail(id) {
      // 게시글 상세 페이지로 이동 시 카테고리를 경로로 전달
      this.$router.push({ name: 'BoardDetail', params: { id }});
    },
    performSearch() {
      this.currentPage = 1; // 검색할 때 첫 페이지로 초기화
      this.fetchBoardItems();
    },
  },
};
</script>

<style scoped>
.btn_write {
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 16px;
}

.btn_write:hover {
  background-color: #388e3c;
}

.inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.board-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.tbl_list {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tbl_list th,
.tbl_list td {
  border: none; /* 모든 테두리 제거 */
  padding: 10px;
  text-align: left;
}

/* 테두리 스타일을 유지하려면 아래 코드 사용 */
.tbl_list th {
  background-color: #f4f4f4;
}

.tbl_list tr:not(:last-child) td {
  border-bottom: 1px solid #ccc; /* 하단 선만 유지 */
}

.text_left {
  text-align: left;
}

.subject {
  cursor: pointer;
  color: #333;
  text-decoration: none;
}

.subject:hover {
  text-decoration: underline;
}

.btn_adm_control {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s, color 0.3s;
  border-radius: 8px;
}

.btn_adm_control:hover {
  background-color: #ccc;
}

.btn_board_modify {
  background-color: #6cb1ff;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
}

.btn_board_modify:hover {
  background-color: #007bff;
}

.btn_board_del {
  background-color: #f57380;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
}

.btn_board_del:hover {
  background-color: #dc3545;
}

.conLayer {
  display: inline-block;
  background-color: white;
  border: 1px solid #ccc;
  position: absolute;
  z-index: 1;
  right: 0;
  padding: 5px;
}

.btnWrap {
  text-align: right;
  margin-top: 20px;
}

.btn_write {
  padding: 10px 20px;
  background-color: #f27885;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.btn_write:hover {
  background-color: #fa5263;
}

.pagingWrap ul {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: center;
  margin-top: 20px;
}

.pagingWrap li {
  display: inline-block;
}

.pagingWrap li a {
  margin: 0 5px;
  text-decoration: none;
  color: #333;
  cursor: pointer;
}

.pagingWrap li a.active {
  font-weight: bold;
  color: #0056b3;
}

.pagingWrap .btn_paging_start:before {
  content: "<<";
}

.pagingWrap .btn_paging_prev:before {
  content: "<";
}

.pagingWrap .btn_paging_next:before {
  content: ">";
}

.pagingWrap .btn_paging_end:before {
  content: ">>";
}
</style>
