<template>
  <div class="write-container">
    <h3 class="write-title">게시글 작성</h3>

    <v-form ref="form" @submit.prevent="submitForm" class="write-form">
      <v-row>
        <!-- 카테고리를 URL에 따라 표시 -->
        <v-col cols="3">
          <!-- 카테고리를 URL에서 전달받아 고정 표시 -->
          <v-text-field v-model="categoryLabel" label="게시판" readonly solo flat hide-details class="category-label" />
        </v-col>

        <!-- 제목 -->
        <v-col cols="9">
          <v-text-field v-model="title" placeholder="제목을 입력하세요." solo flat hide-details class="title-input" dense />
        </v-col>
      </v-row>

      <!-- 내용 (에디터 툴바 및 내용 필드) -->
      <div class="editor-toolbar">
        <v-toolbar flat dense>
          <v-btn icon @click="formatText('bold')">
            <v-icon>mdi-format-bold</v-icon>
          </v-btn>
          <v-btn icon @click="formatText('italic')">
            <v-icon>mdi-format-italic</v-icon>
          </v-btn>
          <v-btn icon @click="formatText('underline')">
            <v-icon>mdi-format-underline</v-icon>
          </v-btn>
          <v-btn icon @click="formatText('justifyLeft')">
            <v-icon>mdi-format-align-left</v-icon>
          </v-btn>
          <v-btn icon @click="formatText('justifyCenter')">
            <v-icon>mdi-format-align-center</v-icon>
          </v-btn>
          <v-btn icon @click="formatText('justifyRight')">
            <v-icon>mdi-format-align-right</v-icon>
          </v-btn>
          <v-btn icon @click="formatText('insertUnorderedList')">
            <v-icon>mdi-format-list-bulleted</v-icon>
          </v-btn>
          <v-btn icon @click="formatText('insertOrderedList')">
            <v-icon>mdi-format-list-numbered</v-icon>
          </v-btn>
        </v-toolbar>
      </div>

      <!-- 내용 입력 필드 -->
      <div id="editor" class="content-input" contenteditable="true"></div>

      <!-- 파일 첨부 -->
      <v-file-input v-model="files" label="파일첨부"
        accept="image/*, application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        multiple flat />

      <!-- 태그 선택 버튼 -->
      <v-row>
        <v-col cols="12">
          <div class="tag-buttons">
            <!-- 태그 추가 버튼 -->
            <v-btn class="tag-button rounded-button" outlined @click="openTagModal">
              + <!-- 태그 추가 버튼 표시 -->
            </v-btn>

            <!-- 기존 태그들 -->
            <div v-for="tag in tags" :key="tag.id" class="tag-wrapper">
              <v-btn :class="{ 'selected-tag': selectedTags.includes(tag.id) }" @click="toggleTagSelection(tag.id)"
                outlined class="tag-button rounded-button">
                {{ tag.tag }}
              </v-btn>
              <!-- 태그 삭제 버튼 (X 버튼) -->
              <v-btn icon @click="removeTag(tag.id)" class="remove-tag-btn">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- 고정 여부 체크박스, 취소 및 저장 버튼 -->
      <div class="btnWrap">
        <v-checkbox v-if="selectedCategory !== 'FAMILY_EVENT'" v-model="isPinned" label="중요" class="mr-4" />
        <v-btn v-create type="submit" class="ml-4">등록</v-btn>
        <v-btn v-delete @click="cancel">취소</v-btn>

      </div>
    </v-form>

    <!-- 태그 추가 모달 -->
    <v-dialog v-model="showTagModal" max-width="400">
      <v-card>
        <v-card-title>새로운 태그 추가</v-card-title>
        <v-card-text>
          <v-text-field v-model="newTagName" label="태그 이름" placeholder="태그 이름을 입력하세요" solo></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-create @click="addNewTag">저장</v-btn>
          <v-btn v-delete text @click="closeTagModal">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      title: '', // 제목
      files: [], // 파일
      isPinned: false, // 고정 여부
      selectedCategory: '', // 선택된 카테고리
      selectedTags: [], // 선택된 태그들
      categoryLabel: '', // 카테고리 레이블 (공지사항, 경조사)
      tags: [], // 태그 목록
      userNum: localStorage.getItem('userNum'), // 유저 번호
      departmentId: localStorage.getItem('departmentId'), // 부서 아이디
      showTagModal: false, // 태그 추가 모달 상태
      newTagName: '', // 새로운 태그 이름
      titleMaxLength: 100, // 제목 최대 길이
      contentMaxLength: 30000, // 내용 최대 길이
    };
  },
  mounted() {
    this.setCategoryFromUrl(); // URL에서 카테고리 설정
    this.checkUserRole(); // 유저 권한 확인
    this.fetchTags(); // 태그 목록 불러오기
  },
  methods: {
    // URL에서 카테고리 값을 가져와 설정
    setCategoryFromUrl() {
      try {
        const currentCategory = this.$route.params.category;

        if (currentCategory === 'notice') {
          this.selectedCategory = 'NOTICE';
          this.categoryLabel = '공지사항';
        } else if (currentCategory === 'familyevent') {
          this.selectedCategory = 'FAMILY_EVENT';
          this.categoryLabel = '경조사';
        } else {
          alert('잘못된 페이지입니다. 올바른 경로로 접근해주세요.');
        }
      } catch (error) {
        console.error('카테고리 설정 중 오류 발생:', error);
        alert('카테고리 설정 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },
    
    async removeTag(tagId) {
      console.log("태그 삭제 요청: ", tagId);
      try {
        const response = await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/tags/delete/${tagId}`);
        console.log("태그 삭제 응답: ", response.data);

        if (response.status === 200) {
          // 태그 목록과 선택된 태그 배열에서 삭제
          this.tags = this.tags.filter(tag => tag.id !== tagId);
          this.selectedTags = this.selectedTags.filter(id => id !== tagId);
          console.log("현재 선택된 태그: ", this.selectedTags); // 배열 업데이트 후 로그 확인
        } else {
          alert("태그 삭제에 실패했습니다.");
        }
      } catch (error) {
        console.error("태그 삭제 중 오류 발생: ", error);
        alert("태그 삭제에 실패했습니다.");
      }
    },


    toggleTagSelection(tagId) {
      const index = this.selectedTags.indexOf(tagId);
      if (index === -1) {
        // 배열이 업데이트되는 과정을 명확하게 보여줌
        this.selectedTags = [...this.selectedTags, tagId];
      } else {
        this.selectedTags = this.selectedTags.filter(id => id !== tagId);
      }
      console.log("태그 선택 후 현재 선택된 태그: ", this.selectedTags);
    },


    // 유저가 관리자 권한을 갖고 있는지 확인
    checkUserRole() {
      try {
        if (!this.userNum || !this.departmentId) {
          alert('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
          this.$router.push('/login');
        }
      } catch (error) {
        console.error('권한 확인 중 오류 발생:', error);
        alert('사용자 권한을 확인하는 중 문제가 발생했습니다. 다시 로그인해주세요.');
      }
    },

    // 백엔드로부터 태그 목록을 가져옴
    async fetchTags() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/tags/list`);
        this.tags = response.data.result;
      } catch (error) {
        console.error('태그 목록을 불러오는 데 실패했습니다:', error);
        alert('태그 목록을 불러오는 중 문제가 발생했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
      }
    },

    // 제목과 내용의 길이 확인
    validateForm() {
      if (this.title.length > this.titleMaxLength) {
        alert(`제목은 최대 ${this.titleMaxLength}자까지 입력 가능합니다. 현재 ${this.title.length}자입니다.`);
        return false;
      }

      const content = document.getElementById('editor').innerHTML;
      if (content.length > this.contentMaxLength) {
        alert(`내용은 최대 ${this.contentMaxLength}자까지 입력 가능합니다. 현재 ${content.length}자입니다.`);
        return false;
      }

      return true;
    },

    // 태그 추가 모달 열기
    openTagModal() {
      try {
        this.newTagName = '';
        this.showTagModal = true;
      } catch (error) {
        console.error('태그 추가 모달을 여는 중 오류 발생:', error);
        alert('태그 추가 창을 여는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 태그 추가 모달 닫기
    closeTagModal() {
      try {
        this.showTagModal = false;
      } catch (error) {
        console.error('태그 추가 모달을 닫는 중 오류 발생:', error);
        alert('태그 추가 창을 닫는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 새로운 태그 추가하기
    async addNewTag() {
      if (!this.newTagName.trim()) {
        alert('태그 이름을 입력해주세요.');
        return;
      }

      const existingTag = this.tags.find(tag => tag.tag === this.newTagName.trim());
      if (existingTag) {
        alert('이미 존재하는 태그입니다. 다른 이름을 입력해주세요.');
        return;
      }

      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/tags/create`, {
          tag: this.newTagName.trim(),
        });

        this.tags.push(response.data.result);
        this.selectedTags.push(response.data.result.id);
        this.closeTagModal();
      } catch (error) {
        console.error('태그 추가에 실패했습니다:', error);
        alert('새 태그를 추가하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 폼 제출 처리
    async submitForm() {
      if (!this.validateForm()) {
        return;
      }

      if (this.departmentId !== '4') {
        alert('이 작업은 관리자만 할 수 있습니다.');
        return;
      }

      const content = document.getElementById('editor').innerHTML;

      const formData = new FormData();
      formData.append('title', this.title);
      formData.append('content', content);
      formData.append('category', this.selectedCategory);
      formData.append('userNum', this.userNum);
      formData.append('isPinned', this.isPinned ? 'true' : 'false');
      formData.append('tagIds', this.selectedTags);

      const currentDate = new Date();
      const currentTimeKST = new Date(currentDate.getTime() + 9 * 60 * 60 * 1000).toISOString();
      formData.append('createdTime', currentTimeKST);

      if (this.files && this.files.length > 0) {
        this.files.forEach((file) => {
          formData.append('files', file);
        });
      }

      try {
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/${this.selectedCategory.toLowerCase()}/create`;
        const response = await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const boardId = response.data.result?.id || response.data?.id;
        if (!boardId) {
          alert('게시글을 저장하는 중 문제가 발생했습니다. 다시 시도해주세요.');
          return;
        }

        if (this.isPinned) {
          await this.pinBoard(boardId);
        }

        if (this.selectedCategory === 'NOTICE') {
          this.$router.push({ path: '/board/notice/list' });
        } else if (this.selectedCategory === 'FAMILY_EVENT') {
          this.$router.push({ path: '/board/familyevent/list' });
        } else {
          this.$router.push({ name: 'BoardList' });
        }
      } catch (error) {
        console.error('게시글 저장 실패:', error.response?.data || '서버와의 통신에 실패했습니다.');
        alert('게시글을 저장하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 게시글 상단 고정 처리
    async pinBoard(boardId) {
      try {
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/pin/${boardId}`;
        const response = await axios.post(apiUrl, {
          boardId,
          isPinned: true
        });
        console.log('상단 고정 성공:', response.data);
      } catch (error) {
        console.error('상단 고정 실패:', error.response?.data || '서버와의 통신에 실패했습니다.');
        alert('게시글을 상단에 고정하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 작성 취소 처리
    cancel() {
      try {
        this.$router.go(-1);
      } catch (error) {
        console.error('취소 처리 중 오류 발생:', error);
        alert('작성을 취소하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 에디터에서 텍스트 포맷팅 처리
    formatText(command) {
      try {
        document.execCommand(command, false, null);
      } catch (error) {
        console.error('텍스트 포맷팅 중 오류 발생:', error);
        alert('텍스트 스타일을 적용하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },
  },
};
</script>



<style scoped>
.write-container {
  max-width: 1700px;
  margin: auto;
  padding: 0 10px;
  box-sizing: border-box;
}

.write-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 50px;
}

.write-form {
  margin: auto;
}

.category-label,
.title-input {
  margin: 10px 0;
}

.editor-toolbar {
  margin-bottom: 10px;
}

.content-input {
  min-height: 200px;
  border: 1px solid #ddd;
  margin-bottom: 20px;
  padding: 10px;
  outline: none;
  white-space: pre-wrap;
  overflow-wrap: break-word;
}

/* 태그 선택 버튼 스타일 */
.tag-buttons {
  display: flex;
  flex-wrap: wrap;
}

.tag-wrapper {
  position: relative;
  display: inline-block;
  margin: 5px;
}

.tag-button {
  min-width: 10px;
  text-align: center;
}

/* 둥근 모양 버튼 스타일 */
.rounded-button {
  border-radius: 20px;
  padding:10px;
}

.remove-tag-btn {
  position: absolute !important;
  top: -2px !important;
  right: -2px !important;
  background-color: red !important;
  border-radius: 50% !important;
  color: white !important;
  padding: 0 !important;
  width: 12px !important;
  height: 12px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  font-size: 6px !important;
  line-height: 12px !important;
}

.selected-tag {
  background-color: #007bff;
  color: white;
}

.right-align {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.btnWrap {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>