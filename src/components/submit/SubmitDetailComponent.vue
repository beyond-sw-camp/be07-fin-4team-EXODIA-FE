<template>
    <h1>결재 상세 조회</h1>
    <h2 style="margin:20px 0;">{{ selectedSubmit.submitType }}</h2>


    <v-row>
        <!-- 내용 -->
        <v-col cols="8">
            <v-row>
                <v-col cols="3">
                    <v-list-subheader>신청인</v-list-subheader>
                </v-col>
                <v-col cols="3">
                    <v-list-subheader style="font-weight:700">{{ selectedSubmit.userName }}</v-list-subheader>
                </v-col>
                <v-col cols="3">
                    <v-list-subheader>부서</v-list-subheader>
                </v-col>
                <v-col cols="3">
                    <v-list-subheader style="font-weight:700">{{ selectedSubmit.department }}</v-list-subheader>
                </v-col>
            </v-row>

            <!-- 결재 상태 -->
            <v-row>
                <v-col cols="3">
                    <v-list-subheader>상태</v-list-subheader>
                </v-col>
                <v-col cols="9">
                    <v-chip class="d-inline-flex align-center" v-bind:class="{
                        'chip-reject': selectedSubmit.submitStatus === 'REJECT',
                        'chip-accept': selectedSubmit.submitStatus === 'ACCEPT'
                    }">{{ selectedSubmit.submitStatus }}</v-chip>
                </v-col>
            </v-row>

            <!-- 결재 신청 시간 -->
            <v-row>
                <v-col cols="3">
                    <v-list-subheader>신청 시간</v-list-subheader>
                </v-col>
                <v-col cols="9">
                    <v-list-subheader style="font-weight:700">
                        {{ formatDate(selectedSubmit.submitTime) }}
                        {{ formatLocalTime(selectedSubmit.submitTime) }}
                    </v-list-subheader>
                </v-col>
            </v-row>

            <!-- 결재 내용 -->
            <v-row style="justify-content: space-between">
                <v-col cols="3">
                    <v-list-subheader>내용</v-list-subheader>
                </v-col>
                <v-col cols="9">
                    <div style="border: 1px solid #b9b9b9; border-radius:20px">
                        <v-col v-for="(value, key) in selectedSubmit.contents" :key="key">
                            <div v-if="key === '신청일'">
                                {{ key }}: {{ formatDate(value) }}
                            </div>
                            <div v-else>
                                {{ key }}:{{ value }}
                            </div>
                        </v-col>
                    </div>
                </v-col>
            </v-row>
        </v-col>

        <!-- 승인 거절 -->
        <!-- 요청한 경우에는 화면에서 안나오게 처리 필요 -->
        <v-col cols="4" v-if="selectedSubmit.submitStatus === 'WAITING' && isMySubmitReq == 'false'">
            <strong>승인 여부 선택:</strong>
            <v-radio-group v-model="approvalStatus" mandatory @change="handleApprovalChange(approvalStatus)">
                <v-radio label="승인" value="ACCEPT"></v-radio>
                <v-radio label="반려" value="REJECT"></v-radio>
            </v-radio-group>
            <v-col cols="12" v-if="selectedSubmit.submitStatus === 'WAITING'">
                <v-btn color="primary" @click="submitDecision">
                    제출
                </v-btn>

            </v-col>
        </v-col>
    </v-row>

    <!-- 반려 사유 모달 -->
    <v-dialog v-model="isRejectReasonDialogVisible" max-width="500px">
        <v-card>
            <v-card-title>
                <h4>반려 사유 입력</h4>
            </v-card-title>
            <v-card-text>
                <v-text-field label="반려 사유" v-model="reason" :rules="[v => !!v || '반려 사유를 작성하세요']"
                    required></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="isRejectReasonDialogVisible = false">취소</v-btn>
                <v-btn color="blue darken-1" text @click="submitDecision">확인</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

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
            isRejectReasonDialogVisible: false,
            isMySubmitReq: true,
        }
    },
    created() {
        this.submitId = this.$route.params.submitId;
        this.isMySubmitReq = this.$route.query.isMySubmitReq

        console.log(this.isMySubmitReq);
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

                console.log(this.selectedSubmit.contents);
            } catch (e) {
                console.error('문서 상세 정보를 가져오는 중 오류 발생:', e);
            }
        },
        async submitDecision() {
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
                await axios.post(url, submitData, { headers: { Authorization: `Bearer ${this.token}` } })
                alert("결재 상태 변경이 성공적으로 처리되었습니다.")
                location.reload();
            } catch (e) {
                console.error('결재 승인/반려 처리 중 오류 발생:', e.response.data.status_message);

            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        formatLocalTime(date) {
            return new Date(date).toLocaleTimeString();
        },
        handleApprovalChange(value) {
            console.log(value)
            if (value === 'REJECT') {
                this.isRejectReasonDialogVisible = true;
            }
        },
        confirmRejectReason() {
            if (!this.reason) {
                alert('반려 사유를 작성하세요');
            } else {
                this.isRejectReasonDialogVisible = false;
            }
        },
    }
}
</script>
<style scoped>
*:not(h1, h2) {
    font-size: 14px;
}

.subtitle {
    justify-content: space-between;
}

.contents-item {
    border: 1px solid #b9b9b9;
    border-radius: 20px;
}

.chip-reject {
    background-color: #e57373;
    color: white;
}

.chip-accept {
    background-color: #4cAf50;
    color: white;
    padding: auto;
}
</style>