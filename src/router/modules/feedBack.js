import Layout from '@/layout'

const feedbackRouter = {
  path: '/feedBack',
  component: Layout,
  children: [
    {
      path: 'feedBackList',
      component: () => import('@/views/feedBack/index'),
      name: '投诉与建议管理',
      meta: { title: '投诉与建议管理', icon: 'edit', noCache: true }
    }
  ]
}

export default feedbackRouter
