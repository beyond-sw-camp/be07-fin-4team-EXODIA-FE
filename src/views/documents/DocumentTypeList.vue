<template>
    <DocumentListComponent :pageTitle="typeId" />
</template>

<script>
import DocumentListComponent from '@/components/document/DocumentListComponent.vue';

export default {
    name: 'DocumentsList',
    components: {
        DocumentListComponent
    },
    data() {
        return {
            typeId: '',
        }
    },
    mounted() {
        const { id } = history.state;
        this.typeId = id;
        console.log("DocumentTypeList: " + this.typeId)
    },
};
</script>