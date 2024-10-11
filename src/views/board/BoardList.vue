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
</v-form>


    <!-- 게시글 목록 테이블 -->
    <table class="tbl_list">
      <thead>
        <tr>
          <th scope="col">번호</th>
          <th scope="col">제목</th>
          <th scope="col">작성자</th> 
          <th scope="col">작성일</th>
          <th scope="col">조회수</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in boardItems" :key="item.id">
          <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
          <td @click="goToDetail(item.id)" class="text_left subject">{{ item.title }}</td>
          <td>관리자</td> 
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
      currentCategory: '', // URL에서 카테고리 가져오기
      boardTitle: '',

      // 검색 필드 추가
      searchType: 'all',
      searchQuery: '',
      searchOptions: [
        { text: "전체", value: "all" },
        { text: "제목", value: "title" },
        { text: "작성자", value: "userNum" },
      ],
      categoryOptions: [
        { text: '공지사항', value: 'NOTICE' },
        { text: '경조사', value: 'FAMILY_EVENT' }
      ],
    };
  },
  props: ['category'],
  watch: {
    currentPage(newPage, oldPage) {
      console.log("currentPage 값 변경됨 - 이전 값:", oldPage, "새 값:", newPage);
      this.fetchBoardItems();
    },
    // category가 변경될 때 currentCategory도 변경되도록 설정
    category(newCategory) {
      this.currentCategory = newCategory;
      this.setBoardTitle();
      this.fetchBoardItems(); // 카테고리 변경 시 게시글 목록을 다시 불러옴
    }
  },
  created() {
    // URL에서 카테고리 값을 가져와 초기 설정
    this.currentCategory = this.category || 'NOTICE';
    this.checkUserRole(); // 사용자 권한 확인 및 설정
    this.setBoardTitle(); // 초기 제목 설정
    this.fetchBoardItems(); // 컴포넌트 생성 시 게시글 목록을 가져옴
    this.userNum = localStorage.getItem('userNum'); // 로컬스토리지에서 userId 가져오기
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
        
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/${this.currentCategory.toLowerCase()}/list`;
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
      if (this.currentCategory === 'familyevent') {
        this.boardTitle = '경조사';
      } else if (this.currentCategory === 'notice') {
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
/* 전체 배경 및 컨테이너 스타일 */
.board-container {
  background-color: #f9fafb; /* 부드러운 회색 배경 */
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
  justify-content: flex-start; /* 왼쪽으로 정렬 */
  gap: 10px; /* 검색 범위와 검색어 입력 간의 간격 */
  margin-bottom: 20px; /* 폼 하단의 여백 */
}

.v-select,
.v-text-field {
  flex: none; /* 크기를 고정 */
  width: auto; /* 내용에 따라 너비 조정 */
  margin-right: 20px; /* 입력 필드 간의 간격 */
}

/* v-select와 v-text-field 내부 스타일 */
.v-select .v-input__control,
.v-text-field .v-input__control {
  border: none;
  background: transparent;
}

/* 테이블 전체 스타일 */
.tbl_list {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 100px;
}

/* 테이블 헤더와 셀 스타일 */
.tbl_list th,
.tbl_list td {
  padding: 12px;
  text-align: left;
  font-size: 14px;
  border-bottom: 1px solid #000000; /* 연한 회색 하단 선 */
}

/* 테이블 헤더 스타일 */
.tbl_list th {
  background-color: #a77171; /* 헤더 배경색 */
  font-weight: bold;
  color: #000000; /* 헤더 텍스트 색상 */
}

/* 테이블 행 스타일 */
.tbl_list tr:hover {
  background-color: #f1f8e9; /* 행 호버 시 연한 녹색 배경 */
}

/* "필독" 표시 스타일 */
.tbl_list td .important {
  background-color: #ff5252; /* 빨간색 배경 */
  color: white;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 작성하기 버튼 스타일 */
.btn_write {
  padding: 10px 20px;
  background-color: #81c784; /* 연한 녹색 배경 */
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 16px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); /* 버튼 그림자 */
  transition: background-color 0.3s ease;
}

/* 작성하기 버튼 호버 스타일 */
.btn_write:hover {
  background-color: #66bb6a; /* 호버 시 진한 녹색 배경 */
}

/* 페이지네이션 스타일 */
.v-pagination {
  margin-top: 20px;
}

/* 페이지네이션 항목 스타일 */
.v-pagination .v-pagination__item {
  border: none;
  color: #66bb6a; /* 페이지네이션 항목 색상 */
}

/* 현재 페이지의 페이지네이션 스타일 */
.v-pagination .v-pagination__item--active {
  font-weight: bold;
  background-color: #c5e1a5; /* 현재 페이지 표시 배경 */
  color: white;
}

/* 버튼 및 기타 스타일 */
.btn_adm_control {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 5px 10px;
  border-radius: 8px;
  transition: background-color 0.3s, color 0.3s;
}

/* 버튼 호버 스타일 */
.btn_adm_control:hover {
  background-color: #f1f1f1;
}

/* 테이블 내 링크 스타일 */
.subject {
  cursor: pointer;
  color: #33691e; /* 녹색 톤의 링크 */
  text-decoration: none;
}

/* 링크 호버 스타일 */
.subject:hover {
  text-decoration: underline;
  color: #66bb6a;
}

/* 테이블 내 글씨 색상 및 강조 */
.tbl_list th,
.tbl_list td {
  color: #004d40; /* 진한 초록색 텍스트 */
}

/* 번호 컬럼 스타일 */
.tbl_list tr td:first-child {
  text-align: center; /* 번호 컬럼 가운데 정렬 */
}

/* 테이블 셀 텍스트 정렬 */
.tbl_list tr td {
  vertical-align: middle; /* 텍스트 중앙 정렬 */
}

/* 페이지네이션 스타일 */
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

/* 페이지네이션 링크 스타일 */
.pagingWrap li a {
  margin: 0 5px;
  text-decoration: none;
  color: #333;
  cursor: pointer;
}

/* 현재 페이지의 링크 스타일 */
.pagingWrap li a.active {
  font-weight: bold;
  color: #33691e; /* 진한 녹색 */
}
</style>

