<template>
  <v-container fluid>
    <!-- v-tabs 추가 -->
    <v-tabs v-model="activeTab" background-color="#ffffff" centered class="header-tabs">
      <v-tab @click="navigateTab('/mypage/userProfile')">프로필</v-tab>
      <v-tab @click="navigateTab('/mypage/evaluation')">인사 평가</v-tab>
      <v-tab @click="navigateTab('/mypage/spinWheel')">오늘의 점심</v-tab>
    </v-tabs>
    <v-row justify="" class="my-8" style="margin-top: 10px; margin-left: 70px;">
      <!-- 왼쪽: 돌림판 -->
      <v-col cols="12" sm="6" md="5" style="background-color: #F5F5F5;">
        <!-- 검은 줄 (화살표) -->
        <v-sheet class="indicator"></v-sheet>

        <v-sheet class="pa-4" elevation="0" style="background-color: #F5F5F5;">
          <canvas ref="canvas" width="400" height="400"></canvas>
        </v-sheet>
      </v-col>

      <!-- 오른쪽: 결과 -->
      <v-col cols="12" sm="6" md="5" style="margin-top: 40px;">
        <v-sheet class="pa-4" elevation="0" style="background-color: #F5F5F5;">
          
          <v-sheet class="pa-6 text-h5" elevation="0" style="background-color: #F5F5F5;">
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
  </v-container>
</template>


<script>
export default {
  data() {
    return {
      product: ["햄버거", "피자"], // 기본 메뉴
      colors: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#0000FF", "#4B0082", "#8B00FF", "brown"], // 무지개 색상
      newMenu: "", // 추가할 메뉴 입력 필드
      ctx: null, // Canvas Context
      currentRotation: 0, // 돌림판의 현재 회전 각도
      resultText: "", // 돌림판 결과
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.ctx = this.$refs.canvas.getContext("2d"); // Canvas의 2D 컨텍스트를 가져옴
      this.drawWheel(); // 기본 메뉴로 돌림판 그리기
      this.$refs.canvas.addEventListener("click", this.handleCanvasClick);
    });
  },
  methods: {
    // 탭 클릭 시 라우팅 처리
    navigateTab(route) {
      this.$router.push(route); // 클릭된 탭에 맞는 경로로 이동
    },

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
      const alpha = Math.floor(Math.random() * 100);
      const arc = 360 / this.product.length;

      setTimeout(() => {
        const ran = Math.floor(Math.random() * this.product.length);
        const rotate = ran * arc + 3600 + arc * 3 - arc / 4 + alpha;
        this.currentRotation = rotate; // 회전 각도 저장
        canvas.style.transform = `rotate(-${rotate}deg)`;
        canvas.style.transition = "2s";

        // 결과 텍스트 업데이트
        setTimeout(() => {
          this.resultText = this.product[ran];
        }, 2000); // 2초 후 결과 출력
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
  },
};
</script>

<style scoped>
/* 탭 관련 스타일 */
.header-tabs {
  /* margin-bottom: 30px; */
}

.tab-item {
  font-weight: bold;
  font-size: 16px;
  color: #4CAF50;
  min-width: 100px;
  background-color: #e0e0e0;
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
  padding: 12px;
}

/* 돌림판 관련 스타일 */
canvas {
  transition: 2s;
  margin-top: 20px;
  width: 100%; /* 화면에 꽉 차게 설정 */
  /* height: auto; */
  
}
.tab-item {
  font-weight: bold;
  
  color: #4CAF50;
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
  margin-top: 10px;
}
</style>
