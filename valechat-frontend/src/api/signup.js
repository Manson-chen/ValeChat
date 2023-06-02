import request from '@/util/request';

export function signup(data) { // 登录
  return request({
    url: "api/user/register", 
    method: "post",
    data
  })
}


export function organization(data) { // 获取组织
  return request({
    url: "api/organization/list", 
    method: "get",
    data
  })
}

export function logout(data) { // 登出接口
  return request({
    url: "api/user/logout", 
    method: "post",
    data
  })
}



export function update(data) { // 更新接口
  return request({
    url: "api/user/update", 
    method: "post",
    data
  })
}



