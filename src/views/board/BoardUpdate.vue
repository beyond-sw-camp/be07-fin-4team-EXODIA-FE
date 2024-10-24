<template>
  <v-container class="mt-5 board-container">
    <v-card>
      <v-card-title>
        <h3 class="board-title">게시글 수정</h3>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submitForm">
          <!-- 제목 -->
          <v-text-field label="제목" v-model="title" required outlined dense />

          <!-- 내용 -->
          <v-textarea label="내용" v-model="content" rows="5" required outlined dense />


          <!-- 파일 선택 -->
          <v-file-input v-model="files" label="파일 첨부"
            accept=".png, .jpg, .jpeg, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .zip" multiple outlined
            dense />

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
            <!-- 고정 체크박스: 카테고리가 FAMILY_EVENT가 아닐 때만 표시 -->
            <v-checkbox v-if="currentCategory !== 'FAMILY_EVENT'" v-model="isPinned" label="중요" class="mr-4" />

            <v-btn v-create type="submit" class="ml-4">저장</v-btn>
            <v-btn v-delete text @click="cancel">취소</v-btn>
          </div>

        </v-form>
      </v-card-text>
    </v-card>

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
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  props: ['category'], // 부모 컴포넌트에서 전달된 category를 props로 받음
  data() {
    return {
      title: '',
      content: '',
      currentCategory: '', // 현재 카테고리 정보
      isPinned: false, // 상단 고정 여부
      files: [], // 새로 업로드된 파일들
      existingFiles: [], // 기존에 등록된 파일들
      tags: [], // 태그 목록
      selectedTags: [], // 선택된 태그 목록
      showTagModal: false, // 태그 추가 모달 상태
      newTagName: '', // 새로운 태그 이름
    };
  },
  watch: {
    // props로 전달된 category가 변경될 때마다 currentCategory를 업데이트
    category(newCategory) {
      this.currentCategory = newCategory;
    }
  },
  created() {
    // 초기화 시 props로 전달된 category를 currentCategory에 설정
    this.currentCategory = this.category || 'NOTICE';
    this.fetchPostDetail(); // 컴포넌트 생성 시 기존 게시글 정보 로드
    this.fetchTags(); // 태그 목록 로드
  },
  methods: {
    async fetchPostDetail() {
      try {
        const postId = this.$route.params.id;
        const userNum = localStorage.getItem('userNum');

        if (!userNum) {
          console.warn("userNum 값이 설정되지 않았습니다.");
          alert("로그인 정보가 확인되지 않습니다. 다시 로그인해주세요.");
          return;
        }

        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/board/detail/${postId}`, {
          params: { userNum }
        });

        const post = response.data.result;

        // 게시글 데이터를 Vue 컴포넌트의 상태로 설정
        this.title = post?.title || '';
        this.content = post?.content || '';
        this.currentCategory = post?.category || 'NOTICE';
        this.isPinned = post?.isPinned || false;
        this.existingFiles = post?.files || [];
      } catch (error) {
        console.error("게시글을 불러오는 데 실패했습니다:", error);
        alert('게시글을 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    async fetchTags() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/tags/list`);
        this.tags = response.data.result;
      } catch (error) {
        console.error('태그 목록을 불러오는 데 실패했습니다:', error);
        alert('태그 목록을 불러오는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },
    cancel() {
      this.$router.go(-1);
    },

    // 태그 추가 모달 열기
    openTagModal() {
      this.newTagName = '';
      this.showTagModal = true;
    },

    // 태그 추가 모달 닫기
    closeTagModal() {
      this.showTagModal = false;
    },

    // 새로운 태그 추가하기
    async addNewTag() {
      if (!this.newTagName.trim()) {
        alert('새로운 태그 이름을 입력해주세요.');
        return;
      }

      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/tags/create`, {
          tag: this.newTagName.trim(),
        });

        // 새로 추가된 태그를 태그 목록에 추가
        this.tags.push(response.data.result);
        this.selectedTags.push(response.data.result.id);
        this.closeTagModal();
      } catch (error) {
        console.error('태그 추가에 실패했습니다:', error);
        alert('새 태그를 추가하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 태그 선택/해제 토글
    toggleTagSelection(tagId) {
      const index = this.selectedTags.indexOf(tagId);
      if (index === -1) {
        this.selectedTags.push(tagId);
      } else {
        this.selectedTags.splice(index, 1);
      }
    },

    // 태그 삭제
    async removeTag(tagId) {
      if (!tagId) {
        console.error('tagId가 유효하지 않습니다.');
        return;
      }
      try {
        await axios.delete(`${process.env.VUE_APP_API_BASE_URL}/tags/delete/${tagId}`);
        this.tags = this.tags.filter(tag => tag.id !== tagId); // 태그 목록에서 삭제
        alert('태그가 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('태그 삭제에 실패했습니다:', error);
        alert('태그를 삭제하는 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    },

    // 게시글 수정 시 태그와 함께 폼 제출
    async submitForm() {
      try {
        const formData = new FormData();
        formData.append('title', this.title);
        formData.append('content', this.content);
        formData.append('category', this.currentCategory);
        formData.append('isPinned', this.isPinned);
        formData.append('userNum', localStorage.getItem('userNum'));
        formData.append('tagIds', this.selectedTags); // 선택된 태그 ID 추가

        if (this.files && this.files.length > 0) {
          this.files.forEach((file) => formData.append('files', file));
        }

        const postId = this.$route.params.id;
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/update/${postId}`;

        await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        alert('게시글이 성공적으로 수정되었습니다.');
        this.$router.push({ name: 'BoardList', params: { category: this.currentCategory } });
      } catch (error) {
        console.error('게시글을 수정하는 데 실패했습니다:', error);
        alert('게시글 수정 중 문제가 발생했습니다. 다시 시도해주세요.');
      }
    }
  }
};
</script>


<style scoped>
.board-container {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 12px;
}

.board-title {
  margin-bottom: 20px;
  color: #000;
}

.v-select,
.v-text-field {
  flex: none;
  width: auto;
  margin-right: 20px;
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

/* 태그 버튼 및 삭제 스타일 */
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
  min-width: 100px;
  text-align: center;
}

.rounded-button {
  border-radius: 20px;
  padding: 10px 20px;
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

.btn-right {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.btnWrap {
  display: flex;
  justify-content: flex-end;
  /* 오른쪽 정렬 */
  gap: 10px;
  /* 버튼 간의 간격 */
}
</style>
