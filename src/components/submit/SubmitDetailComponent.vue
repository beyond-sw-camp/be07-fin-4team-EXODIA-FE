<template>
    <v-card class="p-4">
        <v-row>
            <v-col cols="12">
                <h3>결재 정보 상세</h3>
            </v-col>
            <v-col cols="6">
                <strong>신청자 이름:</strong> {{ selectedSubmit.userName }}
            </v-col>
            <v-col cols="6">
                <strong>부서:</strong> {{ selectedSubmit.department }}
            </v-col>
            <v-col cols="12">
                <strong>결재 종류:</strong> {{ selectedSubmit.submitType }}
            </v-col>
            <v-col cols="12">
                <strong>상태:</strong>
                <v-chip :color="statusColor" class="d-inline-flex align-center">
                    {{ selectedSubmit.submitStatus }}
                </v-chip>
            </v-col>
            <!-- <v-col cols="12">
                <strong>내용:</strong> {{ parseContents(selectedSubmit.contents) }}
            </v-col> -->
            <v-col v-for="(value, key) in selectedSubmit.contents" :key="key" cols="12">
                <strong>{{ key }}:</strong> {{ value }}
            </v-col>
            <v-col cols="12" v-if="selectedSubmit.rejectReason">
                <strong>반려 사유:</strong> {{ selectedSubmit.rejectReason }}
            </v-col>
            <v-col cols="12">
                <strong>신청 시간:</strong> {{ formatDate(selectedSubmit.submitTime) }}
            </v-col>
        </v-row>
    </v-card>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            token: localStorage.getItem('token') || null,

            selectedSubmit: {}
        }
    },
    created() {
        const submitId = this.$route.params.submitId;
        console.log("submitId: " + submitId)
        this.fetchSubmitDetail(submitId);

    },

    methods: {
        async fetchSubmitDetail(submitId) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/submit/detail/${submitId}`;
                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });
                this.selectedSubmit = response.data.result;

                if (typeof this.selectedSubmit.contents === 'string') {
                    this.selectedSubmit.contents = JSON.parse(this.selectedSubmit.contents);
                }
            } catch (e) {
                console.error('문서 상세 정보를 가져오는 중 오류 발생:', e);
            }
        },
        parseContents(contents) {
            try {
                return JSON.parse(contents);
            } catch (e) {
                console.error('Contents parsing error:', e);
                return contents; // Fallback if parsing fails
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
    }
}
</script>
