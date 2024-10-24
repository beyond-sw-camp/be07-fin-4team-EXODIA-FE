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

    <div v-if="showFamilyEventTemplate">
        <FamilyEventTemplate />
    </div>
</template>

<script>
import axios from 'axios';
import CardTemplate from './template/CardTemplate.vue';
import VacationTemplate from './template/VacationTemplate.vue';
import FamilyEventTemplate from './template/FamilyEventTemplate.vue';

export default {
    components: {
        CardTemplate, VacationTemplate, FamilyEventTemplate,
    },
    data() {
        return {
            token: localStorage.getItem('token') || null,
            userNum: localStorage.getItem('userNum') || null,

            submitType: '법인 카드 사용 신청서',
            submitTypes: [],
            showCardTemplate: true,
            showVacationTemplate: false,
            showFamilyEventTemplate: false,
        };
    },
    mounted() {
        this.fetchSubmitTypes();
    },
    watch: {
        'submitType': function (newType) {
            this.showCardTemplate = newType === '법인 카드 사용 신청서';
            this.showVacationTemplate = newType == '휴가 신청서'
            this.showFamilyEventTemplate = newType == '경조사 신청서';
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