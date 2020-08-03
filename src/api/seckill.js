import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/backstage-service/goodsRule/getSeckillRule',
    method: 'get',
    params: query
  })
}
export function getgoodsNav(params) {
  return request({
    url: '/backstage-service/goodsRule/getGoods',
    method: 'get',
    params
  })
}
export function fetchPv(pv) {
  return request({
    url: '/backstage-service/goodsRule/releaseSeckillRule',
    method: 'PUT',
    params: {
      goodsId: pv
    }
  })
}

export function createArticle(data) {
  return request({
    url: '/backstage-service/goodsRule/addSeckillRule',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/backstage-service/goodsRule/updateSeckillRule',
    method: 'PUT',
    data
  })
}
export function deleteNav(params) {
  return request({
    url: '/backstage-service/goodsRule/deleteSeckillRule',
    method: 'DELETE',
    params: {
      goodsId: params
    }
  })
}
