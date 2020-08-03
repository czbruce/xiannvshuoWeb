import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/backstage-service/goods/getGoods',
    method: 'get',
    params: query
  })
}

export function fetchPv(pv) {
  return request({
    url: '/backstage-service/goods/releaseGoods',
    method: 'PUT',
    params: {
      goodsId: pv
    }
  })
}

export function createArticle(data) {
  return request({
    url: '/backstage-service/goods/addGoods',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/backstage-service/goods/updateGoods',
    method: 'PUT',
    data
  })
}
export function deleteNav(params) {
  return request({
    url: '/backstage-service/goods/deleteGoods',
    method: 'DELETE',
    params: {
      goodsId: params
    }
  })
}
export function getgoodsNav(params) {
  return request({
    url: '/backstage-service/goodsCategory/getGoodsCategory',
    method: 'get',
    params
  })
}
export function handdelete(data) {
  return request({
    url: '/backstage-service/goods/deleteBatchGoods',
    method: 'delete',
    data: {
      goodsIds: data
    }
  })
}
export function getfreelist(params) {
  return request({
    url: '/backstage-service/goodsRule/getFreeRule',
    method: 'get',
    params
  })
}

export function createfree(data) {
  return request({
    url: '/backstage-service/goodsRule/addFreeRule',
    method: 'post',
    data
  })
}
