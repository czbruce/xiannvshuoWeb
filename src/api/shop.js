import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/backstage-service/goodsCategory/getGoodsCategory',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/backstage-service/goodsCategory/releaseGoodsCategory',
    method: 'PUT',
    params: {
      goodsCategoryId: pv
    }
  })
}

export function createArticle(data) {
  return request({
    url: '/backstage-service/goodsCategory/addGoodsCategory',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/backstage-service/goodsCategory/updateGoodsCategory',
    method: 'PUT',
    data
  })
}
export function deleteNav(params) {
  return request({
    url: '/backstage-service/goodsCategory/deleteGoodsCategory',
    method: 'DELETE',
    params: {
      goodsCategoryId: params
    }
  })
}
