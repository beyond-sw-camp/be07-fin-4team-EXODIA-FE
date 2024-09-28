<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-card>
                    <!-- <v-card-title class="headline">전체 문서 목록</v-card-title>
                    <v-card-text>
                        <v-list>
                            <v-list-item v-for="document in documents" :key="document.id">
                                <v-list-item-content>
                                    <v-list-item-title>{{ document.roomName }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ document.participantCount }} 명 참여 중</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-icon>mdi-arrow-right</v-icon>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                    </v-card-text> -->
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
            token: localStorage.getItem('token') || null,  // 토큰을 저장
        };
    },
    mounted() {
        this.fetchDocuments();
    },
    methods: {
        async fetchDocuments() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/document/list/all`,
                    { headers: { Authorization: `Bearer ${this.token}` } }
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