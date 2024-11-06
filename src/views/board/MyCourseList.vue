<template>
  <MypageTemplate>
    <template #myCourseList>
      <v-container class="container">

        <v-row class="mb-12 mt-4" style="padding-left:30px">
          <h1>신청한 강좌 목록</h1>
        </v-row>

        <!-- 강좌 리스트 헤더 -->
        <v-row class="mb-2 header-row"
          style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:4px; color:#444444; font-weight:400; ">
          <v-col class="header-col" cols="1"></v-col>
          <v-col class="header-col" cols="2"><strong>강좌명</strong></v-col>
          <v-col class="header-col" cols="2"><strong>신청일</strong></v-col>
          <v-col class="header-col" cols="3"><strong>URL</strong></v-col>
          <v-col class="header-col" cols="2"><strong>전송 여부</strong></v-col>
          <v-col class="header-col" cols="1"><strong>작업</strong></v-col>
        </v-row>

        <!-- 강좌 리스트 내용 -->
        <v-row v-for="(course, index) in myRegistrations" :key="index" class="course-row" outlined
          style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:300; align-items: center;">
          <v-col cols="1"></v-col>
          <v-col class="content-col text-truncate" cols="2">{{ course.courseName }}</v-col>
          <v-col class="content-col" cols="2">{{ formatDate(course.createdAt) }}</v-col>
          <v-col class="content-col text-truncate" cols="3" style="margin-right: 90px;">{{ course.courseUrl }}</v-col>
          <v-col class="content-col" cols="2" >{{ course.transmitted ? '전송됨' : '전송되지 않음' }}</v-col>
          <v-col class="content-col" cols="1">
            <v-btn icon @click.stop="deleteRegistration(course.id)" style="box-shadow: none;">
              <v-icon>mdi-delete</v-icon> <!-- 삭제 아이콘 -->
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </MypageTemplate>
</template>

<script>
import axios from 'axios';
import MypageTemplate from '../mypage/MypageTemplate.vue';
export default {
  components: {
    MypageTemplate,
  },
  data() {
    return {
      myRegistrations: [],
    };
  },
  methods: {
    fetchMyRegistrations() {
      const token = localStorage.getItem("token");
      axios
        .get(`${process.env.VUE_APP_API_BASE_URL}/course/my-registrations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          this.myRegistrations = response.data;
        })
        .catch((error) => {
          console.error("강좌 목록을 불러오는 데 실패했습니다: ", error);
        });
    },
    deleteRegistration(registrationId) {
      const token = localStorage.getItem("token");
      axios
        .delete(`${process.env.VUE_APP_API_BASE_URL}/course/my-registrations/${registrationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          this.myRegistrations = this.myRegistrations.filter(
            (course) => course.id !== registrationId
          );
        })
        .catch((error) => {
          console.error("강좌 삭제에 실패했습니다: ", error);
        });
    },
    formatDate(date) {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(date).toLocaleDateString(undefined, options);
    },
  },
  mounted() {
    this.fetchMyRegistrations();
  },
};
</script> 

<style scoped>
.header-row {
  margin-bottom: 10px;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  display: inline-block;
  vertical-align: middle;
}

.course-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.course-row:hover {
  background-color: #f0f0f0;
}

.mb-2 {
  margin-bottom: 20px;
}
</style>
