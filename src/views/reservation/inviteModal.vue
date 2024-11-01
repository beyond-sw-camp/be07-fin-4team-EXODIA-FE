<!-- <template>
    <v-dialog v-model="localDialog" max-width="400px">
        <v-container class="invite-container">
            <v-row>
                <v-col>
                    <h3>회의 참석자 선택</h3>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="10">
                    <v-text-field v-model="searchQuery" @input="searchUser"
                        placeholder="부서, 직급, 이름으로 검색"></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-icon @click="searchUser">mdi-magnify</v-icon>
                </v-col>
            </v-row>

            <v-row v-for="(user, index) in userList" :key="index">
                <v-col cols="8">
                    <span>{{ user.name }}</span>
                </v-col>
                <v-col cols="2">
                    <v-icon @click="addUser(user)">mdi-plus</v-icon>
                </v-col>
            </v-row>

            <div v-if="selectedUsers.length > 0">
                <br>
                <hr class="select-line" />
                <br>
                <v-row v-for="(user, index) in selectedUsers" :key="index">
                    <v-col cols="8">
                        <span>{{ user.name }}</span>
                    </v-col>
                    <v-col cols="2">
                        <v-icon @click="removeUser(user)">mdi-minus</v-icon>
                    </v-col>
                </v-row>
            </div>

            <v-row>
                <v-col cols="12">
                    <v-btn @click="confirmInvite">초대 완료</v-btn>
                    <v-btn color="error" @click="closeModal">취소</v-btn>
                </v-col>
            </v-row>
        </v-container>
    </v-dialog>
</template>

<script>
import axios from 'axios';

export default {
    props: ['dialog', 'inviteUsersProp'],
    data() {
        return {
            searchQuery: "",
            userList: [],
            selectedUsers: [],
        }
    },
    computed: {
        localDialog: {
            get() {
                return this.dialog;
            },
            set(value) {
                this.$emit('update:dialog', value);
            }
        }
    },
    methods: {
        async searchUser() {
            try {
                const response = await axios.get(`${process.env.VUE_APP_API_BASE_URL}/user/search`, {
                    params: { search: this.searchQuery },
                });
                this.userList = response.data;
            } catch (error) {
                console.error("유저 검색 오류:", error);
            }
        },

        addUser(user) {
            if (!this.selectedUsers.find(u => u.userNum === user.userNum)) {
                this.selectedUsers.push(user);
            }
        },

        removeUser(user) {
            this.selectedUsers = this.selectedUsers.filter(u => u.userNum !== user.userNum);
        },

        confirmInvite() {
            this.$emit('update-invite-list', this.selectedUsers);  // 상위 컴포넌트로 선택 유저 리스트 전달
            this.closeModal();
        },

        closeModal() {
            this.localDialog = false;  // 모달 닫기
            this.selectedUsers = [];  // 선택한 유저 초기화
        },
    }
}
</script>

<style scoped>
.invite-container {
    background-color: white;
}

.select-line {
    border: 0px;
    border-top: 2px solid #000000;
}
</style> -->
