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
                <v-chip class="d-inline-flex align-center" v-bind:class="{
                    'chip-reject': selectedSubmit.submitStatus === 'REJECT',
                    'chip-accept': selectedSubmit.submitStatus === 'ACCEPT'
                }">{{ selectedSubmit.submitStatus }}</v-chip>
            </v-col>
            <v-col cols="12">
                <strong>신청 시간:</strong> {{ formatDate(selectedSubmit.submitTime) }}
            </v-col>
            <!-- <v-col cols="12">
                <strong>내용:</strong> {{ parseContents(selectedSubmit.contents) }}
            </v-col> -->
            <v-col v-for="(value, key) in selectedSubmit.contents" :key="key" cols="12">
                <strong>{{ key }}:</strong> {{ value }}
            </v-col>


            <!-- 승인 여부, 거절 선택/ 결재 담당자만 보여주게끔 -->
            <v-col cols="12" v-if="selectedSubmit.submitStatus === 'WAITING'">
                <strong>승인 여부 선택:</strong>
                <v-radio-group v-model="approvalStatus" mandatory>
                    <v-radio label="승인" value="ACCEPT"></v-radio>
                    <v-radio label="반려" value="REJECT"></v-radio>
                </v-radio-group>
            </v-col>

            <v-col cols="12" v-if="approvalStatus === 'REJECT' && selectedSubmit.submitStatus === 'WAITING'">
                <v-text-field label="반려 사유" v-model="reason" :rules="[v => !!v || '반려 사유를 작성하세요']"
                    required></v-text-field>
            </v-col>
        </v-row>
    </v-card>

    <v-col cols="12" v-if="selectedSubmit.submitStatus === 'WAITING'">
        <v-btn color="primary" @click="submitDecision">
            제출
        </v-btn>
    </v-col>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            token: localStorage.getItem('token') || null,

            selectedSubmit: {},
            approvalStatus: '',
            reason: '',
            submitId: '',

        }
    },
    created() {
        this.submitId = this.$route.params.submitId;
        this.fetchSubmitDetail(this.submitId);

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
        submitDecision() {
            if (this.approvalStatus === 'REJECT' && !this.reason) {
                alert('반려 사유를 작성하세요');
                return;
            }

            const url = `${process.env.VUE_APP_API_BASE_URL}/submit/update`;
            const submitData = {
                submitId: this.submitId,
                status: this.approvalStatus,
                reason: this.approvalStatus === 'REJECT' ? this.reason : null
            };

            try {
                axios.post(url, submitData, { headers: { Authorization: `Bearer ${this.token}` } })
                alert("결재 상태 변경이 성공적으로 처리되었습니다.")
                location.reload();
            } catch (e) {
                console.error('결재 승인/반려 처리 중 오류 발생:', e.response.data.status_message);

            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
    }
}
</script>
<style scoped>
.chip-reject {
    background-color: #e57373;
    color: white;
}

.chip-accept {
    background-color: #81c784;
    color: white;
    padding: auto;
}
</style>