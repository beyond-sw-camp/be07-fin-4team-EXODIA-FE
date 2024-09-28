<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-card>
                    <v-select v-model="selectedType" :items="searchOptions" label="문서 타입 선택"></v-select>
                    <v-table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>제목</th>
                                <th>타입</th>
                                <th>글쓴이</th>
                                <th>작성일</th>
                                <th>조회수</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="document in documents" :key="document.id"
                                @click="openDocumentDetail(document.id)">
                                <td>{{ document.id }}</td>
                                <td>{{ document.fileName }}</td>
                                <td>{{ document.type }}</td>
                                <td>{{ document.userName }}</td>
                                <td>{{ document.createdAt }}</td>
                                <td>{{ document.hits }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </v-col>
        </v-row>

        <!-- 상세 정보 -->
        <v-card>
            <v-navigation-drawer v-model="drawer" location="right" temporary width="400">
                <v-card>
                    <v-card-title>
                        <span class="headline">{{ selectedDocument.fileName }}</span>
                    </v-card-title>
                    <v-card-text>
                        <p><strong>파일 확장자:</strong> {{ selectedDocument.fileExtension }}</p>
                        <p><strong>파일 등록일:</strong> {{ selectedDocument.updatedAt }}</p>
                        <p><strong>파일 등록자:</strong> {{ selectedDocument.updatedAt }}</p>
                        <p><strong>파일 다운로드:</strong>
                            <v-btn color="primary" @click="fileDownload()">다운로드</v-btn>
                        </p>
                        <p><strong>설명:</strong> {{ selectedDocument.description }}</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click="updateDocument(selectedDocument.id)">업데이트</v-btn>
                        <v-btn color="primary" @click="closeDrawer()">닫기</v-btn>
                    </v-card-actions>
                </v-card>
            </v-navigation-drawer>
        </v-card>

    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    name: 'DocumentsList',
    data() {
        return {
            token: localStorage.getItem('token') || null,

            documents: [],
            selectedType: '전체 문서',
            searchOptions: ['전체 문서', '최근 조회 문서', '최근 수정 문서'],
            drawer: false,
            selectedDocument: {}
        };
    },
    mounted() {
        this.fetchDocuments();
    },
    watch: {
        selectedType() {
            this.fetchDocuments();
        }
    },
    methods: {
        // 문서 리스트 조회
        async fetchDocuments() {
            let url = '';
            try {
                if (this.selectedType == '전체 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/all`;
                } else if (this.selectedType == '최근 조회 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/viewd`;
                } else if (this.selectedType == '최근 수정 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/updated`;
                }

                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });
                this.documents = response.data.result;
            } catch (e) {
                console.error('문서 목록을 가져오는 중 오류 발생:', e);
            }
        },
        // 문서 상세 조회
        async openDocumentDetail(id) {
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
        async updateDocument(id) {
            const url = `${process.env.VUE_APP_API_BASE_URL}/document/update/${id}`;
            const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });
            console.log(response.data.result)
        }
    },
};
</script>

<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.v-card>.v-navigation-drawer {
    padding-top: 10vh;
}
</style>