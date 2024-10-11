<template>
  <v-container class="mt-5">
    <v-card>
      <v-card-title>
        <h3>글쓰기</h3>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="submitForm">
          <!-- 게시판 선택 -->
          <v-select
            v-model="selectedCategory"
            :items="categories"
            item-text="title"
            item-value="value"
            label="게시판 선택"
            required
          ></v-select>

          <!-- 제목 -->
          <v-text-field
            label="제목"
            v-model="title"
            required
          />

          <!-- 내용 -->
          <v-textarea
            label="내용"
            v-model="content"
            rows="10"
            required
          />

          <!-- 파일 첨부 -->
          <v-file-input
            v-model="files"
            label="파일첨부"
            accept="image/*, application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
          />

          <div class="btnWrap">
            <v-btn text @click="cancel">취소</v-btn>
            <v-btn color="primary" type="submit" class="ml-4">저장</v-btn>
          </div>
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
      files: [], // 파일 배열
      selectedCategory: null,
      categories: [
        { value: 'NOTICE', title: '공지사항' },
        { value: 'FAMILY_EVENT', title: '경조사' },
      ], // 게시판 목록을 저장할 배열
      userNum: localStorage.getItem('userNum'), // 로컬스토리지에서 userNum 가져오기
      departmentId: localStorage.getItem('departmentId') // 로컬스토리지에서 departmentId 가져오기
    };
  },
  props: ['category'],
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

  const formData = new FormData();
  formData.append('title', this.title);
  formData.append('content', this.content);
  formData.append('category', this.selectedCategory); // 선택된 카테고리를 formData에 추가
  formData.append('userNum', this.userNum); // 사용자 사번 추가

  // 파일 배열을 FormData에 추가
  if (this.files && this.files.length > 0) {
    this.files.forEach((file) => {
      formData.append('files', file); // 'files'라는 키로 파일을 추가
    });
  }

  try {
    const apiUrl = `${process.env.VUE_APP_API_BASE_URL}/board/create`; // 서버 URL 수정
    const response = await axios.post(apiUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Bearer 토큰 추가
      },
    });
    console.log('저장 성공:', response.data);

    // 작성 완료 후 카테고리별로 다른 페이지로 이동
    if (this.selectedCategory === 'NOTICE') {
      this.$router.push({ path: '/board/notice/list' });
    } else if (this.selectedCategory === 'FAMILY_EVENT') {
      this.$router.push({ path: '/board/familyevent/list' });
    } else {
      // 기본 BoardList 페이지로 이동 (예비 처리)
      this.$router.push({ name: 'BoardList' });
    }
  } catch (error) {
    console.error('저장 실패:', error.response?.data || '서버와의 통신에 실패했습니다.');
    alert('게시글 저장에 실패했습니다.');
  }
}
,
    cancel() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.v-container {
  max-width: 800px;
  margin: auto;
}
.btnWrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
.my-3 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
