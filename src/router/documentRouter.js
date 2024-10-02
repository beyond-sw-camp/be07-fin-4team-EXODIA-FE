import DocumentList from '@/views/documents/DocumentList.vue'
import DocumentViewedList from '@/views/documents/DocumentViewedList.vue'
import DocumentUpdatedList from '@/views/documents/DocumentUpdatedList.vue'
import DocumentCreate from '@/views/documents/DocumentCreate.vue'
import DocumentUpdate from '@/views/documents/DocumentUpdate.vue'
import DocumentTypeList from '@/views/documents/DocumentTypeList.vue'

export const documentRouter = [
    {
        path: '/document',
        name: 'DocumentList',
        component: DocumentList,
    },
    {
        path: '/document/list/viewed',
        name: 'DocumentViewedList',
        component: DocumentViewedList,
    },
    {
        path: '/document/list/updated',
        name: 'DocumentUpdatedList',
        component: DocumentUpdatedList,
    },
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
    {
        path: '/document/type/list',
        name: 'DocumentTypeList',
        component: DocumentTypeList,
    },


];
