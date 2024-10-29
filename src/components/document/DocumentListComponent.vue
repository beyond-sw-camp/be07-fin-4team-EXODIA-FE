<template>
    <v-container class="container">
        <v-row class="mb-12" style="padding-left:30px">
            <h1 :class="{ 'drawer-open': drawer }">{{ pageTitle }}</h1>
        </v-row>

        <!-- 검색 옵션 -->
        <v-row justify="center" :class="{ 'drawer-open': drawer }">
            <v-col cols="8">
                <v-text-field v-model="keyword" placeholder="검색어를 입력하세요" variant="underlined" @input="filterDocuments"
                    append-icon="mdi-magnify" @click:append=esSearch(keyword)></v-text-field>
            </v-col>
        </v-row>
        <v-row justify="end" class="mb-4">
            <v-col cols="auto" v-if="this.positionId == 1 && this.pageTitle == '전체 파일'">
                <v-btn v-create variant="outlined" @click="handleCreateTag()">
                    태그 생성
                </v-btn>
            </v-col>
            <v-col cols="auto" v-if="this.pageTitle === '전체 파일'">
                <v-btn v-create variant="outlined" @click="$router.push('/document/create')">
                    파일 등록
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
                        <v-col cols="6"><strong>파일 이름</strong></v-col>
                        <v-col cols="3"><strong>등록일</strong></v-col>
                        <v-col cols="2"><strong>작성자</strong></v-col>
                    </v-row>

                    <v-row :class="{ 'drawer-open': drawer }" v-for="(document, index) in documents" :key="document.id"
                        class="document" oulined @click="openDrawer(document.id)"
                        style="border-bottom:1px solid #E7E4E4; padding:5px; font-weight:500">
                        <v-col cols="1">{{ index + 1 }}</v-col>
                        <v-col cols="6" class="ellipsis-text-list" style="text-align:start;">{{ document.fileName
                            }}</v-col>
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
                            <v-row class="detail-file-name ellipsis-text">
                                {{ selectedDocument.fileName }}
                                <v-icon @click="fileDownload(selectedDocument.id)">mdi-file-download-outline</v-icon>
                            </v-row>
                        </v-card-title>
                        <v-divider></v-divider>
                        <v-card-text>
                            <v-row style="font-size:16px; font-weight: 600">생성 날짜</v-row>
                            <v-row style="font-size:14px">{{ formatDate(selectedDocument.createAt) }}</v-row>
                        </v-card-text>
                        <v-card-text>
                            <v-row style="font-size:16px; font-weight: 600">생성 시간</v-row>
                            <v-row style="font-size:14px">{{ formatLocalTime(selectedDocument.createAt) }}</v-row>
                        </v-card-text>
                        <v-card-text>
                            <v-row style="font-size:16px; font-weight: 600">파일 등록자</v-row>
                            <v-row style="font-size:14px">{{ selectedDocument.userName }}</v-row>
                        </v-card-text>
                        <v-card-text>
                            <v-row style="font-size:16px; font-weight: 600">태그</v-row>
                            <v-row style="font-size:14px">
                                <span v-for="(tag, index) in selectedDocument.tags" :key="index"
                                    style="padding-right:5px">
                                    <v-chip>{{ tag }}</v-chip>
                                </span>
                            </v-row>
                        </v-card-text>
                        <v-card-text>
                            <v-row style="font-size:16px; font-weight: 600">설명</v-row>
                            <v-row>{{ selectedDocument.description }}</v-row>
                        </v-card-text>

                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn v-create @click="$router.push({
                                name: 'DocumentUpdate', state: {
                                    id: selectedDocument.id,
                                }
                            })">
                                업데이트</v-btn>
                            <v-btn v-delete @click="closeDrawer()">닫기</v-btn>
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

                        <v-timeline dense v-if="showHistory" style="margin:10px" width="500px">
                            <v-timeline-item v-for="(history, index) in historyDocument" :key="index" size="x-small">

                                <v-col class="history-item" style="padding:20px; width:250px">
                                    <v-row justify="space-between">
                                        <v-col cols="2">
                                            <v-icon size="18" left>mdi-file-document-outline</v-icon>
                                        </v-col>
                                        <v-col cols="10" style="padding-left:0">
                                            <span class="ellipsis-text-detail">{{ history.fileName }}</span>
                                        </v-col>
                                    </v-row>
                                    <v-row
                                        style="margin-bottom:3px; margin-top:0; padding-bottom:0; padding-top:0; padding-left:10px; padding-right:10px">
                                        <span style="padding-left:6px; font-size:12px">설명: {{ history.description
                                            }}</span>
                                    </v-row>

                                    <v-row class="user-info" style="margin-top:0">
                                        <v-col cols="2" style="padding-top:0;">
                                            <v-avatar class="icon" size="30">
                                                <v-img :src="history?.userProfileImage || defaultProfileImage"
                                                    aspect-ratio="1"></v-img>
                                            </v-avatar>
                                        </v-col>
                                        <v-col style="font-size:14px; padding-top:0">{{ history.userName }}</v-col>
                                    </v-row>
                                </v-col>

                                <template v-slot:opposite>
                                    <div>{{ formatDate(history.updatedAt) }}</div>
                                    <v-btn variant="none" @click="confirmRevert(history.id)">
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
                                    <v-text-field density="compact" label="댓글을 입력하세요." variant="outlined"
                                        v-model="comment"></v-text-field>
                                </v-col>
                                <v-col cols="3">
                                    <v-btn v-create @click="submitComments(this.selectedDocument.id)">등록</v-btn>
                                </v-col>
                            </v-row>
                        </v-card-title>

                        <div v-if="showComments" class="comments">
                            <v-row v-if="this.comments.length > 0">
                                <v-col cols="12" v-for="(comment, index) in this.comments" :key="index">
                                    <v-row class="comments-item">
                                        <v-col cols=1>
                                            <v-avatar class="icon" size="28">
                                                <v-img :src="comment?.userProfileImage || defaultProfileImage"
                                                    aspect-ratio="1"></v-img>
                                            </v-avatar>
                                        </v-col>
                                        <v-col cols="5">{{ comment.userName }}</v-col>
                                    </v-row>
                                    <v-row cols="12" style="padding-left:50px" class="comment-content">
                                        {{ comment.contents }}
                                    </v-row>
                                    <v-row style="font-size:14px; padding-right:13px; color:gray" class="justify-end">
                                        {{ formatDate(comment.createdAt) }} {{
                                            formatLocalTime(comment.createdAt) }}
                                    </v-row>
                                    <v-divider></v-divider>
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
                            <v-btn v-create @click="$router.push({
                                name: 'DocumentUpdate', state: {
                                    id: selectedDocument.id,
                                }
                            })">
                                업데이트</v-btn>
                            <v-btn v-delete @click="closeDrawer()">닫기</v-btn>
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
                    <v-btn v-create text @click="submitCreateTag">생성</v-btn>
                    <v-btn v-delete text @click="isTagDialogVisible = false">취소</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>

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

            defaultProfileImage: 'https://via.placeholder.com/150',

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

                if (this.pageTitle == '전체 파일') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/all`;
                } else if (this.pageTitle == '최근 조회 파일') {
                    url = `${process.env.VUE_APP_API_BASE_URL}/document/list/viewed`;
                } else if (this.pageTitle == '최근 수정 파일') {
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
                alert(e.response.data.status_message);
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

                const response = await axios.post(url, createData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                alert(response.data.status_message);
                this.comment = '';
                this.fetchComments();
            } catch (e) {
                alert(e.response.data.status_message);
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
                alert("파일 다운로드를 완료하였습니다.");

            } catch (e) {
                alert("파일이 존재하지 않습니다.");
            }
        },
        async fetchHistory(id) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/document/versions/${id}`;
                const response = await axios.get(url, { headers: { Authorization: `Bearer ${this.token}` } });

                this.historyDocument = response.data.result;
            } catch (e) {
                alert(e.response.data.status_message);
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
                alert(e.response.data.status_message);
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
                alert(e.response.data.status_message);
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
                const response = await axios.post(url, submitData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                this.isTagDialogVisible = false;
                alert(response.data.status_message);
                location.reload();
            } catch (e) {
                alert(e.response.data.status_message);
                location.reload();
            }
        },
        async esSearch(keyword) {
            try {
                const url = `${process.env.VUE_APP_API_BASE_URL}/es/document/search?keyword=${keyword}`;
                this.documents = (await axios.get(url)).data.result;
            } catch (e) {
                alert(e.response.data.status_message);
                location.reload();
            }
        },
        formatDate(date) {
            return new Date(date)
                .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                .replace(/\.\s/g, '.') // 중간에 붙는 공백을 없앰
                .replace(/\.$/, ''); // 마지막에 붙는 '.'을 없앰
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
.container {
    padding: 20px;
    border-radius: 12px;
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
}

.ellipsis-text-list {
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
    font-weight: 800;
}

.v-tab:hover {
    background-color: #ffffff;
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

.detail-file-name {
    margin: 20px 0 0;
    font-weight: 800;
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
    justify-content: start;
    align-items: center;
    
}

.user-info {
    display: flex;
    justify-content: start;
    align-items: center;
    font-size: 14px;
}

.comment-content {
    display: inline-block;
    max-width: 700px;
    width: 100%;
    font-size: 16px;
}

.history-item {
    border-radius: 8px;
    height: max-content;
    border: 2px solid #b9b9b9;
}
</style>