<template>
  <v-container class="mt-5 board-container" fluid>
    <!-- 질문 상세보기 카드 -->
    <div class="pa-4 mb-5" v-if="questionDetail">
      <h3 class="text-h5 font-weight-bold">
        {{ questionDetail.title }}
      </h3>

      <!-- 작성자 정보 한 줄로 나열 -->
      <div class="pa-3 meta-info-inline d-flex justify-space-between align-center mb-3">
        <div>
          <p>
            <strong>작성자:</strong> {{ questionDetail.anonymous ? '익명' : questionDetail.questionUserName }}
            | <strong>문의 부서:</strong> {{ questionDetail.departmentName }}
            | <strong>작성 시간:</strong> {{ formatDate(questionDetail.createdAt) }}
            <span v-if="questionDetail.updatedAt"> 
              | <strong>수정 시간:</strong> {{ formatDate(questionDetail.updatedAt) }}
            </span>
          </p>
        </div>
        <div>
          <!-- 수정 및 답변하기 버튼 -->
          <v-btn v-edit class="mr-2" v-if="isQuestionAuthor" @click="goToEditQuestion" small>
            수정
          </v-btn>
          <v-btn v-create v-if="!questionDetail.answerText" @click="goToAnswerPage" small>
            답변하기
          </v-btn>
        </div>
      </div>

      <v-divider></v-divider> <!-- 상단 구분선 -->

      <!-- 질문 내용 -->
      <div class="board-body">
        <p class="text-body-1">{{ questionDetail.questionText }}</p>
      </div>

      <!-- 질문자 파일 목록 섹션 -->
      <div v-if="questionDetail.qfiles && questionDetail.qfiles.length > 0" class="file-list-section mb-5">
        <h3 class="section-title">질문자 첨부 파일</h3>
        <div class="file-grid">
          <div v-for="file in questionDetail.qfiles" :key="file.id" class="file-item">
            <v-img v-if="isImage(file.fileType)" :src="file.filePath" class="file-preview" alt="file image" />
            <a :href="file.filePath" target="_blank" @click.prevent="downloadFile(file.filePath, file.fileName)">
              {{ file.fileName }}
            </a>
          </div>
        </div>
      </div>

      <v-divider></v-divider> <!-- 질문과 답변 구분선 -->
      <p v-if="questionDetail.answeredAt" class="meta-info-section mt-2">
        <strong>답변자:</strong> {{ questionDetail.answerUserName }} | <strong>답변 시간:</strong> {{ formatDate(questionDetail.answeredAt) }}
      </p>
      
      <!-- 답변 내용 및 수정 버튼 -->
      <div v-if="questionDetail.answerText" class="board-body" style="background-color: transparent;">
        <div class="d-flex justify-space-between align-center mb-3">
          <div>
            <!-- 답변 내용 -->
            <p class="text-body-1">{{ questionDetail.answerText }}</p>
          </div>
          <!-- 답변 작성자와 현재 로그인된 유저가 동일할 경우 수정 버튼 표시 -->
          <v-btn v-edit v-if="isAnswerAuthor" class="btn_solid" @click="goToEditAnswer" small>
            수정
          </v-btn>
        </div>
      </div>
    </div>

    <!-- 답변자 파일 목록 섹션 -->
    <div v-if="questionDetail.afiles && questionDetail.afiles.length > 0" class="file-list-section mb-5">
      <h3 class="section-title">답변자 첨부 파일</h3>
      <div class="file-grid">
        <div v-for="file in questionDetail.afiles" :key="file.id" class="file-item">
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
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
    return {
      questionDetail: {}, // 빈 객체로 초기화
      newCommentContent: '',
      comments: [], // 빈 배열로 초기화
      isLoggedIn: false,
      error: null,
      userNum: localStorage.getItem('userNum'),
      departmentTree: [],
      userDepartmentId: localStorage.getItem('departmentId'),
      userProfile: {
        userNum: localStorage.getItem('userNum') || '',
        name: '',
        profileImage: ''
      },

      editingCommentId: null, // 수정 중인 댓글 ID
      editingCommentContent: '', // 수정 중인 댓글 내용
    };
  },
  async mounted() {
    this.decodeToken();
    await this.fetchQuestionDetail();
    await this.fetchDepartmentTree();
  },
  computed: {
    isQuestionAuthor() {
      return this.questionDetail && this.questionDetail.questionUserNum === this.userNum;
    },
    isAnswerAuthor() {
      return this.questionDetail && this.questionDetail.answerUserNum === this.userNum;
    },
  },
  methods: {
    decodeToken() {
      this.userNum = localStorage.getItem('userNum');
      this.isLoggedIn = !!this.userNum;
      if (!this.userNum) {
        alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
        this.$router.push('/login');
      }
    },
    async fetchQuestionDetail() {
      const questionId = this.$route.params.id;
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/qna/detail/${questionId}`);
        this.questionDetail = response.data.result;
        console.log("Question Detail Data:", this.questionDetail); // 데이터를 콘솔로 확인
        this.comments = response.data.result.comments || [];
      } catch (error) {
        this.error = error.response ? error.response.data.message : '질문 정보를 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.';
        alert(this.error);
      }
    },

    async fetchDepartmentTree() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/department/hierarchy`);
        this.departmentTree = response.data;
      } catch (error) {
        console.error('부서 트리를 가져오는 중 오류가 발생했습니다:', error);
        alert('부서 정보를 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },
    async goToAnswerPage() {
      const departmentId = this.questionDetail.departmentId;
      try {
        const managerResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/manager/is-manager/${this.userNum}`);
        
        if (managerResponse.data) {
          const isDepartmentValid = this.checkDepartmentPermission(departmentId, Number(this.userDepartmentId));
          if (isDepartmentValid) {
            const questionId = this.$route.params.id;
            this.$router.push(`/qna/answer/${questionId}`);
          } else {
            alert('해당 문의 부서 또는 상위 부서의 매니저만 답변할 수 있습니다.');
          }
        } else {
          alert('매니저 권한이 필요합니다.');
        }
      } catch (error) {
        console.error('매니저 확인 중 오류가 발생했습니다:', error);
        alert('매니저 권한을 확인하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },
    checkDepartmentPermission(targetDeptId, userDeptId) {
      if (targetDeptId === userDeptId) return true;

      const departmentMap = {};
      const mapDepartments = (departments) => {
        departments.forEach(department => {
          departmentMap[department.id] = department.parentId || null;
          if (department.children && department.children.length) {
            mapDepartments(department.children);
          }
        });
      };
      mapDepartments(this.departmentTree);

      let currentParent = departmentMap[targetDeptId];
      while (currentParent) {
        if (currentParent === userDeptId) {
          return true;
        }
        currentParent = departmentMap[currentParent];
      }
      return false;
    },
    goToEditQuestion() {
      this.$router.push(`/qna/update/question/${this.$route.params.id}`);
    },
    goToEditAnswer() {
      const questionId = this.$route.params.id;
      this.$router.push(`/qna/update/answer/${questionId}`);
    },
    async submitComment() {
      if (!this.newCommentContent.trim()) {
        alert('댓글 내용을 입력해주세요.');
        return;
      }
      const qnaId = this.$route.params.id;
      const newComment = {
        content: this.newCommentContent,
        question_id: qnaId,
        userNum: this.userNum,
      };
      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/comment/create`, newComment);
        this.newCommentContent = '';
        this.fetchQuestionDetail();
        alert('댓글이 성공적으로 등록되었습니다.');
      } catch (error) {
        alert('댓글 작성에 실패했습니다. 다시 시도해주세요.');
      }
    },

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
    async deleteComment(commentId) {
      if (confirm("이 댓글을 삭제하시겠습니까?")) {
        try {
          await axios.get(`${process.env.VUE_APP_API_BASE_URL}/comment/delete/${commentId}`, {
            params: { userNum: this.userNum }
          });
          alert("댓글이 삭제되었습니다.");
          this.fetchQuestionDetail();
        } catch (error) {
          alert('댓글 삭제에 실패했습니다. 다시 시도해주세요.');
        }
      }
    },
    editComment(comment) {
      this.editingCommentId = comment.id;          // 수정 중인 댓글 ID 설정
      this.editingCommentContent = comment.content; // 수정 중인 댓글 내용 초기화
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
  
    async created() {
      this.decodeToken();
      this.fetchQuestionDetail();
      await this.fetchDepartmentTree();
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
    }
  }
};
</script>

<style scoped>
.board-container {
  padding: 20px;
}

.meta-info-section {
  font-size: 0.9rem;
  color: #777;
}

.board-body {
  width: 100%;
  max-width: 1500px;
  min-height: 400px;
  padding: 20px;
  border-radius: 8px;
  overflow: hidden;
}

.board-container {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 12px;
}

.comment-section {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  width: 100%;
  max-width: 900px;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
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

.comment-meta {
  display: flex;
  align-items: center;
  gap: 10px;
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
.comment-text {
  font-size: 1rem;
  color: #333;
  margin-top: 10px;
  max-width: 90%;
  word-break: break-word;
}

.comment-form {
  margin-top: 20px;
  width: 100%;
  max-width: 1200px;
}


.action-links {
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
}

.action-link {
  cursor: pointer;
  font-size: 0.8rem;
  color: #555;
}

.action-link.delete {
  color: red;
}

.action-link:hover {
  color: #333;
}

.comment-date {
  font-size: 0.8rem;
  color: #777;
  margin-top: 0.5px;
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

.user-info {
  display: flex;
  flex-direction: column; /* 이름과 작성일을 세로로 배치 */
}

</style>
