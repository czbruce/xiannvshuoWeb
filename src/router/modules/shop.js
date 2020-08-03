import Layout from '@/layout'

const shopRouter = {
  path: '/shop',
  component: Layout,
  redirect: '/shop/page',
  alwaysShow: true, // will always show the root menu
  name: '商城管理',
  meta: {
    title: '商城管理',
    icon: 'shopping',
    roles: ['admin', 'editor'] // you can set roles in root nav
  },
  children: [
    {
      path: 'types',
      component: () => import('@/views/shop/types'),
      name: '商品分类',
      meta: {
        title: '商品分类',
        roles: ['admin', 'editor']
        // if do not set roles, means: this page does not require permission
      }
    },
    {
      path: 'goods',
      component: () => import('@/views/shop/goods'),
      name: '商品管理',
      meta: {
        title: '商品管理',
        roles: ['admin', 'editor']
      }
    },
    {
      path: 'group',
      component: () => import('@/views/shop/group'),
      name: '拼团管理',
      meta: {
        title: '拼团管理',
        roles: ['admin', 'editor']
      }
    },
    {
      path: 'secKill',
      component: () => import('@/views/shop/secKill'),
      name: '秒杀管理',
      meta: {
        title: '秒杀管理',
        roles: ['admin', 'editor']
      }
    },
    {
      path: 'free',
      component: () => import('@/views/shop/free'),
      name: '免费商品管理',
      meta: {
        title: '免费商品管理',
        roles: ['admin', 'editor']
      }
    }
  ]
}

export default shopRouter
