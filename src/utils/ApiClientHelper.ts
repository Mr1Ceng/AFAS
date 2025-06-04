import axios, { type AxiosInstance, type AxiosResponse, type CreateAxiosDefaults, type InternalAxiosRequestConfig } from 'axios'
import { message } from 'ant-design-vue';
import router from '@/router';

import { getAuthorizationString } from '@/utils/AuthorizationHelper'
import { processResponseData, processRequestData } from '@/utils/CommonHelper'


let accountStore: any = null;
let globalStore: any = null;

let baseURL = "";

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

const loadConfig = async () => {
  const response = await fetch('/config.json');
  return await response.json();
}

const requestConfig = async (config: InternalAxiosRequestConfig) => {
  if (!globalStore) {
    globalStore = (await import("@/stores/globalStore")).useGlobalStore();
  }
  const localConfig = globalStore.config // 示例：获取 本地配置
  if (localConfig.baseURL && localConfig.baseURL != '') {
    config.baseURL = localConfig.baseURL; // 修改本次基本请求URL
  } else {
    const data = await loadConfig();
    globalStore.setConfig(data);
    config.baseURL = data.baseURL; // 修改本次基本请求URL
  }

  // 延迟 apiClient 访问 store
  if (!accountStore) {
    accountStore = (await import("@/stores/accountStore")).useAccountStore();
  }
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
};

const responseConfig = (response: AxiosResponse) => {
  if (response.data.status == 0) {
    message.error(response.data.data.exception.businessMessage);
    if (response.data.data.exceptionType == 403) {
      router.push({ name: 'login', params: {} })
    }
  }
  return processResponseData(response.data) // 返回数据

}

// 请求拦截器
apiClient.interceptors.request.use(
  async (config) => await requestConfig(config),
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)
// 响应拦截器
apiClient.interceptors.response.use(
  responseConfig,
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
export { apiClient }
