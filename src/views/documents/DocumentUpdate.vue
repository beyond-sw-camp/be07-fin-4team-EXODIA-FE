<template>
    <v-container class="main-container">
        <h1>문서 업데이트</h1>
        <v-row justify="center">
            <v-col cols="12">
                <v-form>
                    <v-row>
                        <v-col cols=4>
                            첨부파일
                        </v-col>
                        <v-col cols="8">
                            <v-file-input v-model="selectedFile" label="파일 선택" @change="fileUpdate()">
                            </v-file-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols=4>
                            문서 타입
                        </v-col>
                        <v-col cols="8"> {{ this.documentType }} </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols=4>
                            설명
                        </v-col>
                        <v-col cols="8">
                            <v-textarea v-model="description" label="설명" rows="3" class="custom-textarea"></v-textarea>
                        </v-col>
                    </v-row>
                    <v-row justify="end">
                        <v-card-actions>
                            <v-btn style="background-color:#4CAF50; color:#ffffff" @click="submitForm">등록</v-btn>
                            <v-btn style="background-color:#AF2626; color:#ffffff" @click="closeForm">닫기</v-btn>
                        </v-card-actions>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';


export default {
    name: 'DocumentCreate',
    data() {
        return {
            token: localStorage.getItem('token') || null,
            document: {},
            description: '',
            selectedFile: '',
            documentId: '',
            documentType: '',
        }
    },
    mounted() {
        const { id } = history.state;
        this.documentId = id;
        this.fetchDocument();
    },
    methods: {
        async fetchDocument() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/document/detail/` + this.documentId, { headers: { Authorization: `Bearer ${this.token}` } });
                this.document = response.data.result;
                this.documentType = response.data.result.documentType;
            } catch (e) {
                console.error('문서 디테일 가져오는 중 오류 발생:', e);
            }
        },
        async submitForm() {
            try {
                const data = {
                    id: this.documentId,
                    typeName: this.selectedType,
                    description: this.description,
                };
                const submitData = new FormData();
                submitData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
                submitData.append("file", this.selectedFile);

                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/document/update`, submitData,
                    { headers: { Authorization: `Bearer ${this.token}` } }
                );
                this.$router.push('/document');

            } catch (e) {
                console.error('파일 업로드 중 오류 발생:', e);
            }
        },
        fileUpdate() {
            console.log('선택한 파일:', this.selectedFile);
        },
        closeForm() {
            this.$router.push('/document');
        }
    }
};
</script>

<style scoped>
.login-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.main-container {
    padding: 100px 150px;
}
</style>