<template>
  <v-container class="container">
    <v-row class="mb-12" style="padding-left:30px">
      <!-- style="margin:40px 50px" -->
      <h1 :class="{ 'drawer-open': drawer }">{{ pageTitle || '직원 목록' }}</h1>
    </v-row>

    <!-- 검색 옵션 -->
    <v-row justify="center" style="margin:0; text-align:center;">
      <v-col cols="2">
        <v-select v-model="searchType" :items="searchOptions" item-title="label" variant="underlined" item-value="value"
          label="검색 기준 선택"></v-select>
      </v-col>
      <v-col cols="7">
        <v-text-field v-model="searchQuery" placeholder="검색어를 입력하세요" variant="underlined" @input="performSearch()"
          style="margin-bottom: 20px;" append-icon="mdi-magnify"
          @click:append="performSearch()"></v-text-field>
      </v-col>
    </v-row>

    <v-row justify="end" class="mb-4">
      <v-col class="d-flex justify-end">
        <v-btn v-create @click="goToCreate">직원 생성</v-btn>
      </v-col>
    </v-row>

    <!-- 직원 목록 테이블 -->
    <v-row justify="center" style="margin:0; text-align:center;">
      <v-col cols="12">
        <v-row class="mb-2"
          style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:10px; color:#444444; font-weight:600;">
          <v-col cols="1">번호</v-col>
          <v-col cols="2">사번</v-col>
          <v-col cols="2">부서</v-col>
          <v-col cols="1">이름</v-col>
          <v-col cols="2">직급</v-col>
          <v-col cols="2">입사일</v-col>
          <v-col cols="2">관리</v-col>
        </v-row>
        <v-row v-for="(user, index) in users" :key="user.userNum" @click="viewUser(user)"
          style="border-bottom: 1px solid #e7e4e4; padding:5px; font-weight:500; cursor: pointer;">
          <v-col cols="1">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</v-col>
          <v-col cols="2">{{ user.userNum }}</v-col>
          <v-col cols="2">{{ getDepartmentName(user.departmentId) }}</v-col>
          <v-col cols="1">{{ user.name }}</v-col>
          <v-col cols="2">{{ getPositionName(user.positionId) }}</v-col>
          <v-col cols="2">{{ user.joinDate }}</v-col>
          <v-col cols="2">
            <v-icon color="black" style="font-size: 18px; padding-right: 15px" @click.stop="editUser(user.userNum)">mdi-pencil</v-icon>
            <v-icon color="black" style="font-size: 18px;" @click.stop="openDeleteDialog(user.userNum)">mdi-delete</v-icon>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- 현재 페이지 상태 표시 -->
    <!-- <v-row justify="center">
      <p>현재 페이지: {{ currentPage }} / 총 {{ totalPages }} 페이지</p>
    </v-row> -->

    <!-- 페이징 -->
    <v-row justify="center">
      <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5" always-show></v-pagination>
    </v-row>

    <!-- 삭제 다이얼로그 -->
    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="headline">직원 삭제</v-card-title>
        <v-card-text>
          <v-text-field v-model="adminCode" label="관리자 코드" required type="password"></v-text-field>
          <v-textarea v-model="deleteInfo.reason" label="삭제 사유" required></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-delete @click="confirmDelete">삭제</v-btn>
          <v-btn v-cancel class="green--text" @click="closeDeleteDialog">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  name: "EmployeeManagement",
  data() {
    return {
      users: [],            // 직원 목록
      departments: [],      // 부서 목록
      positions: [],        // 직급 목록
      searchQuery: "",      // 검색어
      searchType: "all",    // 검색 기준 (기본값: 전체)
      searchOptions: [
        { label: "이름", value: "name" },
        { label: "부서", value: "department" },
        { label: "직급", value: "position" },
        { label: "전체", value: "all" },
      ],
      deleteDialog: false,  // 삭제 다이얼로그 상태
      deleteInfo: {
        userNum: "",
        reason: "",
      },
      adminCode: "",            // 관리자 코드
      correctAdminCode: "12341234",
      currentPage: 1,           // 현재 페이지
      itemsPerPage: 10,          // 페이지당 아이템 수
      totalPages: 0,            // 총 페이지 수

      searchResultCurrentPage: 1,
    };
  },
  methods: {
    // async fetchUsers(page = 1) {
    //   try {
    //     const response = await axios.get('/user/list', {
    //       params: { page: page - 1, size: this.itemsPerPage },  // page는 0부터 시작하므로 -1
    //     });
    //     this.users = response.data.users;        // 직원 리스트
    //     this.totalPages = response.data.totalPages;  // 총 페이지 수
    //   } catch (error) {
    //     console.error('직원 목록을 불러오는 중 오류가 발생했습니다:', error);
    //   }
    // },

    async performSearch(page = 1) {
      try {
        const response = await axios.get("/user/search", {
          params: { search: this.searchQuery, searchType: this.searchType, page: page - 1, size: this.itemsPerPage },
        });
        this.users = response.data.users;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        console.error("검색 중 오류가 발생했습니다:", error);
      }
    },

    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.performSearch(page);
      }
    },

    async fetchDepartments() {
      try {
        const response = await axios.get("/department");
        this.departments = response.data;
      } catch (error) {
        console.error("부서 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },
    async fetchPositions() {
      try {
        const response = await axios.get("/positions");
        this.positions = response.data;
      } catch (error) {
        console.error("직급 목록을 불러오는 중 오류가 발생했습니다:", error);
      }
    },
    getDepartmentName(departmentId) {
      const department = this.departments.find((dept) => dept.id === departmentId);
      return department ? department.name : "알 수 없음";
    },
    getPositionName(positionId) {
      const position = this.positions.find((pos) => pos.id === positionId);
      return position ? position.name : "알 수 없음";
    },

    viewUser(item) {
      if (item && item.userNum) {
        this.$router.push(`/employee-management/detail/${item.userNum}`);
      }
    },
    goToCreate() {
      this.$router.push("/employee-management/create");
    },
    editUser(userNum) {
      this.$router.push(`/employee-management/edit/${userNum}`);
    },
    openDeleteDialog(userNum) {
      this.deleteInfo.userNum = userNum;
      this.deleteDialog = true;
    },
    async confirmDelete() {
      if (this.adminCode !== this.correctAdminCode) {
        alert("잘못된 관리자 코드입니다.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        await axios.delete("/user/delete", {
          data: {
            userNum: this.deleteInfo.userNum,
            reason: this.deleteInfo.reason,
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("직원 삭제가 완료되었습니다.");
        this.performSearch();
        this.closeDeleteDialog();
      } catch (error) {
        console.error("삭제 중 오류가 발생했습니다:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    },
    closeDeleteDialog() {
      this.deleteDialog = false;
    },
  },
  mounted() {
    this.performSearch(this.currentPage);
    this.fetchDepartments();
    this.fetchPositions();
  },
  watch: {
    currentPage(newPage) {
      // if(this.searchQuery!=null){
      //   this.performSearch(newPage);
      // }
      this.performSearch(newPage);
    },
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  border-radius: 12px;
}

.drawer-open {
  transition: margin-right 0.3s ease;
  margin-right: 200px;
}

/* .v-row {
  margin-bottom: 20px;
} */

.v-btn {
  font-size: 14px;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
}

.employee-table th,
.employee-table td {
  padding: 10px;
  text-align: left;
}

.employee-table th {
  font-weight: bold;
}

.employee-table tr:hover {
  background-color: #f0f0f0;
}

thead {
  border-radius: 12px;
}

.v-dialog .v-card {
  padding: 20px;
}

.v-card-text {
  margin-bottom: 10px;
}

.v-btn--icon {
  font-size: 20px;
}

.v-pagination {
  margin-top: 20px;
}

</style>
