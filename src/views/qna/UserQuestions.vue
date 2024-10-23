<template>
  <v-app>
    <v-container>
      <h1 class="board-title">내 질문 목록</h1>

      <!-- QnA 목록 테이블 -->
      <table class="tbl_list">
        <caption></caption>
        <colgroup>
          <col width="80" />
          <col width="auto" />
          <col width="140" />
          <col width="160" /> <!-- 작성일 칸의 너비를 160으로 증가 -->
          <col width="140" /> <!-- 상태 칸 추가 -->
        </colgroup>
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>상태</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in qnaList" :key="item.id">
            <td>{{ index + 1 }}</td>
            <td @click="viewDetails(item.id)" class="text_left subject">{{ item.title }}</td>
            <td>
              <v-chip
                :color="item.answeredAt ? 'green' : 'red'"
                dark
                small
              >
                {{ item.answeredAt ? '답변완료' : '미답변' }}
              </v-chip>
            </td>
            <td>{{ formatDate(item.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios';

export default {
  name: "QnAList",
  data() {
    return {
      qnaList: [] // QnA 목록 데이터 초기화
    };
  },
  async mounted() {
    await this.fetchQnAList(); // 컴포넌트가 마운트될 때 Q&A 리스트를 불러옵니다.
  },
  methods: {
    // 사용자가 작성한 질문 목록을 서버에서 가져오는 메서드
    async fetchQnAList() {
      try {
        const userNum = localStorage.getItem('userNum'); // 사용자 번호를 로컬 스토리지에서 가져옴
        if (!userNum) {
          alert('사용자 정보가 없습니다. 다시 로그인 해주세요.');
          return;
        }

        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/qna/my`, {
          params: { userNum }  // userNum을 요청 파라미터로 전달
        });

        if (response.status === 200) {
          this.qnaList = response.data.result;
        } else {
          console.error('Q&A 리스트 가져오기 실패:', response.data.message || response.statusText);
          alert('Q&A 리스트를 가져오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }
      } catch (error) {
        console.error('Q&A 리스트 가져오기 중 오류 발생:', error.response ? error.response.data.message : error.message);
        alert('Q&A 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    },


    // 날짜 형식을 보기 좋게 변환하는 메서드
    formatDate(dateString) {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };
      return new Date(dateString).toLocaleString('ko-KR', options); // 한국어 형식으로 날짜 변환
    },
    // 상세 페이지로 이동하는 메서드
    viewDetails(id) {
      this.$router.push(`/qna/detail/${id}`); // ID를 포함한 상세 페이지 URL로 이동
    }
  }
};
</script>

<style scoped>
.board-title {
  font-size: 26px;
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
  border-top: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  padding: 10px;
  text-align: left;
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
  cursor: pointer;
}

.subject:hover {
  text-decoration: underline;
}

.btn_view:hover {
  background-color: #555;
}
</style>
