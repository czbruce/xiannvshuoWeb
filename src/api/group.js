import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/backstage-service/goodsRule/getAssermbleRule',
    method: 'get',
    params: query
  })
}
export function fetchPv(pv) {
  return request({
    url: '/backstage-service/goodsRule/releaseAssermbleRule',
    method: 'PUT',
    params: {
      goodsId: pv
    }
  })
}

export function createArticle(data) {
  return request({
    url: '/backstage-service/goodsRule/addAssermbleRule',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/backstage-service/goodsRule/updateAssermbleRule',
    method: 'PUT',
    data
  })
}
export function deleteNav(params) {
  return request({
    url: '/backstage-service/goodsRule/deleteAssermbleRule',
    method: 'DELETE',
    params: {
      goodsId: params
    }
  })
}
