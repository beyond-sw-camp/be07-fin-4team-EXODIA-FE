<template>
    <v-container class="container">
        <!-- 상단 레이아웃 및 버튼 설정 -->
        <v-row class="mb-12 mt-4" style="padding-left:30px">
            <h1>결재 요청 문서</h1>
        </v-row>
        <v-row no-gutters class="mb-4 justify-end">
            <v-col cols="auto">
                <v-btn v-create @click="$router.push('/submit')">
                    결재 생성
                </v-btn>
            </v-col>
        </v-row>

        <!-- 문서 리스트 -->
        <div v-if="submitList && submitList.length > 0">
            <v-row justify="center" style="margin:0; text-align:center;">
                <v-col cols="12">
                    <v-row class="mb-2"
                        style="background-color:rgba(122,86,86,0.2); border-radius:12px; padding:4px; color:#444444; font-weight:600;">
                        <v-col cols="1" class="d-flex align-center justify-center"><strong>번호</strong></v-col>
                        <v-col cols="5">
                            <strong>결재 종류</strong>
                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn icon variant="text" v-bind="props">
                                        <v-icon>mdi-filter-menu-outline</v-icon>
                                    </v-btn>
                                </template>

                                <v-list>
                                    <v-list-item v-for="(item, index) in submitTypes" :key="index"
                                        @click="setSubmitType(item)">
                                        <v-list-item-title>
                                            {{ item }}
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-col>
                        <v-col cols="4" class="d-flex align-center justify-center"><strong>결재 신청 일시</strong></v-col>
                        <v-col cols="2"><strong>결재 상태</strong>

                            <v-menu>
                                <template v-slot:activator="{ props }">
                                    <v-btn icon variant="text" v-bind="props">
                                        <v-icon>mdi-filter-menu-outline</v-icon>
                                    </v-btn>
                                </template>

                                <v-list>
                                    <v-list-item v-for="(item, index) in submitStatuses" :key="index"
                                        @click="setSubmitStatus(item)">
                                        <v-list-item-title>
                                            <v-chip v-if="item === '반려'" color="red">
                                                {{ item }} </v-chip>
                                            <v-chip v-else-if="item === '승인'" color="green">
                                                {{ item }} </v-chip>
                                            <v-chip v-else color="gray">
                                                {{ item }}
                                            </v-chip>
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-col>
                    </v-row>

                    <v-row v-for="(submit, index) in submitList" :key="index" outlined
                        style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500"
                        @click="showDetail(submit.id)">
                        <!-- 가장 최근의 번호가 totalElements에서 시작하도록 계산 -->
                        <v-col cols="1">{{ totalCnt - ((currentPage - 1) * itemsPerPage + index) }}</v-col>
                        <v-col cols="5">{{ submit.submitType }}</v-col>
                        <v-col cols="4">{{ formatDate(submit.submitTime) }} {{ formatLocalTime(submit.submitTime)
                            }}</v-col>
                        <v-col cols="2" class="d-flex justify-center align-center">
                            <v-chip v-if="submit.submitStatus === '반려'" color="red">
                                {{ submit.submitStatus }}
                            </v-chip>
                            <v-chip v-else-if="submit.submitStatus === '승인'" color="green">
                                {{ submit.submitStatus }}
                            </v-chip>
                            <v-chip v-else color="gray">
                                {{ submit.submitStatus }}
                            </v-chip>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>

            <!-- 페이지네이션 -->
            <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5"
                @input="onPageChange"></v-pagination>

        </div>

        <div v-else>
            <v-row justify="center">
                데이터가 존재하지 않습니다.
            </v-row>
        </div>
    </v-container>
</template>


<script>
import axios from 'axios';

export default {
    data() {
        return {
            token: localStorage.getItem('token') || null,
            submitList: [], // 결재 요청 목록

            currentPage: 1, // 현재 페이지
            totalPages: 1, // 총 페이지 수
            itemsPerPage: 10, // 페이지당 항목 수
            totalCnt: 0, // 전체 데이터 수
            isMySubmitReq: true, // 결재 요청 여부

            submitTypes: ['법인 카드 사용 신청서', '휴가 신청서', '경조사 신청서'],
            submitStatuses: ['대기중', '승인', '반려'],
            submitStatus: null,
            submitType: null,

        };
    },
    watch: {
        currentPage(newPage) {
            this.currentPage = newPage;

            if (this.submitStatus == null && this.submitType == null) {
                this.fetchMySubmits();
            } else {
                // 필터 값이 존재하면
                this.fetchFilteredSubmits();
            }
        },
    },
    mounted() {
        this.fetchMySubmits();
    },
    methods: {
        async fetchMySubmits() {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/submit/list/my`;
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${this.token}` },
                    params: {
                        page: this.currentPage - 1,
                        size: this.itemsPerPage
                    }
                });

                this.submitList = response.data.result.content; // 페이지당 항목 수에 맞게 데이터 업데이트
                this.totalPages = response.data.result.totalPages; // 전체 페이지 수 설정
                this.totalCnt = response.data.result.totalElements; // 전체 요소 수 설정
            } catch (e) {
                console.error('결재 요청 정보를 가져오는 중 오류 발생:', e);
            }
        },
        formatDate(date) {
            return new Date(date)
                .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .replace(/\.\s/g, '.')
                .replace(/\.$/, '');
        },
        formatLocalTime(date) {
            return new Date(date).toLocaleTimeString();
        },
        showDetail(submitId) {
            this.$router.push({
                name: 'SubmitDetailComponent',
                params: { submitId: submitId },
                query: { isMySubmitReq: this.isMySubmitReq }
            });
        },
        setSubmitStatus(status) {
            this.submitStatus = status;
            this.fetchFilteredSubmits();
        },
        setSubmitType(type) {
            this.submitType = type;
            this.fetchFilteredSubmits();
        },
        async fetchFilteredSubmits() {
            try {
                const filterType = this.submitStatus ? "submitStatus" : "submitType";
                const filterValue = this.submitStatus || this.submitType;

                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/submit/filter/my`, {
                    params: {
                        filterType: filterType,
                        filterValue: filterValue,
                        page: this.currentPage - 1,
                        size: this.itemsPerPage
                    },
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                this.submitList = response.data.result.content;
                this.totalPages = response.data.result.totalPages;
                this.totalCnt = response.data.result.totalElements; // 전체 요소 수 설정
            } catch (e) {
                console.error('필터링 요청 중 에러', e);
            }
        },
    },
};
</script>

<style scoped>
.container {
    padding: 20px;
    border-radius: 12px;
}

.course-row {
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.course-row:hover {
    background-color: #f5f5f5;
}

.v-pagination {
    margin-top: 20px;
}

.v-chip {
    font-weight: bold;
}

.v-pagination .v-pagination__item {
    color: #722121;
    /* 페이지 번호 색상 */
}

.v-pagination .v-pagination__item--active {
    font-weight: bold;
    background-color: #c5e1a5;
    color: white;
}
</style>
