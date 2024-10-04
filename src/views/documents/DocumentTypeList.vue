    <template>
        <DocumentListComponent :pageTitle="typeId" :documents="documents" />
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

            typeId: '',
            documents: [],
        }
    },
    mounted() {
        const { id } = history.state;
        this.typeId = id;
        this.fetchDocuments();
    },
    methods: {
        async fetchDocuments() {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/list/type/${this.typeId}`;
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