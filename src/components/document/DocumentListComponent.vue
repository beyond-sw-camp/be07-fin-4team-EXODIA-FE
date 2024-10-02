<template>
    <v-row justify="center">
        <h1 :class="{ 'drawer-open': drawer }">{{ pageTitle }}</h1>

    </v-row>
    <v-row justify="center" :class="{ 'drawer-open': drawer }">
        <v-col cols="12" sm="8" md="6">
            <v-row class="mb-2">
                <v-col></v-col>
                <v-col>제목</v-col>
                <v-col>문서타입</v-col>
                <v-col>작성자명</v-col>
                <v-col>생성 시간</v-col>
                <v-col>조회</v-col>
            </v-row>
            <v-row v-for="document in documents" :key="document.id" class="document" @click="openDrawer(document.id)">
                <v-col>{{ document.id }}</v-col>
                <v-col>{{ document.fileName }}</v-col>
                <v-col>{{ document.type }}</v-col>
                <v-col>{{ document.userName }}</v-col>
                <v-col>{{ formatDate(document.createdAt) }}</v-col>
                <v-col>0</v-col>
            </v-row>
        </v-col>
    </v-row>

    <!-- 상세 정보 -->
    <v-card>
        <v-navigation-drawer v-model="drawer" location="right" temporary width="500">
            <v-tabs v-model="tab" align-tabs="center" background-color="transparent">
                <v-tab class="tabs" value="1">상세보기</v-tab>
                <v-tab class="tabs" value="2" @click="fetchHistory(this.selectedDocument.id)">히스토리</v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
                <!-- 상세 정보 -->
                <v-tabs-window-item value="1">
                    <v-card-title>
                        <v-row class="detailFileName">{{ selectedDocument.fileName }}</v-row>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-row>파일 확장자</v-row>
                        <v-row>{{ selectedDocument.fileExtension }}</v-row>
                    </v-card-text>
                    <v-card-text>
                        <v-row>생성 날짜</v-row>
                        <v-row>{{ formatDate(selectedDocument.createAt) }}</v-row>
                    </v-card-text>
                    <v-card-text>
                        <v-row>파일 등록자</v-row>
                        <v-row>{{ selectedDocument.userName }}</v-row>
                    </v-card-text>
                    <v-card-text>
                        <v-row>파일 다운로드</v-row>
                        <v-row>
                            <v-btn style="color:#4CAF50" @click="fileDownload(selectedDocument.id)">다운로드</v-btn>
                        </v-row>
                    </v-card-text>
                    <v-card-text>
                        <v-row>설명</v-row>
                        <v-row>{{ selectedDocument.description }}</v-row>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn style="background-color:#4CAF50; color:#ffffff" @click="$router.push({
                            name: 'DocumentUpdate', state: {
                                id: selectedDocument.id,
                            }
                        })">
                            업데이트</v-btn>
                        <v-btn style="background-color:#AF2626; color:#ffffff" @click="closeDrawer()">닫기</v-btn>
                    </v-card-actions>
                </v-tabs-window-item>


                <!-- 히스토리 -->
                <v-tabs-window-item value="2">
                    <v-card-title>
                        <span class="headline">히스토리</span>

                        <v-icon class="icon" @click="toggleHistoryVisibility"> {{ showHistory ? 'mdi-chevron-up' :
                            'mdi-chevron-down' }}</v-icon>
                        <v-divider v-if="!showHistory"></v-divider>


                    </v-card-title>

                    <v-timeline dense v-if="showHistory">
                        <v-timeline-item v-for="(history, index) in historyDocument" :key="index" size="x-small">
                            <v-card>
                                <v-card-title>
                                    <div class="d-flex align-center fileName">
                                        <v-icon left>mdi-file-document-outline</v-icon>
                                        <span>{{ history.fileName }}</span>
                                    </div>
                                </v-card-title>

                                <v-card-subtitle class="d-flex align-center userName">
                                    <v-avatar left size="24">
                                        <img :src="history.userAvatar" alt="User Avatar" />
                                    </v-avatar>
                                    <span>{{ history.userName }}</span>
                                </v-card-subtitle>

                                <v-card-actions>
                                    <v-btn small text color="primary" @click="confirmRevert(history.id)">
                                        revert
                                    </v-btn>
                                </v-card-actions>
                            </v-card>

                            <template v-slot:opposite>
                                <div class="fileModifiedDate">{{ formatDate(history.updatedAt) }}</div>
                            </template>
                        </v-timeline-item>
                    </v-timeline>


                    <v-card-title>
                        <span class="headline">댓글</span>
                        <v-divider></v-divider>
                    </v-card-title>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn style="background-color:#4CAF50; color:#ffffff" @click="$router.push({
                            name: 'DocumentUpdate', state: {
                                id: selectedDocument.id,
                            }
                        })">
                            업데이트</v-btn>
                        <v-btn style="background-color:#AF2626; color:#ffffff" @click="closeDrawer()">닫기</v-btn>
                    </v-card-actions>

                </v-tabs-window-item>
            </v-tabs-window>
        </v-navigation-drawer>
    </v-card>
</template>

<script>
import axios from 'axios'

export default {
    props: ['pageTitle'],
    data() {
        return {
            token: localStorage.getItem('token') || null,

            documents: [],
            title: '',
            drawer: false,
            selectedDocument: [],
            tab: '상세보기',
            showHistory: false,
        }
    },
    mounted() {
        this.fetchDocuments();
    },
    methods: {
        async fetchDocuments() {
            let url = '';
            this.title = this.pageTitle;

            try {
                if (this.pageTitle == '전체 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/all`;
                } else if (this.selectedDoc == '최근 조회 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/viewd`;
                } else if (this.selectedDoc == '최근 업데이트 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/updated`;
                }

                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });
                this.documents = response.data.result;
                console.log(this.documents)
            } catch (e) {
                console.error('문서 목록을 가져오는 중 오류 발생:', e);
            }
        },
        async openDrawer(id) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/detail/${id}`;
                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });

                this.selectedDocument = response.data.result;
                this.drawer = true;

            } catch (e) {
                console.error('문서 상세 정보를 가져오는 중 오류 발생:', e);
            }
        },
        closeDrawer() {
            this.drawer = false;
        },
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
        async fetchHistory(id) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/versions/${id}`;
                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });
                console.log(url)
                console.log(response.data.result[0])
                this.historyDocument = response.data.result;
            } catch (e) {
                console.error('히스토리 정보를 가져오는 중 오류 발생:', e);
            }
        },
        confirmRevert(versionId) {
            // rollback 이전에 확인받기 위한 창
            const isConfirmed = window.confirm("이후의 문서에 대한 모든 버전이 삭제됩니다.\n 그래도 버전 되돌리기를 진행하시겠습니까?");
            if (isConfirmed) {
                this.revertToVersion(versionId);
            }
        },
        async revertToVersion(id) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/rollback/${id}`;
                await axios.post(url, { headers: { Authorization: `Bearer ${this.token}` } });

                this.fetchHistory(id);

            } catch (e) {
                console.error('롤백 중 오류 발생:', e);
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        toggleHistoryVisibility() {
            this.showHistory = !this.showHistory;
        },
    },
}
</script>
<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.drawer-open {
    transition: margin-right 0.3s ease;
    margin-right: 500px;
}

.v-card>.v-navigation-drawer {
    padding-top: 8vh;
}

.v-card-title {
    padding: 0;
}

v-card-title,
.v-card-subtitle {
    display: flex;
    align-items: center;
}

.v-tabs-window {
    margin: 50px;
}

.v-avatar img {
    object-fit: cover;
}

.headline {
    font-size: 14px;
}

.tabs>.v-btn {
    font-size: 14px;
}


.v-btn {
    font-size: 12px;
}

.v-card {
    margin-bottom: 5px;
}

.v-card-text>.v-row:first-child {
    font-size: 14px;
}

.v-card-text>.v-row:last-child {
    font-size: 16px;
}

.v-card-text {
    margin-bottom: 20px;
}

.v-timeline-divider__inner-dot {
    height: 20px;
    width: 20px;
}

.detailFileName {
    font-size: 20px;
    margin: 20px 0 0;
}

.fileName {
    font-size: 13px;
    margin: 10px;
}

.userName {
    font-size: 13px;
}

.fileModifiedDate {
    font-size: 10px;
}

.v-timeline--vertical.v-timeline {
    row-gap: 0;
}

.v-divider {
    margin: 20px 0;
}
</style>