<template>
    <v-row>
        <v-list>
            <v-list-item>
                <v-list-item-content>신청일</v-list-item-content>
            </v-list-item>
            <v-col cols="9">
                <v-text-field label="신청일" v-model="formData.신청일" outlined dense class="mb-4"></v-text-field>
            </v-col>

            <v-list-item>
                <v-list-item-content>사용 기간</v-list-item-content>
            </v-list-item>
            <v-col cols="9">
                <v-text-field label="사용 기간" v-model="formData.사용기간" outlined dense class="mb-4"></v-text-field>
            </v-col>

            <v-list-item>
                <v-list-item-content>사유</v-list-item-content>
            </v-list-item>
            <v-col cols="9">
                <v-textarea label="사유" v-model="formData.사유" outlined dense class="mb-4"></v-textarea>
            </v-col>

            <v-list-item>
                <v-list-item-content>사용 인원</v-list-item-content>
            </v-list-item>
            <v-col cols="9">
                <v-text-field label="사용 인원" v-model="formData.사용인원" outlined dense class="mb-4"></v-text-field>
            </v-col>

            <v-list-item>
                <v-list-item-content>사용 금액</v-list-item-content>
            </v-list-item>
            <v-col cols="9">
                <v-text-field label="사용 금액" v-model="formData.사용금액" outlined dense class="mb-4"></v-text-field>
            </v-col>

            <v-list-item>
                <v-list-item-content>총 금액</v-list-item-content>
            </v-list-item>
            <v-col cols="9">
                <v-text-field label="총 금액" v-model="formData.총금액" outlined dense class="mb-4"></v-text-field>
            </v-col>

            <v-list-item>
                <v-list-item-content>기타</v-list-item-content>
            </v-list-item>
            <v-col cols="9">
                <v-text-field label="기타" v-model="formData.기타" outlined dense></v-text-field>
            </v-col>
        </v-list>
        <v-col cols=" 3">
            <v-card>
                <v-card-title>결재 라인</v-card-title>
                <v-list>
                    <v-list-item v-for="user in users" :key="user.id" draggable="true" @dragstart="onDragStart(user)"
                        class="draggable-item">
                        <v-list-item-content>{{ user.name }}</v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-col>
    </v-row>

    <v-row>

    </v-row>
    <v-row>
        <v-col cols="3">
            <v-card @dragover.prevent @drop="onDrop" class="drop-zone">
                <v-card-text>결재자를 선택하시오.</v-card-text>
                <v-list>
                    <v-list-item v-for="(droppedUser, index) in droppedUsers" :key="droppedUser.id">
                        <v-list-item-content>{{ droppedUser.name }} - {{ droppedUser.positionName
                            }}</v-list-item-content>
                        <v-btn icon color="red" @click="removeUser(index)">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                    </v-list-item>
                </v-list>
            </v-card>
            <v-btn color="primary" class="mt-4" @click="createSubmit">
                결재라인 등록
            </v-btn>
        </v-col>
    </v-row>


</template>

<script>
export default {
    data() {
        return {
            formData: {
                신청일: '',
                사용기간: '',
                사유: '',
                사용인원: '',
                사용금액: '',
                총금액: '',
                기타: ''
            },
        }
    }
}
</script>