import Layout from '@/layout'

const userRouter = {
  path: '/user',
  component: Layout,
  redirect: '/user/list',
  alwaysShow: true, // will always show the root menu
  name: '用户管理',
  meta: {
    title: '用户管理',
    icon: 'user',
    roles: ['admin'] // you can set roles in root nav
  },
  children: [
    {
      path: 'cUser',
      component: () => import('@/views/user/C_user'),
      name: '消费者中心',
      meta: {
        title: '消费者中心',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'CarUser',
      component: () => import('@/views/user/CarUser'),
      name: '司机渠道',
      meta: {
        title: '司机渠道',
        roles: ['admin']
        // if do not set roles, means: this page does not require permission
      }
    },
    {
      path: 'otherUser',
      component: () => import('@/views/user/otherUser'),
      name: '其他渠道',
      meta: {
        title: '其他渠道',
        roles: ['admin']
      }
    },
    {
      path: 'freeUser',
      component: () => import('@/views/user/freeUser'),
      name: '自由渠道',
      meta: {
        title: '自由渠道',
        roles: ['admin']
      }
    },
    {
      path: '/Channels',
      component: () => import('@/views/user/Channels'),
      name: '渠道公司管理',
      meta: {
        title: '渠道公司管理',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    },
    {
      path: '/sewm',
      component: () => import('@/views/user/sewm'),
      name: 'sewm',
      meta: {
        title: '渠道推广二维码',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    },
    {
      path: '/bigewm',
      component: () => import('@/views/user/bigewm'),
      name: 'bigewm',
      meta: {
        title: '渠道推广司机二维码',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    }
  ]
}

export default userRouter
