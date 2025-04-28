import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue';
import { useGlobalStore } from "@/stores/globalStore";
const globalStore = useGlobalStore();
const baseURL = globalStore.baseURL;

// 创建 axios 实例
const apiClient: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const apiClientAny: AxiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = globalStore.token // 示例：获取 token
    if (token && token != '') {
      config.headers.Authorization = token // 添加 Authorization 头
    }
    else {
      try {
        const response = await apiClientAny.post('/Authorization/GetTerminalAuthorization/AFAS')
        console.log('响应:', response)
        if (response.data.status == 1) {
          config.headers.Authorization = response.data.data.key
          globalStore.setToken(response.data.data.key)
        } else {
          throw "获取终端token失败";
        }
      } catch (error) {
        console.error('请求失败:', error)
      }
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
    if (response.data.status == 0) {
      message.error(response.data.data.exception.businessMessage);
    }
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
