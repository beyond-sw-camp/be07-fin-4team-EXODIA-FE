<template>
  <v-container class="mt-5 board-container">
    <!-- 게시글 상세 정보 -->
    <div v-if="board" class="board-content-section mb-5">
      <!-- 제목 섹션 -->
      <div class="title-section mb-3">
        <h2 class="board-title">{{ board.title }}</h2>
      </div>

      <!-- 메타 정보 섹션 -->
      <div class="meta-info-section mb-3">
        <span class="meta-info">
          <strong>카테고리:</strong> {{ board.category }} |
          <strong>작성일:</strong> {{ formatDate(board.createdAt) }} |
          <strong>조회수:</strong> {{ board.hits }} |
          <strong>댓글:</strong> {{ comments.length }}
        </span>
      </div>

      <!-- 구분선 -->
      <v-divider class="mb-4"></v-divider>

      <!-- 본문 내용 섹션 -->
      <div v-html="board.content" class="board-body mb-4"></div>

      <!-- 파일 목록 섹션 -->
      <div v-if="board.files && board.files.length > 0" class="file-list-section mb-5">
        <h3 class="section-title">첨부 파일</h3>
        <div class="file-grid">
          <div v-for="file in board.files" :key="file.id" class="file-item">
            <v-img v-if="isImage(file.fileType)" :src="file.filePath" class="file-preview" alt="file image" />
            <a :href="file.filePath" target="_blank" @click.prevent="downloadFile(file.filePath, file.fileName)">
              {{ file.fileName }}
            </a>
          </div>
        </div>
      </div>

      <!-- 댓글 섹션 (FAMILY_EVENT 카테고리일 때만 표시) -->
      <div v-if="isFamilyEventCategory" class="comment-section">
        <h3 class="section-title">댓글</h3>
        <!-- 댓글 목록 -->
        <v-list two-line v-if="comments && comments.length > 0">
          <v-list-item v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-content">
              <div class="comment-meta">
                <p class="comment-text">{{ comment.content }}</p>
                <small>사번: {{ comment.userNum }} - {{ formatDate(comment.createdAt) }}</small>
              </div>
              <div v-if="comment.userNum === userNum" class="action-buttons">
                <v-btn small text @click="editComment(comment)">수정</v-btn>
                <v-btn small text color="red" @click="deleteComment(comment.id)">삭제</v-btn>
              </div>
            </div>
          </v-list-item>
        </v-list>

        <!-- 댓글 작성 폼 -->
        <v-form v-if="isLoggedIn" @submit.prevent="submitComment" class="comment-form mt-4">
          <v-textarea label="댓글 작성" v-model="newCommentContent" required outlined></v-textarea>
          <v-btn class="btn_comment_ok mt-2" @click="submitComment">댓글 작성</v-btn>
        </v-form>
      </div>
    </div>

    <!-- 액션 버튼들 -->
    <div v-if="board" class="action-section d-flex justify-end mb-5">
      <v-btn class="btn_solid mr-2" @click="goBack">목록으로</v-btn>
      <v-btn class="btn_st2 mr-2" @click="editBoard">수정</v-btn>
      <v-btn class="btn_del" @click="confirmDeleteBoard">삭제</v-btn>
    </div>

    <!-- 에러 및 로딩 상태 표시 -->
    <v-alert type="error" v-if="error">{{ error }}</v-alert>
    <v-progress-circular v-else-if="!board" indeterminate color="primary"></v-progress-circular>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      board: null,
      comments: [],
      newCommentContent: '',
      isLoggedIn: false,
      error: null,
      userNum: localStorage.getItem('userNum'),
      boardTitle: '게시글 상세보기',
    };
  },
  computed: {
    isFamilyEventCategory() {
      return this.board?.category === 'FAMILY_EVENT';
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
        const userNum = localStorage.getItem('userNum');
        const response = await axios.get(`/board/detail/${boardId}`, { params: { userNum } });
        this.board = response.data.result;

        if (this.isFamilyEventCategory) {
          this.comments = Array.isArray(this.board?.comments) ? this.board.comments : [];
        }
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
        board_id: boardId,
        userNum: this.userNum,
      };

      try {
        await axios.post(`/comment/create`, newComment);
        this.newCommentContent = '';
        this.fetchBoardDetail();
      } catch (error) {
        console.error('댓글 작성에 실패했습니다:', error);
        alert('댓글 작성에 실패했습니다.');
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\./g, '-');
    },
    goBack() {
      this.$router.go(-1);
    },
    editBoard() {
      this.$router.push({ name: 'BoardUpdate', params: { id: this.board.id } });
    },
    async confirmDeleteBoard() {
      if (confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
        try {
          const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/delete/${this.board.id}`;
          await axios.get(apiUrl);
          alert('게시물이 성공적으로 삭제되었습니다.');
          this.$router.push({ name: 'BoardList', params: { category: this.board.category } });
        } catch (error) {
          console.error('게시물 삭제에 실패했습니다:', error);
          alert('게시물 삭제에 실패했습니다.');
        }
      }
    },
    editComment(comment) {
      const updatedContent = prompt("댓글을 수정하세요:", comment.content);
      if (updatedContent && updatedContent !== comment.content) {
        const userNum = localStorage.getItem("userNum");
        axios
          .put(`/comment/update/${comment.id}`, { content: updatedContent, userNum })
          .then(() => this.fetchBoardDetail())
          .catch((error) => {
            console.error("댓글 수정에 실패했습니다:", error);
            alert("댓글 수정에 실패했습니다.");
          });
      }
    },
    async deleteComment(commentId) {
      if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        const userNum = localStorage.getItem("userNum");
        try {
          await axios.get(`/comment/delete/${commentId}`, { params: { userNum } });
          alert("댓글이 성공적으로 삭제되었습니다.");
          this.fetchBoardDetail();
        } catch (error) {
          console.error("댓글 삭제에 실패했습니다:", error);
          alert("댓글 삭제에 실패했습니다.");
        }
      }
    },
    isImage(fileType) {
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
.board-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 12px;
}

.board-content-section {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.title-section .board-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
}

.meta-info-section {
  font-size: 0.9rem;
  color: #777;
}

.board-body {
  font-size: 1rem;
  color: #555;
}

.file-list-section {
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.file-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-item {
  flex: 0 1 30%;
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.file-preview {
  width: 100%;
  border-radius: 8px;
  margin-bottom: 8px;
}

.comment-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
}

.comment-item {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
}

.comment-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.comment-form {
  margin-top: 20px;
}

.action-section {
  margin-top: 20px;
}

.btn_solid {
  background-color: #3f51b5 !important;
  color: #ffffff !important;
  border-radius: 8px;
}

.btn_st2 {
  background-color: #424242 !important;
  color: #ffffff;
  border-radius: 8px;
}

.btn_del {
  background-color: #f27885 !important;
  color: white;
  border-radius: 8px;
}

.btn_comment_ok {
  background-color: #5087c7 !important;
  color: white;
  border-radius: 8px;
}
</style>
