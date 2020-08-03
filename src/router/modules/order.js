/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const orderRouter = {
  path: '/order',
  component: Layout,
  redirect: '/order/orderList',
  name: '订单管理',
  meta: {
    title: '订单管理',
    icon: 'table',
    roles: ['admin']
  },
  children: [
    {
      path: 'orderList',
      component: () => import('@/views/order/orderList'),
      name: '订单列表',
      meta: { title: '订单列表' }
    },
    {
      path: 'review',
      component: () => import('@/views/order/review'),
      name: '评价管理',
      meta: { title: '评价管理' }
    }
  ]
}
export default orderRouter
