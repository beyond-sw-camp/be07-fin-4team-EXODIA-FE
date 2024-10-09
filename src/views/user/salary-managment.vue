<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2>급여 관리</h2>
        <v-btn color="primary" @click="openSalaryDialog">새 급여 추가</v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-data-table
        :headers="headers"
        :items="salaries"
        class="elevation-1"
        @click:row="viewSalary"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.user.name }}</td>
            <td>{{ item.baseSalary }}</td>
            <td>{{ item.taxAmount }}</td>
            <td>{{ item.finalSalary }}</td>
            <td>
              <v-btn color="green" @click.stop="editSalary(item)">수정</v-btn>
              <v-btn color="red" @click.stop="deleteSalary(item.id)">삭제</v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-row>

    <!-- 급여 추가/수정 다이얼로그 -->
    <v-dialog v-model="salaryDialog" max-width="500">
      <v-card>
        <v-card-title>{{ isEdit ? '급여 수정' : '새 급여 추가' }}</v-card-title>
        <v-card-text>
          <v-text-field v-model="salaryForm.baseSalary" label="기본 급여"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue" @click="saveSalary">저장</v-btn>
          <v-btn color="grey" @click="closeSalaryDialog">취소</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      salaries: [],
      salaryForm: {
        id: null,
        baseSalary: 0,
      },
      salaryDialog: false,
      isEdit: false,
      headers: [
        { text: '이름', value: 'user.name' },
        { text: '기본 급여', value: 'baseSalary' },
        { text: '세금', value: 'taxAmount' },
        { text: '세후 급여', value: 'finalSalary' },
        { text: '관리', value: 'actions' }
      ]
    };
  },
  methods: {
    openSalaryDialog() {
      this.salaryForm = { id: null, baseSalary: 0 };
      this.isEdit = false;
      this.salaryDialog = true;
    },
    viewSalary(item) {
      this.salaryForm = { ...item };
      this.salaryDialog = true;
      this.isEdit = true;
    },
    async saveSalary() {
      try {
        if (this.isEdit) {
          await this.$axios.put(`/salary/manage`, this.salaryForm);
        } else {
          await this.$axios.post(`/salary/manage`, this.salaryForm);
        }
        this.fetchSalaries();
        this.salaryDialog = false;
      } catch (error) {
        console.error(error);
      }
    },
    async fetchSalaries() {
  try {
    const response = await this.$axios.get('/salary');
    this.salaries = response.data;
  } catch (error) {
    console.error("Error fetching salaries:", error);
  }
},

    async deleteSalary(id) {
      await this.$axios.delete(`/salary/manage/${id}`);
      this.fetchSalaries();
    },
    closeSalaryDialog() {
      this.salaryDialog = false;
    }
  },
  mounted() {
    this.fetchSalaries();
  }
};
</script>

<style scoped>
.v-data-table th, .v-data-table td {
  text-align: center;
}
</style>
