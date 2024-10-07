<template>
    <v-container>
        <v-row>
            <v-select v-model="selectedType" :items="submitTypes" item-text="typeName" item-value="id" hint="결재 타입 골라골라"
                label="결재 종류"></v-select>

            <v-col cols="12">
                <h2>User Drag & Drop</h2>
            </v-col>
            <v-col cols="6">
                <v-card>
                    <v-card-title>결재 라인</v-card-title>
                    <v-list>
                        <v-list-item v-for="user in users" :key="user.id" draggable="true"
                            @dragstart="onDragStart(user)" class="draggable-item">
                            <v-list-item-content>{{ user.name }}</v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-col>
            <v-col cols="6">
                <v-card @dragover.prevent @drop="onDrop" class="drop-zone">
                    <v-card-title>Drop Here</v-card-title>
                    <v-list>
                        <v-list-item v-for="(droppedUser, index) in droppedUsers" :key="droppedUser.id">
                            <v-list-item-content>{{ droppedUser.name }}</v-list-item-content>
                            <v-btn icon color="red" @click="removeUser(index)">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-list-item>
                    </v-list>
                </v-card>
                <v-btn color="primary" class="mt-4" @click="submitDroppedUsers">
                    Submit Dropped Users
                </v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            users: [],
            droppedUsers: [],
            draggedUser: null,
            submitTypes: [],
            selectedType: '',
        };
    },
    mounted() {
        this.fetchSubmitTypes();
    },
    created() {
        this.fetchUsers();
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
                this.droppedUsers.push(this.draggedUser);
                this.draggedUser = null;
            }
        },
        removeUser(index) {
            this.droppedUsers.splice(index, 1);
        },
        async submitDroppedUsers() {
            try {
                const response = await axios.post('/api/submitDroppedUsers', {
                    users: this.droppedUsers,
                });
                console.log(response);
                alert('Users submitted successfully!');
            } catch (error) {
                console.error('Error submitting users:', error);
            }
        },
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
