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
  props: ['category'], // 부모 컴포넌트에서 전달된 category를 props로 받음
  data() {
    return {
      title: '',
      content: '',
      currentCategory: '', // 현재 카테고리 정보 (props로 전달된 category와 구분)
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
  },
  methods: {
    async fetchPostDetail() {
      try {
        const postId = this.$route.params.id; // 게시글 ID를 라우트에서 가져오기
        const userNum = localStorage.getItem('userNum');  // 사용자 번호를 localStorage에서 가져오기

        // userNum이 없는 경우, 요청을 보내지 않고 경고 메시지 출력
        if (!userNum) {
          console.warn("userNum 값이 설정되지 않았습니다. localStorage를 확인하세요.");
          alert("사용자 번호가 설정되지 않았습니다. 로그인을 확인해주세요.");
          return;
        }

        // 로그로 userNum 출력
        console.log("사용자 번호 (userNum):", userNum);
        console.log("게시글 ID:", postId);

        // 서버 요청 시 userNum을 쿼리 파라미터로 포함
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/board/detail/${postId}`, {
          params: { userNum }  // userNum 파라미터 포함
        });

        console.log("서버 응답 데이터:", response.data);
        const post = response.data.result;

        // 게시글 데이터를 Vue 컴포넌트의 상태로 설정
        this.title = post.title;
        this.content = post.content;
        this.currentCategory = post.category || 'NOTICE';
        this.isPinned = post.isPinned || false;
        this.existingFiles = post.files || [];

      } catch (error) {
        if (error.response) {
          console.error("서버 응답 오류:", error.response.status, error.response.data);
        } else if (error.request) {
          console.error("서버에 요청이 전달되지 않았습니다. 요청:", error.request);
        } else {
          console.error("요청 설정 중 오류가 발생했습니다.", error.message);
        }
        alert('게시글을 불러오는 데 실패했습니다.');
      }
    },
    async submitForm() {
      try {
        const formData = new FormData();
        formData.append('title', this.title);
        formData.append('content', this.content);
        formData.append('category', this.currentCategory); // 현재 카테고리 값을 사용
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
        this.$router.push({ name: 'BoardList', params: { category: this.currentCategory } });
      } catch (error) {
        console.error('게시글을 수정하는 데 실패했습니다:', error);
        alert('게시글 수정에 실패했습니다.');
      }
    },
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
