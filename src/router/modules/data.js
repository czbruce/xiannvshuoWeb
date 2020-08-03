import Layout from '@/layout'

const dataRouter = {
  path: '/data',
  component: Layout,
  redirect: '/data/list',
  alwaysShow: true, // will always show the root menu
  name: '数据中心',
  meta: {
    title: '数据中心',
    icon: 'chart',
    roles: ['admin'] // you can set roles in root nav
  },
  children: [
    {
      path: 'goodsSale',
      component: () => import('@/views/data/goodsSale'),
      name: '商品销售分析',
      meta: {
        title: '商品销售分析',
        roles: ['admin'] // or you can only set roles in sub nav
      }
    },
    {
      path: 'channel',
      component: () => import('@/views/data/channel'),
      name: '渠道分析',
      meta: {
        title: '渠道分析',
        roles: ['admin']
        // if do not set roles, means: this page does not require permission
      }
    }
  ]
}

export default dataRouter
