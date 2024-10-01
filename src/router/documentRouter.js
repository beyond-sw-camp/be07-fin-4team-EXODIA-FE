import DocumentList from '@/views/documents/DocumentList.vue'
import DocumentCreate from '@/views/documents/DocumentCreate.vue'

export const documentRouter = [
    {   
        path: '/document/list/all',
        name: 'DocumentList',
        component: DocumentList,
    },
    {
        path: '/documents/create',
        name: 'DocumentCreate',
        component: DocumentCreate,
    },

];
