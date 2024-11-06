<template>
    <v-container class="container">
        <v-row class="mb-12 mt-4" style="padding-left:30px">
            <h1>결재 할 문서</h1>
        </v-row>

        <v-row justify="center">
            <v-col cols="5">
                <v-text-field v-model="searchQuery" variant="underlined" placeholder="검색어를 입력하세요"
                    append-icon="mdi-magnify" @click:append="fetchFilteredSubmits"
                    style="margin-bottom: 20px;"></v-text-field>
            </v-col>
        </v-row>
        

        <!-- 문서 리스트 -->
        <div v-if="submitList == null || submitList.length === 0">
            <v-row justify="center">
                데이터가 존재하지 않습니다.
            </v-row>
        </div>

        <div v-else>
            <v-row justify="center" style="margin:0; text-align:center;">
                <v-col cols="12">
                    <v-row class="mb-2"
                        style="background-color:rgba(122,86,86,0.2); border-radius:12px; padding:4px; color:#444444; font-weight:600;">
                        <v-col cols="1" class="d-flex align-center justify-center"><strong>번호</strong></v-col>
                        <v-col cols="2">
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
                                        <v-list-item-title>{{ item }}</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-col>
                        <v-col cols="1" class="d-flex align-center justify-center"><strong>신청인</strong></v-col>
                        <v-col cols="3" class="d-flex align-center justify-center"><strong>신청 일시</strong></v-col>
                        <v-col cols="3" class="d-flex align-center justify-center"><strong>처리 일시</strong></v-col>
                        <v-col cols="2"><strong>상태</strong>
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
                                            <v-chip v-if="item === '반려'" color="red">{{ item }}</v-chip>
                                            <v-chip v-else-if="item === '승인'" color="green">{{ item }}</v-chip>
                                            <v-chip v-else color="gray">{{ item }}</v-chip>
                                        </v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-col>
                    </v-row>

                    <v-row v-for="(submit, index) in filteredSubmitList" :key="submit.id"
                        style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500"
                        @click="showDetail(submit.id)">
                        <v-col cols="1">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</v-col>
                        <v-col cols="2">{{ submit.submitType }}</v-col>
                        <v-col cols="1">{{ submit.userName }}</v-col>
                        <v-col cols="3">{{ formatDate(submit.submitTime) }} {{ formatLocalTime(submit.submitTime) }}
                        </v-col>
                        <v-col cols="3">{{ formatDate(submit.updatedTime) || ' ' }}
                            {{ formatLocalTime(submit.updatedTime) || ' ' }}</v-col>
                        <v-col cols="2" class="d-flex justify-center align-center">
                            <v-chip v-if="submit.submitStatus === '반려'" color="red">{{ submit.submitStatus }}</v-chip>
                            <v-chip v-else-if="submit.submitStatus === '승인'" color="green">{{ submit.submitStatus }}
                            </v-chip>
                            <v-chip v-else color="gray">{{ submit.submitStatus }}</v-chip>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>

            <!-- 페이지네이션 -->
            <v-row justify="center" class="my-4">
                <v-pagination v-model="currentPage" :length="totalPages" :total-visible="5" @input="onPageChange">
                </v-pagination>
            </v-row>
        </div>
    </v-container>
</template>


<script>
import axios from 'axios'

export default {
    data() {
        return {
            token: localStorage.getItem('token') || null,
            submitList: [],
            searchQuery: '',
            isMySubmitReq: false,

            submitTypes: ['법인 카드 사용 신청서', '휴가 신청서', '경조사 신청서'],
            submitStatuses: ['대기중', '승인', '반려'],
            selectedSubmitStatus: null,
            selectedSubmitType: null,

            currentPage: 1, // 현재 페이지
            totalPages: 1, // 총 페이지 수
            itemsPerPage: 10, // 페이지당 항목 수
            totalCnt: 0, // 전체 데이터 수
        }
    },
    mounted() {
        this.fetchMySubmits();
    },
    watch: {
        currentPage(newPage, oldPage) {
      console.log("currentPage 값 변경됨 - 이전 값:", oldPage, "새 값:", newPage);
      this.fetchMySubmits();
    },
    },
    computed: {
        filteredSubmitList() {
            let filteredList = this.submitList;

            if (this.selectedSubmitType) {
                filteredList = filteredList.filter(submit => submit.submitType === this.selectedSubmitType);
            }

            if (this.selectedSubmitStatus) {
                filteredList = filteredList.filter(submit => submit.submitStatus === this.selectedSubmitStatus);
            }

            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filteredList = filteredList.filter(submit => {
                    return (
                        submit.submitType.toLowerCase().includes(query) ||
                        `${submit.department} ${submit.userName}`.toLowerCase().includes(query) ||
                        this.formatDate(submit.submitTime).toLowerCase().includes(query) ||
                        submit.submitStatus.toLowerCase().includes(query)
                    );
                });
            }

            return filteredList;
        }
    },
    methods: {
        async fetchMySubmits() {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/submit/list`;
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${this.token}` },
                    params: {
                        page: this.currentPage - 1,
                        size: this.itemsPerPage,
                        submitStatus: this.selectedSubmitStatus,
                        submitType: this.selectedSubmitType,
                        searchQuery: this.searchQuery
                    }
                });
                this.submitList = response.data.result.content;
                this.totalPages = response.data.result.totalPages;
                this.totalCnt = response.data.result.totalElements;
            } catch (e) {
                console.error('결재 요청 정보를 가져오는 중 오류 발생:', e);
            }
        },
        async fetchFilteredSubmits() {
            this.currentPage = 1; // 필터 변경 시 첫 페이지로 초기화
            this.fetchMySubmits();
        },
        formatDate(date) {
            if (!date) return '';
            return new Date(date)
                .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .replace(/\.\s/g, '.') // 중간에 붙는 공백을 없앰
                .replace(/\.$/, ''); // 마지막에 붙는 '.'을 없앰
        },
        formatLocalTime(date) {
            if (!date) return '';
            return new Date(date).toLocaleTimeString();
        },
        showDetail(submitId) {
            this.$router.push({ name: 'SubmitDetailComponent', params: { submitId }, query: { isMySubmitReq: this.isMySubmitReq } });
        },
        setSubmitStatus(item) {
            this.selectedSubmitStatus = item;
            this.fetchFilteredSubmits();
        },
        setSubmitType(item) {
            this.selectedSubmitType = item;
            this.fetchFilteredSubmits();
        },
        onPageChange(page) {
            this.currentPage = page;
        }
    }
}
</script>


<style scoped>
.container {
    padding: 20px;
    border-radius: 12px;
}


.searchBtn {
    border: none;
    height: 50px;
}
</style>