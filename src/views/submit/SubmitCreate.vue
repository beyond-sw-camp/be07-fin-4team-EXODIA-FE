<template>

    <v-col cols="3">
        <v-row>
            <v-select v-model="submitType" variant="underlined" :items="submitTypes" item-text="typeName"
                item-value="id" label="결재 종류"></v-select>
        </v-row>
    </v-col>

    <div v-if="showCardTemplate">
        <CardTemplate />
    </div>

    <div v-if="showVacationTemplate">
        <VacationTemplate />
    </div>



</template>

<script>
import axios from 'axios';
import CardTemplate from './CardTemplate.vue';
import VacationTemplate from './VacationTemplate.vue';

export default {
    components: {
        CardTemplate, VacationTemplate,
    },
    data() {
        return {
            token: localStorage.getItem('token') || null,
            userNum: localStorage.getItem('userNum') || null,

            submitType: '법인 카드 신청',
            submitTypes: [],
            showCardTemplate: true,
            showVacationTemplate: false,
        };
    },
    mounted() {
        this.fetchSubmitTypes();
    },
    watch: {
        'submitType': function (newType) {
            this.showCardTemplate = newType === '법인 카드 신청';
            this.showVacationTemplate = newType == '휴가 신청'
        }
    },
    methods: {
        async fetchSubmitTypes() {
            try {
                const response = await axios.get('/submit/type/list');
                this.submitTypes = response.data.result;

            } catch (e) {
                console.error('결재 타입 불러오는데 오류 발생:', e);
            }
        },
    },
};
</script>

<style scoped>
* {
    font-size: 14px;
}
</style>
