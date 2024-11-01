<template>
    <!-- <div class="image-group">
        <div v-for="(file, index) in chatFilesProp" :key="index" class="image-container">
            <v-icon color="green" class="download-icon" @click="downloadFile(index)">mdi-download-circle</v-icon>
            <img :src="file.chatFileUrl" @error="e => e.target.src = require('@/assets/user.png')"
                style="height: 120px; width: 120px; object-fit: cover;">
            <p class="custom-contents">{{ file.chatFileName }}</p>
        </div>
    </div> -->

    <div :class="isMyMessage ? 'my-file' : 'other-file'">
        <div v-for="(file, index) in chatFilesProp" :key="index" class="image-container">
            <v-icon color="green" class="download-icon" @click="downloadFile(index)">mdi-download-circle</v-icon>
            <img :src="file.chatFileUrl" @error="e => e.target.src = require('@/assets/file.png')"
                style="height: 70px; width: 70px; object-fit: cover;">
            <p class="custom-contents">{{ file.chatFileName }}</p>
        </div>
    </div>

</template>

<script>
import axios from 'axios';

export default {
    props: [
        'chatFilesProp',
        'isMyMessage',
    ],
    methods: {
        async downloadFile(index) {
            // 다운로드를 위한 presigned URL 가져오기
            const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/file/${this.chatFilesProp[index].id}/download`)
            const presignedUrl = response.data.result;

            // Blob을 사용하여 파일 다운로드
            const fileResponse = await axios.get(presignedUrl, { responseType: 'blob' });

            // Blob을 파일로 변환하여 다운로드
            const blob = new Blob([fileResponse.data], { type: fileResponse.headers['content-type'] });

            // 다운로드를 위한 a태그 임시 추가
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);

            // 파일 이름으로 설정
            link.setAttribute('download', this.chatFilesProp[index].chatFileName);
            document.body.appendChild(link);
            link.click();// 링크 클릭 이벤트로 다운로드 시작
            document.body.removeChild(link);// 링크 제거
        },
    },
}
</script>

<style scoped>

/* .image-group {
    display: flex;
    flex-direction: row;
    width: 120px;
    max-height: 180px;
} */

.image-container{
    position: relative;
    display: inline-block;
}

.download-icon {
    position: absolute;
    top: 1px;
    /* 이미지 위쪽에서 5px */
    left: 1px;
    /* 이미지 왼쪽에서 5px */
    z-index: 1;
    /* 이미지보다 아이콘이 위에 표시되도록 z-index 설정 */
    cursor: pointer;
    /* 클릭 가능하게 설정 */
}

.custom-contents {
    max-width: 70px;
    /* 제목의 최대 너비를 설정 */
    overflow: hidden;
    /* 내용이 넘칠 경우 숨김 처리 */
    text-overflow: ellipsis;
    /* 넘치는 텍스트에 '...' 추가 (이거 적용안됨 이후 수정필요)*/
    white-space: nowrap;
    /* 텍스트 줄 바꿈 방지 */
    text-align: center;
}

.my-file {
    text-align: right;
    margin-left: auto;
}

.other-file {
    text-align: left;
    margin-right: auto;
}
</style>