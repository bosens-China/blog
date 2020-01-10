// 封装一下axios
const axios = require('axios');
const qs = require('qs');

const instance = axios.create({
  timeout: 10000,
  headers: {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36',
  },
});
function isPost(str) {
  return Boolean(/post/i.test(str));
}

instance.interceptors.request.use((c) => {
  const config = c;
  const { method, params, data } = config;
  const post = isPost(method);
  if (post) {
    config.data = qs.stringify({
      ...params,
      ...data,
    });
  } else {
    config.params = {
      ...data,
      ...params,
    };
  }
  return config;
}, (error) => Promise.reject(error));

// 添加响应拦截器
instance.interceptors.response.use((response) => response.data,
  (error) => Promise.reject(error));

module.exports = instance;
