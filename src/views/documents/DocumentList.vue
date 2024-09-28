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
                            <tr v-for="document in documents" :key="document.id">
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
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    name: 'DocumentsList',
    data() {
        return {
            documents: [],
            selectedType: '전체 문서',
            searchOptions: ['전체 문서', '최근 조회 문서', '최근 수정 문서'],
            token: localStorage.getItem('token') || null,
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

                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } }
                );
                this.documents = response.data.result;
            } catch (e) {
                console.error('문서 목록을 가져오는 중 오류 발생:', e);
            }
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
</style>