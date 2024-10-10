<template>
  <div class="main-view">
  <v-container fluid>
    <v-tabs v-model="activeTab" background-color="green lighten-5" centered class="header-tabs">
      <v-tab @click="navigateTab(0)">프로필</v-tab>
      <v-tab @click="navigateTab(1)">평가리스트</v-tab>
      <v-tab @click="navigateTab(2)">오늘의 점심</v-tab>
      <v-tab @click="navigateTab(3)">인사평가</v-tab>
    </v-tabs>

    <v-tabs-items v-model="activeTab">
      <v-tab-item v-if="activeTab === 0">
        <!-- 프로필 -->
      </v-tab-item>

      <v-tab-item v-if="activeTab === 1">
        <v-row>
          <v-col>
            <h3>인사평가 입력</h3>
            <br>
            <span>* 사용자는 인사평가를 위해서 자신의 특색을 갖춘 리스트로 입력하세요</span>
            <v-simple-table dense>
              <thead>
                <tr>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in evalutions" :key="index">
                  <!-- 대분류 셀 병합 -->
                  <td
                    v-if="shouldShowBigCategory(index)"
                    :rowspan="getRowspanForBigCategory(index)"
                    style="width: 150px; text-align: center; font-weight: bold; border: 1px solid #e0e0e0;"
                  >
                    {{ item.bigCategoryName }}
                  </td>
                  <td style="width: 150px; text-align: center; border: 1px solid #e0e0e0;">
                    {{ item.midCategoryName }}
                  </td>
                  <td style="border: 1px solid #e0e0e0;">
                    <!-- 소분류 입력 필드 -->
                    <v-text-field
                      v-model="item.subEvalutionContent"
                      :label="item.subEvalutionContent ? '' : '소분류 입력'"
                      outlined
                      dense
                      :disabled="item.saved && !item.editable"
                      :style="{ width: '700px', marginRight: '0px', color: '#000000', float: 'left', border: 'none'}"
                    />
                    <v-btn icon @click="toggleEditAndSave(item, index)" style="justify-content: center; width: 30px; height: 30px; margin-top: 15px; margin-right: 10px; background-color: transparent; box-shadow: none;">
                      <v-icon>{{ item.editable ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
                    </v-btn>
                  </td>
                  <td style="border: 1px solid #e0e0e0; text-align: center;">
                    <!-- 평가 선택 -->
                    <v-row
                      v-model="item.grade"
                      :items="[]"
                      label=""
                      dense
                      style="width: 100px; background-color: #FFFFFF; border: none"
                      :disabled="item.saved && !item.editable"
                    ></v-row>
                  </td>
                  <!-- 수정 및 저장 버튼 추가 -->
                  <td style="text-align: center; border: 1px solid #e0e0e0;">

                  </td>
                </tr>
              </tbody>
            </v-simple-table>

            <!-- 전체 저장 버튼 -->
            <v-row justify="end" style="margin-top: 20px;">
              <v-btn @click="saveAllSubEvalutions" :disabled="isSaveDisabled" style="background-color: #4CAF50; color: white;">
                전체 저장
              </v-btn>
            </v-row>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item v-if="activeTab === 2">
        <!-- 오늘의 점심 -->
      </v-tab-item>

      <v-tab-item v-if="activeTab === 3">
        <!-- 인사평가-->
      </v-tab-item>
    </v-tabs-items>
  </v-container>
</div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeTab: 1,
      evalutions: [], // 대/중/소분류 데이터
    };
  },
  computed: {
    // 모든 소분류가 입력되었는지 확인하여 전체 저장 버튼을 활성화
    isSaveDisabled() {
      return this.evalutions.some(item => !item.subEvalutionContent || item.subEvalutionContent.trim() === '');
    }
  },
  created() {
    this.fetchSubEvalutions();
  },
  methods: {
    // 소분류 목록 가져오기 (토큰 사용)
    async fetchSubEvalutions() {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/sub-evalution/list-with-categories`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Bearer Token을 헤더에 추가
          }
        });
        this.evalutions = response.data.map(item => ({
          ...item,
          subEvalutionId: item.subEvalutionId,
          subEvalutionContent: item.subEvalutionContent || '', // 소분류가 비어 있으면 빈 값 설정
          grade: item.grade || '', // 기본 grade 설정
          saved: !!item.subEvalutionContent, // content가 null이 아니면 저장됨으로 표시
          editable: !item.saved // 이미 저장된 항목은 수정 불가, 저장되지 않은 항목은 수정 가능
        }));
      } catch (error) {
        console.error('Failed to fetch evaluations', error);
      }
    },

    // 수정 버튼을 누르면 입력 필드를 활성화 / 저장 버튼 클릭 시 저장
    async toggleEditAndSave(item) {
      if (item.editable) {
        // 저장 로직 (mdi-check 클릭 시)
        try {
          await axios.put(`${process.env.VUE_APP_API_BASE_URL}/sub-evalution/update/${item.subEvalutionId}`, {
            content: item.subEvalutionContent,
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });

          // 수정 완료 후 저장 상태로 전환
          item.editable = false;
          item.saved = true;
          alert('수정이 완료되었습니다.');
        } catch (error) {
            console.error('소분류 수정에 실패하였습니다', error);
          alert('수정에 실패했습니다.');
        }
      } else {
        // 수정 모드 활성화 (mdi-pencil 클릭 시)
        item.editable = true;
      }
    },

    // 대분류 셀 병합을 위한 로직
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

    // 전체 소분류 저장
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
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // 저장이 완료된 항목을 비활성화하고 저장됨으로 표시
        this.evalutions.forEach(item => {
          if (item.subEvalutionContent && item.subEvalutionContent.trim() !== '') {
            item.saved = true; // 저장 플래그 설정
            item.editable = false; // 수정 불가능 상태로 되돌림
          }
        });

        alert('모든 소분류가 성공적으로 저장되었습니다.');
      } catch (error) {
        console.error('Failed to save sub-evaluations', error);
        alert('저장에 실패했습니다.');
      }
    },

    // 탭 이동
    navigateTab(index) {
      if (index === 0) {
        this.$router.push('/mypage/userProfile');
      } else if (index === 2) {
        this.$router.push('/mypage/spinWheel');
      } else if (index === 3) {
        this.$router.push('/mypage/evalutionList');
      } else {
        this.activeTab = index;
      }
    }
  }
};
</script>

<style scoped>

/* 헤더 탭 여백 */
.main-view {
  margin-left: -150px;
  margin-top: -50px;
  padding: -50px;
}
.header-tabs {
    margin-bottom: 30px;
  }
  
  .tab-item {
    font-weight: bold;
    font-size: 16px;
    color: #4CAF50;
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

/* 테이블 셀 경계선 설정 */
th, td {
  border: 1px solid #e0e0e0;
}

td[style*="border: none"] {
  border: none !important;
}
</style>
