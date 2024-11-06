<template>
  <v-container class="mt-5 board-container">
    <div v-if="board" class="action-section d-flex justify-end mb-5">
      <v-btn v-list class="mr-2" @click="goBack">목록으로</v-btn>
      <v-btn v-create class="mr-2" @click="editBoard">수정</v-btn>
      <v-btn v-delete @click="confirmDeleteBoard">삭제</v-btn>
    </div>

    <!-- 게시글 상세 정보 -->
    <div v-if="board" class="board-content-section mb-5">
      <!-- 제목 섹션 -->
      <div class="title-section mb-3">
        <h2 class="board-title">{{ board.title }}</h2>
      </div>

      <!-- 메타 정보 섹션 -->
      <div class="meta-info-section mb-3">
        <span class="meta-info">
          <strong>카테고리:</strong> {{ formatCategory(board.category) }} |
          <strong>작성일:</strong> {{ formatDate(board.createdAt) }} |
          <strong>조회수:</strong> {{ board.hits }}
        </span>
      </div>

      <!-- 구분선 -->
      <v-divider class="mb-4"></v-divider>

      <!-- 본문 내용 섹션 -->
      <div v-html="board.content" class="board-body mb-4"></div>

      <!-- 태그 목록 섹션 -->
      <v-divider class="mb-4"></v-divider>
      <div v-if="tags.length > 0" class="tag-section">
        <h4 class="section-title">태그</h4>
        <div class="tags">
          <v-chip v-for="(tag, index) in tags" :key="index" class="tag-chip" outlined>
            {{ tag.tag || tag }}
          </v-chip>
        </div>
      </div>

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

      <!-- 댓글 -->
      <v-card-title>
        <span class="headline">댓글</span>
        <v-row class="mt-4">
          <v-col cols="10">
            <v-text-field 
              density="compact" 
              label="댓글을 입력하세요." 
              variant="outlined"
              v-model="newCommentContent"> 
            </v-text-field>
          </v-col>
          <v-col cols="2">
            <v-btn v-create @click="submitComment()">등록</v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <!-- 댓글 목록 섹션 -->
      <div class="comment-section">
        <v-list>
          <v-list-item v-for="(comment, index) in comments" :key="comment.id || index" class="comment-item">
            <div class="comment-content">
              <!-- 수정 중인지 확인 -->
              <div class="comment-header">
                <v-avatar class="icon">
                  <v-img :src="comment.profileImage || defaultProfileImage" alt="프로필 이미지" />
                </v-avatar>
                <div class="user-info">
                  <span class="user-name">{{ comment.name }}</span>
                  <small class="comment-date">
                    {{ formatDate(comment.createdAt) }}
                    <span v-if="comment.isEdited" class="edited-mark">(수정됨)</span>
                  </small>
                </div>

                <div v-if="comment.userNum === userProfile.userNum" class="action-links">
                  <!-- 수정 중인지에 따라 버튼 표시 변경 -->
                  <span v-if="editingCommentId === comment.id" @click="saveCommentEdit(comment.id)" class="action-link">완료</span>
                  <span v-if="editingCommentId === comment.id" @click="cancelCommentEdit" class="action-link delete">취소</span>
                  <span v-if="editingCommentId !== comment.id" @click="editComment(comment)" class="action-link">수정</span>
                  <span v-if="editingCommentId !== comment.id" @click="deleteComment(comment.id)" class="action-link delete">삭제</span>
                </div>
              </div>

              <!-- 댓글 내용 -->
              <div v-if="editingCommentId === comment.id">
                <v-text-field
                  v-model="editingCommentContent"
                  label="댓글 수정"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </div>
              <p v-else class="comment-text">{{ comment.content }}</p>
            </div>
            <v-divider style="margin-top:10px;"></v-divider>
          </v-list-item>
        </v-list>
      </div>

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
      defaultProfileImage: 'https://via.placeholder.com/150',
      userProfile: {
        userNum: localStorage.getItem('userNum') || '',
        name: '',
        profileImage: ''
      },
      showComments: true,
      boardTitle: '게시글 상세보기',
      tags: [], // 태그 목록을 담을 배열
      editingCommentId: null, // 수정 중인 댓글 ID
      editingCommentContent: '', // 수정 중인 댓글 내용
    };
  },
  created() {
    this.checkLoginStatus();
    this.fetchBoardDetail();
  },
  methods: {
    checkLoginStatus() {
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;
      if (this.isLoggedIn) {
        // 로그인된 경우 사용자 정보 로드
        this.userProfile.userNum = localStorage.getItem('userNum');
        this.userProfile.name = localStorage.getItem('name') || 'Unknown User';
        this.userProfile.profileImage = localStorage.getItem('profileImage') || 'https://example.com/default-profile.png';
      }
      console.log("로그인 상태:", this.isLoggedIn);
      console.log("사용자 정보:", this.userProfile);
    },

    async fetchBoardDetail() {
      try {
        const boardId = this.$route.params.id;
        const userNum = this.userProfile.userNum;

        const boardResponse = await axios.get(`/board/detail/${boardId}`, {
          params: { userNum }
        });
        this.board = boardResponse.data.result;

        if (this.board.comments) {
          this.comments = this.board.comments.filter(comment => !comment.delYn);
          
        } else {
          this.comments = [];
        }
        // 태그 데이터 확인
        if (this.board.tags) {
          this.tags = [...this.board.tags]; // 태그 데이터가 있으면 태그를 복사하여 사용
        }

        console.log("댓글 데이터:", JSON.stringify(this.comments));
      } catch (error) {
        console.error('게시글을 불러오는 데 실패했습니다:', error);
        this.error = '게시글을 불러오는 데 실패했습니다.';
      }
    },



    formatCategory(category) {
      const categoryMapping = {
        'NOTICE': '공지사항',
        'FAMILY_EVENT': '경조사'
      };
      return categoryMapping[category] || category;
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
        userNum: this.userProfile.userNum,
        userName: this.userProfile.name,
        userProfileImage: this.userProfile.profileImage
      };

      try {
        const response = await axios.post(`/comment/create`, newComment);
        console.log('댓글 작성 응답:', response.data);
        this.newCommentContent = '';
        this.fetchBoardDetail();
      } catch (error) {
        console.error('댓글 작성에 실패했습니다:', error);
        alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    },

    // 댓글 수정 저장
  async saveCommentEdit(commentId) {
    if (!this.editingCommentContent.trim()) {
      alert("댓글 내용을 입력하세요.");
      return;
    }

    const userNum = this.userProfile.userNum;
    try {
      const response = await axios.put(`/comment/update/${commentId}`, {
        content: this.editingCommentContent,
        userNum,
        isEdited: true
      });
      console.log("댓글 수정 응답:", response.data);
      const updatedCommentIndex = this.comments.findIndex(c => c.id === commentId);
      if (updatedCommentIndex !== -1) {
        this.comments[updatedCommentIndex].content = this.editingCommentContent;
        this.comments[updatedCommentIndex].isEdited = true;
      }
      this.editingCommentId = null; // 수정 완료 후 초기화
    } catch (error) {
      console.error("댓글 수정에 실패했습니다:", error);
      alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
    }
  },

    formatDate(date) {
      return new Date(date)
        .toLocaleString('ko-KR', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: 'numeric', 
          minute: '2-digit', 
          second: '2-digit' 
        })
        .replace(/\.\s/g, '.')
        .replace(/,\s/g, ' ')
        .replace(/\.$/, '');
    },



    goBack() {
      console.log('이전 페이지로 이동');
      this.$router.go(-1);
    },
    cancelCommentEdit() {
      this.editingCommentId = null; // 수정 취소
    },

    editBoard() {
      console.log('게시글 수정 페이지로 이동:', this.board.id);
      this.$router.push({ name: 'BoardUpdate', params: { id: this.board.id } });
    },

    async confirmDeleteBoard() {
      if (confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
        try {
          const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/delete/${this.board.id}`;
          const response = await axios.get(apiUrl);

          if (response.data && response.data.status_message === "게시물이 성공적으로 삭제되었습니다.") {
            alert(response.data.status_message);
            this.$router.push({ name: 'BoardList', params: { category: this.board.category } });
          } else {
            alert('게시물 삭제 중 문제가 발생했습니다.');
          }
        } catch (error) {
          console.error('게시물 삭제에 실패했습니다:', error);
          alert('게시물 삭제에 실패했습니다. 다시 시도해주세요.');
        }
      }
    },

    editComment(comment) {
      this.editingCommentId = comment.id;          // 수정 중인 댓글 ID 설정
      this.editingCommentContent = comment.content; // 수정 중인 댓글 내용 초기화
    },

    async deleteComment(commentId) {
      if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        const userNum = this.userProfile.userNum;
        try {
          const response = await axios.get(`/comment/delete/${commentId}`, {
            params: { userNum }
          });

          if (response.data.includes('성공적으로 삭제되었습니다')) {
            this.comments = this.comments.filter(comment => comment.id !== commentId);
            alert("댓글이 성공적으로 삭제되었습니다.");
          } else {
            alert(`댓글 삭제에 실패했습니다. 서버에서 오류가 발생했습니다.`);
          }
        } catch (error) {
          console.error("댓글 삭제에 실패했습니다:", error);
          alert(`댓글 삭제에 실패했습니다. 오류 메시지: ${error.message}`);
        }
      }
    },

    isImage(fileType) {
      return fileType.includes('image/');
    },

    downloadFile(fileUrl, fileName) {
      try {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('파일 다운로드에 실패했습니다:', error);
        alert('파일 다운로드에 실패했습니다. 다시 시도해주세요.');
      }
    },

    toggleCommentsVisibility() {
      this.showComments = !this.showComments;
    },
  }
};
</script>

<style scoped>
.board-container {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
}

.board-title {
  margin-bottom: 20px;
  color: #000;
}

.meta-info-section {
  font-size: 0.9rem;
  color: #777;
}

.board-body {
  width: 100%;
  max-width: 800px;
  min-height: 400px;
  height: auto;
  padding: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.tag-section {
  margin-top: 20px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.file-list-section {
  background-color: #ffffff;
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
  width: 100%;
  max-width: 900px;
}

.comment-item {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  position: relative;
}

.comment-content {
  display: flex;
  flex-direction: column;
}

/* 프로필, 이름, 작성일, 수정/삭제 버튼을 한 줄에 배치 */
.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-name {
  font-size: 0.9rem;
  font-weight: bold;
  color: #333;
}

/* 작성일을 이름 밑에 배치 */
.comment-date {
  font-size: 0.8rem;
  color: #777;
  margin-top: 0.5px;
}

/* 수정/삭제 버튼을 오른쪽 끝에 배치 */
.action-links {
  position: absolute;
  bottom: 10px; /* 아래쪽 여백 */
  right: 10px;  /* 오른쪽 여백 */
  display: flex;
  gap: 10px;
}
.action-link {
  cursor: pointer;
  font-size: 0.8rem;
  color: #555;
  display: block; /* 클릭 범위를 넓히기 위해 block으로 설정 */
}

.action-link.delete {
  color: red;
}

.action-link:hover {
  color: #333;
}

/* 댓글 내용 */
.comment-text {
  font-size: 1rem;
  color: #333;
  margin-top: 10px;
  max-width: 90%; 
  word-break: break-word; /* 긴 단어가 있을 때 줄 바꿈 처리 */
}

.comment-form {
  margin-top: 20px;
  width: 100%;
  max-width: 1200px;
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

.comment-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-info {
  display: flex;
  flex-direction: column; /* 이름과 작성일을 세로로 배치 */
}

</style>