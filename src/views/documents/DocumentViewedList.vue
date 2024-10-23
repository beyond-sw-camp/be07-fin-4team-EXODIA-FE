<template>
    <DocumentListComponent pageTitle="최근 조회 파일" />
</template>

<script>
import DocumentListComponent from '@/components/document/DocumentListComponent.vue';

export default {
    name: 'DocumentsList',
    components: {
        DocumentListComponent
    }
};
</script>