<template>

    <v-row>
        <v-select v-model="submitCreateData.submitType" :items="submitTypes" item-text="typeName" item-value="id"
            label="결재 종류"></v-select>
    </v-row>

    <div v-if="showCardTemplate">
        <!-- 법인 카드 신청과 관련된 데이터  -->
        <CardTemplate />
    </div>

</template>

<script>
import axios from 'axios';
import CardTemplate from './CardTemplate.vue';

export default {
    components: {
        CardTemplate,
    },
    data() {
        return {
            token: localStorage.getItem('token') || null,
            userNum: localStorage.getItem('userNum') || null,

            users: [],
            droppedUsers: [],
            draggedUser: null,
            submitTypes: [],

            submitCreateData: {
                submitType: '',
                contents: '',
                submitUserDtos: []
            },



            showCardTemplate: false
        };
    },
    mounted() {
        this.fetchSubmitTypes();
    },
    created() {
        this.fetchUsers();
    },
    watch: {
        'submitCreateData.submitType': function (newType) {
            console.log("Submit type changed to:", newType);
            this.showCardTemplate = newType === '법인 카드 신청';

        }
    },
    methods: {
        async fetchUsers() {
            try {
                const response = await axios.get('/user/list');
                this.users = response.data;
            } catch (e) {
                console.error('직원 불러오는데 오류 발생:', e);
            }
        },
        async fetchSubmitTypes() {
            try {
                const response = await axios.get('/submit/list');
                this.submitTypes = response.data.result;

            } catch (e) {
                console.error('결재 타입 불러오는데 오류 발생:', e);
            }
        },
        onDragStart(user) {
            this.draggedUser = user;
        },
        onDrop() {
            if (this.draggedUser && !this.droppedUsers.includes(this.draggedUser)) {

                console.log(this.droppedUsers)

                this.submitCreateData.submitUserDtos.push({
                    userName: this.draggedUser.name,
                    position: this.draggedUser.positionName,

                });
                this.droppedUsers.push(this.draggedUser);

                console.log(this.submitCreateData.submitUserDtos);
                this.draggedUser = null;

            }
        },
        removeUser(index) {
            this.droppedUsers.splice(index, 1);
        },
        async submitDroppedUsers() {
            try {
                console.log(this.droppedUsers);

                const response = await axios.post('/submit/create', {
                    users: this.droppedUsers,
                });
                console.log(response);
                alert('Users submitted successfully!');
            } catch (error) {
                console.error('Error submitting users:', error);
            }
        },
        async createSubmit() {
            try {
                console.log("submit data: " + this.submitCreateData.submitType);
                console.log("submit data: " + this.submitCreateData.contents);
                console.log("submit data: " + this.submitCreateData.users);
                const response = await axios.post('/submit/create', this.submitCreateData);
                console.log(response.data);
                alert("결재 요청 성공");
            } catch (error) {
                console.error('Error creating submit:', error);
                alert("결재 요청 실패: " + error.response.data.message || error.message);
            }
        }
    },
};
</script>

<style scoped>
.draggable-item {
    cursor: grab;
    border: 1px solid #ccc;
    margin: 5px;
    padding: 10px;
}

.drop-zone {
    min-height: 200px;
    border: 2px dashed #3f51b5;
    padding: 20px;
}

.v-list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
