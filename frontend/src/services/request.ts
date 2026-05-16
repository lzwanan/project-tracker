import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

request.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') return response.data;
    const res = response.data;
    if (res.code === 401) {
      message.error('请先登录');
      return Promise.reject(new Error('请先登录'));
    }
    if (res.code === 403) {
      message.error('游客无此权限');
      return Promise.reject(new Error('游客无此权限'));
    }
    if (res.code !== 200) {
      message.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res;
  },
  (error) => {
    const status = error?.response?.status;
    if (status === 403) message.error('游客无此权限');
    else if (status === 401) message.error('请先登录');
    else message.error('网络异常');
    return Promise.reject(error);
  }
);

export default request;
