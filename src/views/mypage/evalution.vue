<template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="pa-5">
            <!-- 평가 테이블 -->
            <v-simple-table>
              <thead>
                <tr>
                  <th class="text-left">대분류</th>
                  <th class="text-left">중분류</th>
                  <th class="text-left">소분류</th>
                  <th class="text-right">액션</th>
                  <th class="text-right">점수</th>
                </tr>
              </thead>
              <tbody>
                <!-- 업무 수행 능력 -->
                <tr>
                  <td rowspan="2">업무 수행 능력 (30%)</td>
                  <td>업무 달성도</td>
                  <td>
                    <!-- 소분류 입력 필드 -->
                    <v-text-field
                      v-model="subEvalution.abilityPerformance"
                      label="내용 입력"
                      solo
                      dense
                      outlined
                    ></v-text-field>
                  </td>
                  <td>
                    <v-btn @click="saveSubEvalution('abilityPerformance')" color="primary" small>저장</v-btn>
                    <v-btn @click="deleteSubEvalution('abilityPerformance')" color="error" small>삭제</v-btn>
                  </td>
                  <td>
                    <!-- 점수 입력 필드 -->
                    <v-select
                      v-model="scores.abilityPerformance"
                      :items="scoreOptions"
                      solo
                      dense
                      outlined
                    ></v-select>
                  </td>
                </tr>
                <tr>
                  <td>업무 처리 능력</td>
                  <td>
                    <v-text-field
                      v-model="subEvalution.abilityProcessing"
                      label="내용 입력"
                      solo
                      dense
                      outlined
                    ></v-text-field>
                  </td>
                  <td>
                    <v-btn @click="saveSubEvalution('abilityProcessing')" color="primary" small>저장</v-btn>
                    <v-btn @click="deleteSubEvalution('abilityProcessing')" color="error" small>삭제</v-btn>
                  </td>
                  <td>
                    <v-select
                      v-model="scores.abilityProcessing"
                      :items="scoreOptions"
                      solo
                      dense
                      outlined
                    ></v-select>
                  </td>
                </tr>
  
                <!-- 문제 해결 -->
                <tr>
                  <td rowspan="2">문제 해결 (25%)</td>
                  <td>문제 해결 능력</td>
                  <td>
                    <v-text-field
                      v-model="subEvalution.problemSolving"
                      label="내용 입력"
                      solo
                      dense
                      outlined
                    ></v-text-field>
                  </td>
                  <td>
                    <v-btn @click="saveSubEvalution('problemSolving')" color="primary" small>저장</v-btn>
                    <v-btn @click="deleteSubEvalution('problemSolving')" color="error" small>삭제</v-btn>
                  </td>
                  <td>
                    <v-select
                      v-model="scores.problemSolving"
                      :items="scoreOptions"
                      solo
                      dense
                      outlined
                    ></v-select>
                  </td>
                </tr>
                <tr>
                  <td>주도성</td>
                  <td>
                    <v-text-field
                      v-model="subEvalution.initiative"
                      label="내용 입력"
                      solo
                      dense
                      outlined
                    ></v-text-field>
                  </td>
                  <td>
                    <v-btn @click="saveSubEvalution('initiative')" color="primary" small>저장</v-btn>
                    <v-btn @click="deleteSubEvalution('initiative')" color="error" small>삭제</v-btn>
                  </td>
                  <td>
                    <v-select
                      v-model="scores.initiative"
                      :items="scoreOptions"
                      solo
                      dense
                      outlined
                    ></v-select>
                  </td>
                </tr>
  
                <!-- 책임감 -->
                <tr>
                  <td rowspan="2">책임감 (25%)</td>
                  <td>협력 태도</td>
                  <td>
                    <v-text-field
                      v-model="subEvalution.cooperation"
                      label="내용 입력"
                      solo
                      dense
                      outlined
                    ></v-text-field>
                  </td>
                  <td>
                    <v-btn @click="saveSubEvalution('cooperation')" color="primary" small>저장</v-btn>
                    <v-btn @click="deleteSubEvalution('cooperation')" color="error" small>삭제</v-btn>
                  </td>
                  <td>
                    <v-select
                      v-model="scores.cooperation"
                      :items="scoreOptions"
                      solo
                      dense
                      outlined
                    ></v-select>
                  </td>
                </tr>
                <tr>
                  <td>팀워크</td>
                  <td>
                    <v-text-field
                      v-model="subEvalution.teamwork"
                      label="내용 입력"
                      solo
                      dense
                      outlined
                    ></v-text-field>
                  </td>
                  <td>
                    <v-btn @click="saveSubEvalution('teamwork')" color="primary" small>저장</v-btn>
                    <v-btn @click="deleteSubEvalution('teamwork')" color="error" small>삭제</v-btn>
                  </td>
                  <td>
                    <v-select
                      v-model="scores.teamwork"
                      :items="scoreOptions"
                      solo
                      dense
                      outlined
                    ></v-select>
                  </td>
                </tr>
  
                <!-- 팀워크/의사소통 -->
                <tr>
                  <td rowspan="2">팀워크/의사소통 (20%)</td>
                  <td>팀워크</td>
                  <td>
                    <v-text-field
                      v-model="subEvalution.teamworkCommunication"
                      label="내용 입력"
                      solo
                      dense
                      outlined
                    ></v-text-field>
                  </td>
                  <td>
                    <v-btn @click="saveSubEvalution('teamworkCommunication')" color="primary" small>저장</v-btn>
                    <v-btn @click="deleteSubEvalution('teamworkCommunication')" color="error" small>삭제</v-btn>
                  </td>
                  <td>
                    <v-select
                      v-model="scores.teamworkCommunication"
                      :items="scoreOptions"
                      solo
                      dense
                      outlined
                    ></v-select>
                  </td>
                </tr>
                <tr>
                  <td>의사소통</td>
                  <td>
                    <v-text-field
                      v-model="subEvalution.communication"
                      label="내용 입력"
                      solo
                      dense
                      outlined
                    ></v-text-field>
                  </td>
                  <td>
                    <v-btn @click="saveSubEvalution('communication')" color="primary" small>저장</v-btn>
                    <v-btn @click="deleteSubEvalution('communication')" color="error" small>삭제</v-btn>
                  </td>
                  <td>
                    <v-select
                      v-model="scores.communication"
                      :items="scoreOptions"
                      solo
                      dense
                      outlined
                    ></v-select>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
  
            <!-- 총점 표시 -->
            <v-row class="mt-5">
              <v-col>
                <v-card outlined>
                  <v-card-text>
                    총점: {{ calculateTotalScore() }}
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: "EvaluationPage",
    data() {
      return {
        subEvalution: {
          abilityPerformance: '',
          abilityProcessing: '',
          problemSolving: '',
          initiative: '',
          cooperation: '',
          teamwork: '',
          teamworkCommunication: '',
          communication: '',
        },
        scores: {
          abilityPerformance: null,
          abilityProcessing: null,
          problemSolving: null,
          initiative: null,
          cooperation: null,
          teamwork: null,
          teamworkCommunication: null,
          communication: null,
        },
        scoreOptions: ['A', 'B', 'C', 'D', 'E'], // 점수 옵션
      };
    },
    methods: {
        getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`,
        };
    },
      // 총점 계산
      calculateTotalScore() {
        const scoreMap = { A: 5, B: 4, C: 3, D: 2, E: 1 };
        let totalScore = 0;
        let count = 0;
  
        Object.values(this.scores).forEach((score) => {
          if (score) {
            totalScore += scoreMap[score];
            count++;
          }
        });
  
        return count ? (totalScore / count).toFixed(2) : 'N/A'; // 평균 점수 계산
      },
  
// 소분류 저장 로직
saveSubEvalution(category) {
      const subCategory = this.subEvalution[category];
      if (subCategory) {
        const payload = {
          content: subCategory,
          evalutionmId: 1, // 중분류 ID (실제로는 동적으로 가져와야 함)
        };
        axios
          .post(`${process.env.VUE_APP_API_BASE_URL}/sub-evalution/create`, payload, {
            headers: this.getAuthHeaders(), // 인증 헤더 추가
          })
          .then(() => {
            alert(`${category} 저장 완료`);
          })
          .catch((err) => {
            console.error(err);
            alert(`${category} 저장 중 오류 발생: ${err.response?.data?.message || err.message}`);
          });
      } else {
        alert('소분류 내용을 입력해주세요.');
      }
    },
  
    // 소분류 삭제 로직
    deleteSubEvalution(category) {
      const subCategory = this.subEvalution[category];
      if (subCategory) {
        axios
          .delete(`${process.env.VUE_APP_API_BASE_URL}/sub-evalution/delete/1`, {
            headers: this.getAuthHeaders(), // 인증 헤더 추가
          }) // 예시 ID
          .then(() => {
            alert(`${category} 삭제 완료`);
            this.subEvalution[category] = ''; // 삭제 후 입력 필드를 비움
          })
          .catch((err) => {
            console.error(err);
            alert(`${category} 삭제 중 오류 발생: ${err.response?.data?.message || err.message}`);
          });
      } else {
        alert('삭제할 내용을 먼저 입력해주세요.');
      }
    },
},
};
  </script>
  
  <style scoped>
  .v-simple-table {
    width: 100%;
  }
  
  .v-text-field, .v-select {
    min-width: 220px;
  }
  
  .v-btn {
    min-width: 100px;
  }
  </style>