<template>
  <v-container>
    <h1>직급 및 호봉별 연봉 관리</h1>

    <v-card>
      <v-card-title>
        <v-row>
          <v-col>직급 관리</v-col>
          <v-col class="text-right">
            <v-btn v-create @click="openAddPositionDialog">직급 추가</v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-data-table :headers="positionHeaders" :items="positions" item-key="id">
        <!-- 연봉 정보 테이블 내부에 렌더링 -->
        <template v-slot:[`item.salaries`]="{ item }">
          <v-data-table :headers="salaryHeaders" :items="item.salaries" item-key="id">
            <template v-slot:[`item.baseSalary`]="{ item }">
              {{ item.yearsOfExperience }}호봉 연봉: {{ item.baseSalary }}만원
            </template>
          </v-data-table>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn small v-edit @click="openEditPositionDialog(item)">수정</v-btn>
          <v-btn small v-delete @click="deletePosition(item.id)">삭제</v-btn>
        </template>
      </v-data-table>
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

    <!-- 호봉 추가 다이얼로그 -->
    <v-dialog v-model="salaryDialog" max-width="500px">
      <v-card>
        <v-card-title>호봉 추가</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="newSalary.yearsOfExperience" label="호봉" type="number" />
            <v-text-field v-model="newSalary.baseSalary" label="연봉 (만원)" type="number" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="addPositionSalary">추가</v-btn>
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
        { text: "호봉별 연봉", value: "baseSalary" }
      ],
      currentPosition: { name: '', salaries: [] }, // 현재 수정 또는 추가할 직급
      newSalary: { yearsOfExperience: 1, baseSalary: 0 }, // 새로 추가할 호봉 연봉
      editingPosition: false, // 현재 직급 수정 여부
      positionDialog: false, // 직급 추가/수정 다이얼로그 상태
      salaryDialog: false, // 호봉 추가 다이얼로그 상태
    };
  },
  methods: {
    // 직급 목록 불러오기
    async fetchPositions() {
      try {
        const response = await this.$axios.get("/positions");
        this.positions = response.data;
      } catch (error) {
        console.error("Error fetching positions:", error);
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
        console.error("Error saving position:", error);
      }
    },
    // 직급 삭제
    async deletePosition(id) {
      try {
        await this.$axios.delete(`/positions/${id}`);
        this.fetchPositions(); // 삭제 후 직급 목록 새로고침
      } catch (error) {
        console.error("Error deleting position:", error);
      }
    },
    // 호봉 추가 다이얼로그 열기
    openAddSalaryDialog(positionId) {
      this.currentPositionId = positionId;
      this.salaryDialog = true;
    },
    // 호봉 추가
    async addPositionSalary() {
      try {
        const response = await this.$axios.post(`/positions/${this.currentPositionId}/salaries`, this.newSalary);
        const position = this.positions.find(p => p.id === this.currentPositionId);
        if (!position.salaries) {
          position.salaries = [];
        }
        position.salaries.push(response.data);
        this.closeSalaryDialog();
      } catch (error) {
        console.error("Error adding salary:", error);
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
