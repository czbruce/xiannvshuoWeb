import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/backstage-service/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/backstage-service/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/backstage-service/user/logout',
    method: 'post'
  })
}
