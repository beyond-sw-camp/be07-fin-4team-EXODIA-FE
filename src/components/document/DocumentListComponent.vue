<template>
    <v-row>
        <h1 :class="{ 'drawer-open': drawer }">{{ pageTitle }}</h1>
    </v-row>

    <!-- 검색 옵션 -->
    <v-row justify="center" :class="{ 'drawer-open': drawer }" style="margin:0; text-align:center;">
        <v-col cols="7">
            <v-text-field v-model="searchQuery" placeholder="검색어를 입력하세요" variant="underlined" @input="filterDocuments"
                style="margin-bottom: 20px;" append-icon="mdi-magnify"
                @click:append=searchFilter(searchQuery)></v-text-field>
        </v-col>
        <v-col cols="2" v-if="this.pageTitle === '전체파일'">
            <v-btn style="background-color:#722121; color:#ffffff;" @click="$router.push('/document/create')">
                파일 등록
            </v-btn>
        </v-col>
        <!-- 팀장만 태그 생성 가능 -->
        <v-col v-if="this.positionId == 1">
            <v-btn @click="handleCreateTag()">
                태그 생성
            </v-btn>
        </v-col>
    </v-row>

    <!-- 문서 리스트 -->
    <div v-if="this.documents == null">
        <v-row justify="center" :class="{ 'drawer-open': drawer }">
            데이터가 존재하지 않습니다.
        </v-row>
    </div>

    <div v-else :class="{ 'drawer-open': drawer }">
        <v-row justify="center" :class="{ 'drawer-open': drawer }" style="margin:0; text-align:center; ">
            <v-col cols="12">
                <v-row class="mb-2" :class="{ 'drawer-open': drawer }"
                    style="background-color:rgba(122, 86, 86, 0.2);border-radius:15px ; padding:4px; color:#444444; font-weight:600;">
                    <v-col cols="1"><strong>번호</strong></v-col>
                    <v-col cols="6"><strong>제목</strong></v-col>
                    <v-col cols="3"><strong>등록일</strong></v-col>
                    <v-col cols="2"><strong>작성자</strong></v-col>
                </v-row>

                <v-row v-for="(document, index) in documents" :key="document.id" class="document" oulined
                    @click="openDrawer(document.id)"
                    style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500">
                    <v-col cols="1">{{ index + 1 }}</v-col>
                    <v-col cols="6" class="ellipsis-text" style="text-align:start;">{{ document.fileName }}</v-col>
                    <v-col cols="3">{{ formatDate(document.createdAt) }}</v-col>
                    <v-col cols="2">{{ document.userName }}</v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>



    <!-- 페이징 -->
    <v-pagination v-model="page" :length="totalPages" @input="fetchDocuments"></v-pagination>

    <!-- 상세 정보 -->
    <v-card>
        <v-navigation-drawer v-model="drawer" location="right" temporary width="700">
            <v-tabs v-model="tab" align-tabs="center" background-color="transparent">
                <v-tab class="tabs" value="1">상세보기</v-tab>
                <v-tab class="tabs" value="2" @click="fetchHistory(this.selectedDocument.id)">히스토리</v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
                <!-- 상세 정보 -->
                <v-tabs-window-item value="1">
                    <v-card-title>
                        <v-row class="detailFileName ellipsis-text">{{
                            selectedDocument.fileName
                        }}</v-row>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-row>생성 날짜</v-row>
                        <v-row>{{ formatDate(selectedDocument.createAt) }}</v-row>
                    </v-card-text>
                    <v-card-text>
                        <v-row>생성 시간</v-row>
                        <v-row>{{ formatLocalTime(selectedDocument.createAt) }}</v-row>
                    </v-card-text>
                    <v-card-text>
                        <v-row>파일 등록자</v-row>
                        <v-row>{{ selectedDocument.userName }}</v-row>
                    </v-card-text>
                    <v-card-text>
                        <v-row>태그</v-row>
                        <v-row>
                            <span v-for="(tag, index) in selectedDocument.tags" :key="index" style="padding-right:5px">
                                <v-chip>{{ tag }}</v-chip>
                            </span>
                        </v-row>
                    </v-card-text>
                    <v-card-text>
                        <v-row>파일 다운로드</v-row>
                        <v-row>
                            <v-btn style="color:#722121" @click="fileDownload(selectedDocument.id)">다운로드</v-btn>
                        </v-row>
                    </v-card-text>
                    <v-card-text>
                        <v-row>설명</v-row>
                        <v-row>{{ selectedDocument.description }}</v-row>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn style="background-color:#4CAF50; color:#ffffff" @click="$router.push({
                            name: 'DocumentUpdate', state: {
                                id: selectedDocument.id,
                            }
                        })">
                            업데이트</v-btn>
                        <v-btn style="background-color:#AF2626; color:#ffffff" @click="closeDrawer()">닫기</v-btn>
                    </v-card-actions>
                </v-tabs-window-item>


                <!-- 히스토리 -->
                <v-tabs-window-item value="2">
                    <v-card-title>
                        <span class="headline">히스토리</span>
                        <v-icon class="icon" @click="toggleHistoryVisibility"> {{ showHistory ? 'mdi-chevron-up' :
                            'mdi-chevron-down' }}</v-icon>
                        <v-divider></v-divider>
                    </v-card-title>

                    <v-timeline dense v-if="showHistory" style="margin:10px" width="600px">
                        <v-timeline-item v-for="(history, index) in historyDocument" :key="index" size="x-small">

                            <v-card width="250px" style="padding:20px">
                                <v-row justify="space-between">
                                    <v-col cols="1">
                                        <v-icon left>mdi-file-document-outline</v-icon>
                                    </v-col>
                                    <v-col cols="10">
                                        <span class="ellipsis-text-detail">{{ history.fileName }}</span>
                                    </v-col>
                                </v-row>
                                <v-row
                                    style="margin-bottom:0; padding-bottom:0; padding-top:0; padding-left:10px; padding-right:10px">
                                    <span style="font-size:12px">설명: {{ history.description }}</span>
                                </v-row>

                                <v-row class="user-info">
                                    <v-avatar class="icon">
                                        <img src="@/assets/user.png" alt="User Avatar" class="user-avatar"
                                            style="width: 100%; height: 100%; object-fit: cover;" />
                                    </v-avatar>
                                    <v-col style="padding:20px; font-size:14px">{{ history.userName }}</v-col>
                                </v-row>
                            </v-card>

                            <template v-slot:opposite>
                                <div>{{ formatDate(history.updatedAt) }}</div>
                                <v-btn @click="confirmRevert(history.id)">
                                    복원
                                </v-btn>
                            </template>
                        </v-timeline-item>
                    </v-timeline>

                    <!-- 댓글 -->
                    <v-card-title>
                        <span class="headline">댓글</span>
                        <v-icon class="icon" @click="toggleCommentsVisibility"> {{ showComments ? 'mdi-chevron-up' :
                            'mdi-chevron-down' }}</v-icon>
                        <v-row class="mt-4">
                            <v-col cols="9">
                                <v-text-field label="댓글을 입력하세요." variant="outlined" v-model="comment"></v-text-field>
                            </v-col>
                            <v-col cols="3">
                                <v-btn style="background-color:#722121; color:#ffffff;"
                                    @click="submitComments(this.selectedDocument.id)">저장</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-title>

                    <div v-if="showComments" class="comments">
                        <v-row v-if="this.comments.length > 0">
                            <v-col cols="12" v-for="(comment, index) in this.comments" :key="index">
                                <v-row class="comments-item">
                                    <v-col cols=1>
                                        <v-avatar class="icon" size="24">
                                            <img src="@/assets/user.png"
                                                style="width: 100%; height: 100%; object-fit: cover;" />
                                        </v-avatar>
                                    </v-col>
                                    <v-col cols="5">{{ comment.userName }}</v-col>
                                    <v-col cols="5" style="font-size:12px">{{ formatDate(comment.createdAt) }} {{
                                        formatLocalTime(comment.createdAt) }}</v-col>
                                </v-row>
                                <v-row cols="12" style="padding-left:50px">
                                    {{ comment.contents }}
                                </v-row>
                                <v-divider v-if="!showHistory"></v-divider>
                            </v-col>
                        </v-row>
                        <v-row v-else>
                            <v-col cols=" 12">
                                <p>댓글이 없습니다.</p>
                            </v-col>
                        </v-row>
                    </div>


                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn style="background-color:#4CAF50; color:#ffffff" @click="$router.push({
                            name: 'DocumentUpdate', state: {
                                id: selectedDocument.id,
                            }
                        })">
                            업데이트</v-btn>
                        <v-btn style="background-color:#AF2626; color:#ffffff" @click="closeDrawer()">닫기</v-btn>
                    </v-card-actions>

                </v-tabs-window-item>
            </v-tabs-window>
        </v-navigation-drawer>
    </v-card>

    <!-- 태그 생성 모달 -->
    <v-dialog v-model="isTagDialogVisible" max-width="500px">
        <v-card style="padding:30px">
            <v-card-title>
                <h4>태그 생성</h4>
            </v-card-title>
            <v-card-text style="margin-bottom:0">
                <v-text-field label="태그 이름" v-model="tagName" required></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-btn color="blue darken-1" text @click="isTagDialogVisible = false">취소</v-btn>
                <v-btn color="blue darken-1" text @click="submitCreateTag">확인</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

</template>

<script>
import axios from 'axios'

export default {
    props: ['pageTitle'],
    data() {
        return {
            token: localStorage.getItem('token') || null,
            userNum: localStorage.getItem('userNum') || null,
            positionId: localStorage.getItem('positionId') || null,
            departmentId: localStorage.getItem('departmentId') || null,

            title: '',
            drawer: false,
            selectedDocument: {},
            tab: '히스토리',
            showHistory: false,

            pageId: '',
            page: 1,
            pageSize: 10,
            totalPages: '',
            documents: {},

            comments: {},
            showComments: true,
            commentInput: '',

            isTagDialogVisible: false,
            tagName: '',
        }
    },
    mounted() {
        this.fetchDocuments(this.page);
    },
    watch: {
        documents(newDocuments) {
            this.localDocuments = newDocuments;
        },
        page(newPage) {
            this.fetchDocuments(newPage);
        }
    },
    methods: {
        async fetchDocuments(newPage) {
            try {
                let url = '';

                if (this.pageTitle == '전체파일') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/all`;
                } else if (this.pageTitle == '최근 조회 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/viewed`;
                } else if (this.pageTitle == '최근 업데이트 문서') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/updated`;
                }
                const response = await axios.get(url, {
                    params: {
                        page: newPage - 1,
                        size: this.pageSize
                    }
                });
                this.documents = response.data.result.content;
                this.totalPages = response.data.result.totalPages;
            } catch (e) {
                console.error('문서 목록을 가져오는 중 오류 발생:', e);
            }
        },
        async fetchComments() {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/comment/document/list/${this.selectedDocument.id}`;
                const response = await axios.get(url);
                this.comments = response.data.result;
            } catch (e) {
                console.error('댓글 목록 가져오는 중 오류 발생:', e);
            }
        },
        async submitComments(id) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/comment/document/create`;

                const createData = {
                    documentId: id,
                    userNum: this.userNum,
                    contents: this.comment
                };

                await axios.post(url, createData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                alert("댓글 작성이 성공적으로 처리되었습니다.");
                this.comment = '';
                this.fetchComments();
            } catch (e) {
                console.error('댓글 등록 중 오류 발생:', e);
            }
        },
        async openDrawer(id) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/detail/${id}`;
                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });

                console.log('Document data:', response.data.result);

                this.selectedDocument = response.data.result;
                this.drawer = true;
                console.log("tags: " + this.selectedDocument.tags)

                this.fetchComments();
            } catch (e) {
                console.error('문서 상세 정보를 가져오는 중 오류 발생:', e);
            }
        },
        closeDrawer() {
            this.showHistory = false;
            this.drawer = false;
        },
        async fileDownload(id) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/downloadFile/${id}`;
                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${this.token}` },
                    responseType: 'blob'
                });

                const blob = new Blob([response.data], { type: response.headers['content-type'] });

                // 다운로드를 위한 a태그 임시 추가
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', this.selectedDocument.fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                alert("파일 다운로드 성공");
            } catch (e) {
                console.error('파일 다운로드 중 오류 발생:', e);
            }
        },
        async fetchHistory(id) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/versions/${id}`;
                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });

                this.historyDocument = response.data.result;
            } catch (e) {
                console.error('히스토리 정보를 가져오는 중 오류 발생:', e);
            }
        },
        async searchFilter(input) {
            try {
                if (!input) {
                    this.localDocuments = this.documents;
                    return;
                }
                const url = `${process.env.VUE_APP_API_BASE_URL}/es/document/search?keyword=${input}`;
                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });

                this.localDocuments = response.data.result;
            }
            catch (e) {
                console.error("검색 중 오류 발생: ", e)
            }
        },
        confirmRevert(versionId) {
            // rollback 이전에 확인받기 위한 창
            const isConfirmed = window.confirm("이후의 문서에 대한 모든 버전이 삭제됩니다.\n 그래도 버전 되돌리기를 진행하시겠습니까?");
            if (isConfirmed) {
                this.revertToVersion(versionId);
            }
        },
        async revertToVersion(id) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/rollback/${id} `;
                await axios.post(url);
                location.reload();

            } catch (e) {
                console.error('롤백 중 오류 발생:', e);
            }
        },
        handleCreateTag() {
            this.isTagDialogVisible = true;
        },
        async submitCreateTag() {
            try {
                const submitData = {
                    departmentId: this.departmentId,
                    tagName: this.tagName
                };
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/tag/create`;
                await axios.post(url, submitData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                this.isTagDialogVisible = false;
                alert(`${this.tagName} 태그가 성공적으로 생성되었습니다.`);
                location.reload();
            } catch (e) {
                console.error('롤백 중 오류 발생:', e);
            }
        },
        formatDate(date) {
            return new Date(date).toLocaleDateString();
        },
        formatLocalTime(date) {
            return new Date(date).toLocaleTimeString();
        },
        toggleHistoryVisibility() {
            this.showHistory = !this.showHistory;
        },
        toggleCommentsVisibility() {
            this.showComments = !this.showComments;
        },
    },
}
</script>

<style scoped>
*:not(h1) {}

.login-container {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.drawer-open {
    transition: margin-right 0.3s ease;
    margin-right: 200px;
}

.v-card>.v-navigation-drawer {
    padding-top: 8vh;
}

.v-card-title {
    padding: 0;
}

v-card-title,
.v-card-subtitle {
    display: flex;
    align-items: center;
}

.ellipsis-text {
    /* 말줄임 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}


.ellipsis-text-detail {
    /* 말줄임 */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 200px;
    width: 100%;
}

.v-tabs-window {
    margin: 50px;
}

.v-avatar img {
    object-fit: cover;
}

.v-card-text {
    margin-bottom: 20px;
}

.detailFileName {
    margin: 20px 0 0;
}

.fileName {
    margin: 10px;
}

.v-timeline--vertical.v-timeline {
    row-gap: 0;
}

.v-divider {
    margin: 20px 0;
}

.comments {
    padding: 20px 10px;
}

.comments-item {
    display: flex;
    justify-content: space-between;
    align-content: center;
}


.user-info {
    display: flex;
    justify-content: center;
    align-content: center;
}
</style>