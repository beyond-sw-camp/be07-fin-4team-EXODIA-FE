<template>
  <div class="funeral-template">
    <h1 class="title">⚫ {{ departmentName }} {{ position }} {{ name }}님의 부고 소식을 전해드립니다. ⚫</h1>
    <p>고인의 명복을 빕니다. 삼가 고인의 평안을 기원하며, 아래와 같이 장례식 일정을 안내드립니다.</p>

    <div class="funeral-details">
      <p><strong>📅 발인 일자:</strong> {{ funeralDate }}</p>
      <p><strong>🏛️ 장례식장:</strong> {{ funeralVenue }}</p>
    </div>

    <p>많은 위로 부탁드립니다.</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 사용자 정보는 API 또는 결재 데이터를 통해 가져온다
      departmentName: '인사부', // 예시 부서명
      position: '과장', // 예시 직급
      name: '박철수', // 예시 이름

      // 임의의 장소 및 발인일 데이터를 랜덤하게 생성
      funeralVenues: ['서울 중앙병원 장례식장', '부산 대학교병원 장례식장', '대구 장례문화원', '인천 시민병원 장례식장'],
      funeralDates: ['2024년 11월 20일 발인', '2024년 12월 23일 발인', '2025년 1월 8일 발인', '2024년 11월 1일 발인'],

      funeralVenue: '',
      funeralDate: ''
    };
  },
  mounted() {
    // 랜덤한 장례식 장소 및 발인일 선택
    this.funeralVenue = this.funeralVenues[Math.floor(Math.random() * this.funeralVenues.length)];
    this.funeralDate = this.funeralDates[Math.floor(Math.random() * this.funeralDates.length)];
  }
};
</script>

<style scoped>
.funeral-template {
  padding: 20px;
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-family: Arial, sans-serif;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.funeral-details {
  margin: 20px 0;
}

p {
  font-size: 18px;
  color: #555;
}
</style>