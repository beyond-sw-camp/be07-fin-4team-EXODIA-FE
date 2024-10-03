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
            </ul>
            <v-img v-if="board.files && board.files.length > 0" :src="board.files[0].filePath" alt="board Image" max-width="400" class="my-3"/>
            <div v-html="board.content" class="text-body-1 bodyTxt"></div>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- 댓글 섹션 -->
      <v-row v-if="comments && comments.length > 0">
        <v-divider class="my-3"></v-divider>
        <v-col cols="12">
          <h4 class="text-h6 font-weight-bold">댓글</h4>
          <v-list two-line>
            <v-list-item v-for="comment in comments" :key="comment.id" class="py-2">
              <v-list-item-content class="comment-content">
                <div class="comment-text">
                  <v-list-item-title class="text-subtitle-1">{{ comment.content }}</v-list-item-title>
                  <v-list-item-subtitle>{{ comment.user_num }} ({{ formatDate(comment.createdAt) }})</v-list-item-subtitle>
                </div>
                <v-list-item-action class="action-buttons">
                  <a v-if="canDeleteComment(comment)" href="javascript:void(0)" class="btn_board_option" @click="deleteComment(comment.id)">삭제</a>
                </v-list-item-action>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <!-- 댓글 작성 폼 -->
          <v-form v-if="isLoggedIn" @submit.prevent="submitComment" class="mt-3">
            <v-textarea label="댓글 작성" v-model="newCommentContent" required outlined />
          </v-form>
        </v-col>
      </v-row>

      <!-- 액션 버튼들 -->
      <v-card-actions class="d-flex justify-end">
        <v-btn class="btn_solid" @click="goBack">목록으로</v-btn>
        <v-btn v-if="isFreeBoard" type="submit" class="btn_comment_ok" @click="submitComment">댓글작성</v-btn>
        <v-btn v-if="canEditBoard" class="btn_st2" @click="editBoard">수정</v-btn>
        <v-btn v-if="canDeleteBoard" class="btn_del" @click="confirmDeleteBoard">삭제</v-btn>
      </v-card-actions>
    </v-card>

    <!-- 에러 및 로딩 상태 -->
    <v-alert type="error" v-else-if="error">{{ error }}</v-alert>
    <v-progress-circular v-else indeterminate color="primary"></v-progress-circular>
  </v-container>
</template>

<script>
import axios from 'axios';
import { VList, VListItem, VListItemContent, VListItemAction } from 'vuetify/components';
import 'vuetify/styles';


export default {
  components: {
    VList,
    VListItem,
    VListItemContent,
    VListItemAction,
  },
  data() {
    return {
      board: null,
      comments: [],
      newCommentContent: '',
      isLoggedIn: false,
      isFreeBoard: false,
      deleteDialog: false,
      error: null,
      userId: localStorage.getItem('userId'),
      userEmail: '',
      boardTitle: ''
    };
  },
  computed: {
    canEditBoard() {
      return this.isAdmin || (this.board.user_num === this.userId);
    },
    canDeleteBoard() {
      return this.isAdmin || (this.board.user_num === this.userId);
    }
  },
  created() {
    this.checkLoginStatus();
    this.fetchBoardDetail();
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;
    },
    async fetchBoardDetail() {
      try {
        const boardId = this.$route.params.id;
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/detail/${boardId}`;

        const response = await axios.get(apiUrl);
        this.board = response.data.result;

        // board 객체가 존재할 경우, comments를 설정
        this.comments = this.board && this.board.comments ? this.board.comments : [];
      } catch (error) {
        console.error('게시글을 불러오는 데 실패했습니다:', error);
        this.error = '게시글을 불러오는 데 실패했습니다.';
      }
    },
    async submitComment() {
      if (!this.newCommentContent.trim()) {
        alert('댓글 내용을 입력하세요.');
        return;
      }

      const boardId = this.$route.params.id;
      const newComment = {
        content: this.newCommentContent,
        boardId: boardId,
        userId: this.userId
      };

      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/comment/create`, newComment);
        this.newCommentContent = '';
        this.fetchBoardDetail(); // 댓글 작성 후 댓글 목록 다시 불러오기
      } catch (error) {
        console.error('댓글 작성에 실패했습니다:', error);
        alert('댓글 작성에 실패했습니다.');
      }
    },
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    goBack() {
      this.$router.go(-1); // 이전 페이지로 이동
    },
    confirmDeleteBoard() {
      this.deleteDialog = true;
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
  margin-left: 16px;
}

.v-list-item-action {
  margin-left: auto;
}

.v-list-item-action .v-btn {
  margin-left: 8px;
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

.v-icon {
  font-size: 18px !important;
}
</style>

