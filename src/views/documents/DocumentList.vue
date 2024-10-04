<template>
    <DocumentListComponent :pageTitle="전체문서" :documents="documents" />
</template>

<script>
import DocumentListComponent from '@/components/document/DocumentListComponent.vue';
import axios from 'axios'

export default {
    name: 'DocumentsList',
    components: {
        DocumentListComponent
    },
    data() {
        return {
            token: localStorage.getItem('token') || null,
            documents: [],
        }
    },
    mounted() {

        this.fetchDocuments();
    },
    methods: {
        async fetchDocuments() {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/list/all`;
                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });
                this.documents = response.data.result;
                console.log(this.documents)
            } catch (e) {
                console.error('문서 목록을 가져오는 중 오류 발생:', e);
            }
        },
    }
};
</script>