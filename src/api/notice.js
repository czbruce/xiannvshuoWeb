import request from '@/utils/httprequest'

export function fetchList(params) {
  console.log(params)
  return request({
    url: '/notice/getNotice',
    method: 'get',
    params
  })
}
export function createArticle(data) {
  return request({
    url: '/notice/addNotice',
    method: 'post',
    data
  })
}
export function deleteNotice(params) {
  return request({
    url: '/notice/deleteNotice?noticeId=' + params,
    method: 'delete'
  })
}
