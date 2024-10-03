<template>
  <v-container class="board-container">
    <h1 class="board-title">{{ boardTitle }}</h1>

    <!-- 게시판 상단 검색 폼 -->
    <v-form ref="form" class="d-flex mb-4">
      <!-- 카테고리 선택 -->
      <v-col cols="12" md="2">
        <v-select
          v-model="category"
          :items="categoryOptions"
          item-title="text"
          item-value="value"
          label="카테고리"
          required
        ></v-select>
      </v-col>

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
          <th scope="col">작성자</th>
          <th scope="col">작성일</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in boardItems" :key="item.id">
          <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
          <td @click="goToDetail(item.id)" class="text_left subject">{{ item.title }}</td>
          <td>{{ item.user_num }}</td>
          <td>{{ formatDate(item.createdAt) }}</td>
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
      @input="fetchBoardItems"
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
      category: 'NOTICE', // 초기 카테고리 값을 'NOTICE'로 설정
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
    // category가 변경될 때 자동으로 게시글 목록을 업데이트
    category(newCategory) {
      console.log('Category changed:', newCategory);
      this.currentPage = 1; // 페이지를 첫 페이지로 초기화
      this.setBoardTitle(); // 제목 설정
      this.fetchBoardItems(); // 게시글 목록 가져오기
    }
  },
  created() {
    this.checkUserRole(); // 사용자 권한 확인 및 설정
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
    parseJwt(token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        return JSON.parse(jsonPayload);
      } catch (error) {
        return null;
      }
    },
    async fetchBoardItems() {
      try {
        const params = {
          page: this.currentPage - 1,
          size: this.itemsPerPage,
          searchType: this.searchType,
          searchQuery: this.searchQuery,
          category: this.category // 선택한 카테고리 전달
        };
        console.log('Fetch Board Items Params:', params);  // 파라미터 로그 출력

        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/board/list`, { params });

        const result = response.data.result;
        if (result && result.content) {
          this.boardItems = result.content;
          this.totalPages = result.totalPages;
        } else {
          console.error('올바르지 않은 데이터 형식입니다:', response.data);
        }
      } catch (error) {
        console.error('목록을 가져오는 중 오류가 발생했습니다:', error);
        if (error.response && error.response.status === 401) {
          alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      }
    },
    setBoardTitle() {
      if (this.category === 'FAMILY_EVENT') {
        this.boardTitle = '경조사';
      } else if (this.category === 'NOTICE') {
        this.boardTitle = '공지사항';
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
      this.$router.push({ name: 'BoardCreate' }); // BoardCreate 페이지로 이동
    },
    goToDetail(id) {
      this.$router.push({ name: 'BoardDetail', params: { id } }); // 게시글 상세 페이지로 이동
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