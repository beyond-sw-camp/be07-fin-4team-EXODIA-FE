<template>
    <v-container>
        <!-- 문서 종류(전체, 최근 조회..) -->
        <v-row>
            <v-col>
                <v-menu :selectedDoc="selectedDoc">
                    <template v-slot:activator="{ props }">
                        <v-btn dark v-bind="props">
                            {{ this.selectedDoc }}
                        </v-btn>
                    </template>

                    <v-list>
                        <v-list-item v-for="option in searchDocOptions" :key="option.id"
                            @click="fetchDocuments(option)">
                            <v-list-item-title>{{ option }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </v-col>

            <!-- 검색어 입력 -->
            <v-col>
                <v-text-field v-model="searchQuery" label="검색어" placeholder="검색어 입력"></v-text-field>
            </v-col>
            <v-col>
                <v-btn color="primary" @click="searchDocuments">검색</v-btn>
            </v-col>

            <!-- 문서 타입 -->
            <v-col>
                <v-select v-model="selectedType" :items="typeOptions" item-title="text" item-value="value"
                    class="custom-select"></v-select>
            </v-col>
        </v-row>


        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-row class="mb-2">
                    <v-col></v-col>
                    <v-col>제목</v-col>
                    <v-col>문서타입</v-col>
                    <v-col>작성자명</v-col>
                    <v-col>생성 시간</v-col>
                    <v-col></v-col>
                </v-row>
                <v-row v-for="document in documents" :key="document.id" class="mb-2"
                    @click="openDocumentDetail(document.id)">
                    <v-col>{{ document.id }}</v-col>
                    <v-col>{{ document.fileName }}</v-col>
                    <v-col>{{ document.type }}</v-col>
                    <v-col>{{ document.userName }}</v-col>
                    <v-col>{{ document.createdAt }}</v-col>
                    <v-col>{{ document.hits }}</v-col>
                </v-row>
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
            selectedDoc: '전체 문서',
            searchDocOptions: ['전체 문서', '최근 조회 문서', '최근 수정 문서'],
            selectedType: '',
            selectedTypeOptions: [],
            drawer: false,
            selectedDocument: {}
        };
    },
    mounted() {
        this.fetchDocuments(this.selectedDoc);
    },
    watch: {
        selectedType() {
            this.fetchDocuments();
        }
    },
    methods: {
        // 문서 리스트 조회
        async fetchDocuments(option) {
            this.selectedDoc = option
            let url = '';
            try {
                if (this.selectedDoc == '전체 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/all`;
                } else if (this.selectedDoc == '최근 조회 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/viewd`;
                } else if (this.selectedDoc == '최근 수정 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/updated`;
                }

                console.log(url)
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
        },
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