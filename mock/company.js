import Mock from 'mockjs'

const List = []
const count = 3
const title = [
  { key: 'A', name: '0元购' },
  { key: 'B', name: '正价、拼团、秒杀（有上线）' },
  { key: 'C', name: '正价、拼团、秒杀（无上线）' }
]

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    'title|1': title,
    data1: '@integer(1, 100)',
    data2: '@integer(1, 100)',
    data3: '@integer(1, 100)'
  }))
}

export default [
  {
    url: '/vue-element-admin/company/list',
    type: 'get',
    response: config => {
      const { title, page = 1, limit = 3, sort } = config.query

      let mockList = List.filter(item => {
        if (title && item.title.indexOf(title) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/vue-element-admin/company/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const article of List) {
        if (article.id === +id) {
          return {
            code: 20000,
            data: article
          }
        }
      }
    }
  },

  {
    url: '/vue-element-admin/company/pv',
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: {
          pvData: [
            { key: 'PC', pv: 1024 },
            { key: 'mobile', pv: 1024 },
            { key: 'ios', pv: 1024 },
            { key: 'android', pv: 1024 }
          ]
        }
      }
    }
  },

  {
    url: '/vue-element-admin/company/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-element-admin/company/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]

