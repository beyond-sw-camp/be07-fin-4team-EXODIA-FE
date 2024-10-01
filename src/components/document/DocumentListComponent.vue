<template>
    <v-row>
        {{ pageTitle }}
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
        }
    },
}
</script>