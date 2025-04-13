import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue';

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5165',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') // 示例：获取 token
    if (token) {
      config.headers.Authorization = `Bearer ${token}` // 添加 Authorization 头
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response.data // 返回数据
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      message.error(`错误 ${status}: ${data.message || '请求失败'}`);
    } else {
      message.error(`请求失败，请检查网络`);
    }
    return Promise.reject(error)
  }
)

export default apiClient
