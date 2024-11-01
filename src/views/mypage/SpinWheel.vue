<template>
  <MypageTemplate>
    <template #spinWheel>
      <v-row justify="" class="my-8" style="margin-left: 70px;">
        <!-- 왼쪽: 돌림판 -->
        <v-col cols="12" sm="6" md="5" style="background-color: #ffffff;">
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
          <v-btn v-list @click="rotate" large class="mt-4 mr-2">시작</v-btn>
          <v-btn v-create @click="addMenu" large>메뉴 추가</v-btn>

          <!-- Add Menu Section -->
          <v-row justify="center" class="mt-4">
            <v-col cols="12">
              <v-text-field v-model="newMenu" label="메뉴 추가" solo></v-text-field>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </template>
  </MypageTemplate>
</template>

<script>
import JSConfetti from 'js-confetti';
import MypageTemplate from './MypageTemplate.vue';

export default {
  components: {
    MypageTemplate
  },
  data() {
    return {
      product: ["햄버거", "피자"],
      colors: ["#A68A8A", "#C4A3A3", "#D9B7B7", "#E3C4C4", "#F0D5D5", "#BFA1A1", "#D1B0B0", "brown"],
      newMenu: "",
      ctx: null,
      currentRotation: 0,
      resultText: "",
      jsConfetti: null,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.ctx = this.$refs.canvas.getContext("2d");
      this.drawWheel();
      this.$refs.canvas.addEventListener("click", this.handleCanvasClick);
      this.jsConfetti = new JSConfetti();
    });
  },
  methods: {
    drawWheel() {
      const canvas = this.$refs.canvas;
      const [cw, ch] = [canvas.width / 2, canvas.height / 2];
      const arc = Math.PI / (this.product.length / 2);
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < this.product.length; i++) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.colors[i % this.colors.length];
        this.ctx.moveTo(cw, ch);
        this.ctx.arc(cw, ch, cw, arc * (i - 1), arc * i);
        this.ctx.fill();
        this.ctx.closePath();
      }

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

      this.ctx.beginPath();
      this.ctx.arc(cw, ch, 30, 0, 2 * Math.PI);
      this.ctx.fillStyle = "#F5F5F5";
      this.ctx.fill();
      this.ctx.closePath();
    },
    addMenu() {
      if (this.newMenu.trim()) {
        this.product.push(this.newMenu);
        this.drawWheel();
        this.newMenu = "";
      } else {
        alert("메뉴를 입력한 후 버튼을 클릭 해 주세요.");
      }
    },
    rotate() {
      const canvas = this.$refs.canvas;
      canvas.style.transition = "initial";
      canvas.style.transform = "initial";

      const arc = 360 / this.product.length;
      // const adjustmentAngle = this.product.length === 2 ? arc / 4 : arc / 2;
      const adjustmentAngle = arc * 1.5;
      // const adjustmentAngle = arc / 2;

      setTimeout(() => {
        const ran = Math.floor(Math.random() * this.product.length);
        const rotate = ran * arc + 3600 + adjustmentAngle;
        // const rotate = ran * arc + 3600 + arc * 3 - adjustmentAngle;
        this.currentRotation = rotate;
        canvas.style.transform = `rotate(-${rotate}deg)`;
        canvas.style.transition = "2s";

        setTimeout(() => {
          this.resultText = this.product[ran];
          this.jsConfetti.addConfetti({
            confettiColors: ["#4B89DC", "#4B66DC", "#7E91E6", "#B5C0F0", "#B5CEF0", "#B5E3F0"],
            confettiRadius: 6,
            confettiNumber: 600,
          });
        }, 2000);
      }, 1);
    },
    handleCanvasClick(e) {
      const canvas = this.$refs.canvas;
      const [cw, ch] = [canvas.width / 2, canvas.height / 2];
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let clickAngle = Math.atan2(y - ch, x - cw) * (180 / Math.PI);
      clickAngle = clickAngle < 0 ? 360 + clickAngle : clickAngle;

      const relativeAngle = (clickAngle + this.currentRotation) % 360;

      const arc = 360 / this.product.length;
      const selectedMenuIndex = Math.floor(relativeAngle / arc);

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
.main-view {
  padding: -50px;
}

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
}

canvas {
  transition: 2s;
  margin-top: 20px;
  width: 100%;
  background-color: #ffffff;
}

.indicator {
  width: 5px;
  height: 40px;
  background-color: black;
  position: relative;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
}

.v-btn {
  margin-top: 20px;
}
</style>
