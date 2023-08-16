export const paths = {
  index: '/',
  auth: {
    login: '/auth/login',
    register: '/auth/register'
  },
  home: '/home',
  clients: {
    index: '/clients',
    create: '/clients/create',
  },
  jobs: {
    index: '/jobs',
    create: '/jobs/create',
  },
  schedule: '/schedule',
  events: '/events',
  fleet: '/fleet',
  invoices: {
    index: '/invoices',
    create: '/invoices/create',
    edit: (invoiceId: string) => `/invoices/${invoiceId}/edit`,
    details: (invoiceId: string) => `/invoices/${invoiceId}`,
  },
  groups: {
    index: '/groups',
    create: '/groups/create',
    edit: '/groups/:groupId/edit',
    details: '/groups/:groupId'
  },
  conversations: '/conversations',
  forms: '/forms',
  payments: '/payments',
  files: '/files',
    settings: '/settings',
};
