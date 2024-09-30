<template>
    <v-card>
        <v-navigation-drawer v-model="drawer" location="right" temporary width="400">
            <v-tabs v-model="tab" align-tabs="center" background-color="transparent">
                <v-tab value="1">상세보기</v-tab>
                <v-tab value="2">히스토리</v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="1">
                    <v-card-title>
                        <span class="headline">{{ selectedDocument.fileName }}</span>
                    </v-card-title>
                    <v-card-text>
                        <p><strong>파일 확장자:</strong> {{ selectedDocument.fileExtension }}</p>
                        <p><strong>파일 등록일:</strong> {{ selectedDocument.createAt }}</p>
                        <p><strong>파일 등록자:</strong> {{ selectedDocument.userName }}</p>
                        <p><strong>파일 다운로드:</strong>
                            <v-btn color="primary" @click="fileDownload(selectedDocument.id)">다운로드</v-btn>
                        </p>
                        <p><strong>설명:</strong> {{ selectedDocument.description }}</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="updateDocument(selectedDocument.id)">업데이트</v-btn>
                        <v-btn color="primary" @click="closeDrawer()">닫기</v-btn>
                    </v-card-actions>
                </v-tabs-window-item>

                <v-tabs-window-item value="2">
                    <p>여기에 히스토리 내용이 표시됩니다.</p>
                </v-tabs-window-item>
            </v-tabs-window>

        </v-navigation-drawer>
    </v-card>
</template>

<script>
import axios from 'axios';

export default {
    name: 'DocumentDetail',
    props: {
        selectedDocument: {
            type: Object,
            required: true
        },
    },
    data() {
        return {
            tab: '1',
        };
    },
    methods: {
        async fileDownload(id) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/downloadFile/${id}`;
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${this.token}` },
                    responseType: 'blob'
                });

                const blob = new Blob([response.data], { type: response.headers['content-type'] });

                // 다운로드를 위한 a태그 임시 추가
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', this.selectedDocument.fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                alert("파일 다운로드 성공");
            } catch (e) {
                console.error('파일 다운로드 중 오류 발생:', e);
            }
        },
        async updateDocument(id) {
            const url = `${process.env.VUE_APP_API_BASE_URL}/document/update/${id}`;
            await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });
        },
    },
};
</script>

<style scoped>
/* Add any required styles here */
</style>