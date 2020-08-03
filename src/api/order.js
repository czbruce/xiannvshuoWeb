import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/backstage-service/order/getOrders',
    method: 'get',
    params: query
  })
}
export function orderinfoList(query) {
  return request({
    url: '/backstage-service/order/getOrdersInfo',
    method: 'get',
    params: {
      orderNo: query
    }
  })
}

export function exportExcel(query) {
  return request({
    url: '/backstage-service/order/orderExportExcel',
    method: 'get',
    params: query
  })
}

export function importexcel(data) {
  return request({
    url: '/backstage-service/order/orderImportExcel',
    method: 'post',
    header: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}
export function refundOrder(params) {
  return request({
    url: '/backstage-service/order/refundOrder',
    method: 'post',
    params
  })
}
export function cancelOrder(params) {
  return request({
    url: '/backstage-service/order/cancelOrder',
    method: 'post',
    params
  })
}
