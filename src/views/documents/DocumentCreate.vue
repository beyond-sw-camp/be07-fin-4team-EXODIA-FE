<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-form>
                    <v-row>
                        <v-col cols=4>
                            첨부파일
                        </v-col>
                        <v-col cols="8">
                            <v-file-input v-model="selectedFile" label="파일 선택" @change="fileUpdate" hide-details>
                            </v-file-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols=4>
                            문서 타입
                        </v-col>
                        <v-col cols="8">
                            <v-select v-model="selectedType" :items="typeOptions" item-title="text" item-value="value"
                                class="custom-select"></v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols=4>
                            설명
                        </v-col>
                        <v-col cols="8">
                            <v-textarea v-model="description" label="설명" rows="3" class="custom-textarea"></v-textarea>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" class="text-right">
                            <v-btn color="primary" @click="submitForm">등록</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
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
            token: localStorage.getItem('token') || null,
            selectedFile: '',
            typeName: '',
            description: '',
            selectedType: '',
            typeOptions: []
        };
    },
    mounted() {
        this.fetchTypes();
    },
    methods: {
        // 문서 타입 
        async fetchTypes() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/document/list/type`, { headers: { Authorization: `Bearer ${this.token}` } });
                this.typeOptions = response.data.result;
            } catch (e) {
                console.error('문서 타입 가져오는 중 오류 발생:', e);
            }
        },
        async submitForm() {
            try {
                const data = {
                    typeName: this.selectedType,
                    description: this.description,
                };

                const createData = new FormData();
                createData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
                createData.append("file", this.selectedFile);

                console.log(data)
                console.log(this.selectedFile)
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/document/uploadFile`, createData,
                    { headers: { Authorization: `Bearer ${this.token}` } }
                );
                console.log('업로드 성공:', response.data);
            } catch (e) {
                console.error('파일 업로드 중 오류 발생:', e);
            }
        },
        fileUpdate() {
            console.log('선택한 파일:', this.selectedFile);
        },
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
</style>