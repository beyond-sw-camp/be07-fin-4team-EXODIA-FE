<template>
  <div class="write-container">
    <h3 class="write-title">글쓰기</h3>

    <v-form ref="form" @submit.prevent="submitForm" class="write-form">
      <v-row>
        <!-- 게시판 선택 -->
        <v-col cols="3">
          <v-select
            v-model="selectedCategory"
            :items="categories"
            item-text="title"
            item-value="value"
            label="게시판 선택"
            required
            solo
            flat
            hide-details
            class="category-select"
          ></v-select>
        </v-col>

        <!-- 제목 -->
        <v-col cols="9">
          <v-text-field
            v-model="title"
            placeholder="제목을 입력하세요."
            solo
            hide-details
            flat
            class="title-input"
          />
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
      <v-file-input
        v-model="files"
        label="파일첨부"
        accept="image/*, application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        multiple
        flat
      />

      <div class="btnWrap">
        <v-btn text @click="cancel">취소</v-btn>
        <v-btn color="primary" type="submit" class="ml-4">저장</v-btn>
      </div>
    </v-form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      title: '',
      files: [],
      selectedCategory: null,
      categories: [
        { value: 'NOTICE', title: '공지사항' },
        { value: 'FAMILY_EVENT', title: '경조사' },
      ],
      userNum: localStorage.getItem('userNum'),
      departmentId: localStorage.getItem('departmentId'),
    };
  },
  mounted() {
    this.checkUserRole();
  },
  methods: {
    checkUserRole() {
      if (!this.userNum || !this.departmentId) {
        alert('로그인이 필요합니다.');
        this.$router.push('/login');
        return;
      }
    },
    async submitForm() {
      if (this.departmentId !== '4') {
        alert('관리자만 작성할 수 있습니다.');
        return;
      }

      const content = document.getElementById('editor').innerHTML; // 에디터의 내용 가져오기

      const formData = new FormData();
      formData.append('title', this.title);
      formData.append('content', content); // 에디터에서 가져온 HTML을 content로 사용
      formData.append('category', this.selectedCategory);
      formData.append('userNum', this.userNum);

      if (this.files && this.files.length > 0) {
        this.files.forEach((file) => {
          formData.append('files', file);
        });
      }

      try {
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/create`;
        const response = await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        console.log('저장 성공:', response.data);

        if (this.selectedCategory === 'NOTICE') {
          this.$router.push({ path: '/board/notice/list' });
        } else if (this.selectedCategory === 'FAMILY_EVENT') {
          this.$router.push({ path: '/board/familyevent/list' });
        } else {
          this.$router.push({ name: 'BoardList' });
        }
      } catch (error) {
        console.error('저장 실패:', error.response?.data || '서버와의 통신에 실패했습니다.');
        alert('게시글 저장에 실패했습니다.');
      }
    },
    cancel() {
      this.$router.go(-1);
    },
    formatText(command) {
      document.execCommand(command, false, null); // 텍스트 서식 변경을 위한 execCommand
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
  margin-bottom: 100px; /* 간격을 넓히기 위해 margin-bottom을 100px로 설정 */
}

.write-form {
  margin: auto;
}

.category-select,
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

.btnWrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
