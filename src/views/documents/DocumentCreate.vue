<template>

    <h1 style="margin:35px 0; font-weight:800">파일 업로드</h1>
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
                        문서 태그
                    </v-col>
                    <v-select v-model="tagNames" :items="tagOptions" label="태그를 선택하세요" multiple>
                        <template v-slot:selection="{ item, index }">
                            <v-chip v-if="index >= 0">
                                <span>{{ item.title }}</span>
                            </v-chip>
                        </template>
                    </v-select>
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
        }
    },
    mounted() {
        this.fetchTypes();
    },
    methods: {
        async fetchTypes() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/document/list/tags`, { headers: { Authorization: `Bearer ${this.token}` } });
                this.tagOptions = response.data.result;
                console.log(this.tagOptions)
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
                console.log("tags: " + this.tagNames);
                const submitData = new FormData();
                submitData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));

                if (this.selectedFile == null) {
                    alert("파일을 선택해주세요.");
                    return;
                }

                submitData.append("file", this.selectedFile);
                await axios.post(`${process.env.VUE_APP_API_BASE_URL}/document/uploadFile`, submitData,
                    { headers: { Authorization: `Bearer ${this.token}` } }
                );
                alert("파일이 성공적으로 업로드 되었습니다");
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