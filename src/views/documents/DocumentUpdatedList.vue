<template>
    <DocumentListComponent pageTitle="최근 업데이트 문서" />
</template> 

<script>
import DocumentListComponent from '@/components/document/DocumentListComponent.vue';

export default {
    name: 'DocumentsList',
    components: {
        DocumentListComponent
    },
};
</script>