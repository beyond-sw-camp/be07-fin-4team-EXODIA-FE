import DocumentList from '@/views/documents/DocumentList.vue'
import DocumentCreate from '@/views/documents/DocumentCreate.vue'
import DocumentUpdate from '@/views/documents/DocumentUpdate.vue'

export const documentRouter = [
    {
        path: '/document',
        name: 'DocumentList',
        component: DocumentList,
    },
    {
        path: '/document/create',
        name: 'DocumentCreate',
        component: DocumentCreate,
    },
    {
        path: '/document/update',
        name: 'DocumentUpdate',
        component: DocumentUpdate,
    },


];
