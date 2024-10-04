<template>
  <v-container class="mt-5">
    <v-card>
      <v-card-title>
        <h3>게시글 수정</h3>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submitForm">
          <!-- 제목 -->
          <v-text-field
            label="제목"
            v-model="title"
            required
            outlined
            dense
          />

          <!-- 내용 -->
          <v-textarea
            label="내용"
            v-model="content"
            rows="5"
            required
            outlined
            dense
          />

        
          <!-- 상단 고정 여부 -->
          <v-checkbox
            v-model="isPinned"
            label="상단 고정"
            class="my-2"
          />

          <!-- 파일 선택 -->
          <v-file-input
            v-model="files"
            label="파일 첨부"
            accept=".png, .jpg, .jpeg, .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .zip"
            multiple
            outlined
            dense
          />

          <!-- 기존 파일 목록 표시 및 다운로드 -->
          <div v-if="existingFiles.length > 0" class="mt-3">
            <h4>첨부 파일</h4>
            <v-list>
              <v-list-item
                v-for="(file, index) in existingFiles"
                :key="index"
                @click="downloadFile(file.filePath, file.fileName)"
              >
                <v-row>
                  <v-col>
                    <span>{{ file.fileName }}</span>
                  </v-col>
                  <v-col class="d-flex justify-end">
                    <v-btn icon @click.stop="removeFile(index)">
                      <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </div>

          <v-btn type="submit" color="primary" class="mt-3">저장</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      title: '',
      content: '',
      category: '', // 현재 카테고리 정보
      isPinned: false, // 상단 고정 여부
      files: [], // 새로 업로드된 파일들
      existingFiles: [], // 기존에 등록된 파일들
      previewImageSrc: null,
      categoryOptions: [
        { text: '공지사항', value: 'NOTICE' },
        { text: '경조사', value: 'FAMILY_EVENT' },
      ]
    };
  },
  created() {
    this.fetchPostDetail(); // 컴포넌트 생성 시 기존 게시글 정보 로드
  },
  methods: {
    async fetchPostDetail() {
      try {
        const postId = this.$route.params.id;
        const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/detail/${postId}`;
        const response = await axios.get(apiUrl);
        const post = response.data.result;

        // 게시글의 기존 정보를 데이터에 설정
        this.title = post.title;
        this.content = post.content;
        this.category = post.category || 'NOTICE';
        this.isPinned = post.isPinned || false;
        this.existingFiles = post.files || []; // 기존 파일 목록 설정
      } catch (error) {
        console.error('게시글을 불러오는 데 실패했습니다:', error);
        alert('게시글을 불러오는 데 실패했습니다.');
      }
    },
    async submitForm() {
  try {
    const formData = new FormData();
    formData.append('title', this.title);
    formData.append('content', this.content);
    formData.append('category', this.category); 
    formData.append('isPinned', this.isPinned);

    // 파일 정보 추가
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

    // BoardList 페이지로 이동하면서 category 파라미터를 전달
    this.$router.push({ name: 'BoardList', params: { category: this.category } });
  } catch (error) {
    console.error('게시글을 수정하는 데 실패했습니다:', error);
    alert('게시글 수정에 실패했습니다.');
  }
}
,
    async downloadFile(filePath, fileName) {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/file/download`, {
          params: { filePath },
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('파일 다운로드에 실패했습니다.', error);
      }
    },
    removeFile(index) {
      this.existingFiles.splice(index, 1);
    }
  }
};
</script>

<style scoped>
.v-container {
  max-width: 600px;
  margin: auto;
}
.my-3 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
