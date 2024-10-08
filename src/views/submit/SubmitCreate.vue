<template>

    <v-col cols="3">
        <v-row>
            <v-select v-model="submitType" :items="submitTypes" item-text="typeName" item-value="id"
                label="결재 종류"></v-select>
        </v-row>
    </v-col>

    <div v-if="showCardTemplate">
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

            submitType: '',
            submitTypes: [],
            showCardTemplate: false
        };
    },
    mounted() {
        this.fetchSubmitTypes();
    },
    watch: {
        'submitType': function (newType) {
            console.log("Submit type changed to:", newType);
            this.showCardTemplate = newType === '법인 카드 신청';
        }
    },
    methods: {
        async fetchSubmitTypes() {
            try {
                const response = await axios.get('/submit/list');
                this.submitTypes = response.data.result;

            } catch (e) {
                console.error('결재 타입 불러오는데 오류 발생:', e);
            }
        },
    },
};
</script>

<style scoped></style>
