// request.js
import quickAxios from "quick-axios";

const quickAxiosConfig = {
  // 发生错误时，是否显示提示
  tip: true, // default

  // 如何显示提示，可以传入显示message的方法
  tipFn: message => {
    console.log("tip fn exec", message);
  },
  errorHandlers: {
    // 支持 400/401/403/404/405/413/414/500/502/504/任意其他 errno
    // 401: () => {}
    // 403: () => {}
    // ...
  },
  // validateStatus: status => {
  //   console.log(status);
  //   return status === 0 || (status >= 200 && status < 300);
  // },
  // const defaultValidateStatus = (status) => status === 0 || (status >= 200 && status < 300);
  // this.validateStatus = isFunction(validateStatus) ? validateStatus : defaultValidateStatus;

  // 内置错误提示语言: 'zh-cn'/'en'
  lang: "zh-cn", // default

  // 请求前的自定义操作
  beforeHook: config => {
    console.log("beforeHook fn exec", config);
  },
  //    // 请求后的自定义操作
  //   afterHook: (responce|error, isError) => {},
  // 请求后的自定义操作
  afterHook: (responce, error) => {
    console.log("afterHook fn exec", responce, error);
  },
  // 从请求响应中获取错误状态，默认取errno
  // 如果传入的不是一个函数也会使用默认值
  // default  resData.errorno
  getResStatus: resData => {
    return resData.status;
  },
  // 从请求响应中获取错误消息，默认取errmsg
  // 如果传入的不是一个函数也会使用默认值
  getResErrMsg: resData => resData.errmsg, // default

  // 从请求响应中获取返回数据，默认取data
  // 如果传入的不是一个函数也会使用默认值
  getResData: resData => {
    console.log("resData", resData);
    return resData; // default
  },
  // 是否开启取消重复请求
  cancelDuplicated: true, // default false

  // 如果开启了取消重复请求，如何生成重复标识
  duplicatedKeyFn: config => {
    // return `${config.method}${config.url}` // default
    return `${config.method}${config.url}${JSON.stringify(config.params)}`; // default
  }
};

// const userId = 123;
// const token = "acdfeheefeecc";
const axiosConfig = {
  // withCredentials: true,
  // headers: { userId, token }
};
// 此处 quickAxiosConfig, axiosConfig 未定义，下面会详细介绍 quickAxiosConfig
const request = new quickAxios(quickAxiosConfig, axiosConfig);
export default request;
