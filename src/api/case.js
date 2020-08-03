import request from '@/utils/request'

export function fetchList(params) {
  console.log(params)
  return request({
    url: '/backstage-service/case/getCase',
    method: 'put',
    params
  })
}
export function createCase(data) {
  return request({
    url: '/backstage-service/case/addCase',
    method: 'post',
    data
  })
}
export function deleteCase(params) {
  return request({
    url: '/backstage-service/case/deleteCase?caseNo=' + params,
    method: 'delete'
  })
}
export function deleteBatchCase(params) {
  return request({
    url: '/backstage-service/case/deleteBatchCase?caseNos=' + params,
    method: 'delete'
  })
}
export function updateCase(data) {
  return request({
    url: '/backstage-service/case/updateCase',
    method: 'put',
    data
  })
}
