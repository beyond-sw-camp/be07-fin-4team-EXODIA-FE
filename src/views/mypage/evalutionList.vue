<template>
  <MypageTemplate>
    <template #evaluation>
      <v-row class="mt-4">
        <v-col v-if="isManager" cols="12" md="4">
          <v-select v-model="selectedUser" :items="departmentUsers" item-title="name" item-value="userNum"
            label="부서원 선택" dense outlined></v-select>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-simple-table dense>
            <thead>
              <tr style="background-color:rgba(122,86,86,0.2);">
                <th style="padding:10px;  border: 1px solid #f5f5f5">대분류</th>
                <th style="padding:10px;  border: 1px solid #f5f5f5">중분류</th>
                <th style="padding:10px;  border: 1px solid #f5f5f5">평가 내용</th>
                <th style="padding:10px;  border: 1px solid #f5f5f5">평가</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in evaluations" :key="index">
                <td v-if="shouldShowBigCategory(index)" :rowspan="getRowspanForBigCategory(index)"
                  style="width: 200px; text-align: center; font-weight: bold; border: 1px solid #e0e0e0;">
                  {{ item.bigCategoryName }}
                </td>
                <td style="width: 200px; text-align: center; border: 1px solid #e0e0e0;">
                  {{ item.midCategoryName }}
                </td>
                <td style="border: 1px solid #e0e0e0; text-align: center; width: 800px;">
                  {{ item.subEvalutionContent }}
                </td>
                <td style="border: 1px solid #e0e0e0; text-align: center;">
                  <!-- 평가 선택 -->
                  <v-select hide-details v-model="item.grade" :items="['A', 'B', 'C', 'D', 'E']" label="평가 선택" dense
                    style="width: 100px; background-color: #FFFFFF; border: none"
                    :disabled="item.saved && !item.editable"></v-select>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-col>
      </v-row>

      <!-- 저장 버튼 -->
      <v-row justify="end">
        <v-btn v-create @click="saveEvaluations">저장</v-btn>
      </v-row>
    </template>
  </MypageTemplate>
</template>

<script>
import axios from 'axios';
import MypageTemplate from './MypageTemplate.vue';

export default {
  components: {
    MypageTemplate
  },
  data() {
    return {
      evaluations: [],
      departmentUsers: [],
      selectedUser: null,
      isManager: false,
    };
  },
  created() {
    this.checkIfManager();
    this.fetchSubEvalutions();
  },
  watch: {
    selectedUser(newValue) {
      if (newValue) {
        this.fetchSubEvalutions(newValue);
      }
    }
  },
  methods: {
    async checkIfManager() {
      try {
        const positionId = localStorage.getItem('positionId');

        if (positionId === '7') {
          this.isManager = true;
          const departmentId = localStorage.getItem('departmentId');
          const departmentResponse = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/department-users/${departmentId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          this.departmentUsers = departmentResponse.data;
        } else {
          this.isManager = false;
        }
      } catch (error) {
        console.error('팀장 여부 확인 실패 또는 부서원 목록 조회 실패', error);
      }
    },
    async fetchSubEvalutions(userNum = null) {
      const targetUrl = userNum
        ? `/sub-evalution/team-evaluations/${userNum}`
        : '/sub-evalution/list-with-categories';

      try {
        const response = await axios.get(targetUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.evaluations = response.data.map(item => ({
          ...item,
          subEvalutionContent: item.subEvalutionContent || '',
          grade: item.grade || '',
          saved: !!item.grade,
          editable: !item.grade
        }));
      } catch (error) {
        console.error('평가 목록 조회 실패', error);
      }
    },
    async saveEvaluations() {
      const currentUserNum = localStorage.getItem('userNum');
      const evaluationDtos = this.evaluations.map(evaluation => ({
        subEvalutionId: evaluation.subEvalutionId,
        targetUserNum: this.isManager ? this.selectedUser || currentUserNum : currentUserNum,
        score: evaluation.grade
      }));

      try {
        const response = await axios.post('/evalution/batch-create', evaluationDtos, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log(response)
        this.evaluations.forEach(evaluation => {
          evaluation.editable = false;
          evaluation.saved = true;
        });
        alert('평가가 성공적으로 저장되었습니다.');
      } catch (error) {
        console.error('평가 저장 실패', error);
      }
    },
    shouldShowBigCategory(index) {
      if (index === 0) return true;
      return this.evaluations[index].bigCategoryName !== this.evaluations[index - 1].bigCategoryName;
    },
    getRowspanForBigCategory(index) {
      const currentCategory = this.evaluations[index].bigCategoryName;
      let rowspan = 0;
      for (let i = index; i < this.evaluations.length; i++) {
        if (this.evaluations[i].bigCategoryName === currentCategory) {
          rowspan++;
        } else {
          break;
        }
      }
      return rowspan;
    }
  }
};
</script>

<style scoped>
.header-tabs {
  margin-bottom: 30px;
}

.v-tabs--density-default {
  --v-tabs-height: 48px;
}

.v-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.v-tab {
  font-weight: bold;
}

th,
td {
  border: 1px solid #e0e0e0;
}
</style>
