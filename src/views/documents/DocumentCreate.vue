<template>
    <v-container class="container">
        <v-row class="mb-12" style="padding-left:30px">
            <h1>파일 업로드</h1>
        </v-row>
        <v-row justify="center">
            <v-col cols="9">
                <v-form>
                    <v-row>
                        <v-col cols=4>
                            <strong>첨부파일</strong>
                        </v-col>
                        <v-col cols="8">
                            <v-file-input v-model="selectedFile" label="파일 선택" @change="fileUpdate()">
                            </v-file-input>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols=4>
                            <strong>작성자</strong>
                        </v-col>
                        <v-col cols="8">
                            <v-text-field disabled>
                                {{ this.userName }}
                            </v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols=4>
                            <strong>문서 태그</strong>
                        </v-col>
                        <v-col>
                            <v-select v-model="tagNames" :items="tagOptions" label="태그를 선택하세요" multiple
                                item-text="tagName" item-value="tagName">
                                <template v-slot:selection="{ item, index }">
                                    <v-chip v-if="index >= 0">
                                        <span>{{ item.value }}</span>
                                    </v-chip>
                                </template>
                            </v-select>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols=4>
                            <strong>설명</strong>
                        </v-col>
                        <v-col cols="8">
                            <v-textarea v-model="description" label="설명" rows="3" class="custom-textarea"></v-textarea>
                        </v-col>
                    </v-row>
                    <v-row justify="end">
                        <v-card-actions>
                            <v-btn v-create @click="submitForm">등록</v-btn>
                            <v-btn v-delete @click="closeForm">닫기</v-btn>
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
            tagNames: [],
            tagOptions: [],
            description: '',
            selectedFile: '',
            userName: '',
        }
    },
    mounted() {
        this.fetchWriter();
        this.fetchTypes();
    },
    methods: {
        async fetchWriter() {
            try {
                const response = await axios.get('/user/userName');
                this.userName = response.data.result;
            } catch (e) {
                console.error('회원 이름 불러오는데 오류 발생:', e);
            }
        },
        async fetchTypes() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/document/list/tags`, { headers: { Authorization: `Bearer ${this.token}` } });
                this.tagOptions = response.data.result.map(tag => tag.tagName);

            } catch (e) {
                console.error('문서 타입 가져오는 중 오류 발생:', e);
            }
        },
        async submitForm() {
            try {
                const data = {
                    tags: this.tagNames,
                    description: this.description,
                };

                const submitData = new FormData();
                submitData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
                submitData.append("file", this.selectedFile);

                if (this.selectedFile == null) {
                    alert("파일을 선택해주세요.");
                    return;
                }
                const response = await axios.post(`${process.env.VUE_APP_API_BASE_URL}/document/uploadFile`, submitData,
                    { headers: { Authorization: `Bearer ${this.token}` } }
                );
                alert(response.data.status_message);
                this.$router.push('/document');
            } catch (e) {
                if (e.response && e.response.data && e.response.data.status_message) {
                    alert(e.response.data.status_message);
                } else {
                    alert("파일을 선택해주세요.");
                }
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
.container {
    padding: 20px;
    border-radius: 12px;
}
</style>