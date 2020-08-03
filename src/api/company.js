import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/backstage-service/channel/getChannel',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/company/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/company/pv',
    method: 'get',
    params: { pv }
  })
}

export function createArticle(data) {
  return request({
    url: '/backstage-service/channel/addChannel',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/company/update',
    method: 'post',
    data
  })
}

export function deleteList(data) {
  return request({
    url: '/backstage-service/channel/deleteChannel',
    method: 'delete',
    data: {
      channelId: data
    }
  })
}
export function getChannel(data) {
  return request({
    url: '/backstage-service/channel/getChannelCategory',
    method: 'get',
    data: data
  })
}

