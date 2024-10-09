<template>
  <v-container>
    <h1>직급 및 호봉별 연봉 관리</h1>

    <v-card>
      <v-card-title>
        <v-row>
          <v-col>직급 관리</v-col>
          <v-col class="text-right">
            <v-btn color="primary" @click="openAddPositionDialog">직급 추가</v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <!-- 직급 및 연봉 테이블 -->
      <v-data-table :headers="positionHeaders" :items="positions" item-key="id" v-if="positions.length > 0">
        <template v-slot:[`item.salaries`]="{ item }">
          <v-data-table :headers="salaryHeaders" :items="item.salaries || []" item-key="id">
            <template v-slot:[`item.baseSalary`]="{ item }">
              {{ item.yearsOfExperience }}호봉 연봉: {{ item.baseSalary }}만원
              <v-btn small color="primary" @click="openEditSalaryDialog(item)">수정</v-btn>
              <v-btn small color="error" @click="deleteSalary(item.id)">삭제</v-btn>
            </template>
          </v-data-table>
          <v-btn small color="success" @click="openAddSalaryDialog(item.id)">호봉 추가</v-btn>
        </template>
      </v-data-table>

      <!-- 데이터가 없을 때 출력 -->
      <div v-else>
        <p>직급 데이터를 불러오지 못했습니다.</p>
      </div>
    </v-card>

    <!-- 직급 추가/수정 다이얼로그 -->
    <v-dialog v-model="positionDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editingPosition ? '직급 수정' : '직급 추가' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="currentPosition.name" label="직급 이름" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="savePosition">{{ editingPosition ? '수정' : '추가' }}</v-btn>
          <v-btn color="secondary" @click="closeDialog">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 호봉 추가/수정 다이얼로그 -->
    <v-dialog v-model="salaryDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editingSalary ? '호봉 수정' : '호봉 추가' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="newSalary.yearsOfExperience" label="호봉" type="number" />
            <v-text-field v-model="newSalary.baseSalary" label="연봉 (만원)" type="number" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveSalary">{{ editingSalary ? '수정' : '추가' }}</v-btn>
          <v-btn color="secondary" @click="closeSalaryDialog">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      positions: [], // 직급 리스트
      positionHeaders: [
        { text: "직급", value: "name" },
        { text: "호봉별 연봉", value: "salaries" },
        { text: "작업", value: "actions", sortable: false }
      ],
      salaryHeaders: [
        { text: "호봉", value: "yearsOfExperience" },
        { text: "연봉", value: "baseSalary" },
        { text: "작업", value: "actions", sortable: false }
      ],
      currentPosition: { name: '', salaries: [] }, // 현재 수정 또는 추가할 직급
      newSalary: { yearsOfExperience: 1, baseSalary: 0 }, // 새로 추가할 호봉 연봉
      editingPosition: false, // 현재 직급 수정 여부
      editingSalary: false, // 현재 호봉 수정 여부
      positionDialog: false, // 직급 추가/수정 다이얼로그 상태
      salaryDialog: false, // 호봉 추가/수정 다이얼로그 상태
      currentSalaryId: null, // 수정 중인 호봉 ID
      currentPositionId: null, // 호봉 추가할 직급 ID
    };
  },
  methods: {
    // 직급 목록 불러오기
    async fetchPositions() {
      try {
        const response = await this.$axios.get("/positions");

        // 응답이 배열인지 확인하고 배열이 아니면 빈 배열을 할당
        if (Array.isArray(response.data)) {
          this.positions = response.data;
        } else {
          console.error("API 응답이 배열이 아닙니다:", response.data);
        }

      } catch (error) {
        console.error("직급 데이터를 불러오는 중 에러가 발생했습니다:", error);
      }
    },
    // 직급 추가 다이얼로그 열기
    openAddPositionDialog() {
      this.currentPosition = { name: '', salaries: [] };
      this.editingPosition = false;
      this.positionDialog = true;
    },
    // 직급 수정 다이얼로그 열기
    openEditPositionDialog(position) {
      this.currentPosition = { ...position };
      this.editingPosition = true;
      this.positionDialog = true;
    },
    // 다이얼로그 닫기
    closeDialog() {
      this.positionDialog = false;
    },
    // 직급 저장 (추가 또는 수정)
    async savePosition() {
      try {
        if (this.editingPosition) {
          await this.$axios.put(`/positions/${this.currentPosition.id}`, this.currentPosition);
        } else {
          const response = await this.$axios.post("/positions", this.currentPosition);
          this.positions.push(response.data);
        }
        this.closeDialog();
        this.fetchPositions(); // 직급 목록 새로고침
      } catch (error) {
        console.error("직급 저장 중 에러가 발생했습니다:", error);
      }
    },
    // 직급 삭제
    async deletePosition(id) {
      try {
        await this.$axios.delete(`/positions/${id}`);
        this.fetchPositions(); // 삭제 후 직급 목록 새로고침
      } catch (error) {
        console.error("직급 삭제 중 에러가 발생했습니다:", error);
      }
    },
    // 호봉 추가 다이얼로그 열기
    openAddSalaryDialog(positionId) {
      this.newSalary = { yearsOfExperience: 1, baseSalary: 0 };
      this.currentPositionId = positionId;
      this.editingSalary = false;
      this.salaryDialog = true;
    },
    // 호봉 수정 다이얼로그 열기
    openEditSalaryDialog(salary) {
      this.newSalary = { ...salary };
      this.currentSalaryId = salary.id;
      this.editingSalary = true;
      this.salaryDialog = true;
    },
    // 호봉 저장 (추가 또는 수정)
    async saveSalary() {
      try {
        if (this.editingSalary) {
          await this.$axios.put(`/salaries/${this.currentSalaryId}`, this.newSalary);
        } else {
          const response = await this.$axios.post(`/positions/${this.currentPositionId}/salaries`, this.newSalary);
          const position = this.positions.find(p => p.id === this.currentPositionId);
          if (!Array.isArray(position.salaries)) {
            position.salaries = [];
          }
          position.salaries.push(response.data);
        }
        this.closeSalaryDialog();
        this.fetchPositions(); // 직급 목록 새로고침
      } catch (error) {
        console.error("호봉 저장 중 에러가 발생했습니다:", error);
      }
    },

    // 호봉 삭제
    async deleteSalary(salaryId) {
      try {
        await this.$axios.delete(`/salaries/${salaryId}`);
        this.fetchPositions(); // 삭제 후 직급 목록 새로고침
      } catch (error) {
        console.error("호봉 삭제 중 에러가 발생했습니다:", error);
      }
    },
    // 다이얼로그 닫기
    closeSalaryDialog() {
      this.salaryDialog = false;
    }
  },
  async mounted() {
    this.fetchPositions();
  }
};
</script>

<style scoped>
.text-right {
  text-align: right;
}
</style>
