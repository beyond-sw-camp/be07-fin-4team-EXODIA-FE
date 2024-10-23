<template>
  <MypageTemplate>
    <template #evaluationList>
      <v-row>
        <v-col>
          <h3>인사평가 리스트</h3>
          <br>
          <span>* 인사평가를 위한 자신의 리스트를 작성하세요</span>
          <v-simple-table dense>
            <thead>
              <tr>
                <th>대분류</th>
                <th>중분류</th>
                <th>소분류</th>
                <th>평가</th>
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
                <td style="border: 1px solid #e0e0e0;" width="700">
                  <v-text-field v-model="item.subEvalutionContent" :label="item.subEvalutionContent ? '' : '소분류 입력'"
                    outlined dense :disabled="item.saved && !item.editable"
                    :style="{ width: '600px', marginRight: '10px', color: '#000000', float: 'left', border: 'none' }" />
                  <v-btn icon @click="toggleEditAndSave(item, index)"
                    style="justify-content: center; width: 30px; height: 30px; margin-top: 15px; margin-right: 10px; background-color: transparent; box-shadow: none;">
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
          </v-simple-table>

          <v-row justify="end" style="margin-top: 20px;">
            <v-btn @click="saveAllSubEvalutions" :disabled="isSaveDisabled"
              style="background-color: #4CAF50; color: white;">
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
    };
  },
  computed: {
    isSaveDisabled() {
      return this.evalutions.some(item => !item.subEvalutionContent || item.subEvalutionContent.trim() === '');
    },
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
          editable: !item.saved,
        }));
      } catch (error) {
        console.error('Failed to fetch evaluations', error);
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

          item.editable = false;
          item.saved = true;
          alert('수정이 완료되었습니다.');
        } catch (error) {
          console.error('소분류 수정 실패', error);
          alert('수정에 실패했습니다.');
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
      } catch (error) {
        console.error('Failed to save sub-evaluations', error);
        alert('저장에 실패했습니다.');
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
th, td {
  border: 1px solid #e0e0e0;
}
</style>
