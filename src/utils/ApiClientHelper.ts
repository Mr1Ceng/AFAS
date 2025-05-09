import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue';
import { useGlobalStore } from "@/stores/globalStore";
import { useAccountStore } from "@/stores/accountStore";
import router from '@/router';

import { getAuthorizationString } from '@/utils/AuthorizationHelper'
import { processResponseData ,processRequestData} from '@/utils/CommonHelper'
const globalStore = useGlobalStore();
const accountStore = useAccountStore();
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
    const token = accountStore.token // 示例：获取 token
    if (token && token != '') {
      config.headers.Authorization = token // 添加 Authorization 头
    }
    else {
      config.headers.Authorization = getAuthorizationString()
      accountStore.setToken(config.headers.Authorization)
    }
    // 处理请求数据，将 dayjs 转换为字符串
    if (config.data) {
      config.data = processRequestData(config.data);
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
      if (response.data.data.exceptionType == 403) {
        router.push({ name: 'login', params: {} })
      }
    }
    return processResponseData(response.data) // 返回数据
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
