<template>
    <v-container class="container">
        <v-row class="mb-4 mt-4" style="padding-left:30px">
            <h1>결재 상세 조회 - <span style="font-size:24px">{{ selectedSubmit.submitType }}</span></h1>
        </v-row>

        <v-row>
            <v-col cols="7">
                <v-row>
                    <v-card-text>
                        <table class="custom-table">
                            <tbody>
                                <tr>
                                    <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center;">
                                        신청인
                                    </td>
                                    <td style="width:70%;">{{ selectedSubmit.userName }}</td>
                                </tr>
                                <tr>
                                    <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center;">부서
                                    </td>
                                    <td style="width:70%;">{{ selectedSubmit.department }}</td>
                                </tr>
                                <tr>
                                    <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center">상태
                                    </td>
                                    <td style="width:70%;">
                                        <v-chip v-if="selectedSubmit.submitStatus === '반려'" color="red">
                                            {{ selectedSubmit.submitStatus }}
                                        </v-chip>
                                        <v-chip v-else-if="selectedSubmit.submitStatus === '승인'" color="green">
                                            {{ selectedSubmit.submitStatus }}
                                        </v-chip>
                                        <v-chip v-else color="gray">
                                            {{ selectedSubmit.submitStatus }}
                                        </v-chip>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center">신청
                                        시간
                                    </td>
                                    <td style="width:70%;">{{ formatDate(selectedSubmit.submitTime) }}{{
                                        formatLocalTime(selectedSubmit.submitTime) }}</td>
                                </tr>
                                <tr>
                                    <td style="width:30%; background-color:rgba(122, 86, 86, 0.2);text-align:center">내용
                                    </td>
                                    <td style="width:70%;">
                                        <v-col v-for="(value, key) in selectedSubmit.contents" :key="key">
                                            <div v-if="key === '신청일' || key === '휴가시작일' || key === '휴가종료일'">
                                                {{ key }}: {{ formatDate(value) }}
                                            </div>
                                            <div v-else>
                                                {{ key }}:{{ value }}
                                            </div>
                                        </v-col>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </v-card-text>
                </v-row>
            </v-col>

            <v-col cols="4" class="ml-4">
                <div v-for=" (dto, index) in submitLines" :key="index"
                    style="height:auto; border:3px solid rgba(122, 86, 86, 0.2); padding:20px; border-radius:8px; margin-bottom:10px;">
                    <!-- 단계 표시 -->
                    <v-row style="font-size:18px; font-weight:600; padding:20px 10px; display: block; ">
                        {{ submitLines.length - index }}차 결재자
                    </v-row>

                    <v-row class="mt-4 align-center justify-space-between" style="padding-bottom: 12px;">
                        <!-- 사용자 정보 -->
                        <v-col cols="8" class="d-flex align-start">
                            <v-avatar class="icon mr-4">
                                <v-img :src="dto?.profileImage || defaultProfileImage" aspect-ratio="1"></v-img>
                            </v-avatar>
                            <div>
                                <span>{{ dto.userName }}</span><br>
                                <small>{{ dto.positionName }}</small>
                            </div>
                        </v-col>

                        <!-- 결재 상태 -->
                        <v-col cols="4" class="d-flex align-center justify-end text-center">
                            <v-chip v-if="dto.submitStatus === '승인'" color="green" text-color="white"
                                class="text-center">
                                {{ dto.submitStatus }}
                            </v-chip>
                            <v-chip v-else-if="dto.submitStatus === '반려'" color="red" text-color="white" small
                                class="text-center">
                                {{ dto.submitStatus }}
                            </v-chip>
                            <v-chip v-else color="gray" text-color="white" small class="text-center">
                                {{ dto.submitStatus }}
                            </v-chip>
                        </v-col>
                    </v-row>
                </div>
            </v-col>
        </v-row>


        <v-row v-if="isMySubmitReq == 'true' && selectedSubmit.submitStatus === '대기중'" justify="end" class="mt-8">
            <v-btn style="background-color:#722121; color:#ffffff;" @click="confirmCancel(selectedSubmit.id)">
                결재 취소
            </v-btn>
        </v-row>


        <!-- 승인 거절 -->
        <v-row v-if="selectedSubmit.submitStatus === '대기중' && isMySubmitReq == 'false'"
            class="approveOrReject d-flex justify-end">
            <v-col cols="auto">
                <v-btn v-create value="승인" variant="outlined" v-model="approvalStatus" @click="confirmApprove()">
                    승인
                </v-btn>
            </v-col>
            <v-col cols="auto">
                <v-btn v-delete value="반려" variant="outlined" v-model="approvalStatus" @click="
                    handleApprovalChange('반려')">
                    반려
                </v-btn>
            </v-col>
        </v-row>


        <!-- 반려 사유 모달 -->
        <v-dialog v-model="isRejectReasonDialogVisible" max-width="500px">
            <v-card style="padding:30px">
                <v-card-title>
                    <h4>반려 사유 입력</h4>
                </v-card-title>
                <v-card-text style="margin-bottom:0">
                    <v-text-field label="반려 사유" v-model="reason" :rules="[v => !!v || '반려 사유를 작성하세요']"
                        required></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn v-create text @click="submitDecision">확인</v-btn>
                    <v-btn v-delete text @click="isRejectReasonDialogVisible = false">취소</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import axios from 'axios'

export default {
    data() {
        return {
            token: localStorage.getItem('token') || null,
            userNum: localStorage.getItem('userNum') || null,

            selectedSubmit: {},
            approvalStatus: '',
            reason: '',
            submitId: '',
            submitLines: {},
            isRejectReasonDialogVisible: false,
            isMySubmitReq: true,
            isCancel: false,

            defaultProfileImage: 'https://via.placeholder.com/150',

        }
    },
    mounted() {
        this.submitId = this.$route.params.submitId;
        this.isMySubmitReq = this.$route.query.isMySubmitReq

        this.fetchSubmitDetail(this.submitId);
        this.fetchSubmitLines(this.submitId);
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
                console.error('결재 상세 정보를 가져오는 중 오류 발생:', e);
            }
        },
        async fetchSubmitLines(submitId) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/submit/list/submitLine/${submitId}`;
                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });
                this.submitLines = response.data.result.reverse();
            } catch (e) {
                console.error('결재 라인 정보를 가져오는 중 오류 발생:', e);
            }
        },
        async submitDecision() {
            if (this.approvalStatus === '반려' && !this.reason) {
                alert('반려 사유를 작성하세요');
                return;
            }

            const url = `${process.env.VUE_APP_API_BASE_URL}/submit/update`;
            const submitData = {
                submitId: this.submitId,
                status: this.approvalStatus,
                reason: this.approvalStatus === '반려' ? this.reason : null
            };

            try {
                await axios.post(url, submitData, { headers: { Authorization: `Bearer ${this.token}` } })
                alert("결재 상태 변경이 성공적으로 처리되었습니다.")
                location.reload();
            } catch (e) {
                alert(e.response.data.status_message);
                location.reload();

            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        formatLocalTime(date) {
            return new Date(date).toLocaleTimeString();
        },
        handleApprovalChange(value) {
            this.approvalStatus = '반려';
            if (value === '반려') {
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
        async deleteSubmit(submitId) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/submit/delete/${submitId}`;
                await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });
                alert('결재를 취소하였습니다.');
                this.$router.push("/submit/list/my")
            } catch (e) {
                console.error('결재 취소 중 오류 발생:', e);
            }
        },
        confirmApprove() {
            const isConfirmed = window.confirm("결재 문서를 승인하시겠습니까?");
            if (isConfirmed) {
                this.approvalStatus = '승인';
                this.submitDecision();
            }
        },
        confirmCancel(submitId) {
            const isConfirmed = window.confirm("결재를 취소하시겠습니까?");
            if (isConfirmed) {
                this.isCancel = true;
                this.deleteSubmit(submitId);
            }
        }

    }
}
</script>
<style scoped>
.container {
    padding: 20px;
    border-radius: 12px;
}

.subtitle {
    justify-content: space-between;
}

.contents-item {
    border-bottom: 1px solid #b9b9b9;
    border-radius: 20px;
}


.custom-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
}

.custom-table th,
.custom-table td {
    padding: 20px;
    border-bottom: 2px solid rgba(122, 86, 86, 0.2);
    border-top: 2px solid rgba(122, 86, 86, 0.2);

}

.custom-table th {
    background-color: rgba(122, 86, 86, 0.2);
    font-weight: bold;
    text-align: left;

}

.custom-table td:first-child {
    font-weight: bold;
    border-bottom: 2px solid rgba(122, 86, 86, 0.2);
    border-bottom: 2px solid rgba(122, 86, 86, 0.2);

}

.v-checkbox {
    display: flex;
    align-content: center;
    align-items: center;
    padding: 0
}

.v-chip {
    padding: 0 20px !important;
    text-align: center;
}
</style>