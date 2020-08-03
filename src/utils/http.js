const URL = 'https://xcx.shiyi520.com/small'
import $ from 'jquery'

// export function put(url, data={}) {
// return new Promise((resolve, reject) => {
//   axios.put(URL + url, data)
//     .then(response => {
//       resolve(response.data)
//     }).catch(err => {
//     reject(err)
//   })
// })
//
export function put(params) {
  $.ajax({
    url: URL + params.url,
    method: 'post',
    data: { goodsCategoryId: params.id },
    success(res) {
      console.log(res)
    }
  })
}

// import { Loading, Message } from 'element-ui'
//
// const URL = 'https://xcx.shiyi520.com/small'
// let loadingInstance = null
//
// export const Service = axiox.create({
//   timeout: 7000,
//   baseURL: URL,
//   method: 'post',
//   headers: {
//     'Content-Type': 'application/json;charset=UTF-8'
//   }
// })
//
// Service.interceptors.request.use(config => {
//   loadingInstance = Loading.service({
//     lock: true,
//     text: 'loading...'
//   })
//   return config
// })
//
// Service.interceptors.response.use(response => {
//   loadingInstance.close()
//   return response.data
// }, error => {
//   console.log('error', error)
//   const msg = error.Message !== undefined ? error.Message : ''
//   Message({
//     message: '网络错误' + msg,
//     type: 'error',
//     duration: 3 * 1000
//   })
//   loadingInstance.close()
//   return Promise.reject(error)
// })
