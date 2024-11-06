<template>
  <!-- mt-5 salary-container  -->
  <v-container class="container">
    <v-row class="mb-12" style="padding-left:30px">
      <!-- style="margin:40px 50px" -->
      <h1 :class="{ 'drawer-open': drawer }">{{ pageTitle || '급여 관리' }}</h1>
    </v-row>


    <v-row>
      <v-col cols="6" md="6">
        <v-select v-model="selectedPosition" :items="positions" item-title="name" item-value="id" label="직급별 조회"
          @change="fetchSalariesByPosition" variant="underlined" style="width: 200px; margin-left: 35px;" />
      </v-col>

      <v-col cols="6" md="6" class="text-right" style="align-content: center;">
        <v-btn v-list @click="fetchSalaries">전체 조회</v-btn>
        <v-btn v-create @click="openSetSalaryDateDialog">급여일 설정</v-btn>
      </v-col>
    </v-row>

    <!-- Custom Table -->
    <v-row justify="center" class="mt-4" style="margin:0; text-align:center;">
      <v-col cols="12">
        <v-row class="mb-2"
          style="background-color:rgba(122, 86, 86, 0.2); border-radius:15px; padding:10px; color:#444444; font-weight:600;">
          <v-col cols="1">번호</v-col>
          <v-col cols="2">사번</v-col>
          <v-col cols="1">이름</v-col>
          <v-col cols="2">부서</v-col>
          <v-col cols="2">직급</v-col>
          <v-col cols="1">연차</v-col>
          <v-col cols="2">기본급</v-col>
          <v-col cols="1">수정</v-col>
        </v-row>

        <v-row v-for="(salary, index) in salaries" :key="salary.userNum" class="table-row"
          @click="viewSalaryDetails(salary.userNum)"
          style="border-bottom: 1px solid #ddd; padding: 5px; font-weight:500;">
          <v-col cols="1">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</v-col>
          <v-col cols="2">{{ salary.userNum }}</v-col>
          <v-col cols="1">{{ salary.userName }}</v-col>
          <v-col cols="2">{{ salary.departmentName }}</v-col>
          <v-col cols="2">{{ salary.positionName }}</v-col>
          <v-col cols="1">{{ salary.yearsOfService }} 년</v-col>
          <v-col cols="2">{{ salary.baseSalary.toLocaleString() }} 원</v-col>
          <v-col cols="1">
            <v-icon style="font-size: 18px;" @click.stop="goToSalaryEditPage(salary.userNum)">mdi-cog</v-icon>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <div v-if="salaries.length === 0">
      <v-alert type="info" class="mt-3">
        급여 데이터를 찾을 수 없습니다.
      </v-alert>
    </div>

    <!-- 페이징 -->
    <!-- <v-row justify="center" v-if="totalPages > 1">
        <v-pagination v-model="currentPage" :length="totalPages" @input="fetchSalaries"></v-pagination>
      </v-row> -->


    <!-- 페이징 -->
    <v-row justify="center">
      <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5" always-show></v-pagination>
    </v-row>

    <!-- 급여일 설정 다이얼로그 -->
    <v-dialog v-model="salaryDateDialog" max-width="600px">
      <v-card :style="{ padding: '20px' }">
        <v-card-title>급여일 설정</v-card-title>
        <v-card-text>
          <v-row class="mt-3">
            <v-col cols="12" md="6">
              <v-text-field v-model="selectedStartDate" label="시작일 선택" type="date" @change="syncEndDate" required />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field v-model="selectedEndDate" label="종료일 선택" type="date" required />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-save color="primary" @click="setSalaryDate">저장</v-btn>
          <v-btn v-cancel text @click="salaryDateDialog = false">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SalaryManagement',
  data() {
    return {
      salaries: [],
      positions: [],
      selectedPosition: null,
      salaryDateDialog: false,
      selectedStartDate: null,
      selectedEndDate: null,
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 0,
    };
  },
  watch: {
    currentPage(newPage) {
      if(this.selectedPosition!=null){
        this.fetchSalariesByPosition(this.selectedPosition);
        return;
      }
      if (isNaN(newPage)) {
        this.currentPage = 1;
      }
      this.fetchSalaries();
    },
    selectedPosition(newPositionId) {
      if (newPositionId) {
        this.currentPage = 1;
        this.fetchSalariesByPosition(newPositionId);
      }
    }
  },
  methods: {
    async fetchSalaries() {
      try {
        const response = await axios.get("/salary", {
          params: {
            page: this.currentPage - 1,
            size: this.itemsPerPage,
          },
        });
        this.salaries = response.data.salaries;
        this.totalPages = response.data.totalPages;
      } catch (error) {
        console.error("급여 목록을 가져오는 중 오류가 발생했습니다.", error);
      }
    },

    async fetchSalariesByPosition(positionId) {
      if (positionId) {
        try {
          const response = await axios.get(`/salary/byPosition/${positionId}`, {
            params: {
              page: this.currentPage - 1,
              size: this.itemsPerPage,
            },
          });
          this.salaries = response.data.salaries;
          this.totalPages = response.data.totalPages;
          console.log("직급별 급여 조회 성공:", this.salaries);
        } catch (error) {
          console.error("직급별 급여 목록을 가져오는 중 오류가 발생했습니다.", error);
        }
      }
    },

    goToSalaryEditPage(userNum) {
      this.$router.push(`/salary/update/${userNum}`);
    },

    async fetchPositions() {
      try {
        const response = await axios.get('/positions');
        this.positions = response.data;
        // console.log(this.positions);
      } catch (error) {
        console.error('직급 목록을 가져오는 중 오류가 발생했습니다.', error);
      }
    },

    viewSalaryDetails(userNum) {
      this.$router.push(`/salary/detail/${userNum}`);
    },

    openSetSalaryDateDialog() {
      this.salaryDateDialog = true;
    },

    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      let month = '' + (d.getMonth() + 1);
      let day = '' + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = '0' + month;
      if (day.length < 2) day = '0' + day;

      return [year, month, day].join('-');
    },

    syncEndDate() {
      if (!this.selectedEndDate || new Date(this.selectedEndDate) < new Date(this.selectedStartDate)) {
        this.selectedEndDate = this.selectedStartDate;
      }
    },

    async setSalaryDate() {
      try {
        if (!this.selectedStartDate || !this.selectedEndDate) {
          throw new Error('시작일과 종료일을 모두 선택해야 합니다.');
        }

        const formattedStartDate = this.formatDate(this.selectedStartDate);
        const formattedEndDate = this.formatDate(this.selectedEndDate);
        const userNum = localStorage.getItem('userNum');
        if (!userNum) {
          throw new Error('유저 정보를 찾을 수 없습니다.');
        }

        await axios.post('/eventDate/setDate', {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          eventType: 'salary',
          userNum: userNum
        });

        this.salaryDateDialog = false;
        alert('급여일이 성공적으로 설정되었습니다.');
      } catch (error) {
        console.error('급여일 설정 중 오류가 발생했습니다.', error);
      }
    }
  },

  mounted() {
    this.fetchSalaries();
    this.fetchPositions();
  },
};
</script>

<style scoped>
.container {
  padding: 20px;
  border-radius: 12px;
}

.salary-container {
  margin: 20px;
}

.v-card-title {
  padding-bottom: 10px;
  font-weight: bold;
}

.v-card-text {
  padding-top: 0;
}

.v-btn {
  margin-right: 10px;
}

/* .v-row {
  margin-bottom: 10px;
} */

.table-row {
  transition: background-color 0.3s;
  cursor: pointer;
}

.table-row:hover {
  background-color: #fafafa;
}
</style>
