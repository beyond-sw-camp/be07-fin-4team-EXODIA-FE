<template>
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
          <!-- 평가리스트 -->
        </v-tab-item>
  
        <v-tab-item v-if="activeTab === 2">
          <!-- 오늘의 점심 -->
        </v-tab-item>
  
        <v-tab-item v-if="activeTab === 3">
          <v-row>
            <v-col>
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
                      style="width: 200px; text-align: center; font-weight: bold; border: 1px solid #e0e0e0;"
                    >
                      {{ item.bigCategoryName }}
                    </td>
                    <td style="width: 200px; text-align: center; border: 1px solid #e0e0e0;">
                      {{ item.midCategoryName }}
                    </td>
                    <td style="border: 1px solid #e0e0e0; text-align: center; width: 800px;"> <!-- 소분류 텍스트로 표시 -->
                      {{ item.subEvalutionContent }}
                    </td>
                    <td style="border: 1px solid #e0e0e0; text-align: center;">
                      <!-- 평가 선택 -->
                      <v-select
                        v-model="item.grade"
                        :items="['A', 'B', 'C', 'D', 'E']"
                        label="평가 선택"
                        dense
                        style="width: 100px; background-color: #FFFFFF; border: none"
                        :disabled="item.saved && !item.editable"
                      ></v-select>
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
            </v-col>
          </v-row>
        </v-tab-item>
      </v-tabs-items>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        activeTab: 3,
        evalutions: [], // 대/중/소분류 데이터
      };
    },
    created() {
      this.fetchSubEvalutions();
    },
    methods: {
      // 소분류 목록 가져오기 (토큰 사용)
      async fetchSubEvalutions() {
        try {
          const response = await axios.get('/sub-evalution/list-with-categories', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}` // Bearer Token을 헤더에 추가
            }
          });
          this.evalutions = response.data.map(item => ({
            ...item,
            subEvalutionContent: item.subEvalutionContent || 'N/A', // 소분류가 비어 있으면 'N/A'로 표시
            grade: item.grade || '', // 기본 grade 설정
            saved: !!item.subEvalutionContent, // content가 null이 아니면 저장됨으로 표시
            editable: !item.saved // 이미 저장된 항목은 수정 불가, 저장되지 않은 항목은 수정 가능
          }));
        } catch (error) {
          console.error('Failed to fetch evaluations', error);
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
  
      // 탭 이동
      navigateTab(index) {
        if (index === 0) {
          this.$router.push('/mypage/userProfile');
        } else if (index === 1) {
          this.$router.push('/mypage/evalutionFrame');
        } else if (index === 2) {
          this.$router.push('/mypage/spinWheel');
        } else {
          this.activeTab = index;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  /* 헤더 탭 여백 */
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
  