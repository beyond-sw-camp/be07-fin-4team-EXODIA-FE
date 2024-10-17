<template>
  <div class="main-view">
    <v-container fluid>
      <v-tabs v-model="activeTab" background-color="green lighten-5" centered class="header-tabs">
        <v-tab @click="navigateTab(0)">전사 근태 통계</v-tab>
        <v-tab @click="navigateTab(1)">프로필</v-tab>
        <v-tab @click="navigateTab(2)">평가리스트</v-tab>
        <v-tab @click="navigateTab(3)">오늘의 점심</v-tab>
        <v-tab @click="navigateTab(4)">인사평가</v-tab>
      </v-tabs>

      <v-tab-items>
        <v-tab-item v-if="activeTab === 0">
          <!-- 프로필 -->
        </v-tab-item>
        <v-tab-item v-if="activeTab === 1">
          <!-- 평가리스트 -->
        </v-tab-item>
        <v-tab-item v-if="activeTab === 2">
          <!-- 평가리스트 -->
        </v-tab-item>

        <v-tab-item v-if="activeTab === 3">
          <v-row justify="" class="my-8" style=" margin-left: 70px;">
            <!-- 왼쪽: 돌림판 -->
            <v-col cols="12" sm="6" md="5" style="background-color: #ffffff;">
              <!-- 검은 줄 (화살표) -->
              <v-sheet class="indicator"></v-sheet>

              <v-sheet class="pa-4" elevation="0" style="background-color: #ffffff;">
                <canvas ref="canvas" width="400" height="400"></canvas>
              </v-sheet>
            </v-col>

            <!-- 오른쪽: 결과 -->
            <v-col cols="12" sm="6" md="5" style="margin-top: 40px;">
              <v-sheet class="pa-4" elevation="0" style="background-color: #ffffff;">
                <v-sheet class="pa-6 text-h5" elevation="0" style="background-color: #ffffff;">
                  {{ resultText || '오늘의 점심' }}
                </v-sheet>
              </v-sheet>

              <!-- Spin Button -->
              <v-btn color="yellow darken-2" @click="rotate" large class="mt-4">돌려돌려 돌림판</v-btn>

              <!-- Add Menu Section -->
              <v-row justify="center" class="mt-4">
                <v-col cols="12">
                  <v-text-field v-model="newMenu" label="메뉴 추가" solo></v-text-field>
                  <v-btn color="primary" @click="addMenu" large>메뉴 추가</v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-tab-item>

        <v-tab-item v-if="activeTab === 4">
          <!-- 인사평가 -->
        </v-tab-item>

      </v-tab-items>
    </v-container>
  </div>
</template>

<script>
import JSConfetti from 'js-confetti'; // JSConfetti import

export default {
  data() {
    return {
      activeTab: 3,
      product: ["햄버거", "피자"], // 기본 메뉴
      colors: ["#A68A8A", "#C4A3A3", "#D9B7B7", "#E3C4C4", "#F0D5D5", "#BFA1A1", "#D1B0B0", "brown"], // 무지개 색상
      newMenu: "", // 추가할 메뉴 입력 필드
      ctx: null, // Canvas Context
      currentRotation: 0, // 돌림판의 현재 회전 각도
      resultText: "", // 돌림판 결과
      jsConfetti: null, // JSConfetti 인스턴스
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.ctx = this.$refs.canvas.getContext("2d"); // Canvas의 2D 컨텍스트를 가져옴
      this.drawWheel(); // 기본 메뉴로 돌림판 그리기
      this.$refs.canvas.addEventListener("click", this.handleCanvasClick);
      this.jsConfetti = new JSConfetti(); // JSConfetti 인스턴스 생성
    });
  },
  methods: {
    // 돌림판 그리는 함수
    drawWheel() {
      const canvas = this.$refs.canvas;
      const [cw, ch] = [canvas.width / 2, canvas.height / 2];
      const arc = Math.PI / (this.product.length / 2);
      this.ctx.clearRect(0, 0, canvas.width, canvas.height); // 기존 그린 것 지우기

      // 각 메뉴 섹션 그리기
      for (let i = 0; i < this.product.length; i++) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors[i % this.colors.length];
        this.ctx.moveTo(cw, ch);
        this.ctx.arc(cw, ch, cw, arc * (i - 1), arc * i);
        this.ctx.fill();
        this.ctx.closePath();
      }

      // 메뉴 텍스트 그리기
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "18px Pretendard";
      this.ctx.textAlign = "center";
      for (let i = 0; i < this.product.length; i++) {
        const angle = arc * i + arc / 2;
        this.ctx.save();
        this.ctx.translate(
          cw + Math.cos(angle) * (cw - 50),
          ch + Math.sin(angle) * (ch - 50)
        );
        this.ctx.rotate(angle + Math.PI / 2);
        this.ctx.fillText(this.product[i], 0, 0);
        this.ctx.restore();
      }

      // 중앙에 원 뚫기
      this.ctx.beginPath();
      this.ctx.arc(cw, ch, 30, 0, 2 * Math.PI); // 반지름 30짜리 원
      this.ctx.fillStyle = "#F5F5F5"; // 배경과 동일한 색상으로 채움
      this.ctx.fill();
      this.ctx.closePath();
    },

    // 메뉴 추가 함수
    addMenu() {
      if (this.newMenu.trim()) {
        this.product.push(this.newMenu);
        this.drawWheel();
        this.newMenu = ""; // 입력 필드 초기화
      } else {
        alert("메뉴를 입력한 후 버튼을 클릭 해 주세요.");
      }
    },

    // 돌림판 회전 함수
    rotate() {
      const canvas = this.$refs.canvas;
      canvas.style.transition = "initial";
      canvas.style.transform = "initial";

      // 한 섹션의 각도 (360도를 메뉴 개수로 나눔)
      const arc = 360 / this.product.length;

      // 화살표가 가리키는 위치 보정 (12시 방향 기준으로 보정)
      const adjustmentAngle = arc / 2; // 보정 각도 (12시에서 섹션의 중앙으로 맞춤)

      setTimeout(() => {
        const ran = Math.floor(Math.random() * this.product.length); // 임의의 섹션 선택
        const rotate = ran * arc + 3600 + arc * 3 - adjustmentAngle; // 3600도 이상 회전 후 정지
        this.currentRotation = rotate; // 현재 회전 각도 저장
        canvas.style.transform = `rotate(-${rotate}deg)`; // 돌림판 회전
        canvas.style.transition = "2s";

        // 결과 텍스트 업데이트 및 팡파레 실행
        setTimeout(() => {
          this.resultText = this.product[ran]; // 선택된 메뉴 표시
          this.jsConfetti.addConfetti({
            confettiColors: ["#4B89DC", "#4B66DC", "#7E91E6", "#B5C0F0", "#B5CEF0", "#B5E3F0"],
            confettiRadius: 6,
            confettiNumber: 600,
          });
        }, 2000); // 2초 후 결과 출력 및 팡파레 실행
      }, 1);
    },



    // 캔버스 클릭 이벤트 처리 함수
    handleCanvasClick(e) {
      const canvas = this.$refs.canvas;
      const [cw, ch] = [canvas.width / 2, canvas.height / 2];
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 클릭한 각도 계산 (0~360 도)
      let clickAngle = Math.atan2(y - ch, x - cw) * (180 / Math.PI);
      clickAngle = clickAngle < 0 ? 360 + clickAngle : clickAngle;

      // 현재 돌림판의 각도에서 클릭된 위치를 반영하여 각도 계산
      const relativeAngle = (clickAngle + this.currentRotation) % 360;

      // 각 섹션의 각도 계산
      const arc = 360 / this.product.length;
      const selectedMenuIndex = Math.floor(relativeAngle / arc);

      // 메뉴 이름 수정
      const newName = prompt("메뉴 이름을 수정하세요", this.product[selectedMenuIndex]);
      if (newName) {
        this.product[selectedMenuIndex] = newName;
        this.drawWheel();
      }
    },

    navigateTab(index) {
      if (index == 0) {
        this.$router.push('/mypage/vacation');
      } else if (index === 1) {
        this.$router.push('/mypage/userProfile');
      } else if (index === 2) {
        this.$router.push('/mypage/evalutionFrame');
      } else if (index === 3) {
        this.$router.push('/mypage/spinWheel');
      } else if (index === 4) {
        this.$router.push('/mypage/evalutionList');
      } else {
        this.activeTab = index;
      }
    }
  },
};
</script>

<style scoped>
.main-view {
  /* margin-left: -150px; */
  /* margin-top: -50px; */
  padding: -50px;
}

/* 탭 관련 스타일 */
.header-tabs {
  margin-bottom: 30px;
}

.tab-item {
  font-weight: bold;
  font-size: 16px;
  color: #4CAF50;
  min-width: 100px;
  background-color: #ffffff;
}

.v-tabs {
  border-bottom: 1px solid #e0e0e0;
  height: unset;
  margin-top: -20px;
  min-width: 90px;
  margin-right: 13px;

}

.v-tab {
  font-weight: bold;

}

/* 돌림판 관련 스타일 */
canvas {
  transition: 2s;
  margin-top: 20px;
  width: 100%;
  background-color: #ffffff;
}

.tab-item {
  font-weight: bold;
  color: #4CAF50;
  background-color: #ffffff;
}

/* 검은 줄 스타일 (화살표) */
.indicator {
  width: 10px;
  height: 40px;
  background-color: black;
  position: relative;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
}

.v-btn {
  margin-top: 20px;
}
</style>
