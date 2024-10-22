<template>
    <div class="wedding-template">
      <h1 class="title">🎉 {{ departmentName }} {{ position }} {{ name }}님의 결혼 소식을 알려드립니다! 🎉</h1>
      <p>기쁜 마음으로 결혼식을 준비하고 있습니다. 축하와 응원의 말씀 부탁드립니다.</p>
      
      <div class="wedding-details">
        <p><strong>📅 결혼식 일시:</strong> {{ weddingDate }}</p>
        <p><strong>🏛️ 결혼식 장소:</strong> {{ weddingVenue }}</p>
      </div>
  
      <p>많은 관심 부탁드립니다!</p>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        // 사용자 정보는 API 또는 결재 데이터를 통해 가져온다
        departmentName: '영업부', // 예시 부서명
        position: '대리', // 예시 직급
        name: '김민수', // 예시 이름
        
        // 임의의 장소 및 날짜 데이터를 랜덤하게 생성
        weddingVenues: ['서울 그랜드호텔', '부산 해운대 호텔', '인천 웨딩홀', '대구 문화회관'],
        weddingDates: ['2024년 11월 15일 오후 1시', '2024년 12월 22일 오후 2시', '2025년 1월 5일 오전 11시', '2024년 10월 29일 오후 3시'],
  
        weddingVenue: '',
        weddingDate: ''
      };
    },
    mounted() {
      // 랜덤한 결혼식 장소 및 날짜 선택
      this.weddingVenue = this.weddingVenues[Math.floor(Math.random() * this.weddingVenues.length)];
      this.weddingDate = this.weddingDates[Math.floor(Math.random() * this.weddingDates.length)];
    }
  };
  </script>
  
  <style scoped>
  .wedding-template {
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
  
  .wedding-details {
    margin: 20px 0;
  }
  
  p {
    font-size: 18px;
    color: #555;
  }
  </style>
  