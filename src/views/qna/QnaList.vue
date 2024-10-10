<template>
  <v-container>
    <h1 class="board-title">QnA 목록</h1>

    <!-- 검색 및 필터링 옵션 -->
    <div class="filters">
      <v-row>
        <!-- 검색 범위 선택 -->
        <v-col cols="12" md="4">
          <v-select
            v-model="searchCategory"
            :items="searchCategories"
            label="검색 범위"
            @change="fetchQuestions" 
          ></v-select>
        </v-col>
        <!-- 검색어 입력 -->
        <v-col cols="12" md="8">
          <v-text-field
            v-model="searchQuery"
            label="검색어"
            append-icon="mdi-magnify"
            @keyup.enter="fetchQuestions"
            @click:append="fetchQuestions"
          ></v-text-field>
        </v-col>
      </v-row>
    </div>

    <!-- QnA 목록 테이블 -->
    <table class="tbl_list">
      <caption></caption>
      <colgroup>
        <col width="80" />
        <col width="auto" />
        <col width="140" />
        <col width="140" />
        <col width="140" />
        <col width="140" />
      </colgroup>
      <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          <th>부서명</th>
          <th>작성자</th>
          <th>작성일</th>
          <th>답변 여부</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(question, index) in questions" :key="question.id">
          <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
          <td @click="viewDetail(question.id)" class="text_left subject">
            {{ question.title }}
          </td>
          <!-- 익명 여부에 따른 작성자 정보만 '익명'으로 표시 -->
          <td>{{ question.departmentName || 'N/A' }}</td>
          <td>{{ question.anonymous ? '익명' : question.questionUserName }}</td>
          <td>{{ formatDate(question.createdAt) }}</td>
          <td>{{ question.answeredAt ? '답변 완료' : '미답변' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 질문 작성 버튼 -->
    <div class="btnWrap">
      <button @click="createNewQuestion" class="btn_write">질문 작성하기</button>
    </div>

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
import axios from "axios";

export default {
  data() {
    return {
      questions: [], // QnA 목록 데이터
      currentPage: 1, // 현재 페이지 번호
      totalPages: 1, // 전체 페이지 수
      itemsPerPage: 10, // 페이지당 항목 수
      searchCategory: "전체", // 검색 카테고리 기본값 (null 대신 기본값을 '전체'로 설정)
      searchQuery: "", // 검색어
      // 검색 카테고리 목록: 전체, 제목, 내용
      searchCategories: ["전체", "제목", "내용"],
    };
  },
  created() {
    this.fetchQuestions(); // QnA 목록 가져오기
  },
  watch: {
    // currentPage 값 변경 시 fetchQuestions 호출
    currentPage(newPage) {
      console.log("watch - currentPage 값 변경됨:", newPage);
      this.fetchQuestions();
    }
  },
  methods: {
    // 페이지 변경 시 호출되는 메서드
    onPageChange(newPage) {
      console.log("onPageChange - 새로운 페이지 번호:", newPage);
      this.currentPage = newPage;
    },
    // 질문 목록 가져오기
    async fetchQuestions() {
      try {
        // searchType과 searchQuery 기본값 설정
        const searchType = this.getSearchType(); // '전체', '제목', '내용' 중 하나가 항상 설정됨
        const searchQuery = this.searchQuery.trim(); // 공백 제거

        // 빈 문자열이 아닌 경우에만 파라미터로 추가
        const params = {
          page: this.currentPage - 1, // 페이지 번호를 0부터 시작하기 위해 1을 뺍니다.
          size: this.itemsPerPage,
        };

        // 검색 범위가 '전체'가 아니고 검색어가 있는 경우에만 검색 파라미터 추가
        if (searchType !== "all" && searchQuery) {
          params.searchType = searchType;
          params.searchQuery = searchQuery;
        }

        // 콘솔 로그 추가: 요청 파라미터 확인
        console.log("fetchQuestions() - Request Params:", params);

        // 서버 요청
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/qna/list`, { params });

        // 콘솔 로그 추가: 서버 응답 확인
        console.log("fetchQuestions() - Response Data:", response.data);

        const result = response.data.result;

        if (result && result.content) {
          console.log("QnA 목록 데이터:", result.content);

          this.questions = result.content;
          this.totalPages = result.totalPages;
        } else {
          console.error("올바르지 않은 데이터 형식입니다:", response.data);
        }
      } catch (error) {
        // 콘솔 로그 추가: 오류 메시지 확인
        console.error("질문 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },
    // 검색 유형 변환
    getSearchType() {
      // 콘솔 로그 추가: 검색 카테고리 값 확인
      console.log("getSearchType() - Search Category:", this.searchCategory);

      switch (this.searchCategory) {
        case "전체":
          return "all";
        case "제목":
          return "title";
        case "내용":
          return "content";
        default:
          return "all";
      }
    },
    formatDate(date) {
      if (!date) return "";
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(date).toLocaleDateString("ko-KR", options);
    },
    createNewQuestion() {
      this.$router.push("/qna/create");
    },
    viewDetail(id) {
      this.$router.push(`/qna/detail/${id}`);
    },
  },
};
</script>


<style scoped>
.container {
  padding-top: 20px;
}

.board-title {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 20px;
}

.filters {
  margin-bottom: 20px;
}

.tbl_list {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.tbl_list th,
.tbl_list td {
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  border-left: none;
  border-right: none;
}

.tbl_list th {
  background-color: #f4f4f4;
  font-weight: bold;
}

.text_left {
  text-align: left;
}

.subject {
  text-decoration: none;
  color: #333;
}

.subject:hover {
  text-decoration: underline;
}

.btnWrap {
  text-align: right;
  margin-top: 20px;
}

.btn_write {
  padding: 12px 25px;
  background-color: #f27885;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn_write:hover {
  background-color: #fa5263;
}
</style>
