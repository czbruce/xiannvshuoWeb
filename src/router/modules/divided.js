import Layout from '@/layout'

const dividedRouter = {
  path: '/divided',
  component: Layout,
  redirect: '/divided/list',
  alwaysShow: true, // will always show the root menu
  name: '分成管理',
  meta: {
    title: '分成管理',
    icon: 'money',
    roles: ['admin'] // you can set roles in root nav
  },
  children: [
    {
      path: 'company',
      component: () => import('@/views/divided/company'),
      name: '公司渠道',
      meta: {
        title: '公司渠道',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'free',
      component: () => import('@/views/divided/free'),
      name: '自由渠道',
      meta: {
        title: '自由渠道',
        roles: ['admin']
        // if do not set roles, means: this page does not require permission
      }
    }
  ]
}

export default dividedRouter
