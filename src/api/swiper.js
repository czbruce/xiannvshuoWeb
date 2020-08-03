import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/backstage-service/carousel/getCarousel',
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
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/backstage-service/carousel/addCarousel',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/backstage-service/carousel/updateCarousel',
    method: 'put',
    data
  })
}
export function deletelist(params) {
  return request({
    url: '/backstage-service/carousel/deleteCarousel',
    method: 'delete',
    params
  })
}

export function getgoodsNav(params) {
  return request({
    url: '/backstage-service/goods/getGoods',
    method: 'get',
    params
  })
}
