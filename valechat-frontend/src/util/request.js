import Axios from 'axios';



const request = Axios.create({
    withCredentials: true
});

if (process.env.NODE_ENV == "development") {
  request.defaults.baseURL = "http://localhost:8080";
} else {
  request.defaults.baseURL = process.env.VUE_APP_BASEURL_API;
}
// 请求超时时间
request.defaults.timeout = 60000;
// 添加请求拦截器  作用是在请求发送前进行一些操作

// interceptor for request
request.interceptors.request.use(
    config => {
        // add token
        const token = localStorage.getItem('token')
        if (token) {
            config.headers["Authorization"] = token;
        }
        return config;
    },
    error => {
        // do something with request error
        console.log(error);
        return Promise.reject(error);
    }
);

// interceptor for response
// request.interceptors.response.use(
//     response => {
//         return response.data;
//     },
//     error => {
//         const data = error.response.data;
//         // const status = error.response.status;
//
//         // manage different status codes
//         // if (status === 401) {
//         //     console.log("token expired");
//         // } else if (status === 500) {
//         //     console.log("sever error");
//         // }
//         return Promise.resolve(data);
//     }
// );

// request.interceptors.request.use(
//     config => {
//       // 涉及token
//       // if (localStorage.getItem("access_token")) {
//       //     config.headers["access_token"] = localStorage.getItem("access_token")
//       // } else {
//       //     // config.headers["access_token"] = ""
//       // }
//       // config.headers["Access-Control-Allow-Origin"]="*";
//
//       //  const isToken = (config.headers || {}).isToken === false;
//      let token=""
//     //  const isToken = (config.headers || {}).isToken === false;
//     if(sessionStorage.getItem("access_token")){
//       token = sessionStorage.getItem("access_token");
//     }
//      const isToken = (config.headers || {}).isToken === false;
//      if (token && !isToken) {
//        config.headers["Authorization"] =  token; // token
//        config.headers["token"] = token;
//      }
//       // headers中配置serialize为true开启序列化
//       // if (config.method === "post" && config.headers.serialize) {
//       //   config.data = serialize(config.data);
//       //   delete config.data.serialize;
//       // }
//       return config;
//     },
//     error => {
//         return Promise.reject(error)
//     }
// );

// 添加响应拦截器  作用是在接收到响应后进行一些操作
// request.interceptors.response.use(
//   (response) => {
//     const status = Number(response.status);
//     if (status !== 200) {
//       Message({
//         message: response.data.msg,
//         type: "error",
//       });
//       return Promise.reject(new Error(response.data.msg));
//     }

//     return response;
//   },
//   (error) => {
//     let errorCode = {
//       "000": "操作太频繁，请勿重复请求",
//       401: "当前操作没有权限",
//       403: "当前操作没有权限",
//       404: "资源不存在",
//       417: "未绑定登录账号，请使用密码登录后绑定",
//       423: "演示环境不能操作，如需了解联系我们",
//       426: "用户名不存在或密码错误",
//       428: "验证码错误,请重新输入",
//       429: "请求过频繁",
//       479: "演示环境，没有权限操作",
//       default: "系统未知错误,请反馈给管理员",
//     };
//     const message =
//       error.response.data.msg ||
//       errorCode[error.response.status] ||
//       errorCode["default"];
//     // 后台定义 424 针对令牌过去的特殊响应码
//     if (error.response.status === 424) {
//       MessageBox.confirm("令牌状态已过期，请点击重新登录", "系统提示", {
//         confirmButtonText: "重新登录",
//         cancelButtonText: "取消",
//         type: "warning",
//       })
//         .then(() => {
//           store.dispatch("LogOut").then(() => {
//             // 刷新登录页面，避免多次弹框
//             window.location.reload();
//           });
//         })
//         .catch(() => {});
//       return;
//     } else {
//       Message({
//         message: message,
//         type: "error",
//       });
//     }
//     return Promise.reject(new Error(message));
//     // 在这里还可以进行响应码的判断
//     // switch (error.response.status) {
//     //    case 400:
//     //      error.message = '错误请求'
//     //    break;
//     //    case 500:
//     //      error.message = '服务器端出错'
//     //      break;
//     //  }
//     // 抛出错误提示
//     // Message({
//     //     message: "错误",
//     //     type: 'error'
//     // })
//     // return error
//     // 对响应错误做点什么
//     // return Promise.reject(error);
//   }
// );
export default request 