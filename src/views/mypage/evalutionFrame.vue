<template>
  <MypageTemplate>
    <template #evaluationList>
      <v-row>
        <v-col>
          <br>
          <div class="mb-6"><strong>* 인사평가를 위한 자신의 리스트를 작성하세요</strong></div>
          <v-table dense>
            <thead>
              <tr style="background-color:rgba(122,86,86,0.2);font-weight:800">
                <th style="padding:10px;  border: 1px solid #f5f5f5; text-align: center;font-weight:800">대분류</th>
                <th style="padding:10px;  border: 1px solid #f5f5f5; text-align: center; font-weight:800">중분류</th>
                <th style="padding:10px; text-align: center; font-weight:800">소분류</th>
                <th style="padding:10px;"></th>
                <th style="padding:10px;  border: 1px solid #f5f5f5; text-align: center; font-weight:800">평가</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in evalutions" :key="index">
                <td v-if="shouldShowBigCategory(index)" :rowspan="getRowspanForBigCategory(index)"
                  style="width: 200px; text-align: center; font-weight: bold; border: 1px solid #e0e0e0;">
                  {{ item.bigCategoryName }}
                </td>
                <td style="width: 200px; text-align: center; border: 1px solid #e0e0e0;">
                  {{ item.midCategoryName }}
                </td>
                <td style="border: 1px solid #e0e0e0;padding:0" width="700">
                  <v-text-field v-model="item.subEvalutionContent" :label="item.subEvalutionContent ? '' : '소분류 입력'"
                    outlined hide-details dense :disabled="item.saved && !item.editable" s />
                </td>
                <td style="padding:0 10px;">
                  <v-btn icon @click="changeStatus(item)"
                    style="justify-content: center; width: 30px; height: 30px; background-color: transparent; box-shadow: none;">
                    <v-icon>{{ item.editable ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
                  </v-btn>
                </td>
                <td style="border: 1px solid #e0e0e0; text-align: center;">
                  <v-row v-model="item.grade" :items="[]" label="" dense
                    style="width: 100px; background-color: #FFFFFF; border: none"
                    :disabled="item.saved && !item.editable"></v-row>
                </td>
              </tr>
            </tbody>
          </v-table>

          <v-row justify="end" style="margin-top: 20px;">
            <v-btn v-create @click="saveAllSubEvalutions" :disabled="isSaved">
              전체 저장
            </v-btn>
          </v-row>

        </v-col>
      </v-row>
    </template>
  </MypageTemplate>
</template>

<script>
import axios from 'axios';
import MypageTemplate from './MypageTemplate.vue';

export default {
  components: {
    MypageTemplate,
  },
  data() {
    return {
      evalutions: [], // 대/중/소분류 데이터
      isEvaluationPeriod: '',
    };
  },
  computed: {
    isSaveDisabled() {
      return this.evalutions.some(item => !item.subEvalutionContent || item.subEvalutionContent.trim() === '');
    },
    isSaved() {
      return this.evalutions.every(item => item.saved && item.subEvalutionContent.trim() !== '');
    }
  },
  created() {
    this.fetchSubEvalutions();
  },
  methods: {
    async fetchSubEvalutions() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/sub-evalution/list-with-categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        this.evalutions = response.data.map(item => ({
          ...item,
          subEvalutionId: item.subEvalutionId,
          subEvalutionContent: item.subEvalutionContent || '',
          grade: item.grade || '',
          saved: !!item.subEvalutionContent,
          editable: !item.subEvalutionContent,
        }));

      } catch (error) {
        console.error('소분류 불러오기 실패', error);
      }
    },
    changeStatus(item) {
      if (item.editable) {
        this.toggleEditAndSave(item);
      } else {
        item.editable = true;
      }
    },
    async toggleEditAndSave(item) {
      if (item.editable) {
        try {
          await axios.put(`${process.env.VUE_APP_API_BASE_URL}/sub-evalution/update/${item.subEvalutionId}`, {
            content: item.subEvalutionContent,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });

          item.saved = true;
          item.editable = false;
          alert('수정이 완료되었습니다.');
        } catch (error) {
          console.error('소분류 수정 실패', error);
          alert('수정에 성공했습니다.');
        }
      } else {
        item.editable = true;
      }
    },
    shouldShowBigCategory(index) {
      if (index === 0) return true;
      return this.evalutions[index].bigCategoryName !== this.evalutions[index - 1].bigCategoryName;
    },
    getRowspanForBigCategory(index) {
      const currentCategory = this.evalutions[index].bigCategoryName;
      let rowspan = 0;
      for (let i = index; i < this.evalutions.length; i++) {
        if (this.evalutions[i].bigCategoryName === currentCategory) {
          rowspan++;
        } else {
          break;
        }
      }
      return rowspan;
    },
    async saveAllSubEvalutions() {
      const payload = this.evalutions
        .filter(item => item.subEvalutionContent && item.subEvalutionContent.trim() !== '')
        .map(item => ({
          content: item.subEvalutionContent,
          evalutionmId: item.evalutionmId,
          subEvalutionId: item.subEvalutionId,
        }));


      if (payload.length === 0) {
        alert('저장할 소분류가 없습니다.');
        return;
      }

      if (this.isSaveDisabled) {
        alert('모든 항목을 작성해주세요.');
        return;
      }

      try {
        await axios.post(`${process.env.VUE_APP_API_BASE_URL}/sub-evalution/create-multiple`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        this.evalutions.forEach(item => {
          if (item.subEvalutionContent && item.subEvalutionContent.trim() !== '') {
            item.saved = true;
            item.editable = false;
          }
        });
        alert('모든 소분류가 성공적으로 저장되었습니다.');
        location.reload();
      } catch (error) {
        console.error('Failed to save sub-evaluations', error);
      }
    },
  },
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
