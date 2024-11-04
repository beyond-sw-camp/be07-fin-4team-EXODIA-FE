<template>
  <MypageTemplate>
    <template #evaluation>
      <v-row style="margin-top: 10px;">

        <!-- 팀원은 팀장이 -->
        <!-- 팀장은 부서장, 본부장 -->
        <!-- 부서장, 본부장은 본인이 -->
        <v-col v-if="this.positionId >= 5 && this.positionId <= 7 && isEvaluationPeriod" cols="12" md="4">
          <v-select v-model="selectedUser" :items="departmentUsers" item-title="name" item-value="userNum"
            label="부서원 선택" dense outlined></v-select>
        </v-col>
      </v-row>

      <!-- 인사평가 기간이라면 평가할 수 있도록 -->
      <div v-if="isEvaluationPeriod && this.evaluations.length != 0" style="padding:16px; margin-top:10px;">
        <v-row>
          <v-col>
            <v-table dense>
              <thead>
                <tr style="background-color:rgba(122,86,86,0.2);font-weight:800">
                  <th style="padding:10px;  border: 1px solid #f5f5f5; text-align: center;font-weight:800">대분류</th>
                  <th style="padding:10px;  border: 1px solid #f5f5f5; text-align: center; font-weight:800">중분류</th>
                  <th style="padding:10px; text-align: center; font-weight:800">소분류</th>
                  <th style="padding:10px;  border: 1px solid #f5f5f5; text-align: center; font-weight:800">평가</th>
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
                  <td style="border: 1px solid #e0e0e0; width: 800px;">
                    {{ item.subEvalutionContent }}
                  </td>
                  <td style="border: 1px solid #e0e0e0; text-align: center; padding:0 ">
                    <!-- 평가 선택 -->
                    <v-select hide-details v-model="item.score" :items="['A', 'B', 'C', 'D', 'E']" label="평가 선택" dense
                      style="width: 100px; background-color: #FFFFFF; border: none; padding:0"
                      :disabled="item.saved && !item.editable"></v-select>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>

        <!-- 저장 버튼 -->
        <v-row justify="end" v-if="!evaluations.some(evaluation => evaluation.saved)">
          <v-btn v-create @click="saveEvaluations">저장</v-btn>
        </v-row>
      </div>

      <div v-if="isEvaluationPeriod && this.evaluations.length == 0" style="padding:16px; margin-top:10px;">
        <div class="mb-6"><strong>* 평가 항목이 존재하지 않습니다.</strong></div>
      </div>

      <!-- 인사평가 기간이 아니라면 -->
      <div v-if="!isEvaluationPeriod" style="padding:16px; margin-top:10px;">
        <div class="mb-6"><strong>* {{ formatDate(this.startDate) }}부터 {{ formatDate(this.endDate) }} 까지의 인사평가
            결과입니다.</strong></div>
        <v-row>
          <v-col>
            <v-table dense>
              <thead>
                <tr style="background-color:rgba(122,86,86,0.2);">
                  <th style="padding:10px; text-align: center; border: 1px solid #f5f5f5; font-weight:800">대분류</th>
                  <th style="padding:10px; text-align: center; border: 1px solid #f5f5f5; font-weight:800">중분류</th>
                  <th style="padding:10px;  text-align: center;border: 1px solid #f5f5f5; font-weight:800">평가 내용</th>
                  <th style="padding:10px;  text-align: center;border: 1px solid #f5f5f5; font-weight:800">평가</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in avgEvalutions" :key="index">
                  <td v-if="shouldAvgShowBigCategory(index)" :rowspan="getAvgRowspanForBigCategory(index)"
                    style="width: 200px; text-align: center; font-weight: bold; border: 1px solid #e0e0e0;">
                    {{ item.bigCategoryName }}
                  </td>
                  <td style="width: 200px; text-align: center; border: 1px solid #e0e0e0;">
                    {{ item.midCategoryName }}
                  </td>
                  <td style="border: 1px solid #e0e0e0;  width: 800px;">
                    {{ item.subEvalutionContent }}
                  </td>
                  <td
                    style="border: 1px solid #e0e0e0; text-align: center; width: 100px;height:56px; font-weight: 800; ">
                    {{ item.avgScore }}
                  </td>
                </tr>

                <tr style="height:56px; border:none; font-weight: 800; font-size:16px">
                  <td colspan="3" style="text-align:right; border:none; padding-right: 10px;">
                    총점:
                  </td>
                  <td style="text-align: center; border:none;">
                    {{ totalScore }}
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-col>
        </v-row>
      </div>



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
      positionId: localStorage.getItem('positionId'),
      userNum: localStorage.getItem('userNum'),

      evaluations: [],
      departmentUsers: [],
      selectedUser: null,
      isManager: false,

      isEvaluated: false,
      avgEvalutions: [],
      totalScore: '',

      startDate: '',
      endDate: '',
      saved: false,
    };
  },
  created() {
    this.fetchUsers();
    this.fetchEvaluationPeriod();
    if (this.isEvaluationPeriod) {
      this.fetchSubEvalutions();

    } else {
      this.fetchAvgEvalutaions();
    }

  },
  computed: {
    isEvaluationPeriod() {
      return this.$route.query.isEvaluationPeriod === 'true';
    }
  },
  watch: {
    selectedUser(newValue) {
      if (newValue) {
        this.fetchSubEvalutions(newValue);
      }
    }
  },
  methods: {
    async fetchUsers() {
      // 인사 평가 할 대상 리스트
      try {
        const departmentId = localStorage.getItem('departmentId');

        let url = '';

        if (this.positionId == 7) { //팀장
          url = `${process.env.VUE_APP_API_BASE_URL}/user/department-users/${departmentId}`;
        } else if (this.positionId == 6 || this.positionId == 5) {
          url = `${process.env.VUE_APP_API_BASE_URL}/sub-evalution/user/list`;

        }

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.departmentUsers = response.data.result;
      } catch (error) {
        console.error('팀장 여부 확인 실패 또는 부서원 목록 조회 실패', error);
      }
    },
    async fetchSubEvalutions(userNum = null) {
      // 평가 항목 및 평가 기록 조회)

      const targetUrl = userNum
        ? `/sub-evalution/team-evaluations/${userNum}`
        : `/sub-evalution/team-evaluations/${this.userNum}`
      console.log(targetUrl)
      try {
        const response = await axios.get(targetUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        this.evaluations = response.data.map(item => ({
          ...item,
          subEvalutionContent: item.subEvalutionContent || '',
          score: item.score || '',
          saved: !!item.score,
          editable: !item.score,

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
        score: evaluation.score
      }));

      try {
        await axios.post('/evalution/batch-create', evaluationDtos, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

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
    },
    shouldAvgShowBigCategory(index) {
      if (index === 0) return true;
      return this.avgEvalutions[index].bigCategoryName !== this.avgEvalutions[index - 1].bigCategoryName;
    },
    getAvgRowspanForBigCategory(index) {
      const currentCategory = this.avgEvalutions[index].bigCategoryName;
      let rowspan = 0;
      for (let i = index; i < this.avgEvalutions.length; i++) {
        if (this.avgEvalutions[i].bigCategoryName === currentCategory) {
          rowspan++;
        } else {
          break;
        }
      }
      return rowspan;
    },
    async fetchAvgEvalutaions() {
      try {
        const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/evalution-avg/calculate`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        this.avgEvalutions = response.data.result;

        this.totalScore = this.avgEvalutions.reduce((sum, item) => sum + item.avgScore, 0);
        this.totalScore /= 7;
        this.totalScore = parseFloat(this.totalScore.toFixed(2));


      } catch (error) {
        console.error('소분류 불러오기 실패', error);
      }
    },
    async fetchEvaluationPeriod() {
      try {
        const response = await axios.get('/eventDate/getEventId/인사평가');
        const { startDate, endDate } = response.data;

        this.startDate = new Date(startDate);
        this.endDate = new Date(endDate);
      } catch (error) {
        console.error('Failed to fetch evaluation period:', error);
      }
    },
    formatDate(date) {
      return new Date(date)
        .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
        .replace(/\.\s/g, '.') // 중간에 붙는 공백을 없앰
        .replace(/\.$/, ''); // 마지막에 붙는 '.'을 없앰
    },
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
