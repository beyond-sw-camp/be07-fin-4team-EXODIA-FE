<template>
  <v-container class="mt-5">
    <!-- 헤드 부분 -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-3 mb-4">
          <h1 class="board-title">{{ boardTitle }}</h1>
        </v-card>
      </v-col>
    </v-row>

    <!-- 게시글 카드 -->
    <v-card v-if="board" class="pa-5">
      <!-- 제목 -->
      <v-card-title class="d-flex justify-space-between align-center">
        <h2 class="text-h4 font-weight-bold">{{ board.title }}</h2>
      </v-card-title>

      <!-- 본문 내용 -->
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <ul class="info">
              <li><strong>작성자: {{ board.user_num }}</strong></li>
              <li><strong>작성일:</strong> {{ formatDate(board.createdAt) }}</li>
              <li><strong>조회수:</strong> {{ board.hits }}</li>
              <li><strong>카테고리:</strong> {{ board.category }}</li>
            </ul>

            <!-- 파일 목록 표시 -->
            <v-row v-if="board.files && board.files.length > 0" class="file-list my-3">
              <v-col v-for="file in board.files" :key="file.id" cols="12" sm="6" md="4">
                <v-card class="file-card pa-3">
                  <!-- 파일이 이미지 형식일 경우 이미지로 렌더링 -->
                  <v-img v-if="isImage(file.fileType)" :src="file.filePath" alt="file image" max-width="100%" />
                  <!-- 파일 이름을 링크로 제공 -->
                  <v-card-title>
                    <a :href="file.filePath" target="_blank" @click.prevent="downloadFile(file.filePath, file.fileName)">{{ file.fileName }}</a>
                  </v-card-title>
                </v-card>
              </v-col>
            </v-row>

            <div v-html="board.content" class="text-body-1 bodyTxt"></div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- 댓글 섹션 (FAMILY_EVENT 카테고리일 때만 표시) -->
      <v-row v-if="isFamilyEventCategory">
        <v-divider class="my-3"></v-divider>
        <v-col cols="12">
          <h4 class="text-h6 font-weight-bold">댓글</h4>

          <!-- 댓글 리스트 표시 -->
          <v-list two-line v-if="comments && comments.length > 0">
            <v-list-item v-for="comment in comments" :key="comment.id" class="py-2">
              <div class="comment-content d-flex justify-space-between align-center">
                <div class="comment-text">
                  <v-list-item-title class="text-subtitle-1">{{ comment.content }}</v-list-item-title>
                  <!-- 작성자의 사번 (userNum)과 이름을 표시 -->
                  <v-list-item-subtitle>{{ comment.name }} (사번: {{ comment.userNum }})</v-list-item-subtitle>
                </div>
                <div class="action-buttons">
                  <v-btn small text @click="editComment(comment)">수정</v-btn>
                  <v-btn small text @click="deleteComment(comment.id)">삭제</v-btn>
                </div>
              </div>
            </v-list-item>
          </v-list>

          <!-- 댓글 작성 폼은 항상 표시 -->
          <v-form v-if="isLoggedIn" @submit.prevent="submitComment" class="mt-3">
            <v-textarea label="댓글 작성" v-model="newCommentContent" required outlined />
            <v-btn class="btn_comment_ok mt-2" @click="submitComment">댓글 작성</v-btn>
          </v-form>
        </v-col>
      </v-row>

      <!-- 액션 버튼들 -->
      <v-card-actions class="d-flex justify-end">
        <v-btn class="btn_solid" @click="goBack">목록으로</v-btn>
        <v-btn class="btn_st2" @click="editBoard">수정</v-btn>
        <v-btn class="btn_del" @click="confirmDeleteBoard">삭제</v-btn>
      </v-card-actions>
    </v-card>

    <!-- 에러 및 로딩 상태 -->
    <v-alert type="error" v-else-if="error">{{ error }}</v-alert>
    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
  </v-container>
</template>

<script>
import axios from 'axios';
import 'vuetify/styles';

export default {
  data() {
    return {
      board: null,
      comments: [],
      newCommentContent: '',
      isLoggedIn: false,
      isFreeBoard: false,
      deleteDialog: false,
      error: null,
      userNum: localStorage.getItem('userNum'), // userNum을 localStorage에서 직접 가져옴
      boardId: localStorage.getItem('board_id'), // board_id를 localStorage에서 직접 가져옴
      boardTitle: ''
    };
  },
  computed: {
    // 댓글 표시 여부를 결정하는 변수 (카테고리가 FAMILY_EVENT일 경우 true)
    isFamilyEventCategory() {
      return this.board?.category === 'familyevent';
    }
  },
  props: ['category'],

  created() {
    this.checkLoginStatus();
    this.fetchBoardDetail();
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;
    },
    editBoard() {
      this.$router.push({ name: 'BoardUpdate', params: { id: this.board.id } });
    },
    async fetchBoardDetail() {
  try {
    const boardId = this.$route.params.id;
    const userNum = localStorage.getItem('userNum'); // 사용자 번호 가져오기


    // 서버 요청 시 userNum을 쿼리 파라미터로 함께 전달
    const response = await axios.get(`/board/detail/${boardId}`, { params: { userNum } });
    this.board = response.data.result;

    console.log(JSON.stringify(this.board));


    // 댓글을 FAMILY_EVENT 카테고리일 때만 설정
    if (this.isFamilyEventCategory) {
      this.comments = Array.isArray(this.board?.comments) ? this.board.comments : [];
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.error("Bad Request: 파라미터가 누락되었거나 올바르지 않습니다.", error.response.data);
      alert('잘못된 요청입니다. 요청 데이터를 확인해주세요.');
    } else if (error.response && error.response.status === 401) {
      alert('인증이 만료되었습니다. 다시 로그인 해주세요.');
      this.$router.push('/login');
    } else {
      console.error('게시글을 불러오는 데 실패했습니다:', error);
      this.error = '게시글을 불러오는 데 실패했습니다.';
    }
  }
}
,
    async submitComment() {
      if (!this.newCommentContent.trim()) {
        alert('댓글 내용을 입력하세요.');
        return;
      }

      const boardId = this.$route.params.id; // 게시글 ID는 경로에서 가져옴
      const newComment = {
        content: this.newCommentContent,
        board_id: boardId,  // 서버에서 요구하는 필드명으로 설정
        userNum: this.userNum, // localStorage에서 가져온 userNum 사용
        name: this.userNum // 댓글 작성자 이름을 사번(userNum)으로 설정
      };

      try {
        await axios.post(`/comment/create`, newComment);
        this.newCommentContent = '';
        this.fetchBoardDetail(); // 댓글 작성 후 댓글 목록 다시 불러오기
      } catch (error) {
        if (error.response && error.response.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인 해주세요.');
          this.$router.push('/login');
        } else {
          console.error('댓글 작성에 실패했습니다:', error);
          alert('댓글 작성에 실패했습니다.');
        }
      }
    },
  
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    goBack() {
      this.$router.go(-1); // 이전 페이지로 이동
    },
    async confirmDeleteBoard() {
    if (confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      try {
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/delete/${this.board.id}`;

        // 삭제 요청 보내기
        await axios.get(apiUrl);

        alert('게시물이 성공적으로 삭제되었습니다.');
        this.$router.push({ name: 'BoardList', params: { category: this.board.category } });
      } catch (error) {
        console.error('게시물 삭제에 실패했습니다:', error);
        alert('게시물 삭제에 실패했습니다.');
      }
    }
  },
    // 댓글 수정 메서드에서 userNum을 서버로 전송
    editComment(comment) {
      const updatedContent = prompt("댓글을 수정하세요:", comment.content);
      if (updatedContent && updatedContent !== comment.content) {
        // 로컬스토리지에서 userNum을 가져와 서버에 전송
        const userNum = localStorage.getItem("userNum");
        console.log(comment.id)

        axios
          .put(`/comment/update/${comment.id}`, { content: updatedContent, userNum })
          .then(() => this.fetchBoardDetail())
          .catch((error) => {
            console.error("댓글 수정에 실패했습니다:", error);
            alert("댓글 수정에 실패했습니다.");
          });
      }
    },
    // 댓글 삭제 메서드에서도 userNum을 서버로 전송
    async deleteComment(commentId) {
    if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      // 로컬스토리지에서 userNum을 가져옴
      const userNum = localStorage.getItem("userNum");

      try {
        // GET 요청을 보내고 userNum을 URL 파라미터로 전송
        const apiUrl = `/comment/delete/${commentId}?userNum=${userNum}`;
        
        await axios.get(apiUrl);

        alert("댓글이 성공적으로 삭제되었습니다.");
        this.fetchBoardDetail(); // 삭제 후 댓글 목록을 다시 불러옵니다.
      } catch (error) {
        console.error("댓글 삭제에 실패했습니다:", error);
        alert("댓글 삭제에 실패했습니다.");
      }
    }
  },
    isImage(fileType) {
      // 간단한 이미지 타입 확인 함수
      return fileType.includes('image/');
    },
    downloadFile(fileUrl, fileName) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
</script>


<style scoped>
.v-container {
  max-width: 800px;
  margin: 0 auto;
}

.my-3 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.text-body-1 {
  font-size: 1rem;
  line-height: 1.5;
  color: #555;
}

.info {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info li {
  display: inline-block;
  margin-right: 20px;
}

.v-btn {
  font-weight: bold;
  border-radius: 0;
}

.btn_white {
  background-color: white !important;
  color: #424242 !important;
  border: 1px solid #dcdcdc !important;
}

.btn_white:hover {
  background-color: #f5f5f5 !important;
}

.btn_del {
  background-color: #f27885 !important;
  color: white;
  border-radius: 8px;
}

.btn_solid {
  background-color: #ffdb69 !important;
  color: rgb(255, 255, 255);
  border-radius: 8px;
}

.btn_st2 {
  background-color: #424242 !important;
  color: white;
  border-radius: 8px;
}

.btn_alert {
  background-color: #d32f2f !important;
  color: white;
}

.btn_comment_ok {
  background-color: #5087c7 !important;
  color: white;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
}

.comment-text {
  flex-grow: 1;
}

.comment-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn_board_option {
  display: block;
  padding: 5px 10px;
  color: #ffffff;
  text-decoration: none;
  background-color: #f27885;
  border-bottom: 1px solid #ccc;
  border-radius: 8px;
}

.btn_board_option:hover {
  background-color: #f5f5f5;
  color: black;
}
</style>
