import request from '@/utils/request'

export function fetchList(params) {
  return request({
    url: '/wechat/api/getPublicBarcodeList',
    method: 'get',
    params
  })
}
export function handcreat(params) {
  return request({
    url: '/wechat/api/genPublicBarcode',
    method: 'post',
    params
  })
}
export function zipPublicBarcodes(params) {
  return request({
    url: '/wechat/api/zipPublicBarcodes',
    method: 'post',
    params,
    responseType: 'blob'
  })
}
export function bigList(params) {
  return request({
    url: '/small-program/smallProgramQRCode/getPrivateBarcodeList',
    method: 'get',
    params
  })
}
export function addbigewm(params) {
  return request({
    url: '/small-program/smallProgramQRCode/genPrivateBarCode',
    method: 'get',
    params
  })
}
export function zipPrivateBarcodes(params) {
  return request({
    url: '/small-program/smallProgramQRCode/zipPrivateBarcodes',
    method: 'get',
    params
  })
}
