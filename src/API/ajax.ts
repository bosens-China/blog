// 封装一下axios

import axios from "axios";
import qs from "qs";

const instance = axios.create({
  timeout: 10000
});
function isPost(str: string) {
  return Boolean(/post/i.test(str));
}

instance.interceptors.request.use(
  c => {
    const config = c;
    const { method, params, data } = config;
    const post = isPost(method);
    if (post) {
      config.data = qs.stringify({
        ...params,
        ...data
      });
    } else {
      config.params = {
        ...data,
        ...params
      };
    }
    return config;
  },
  error => Promise.reject(error)
);

// 添加响应拦截器
instance.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
);

export { instance };
