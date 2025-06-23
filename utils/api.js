 // utils/api.js - API调用封装模块

// API配置
const API_CONFIG = {
    baseURL: 'https://api.example.com',
    timeout: 30000,
    retryTimes: 3,
    retryDelay: 1000
  };
  
  class ApiService {
    constructor() {
      this.config = API_CONFIG;
      this.requestQueue = [];
      this.isProcessing = false;
    }
  
    // 基础请求方法
    request(options) {
      return new Promise((resolve, reject) => {
        const requestConfig = {
          url: options.url,
          method: options.method || 'GET',
          data: options.data || {},
          header: {
            'Content-Type': 'application/json',
            ...options.header
          },
          timeout: options.timeout || this.config.timeout,
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(res.data);
            } else {
              reject(new Error(`请求失败: ${res.statusCode}`));
            }
          },
          fail: (error) => {
            reject(error);
          }
        };
  
        wx.request(requestConfig);
      });
    }
  
    // 带重试的请求
    async requestWithRetry(options, retryCount = 0) {
      try {
        return await this.request(options);
      } catch (error) {
        if (retryCount < this.config.retryTimes) {
          await this.delay(this.config.retryDelay * (retryCount + 1));
          return this.requestWithRetry(options, retryCount + 1);
        }
        throw error;
      }
    }
  
    // 延迟函数
    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  
    // GET请求
    get(url, params = {}, options = {}) {
      const queryString = this.buildQueryString(params);
      const fullUrl = queryString ? `${url}?${queryString}` : url;
      
      return this.requestWithRetry({
        url: fullUrl,
        method: 'GET',
        ...options
      });
    }
  
    // POST请求
    post(url, data = {}, options = {}) {
      return this.requestWithRetry({
        url,
        method: 'POST',
        data,
        ...options
      });
    }
  
    // PUT请求
    put(url, data = {}, options = {}) {
      return this.requestWithRetry({
        url,
        method: 'PUT',
        data,
        ...options
      });
    }
  
    // DELETE请求
    delete(url, options = {}) {
      return this.requestWithRetry({
        url,
        method: 'DELETE',
        ...options
      });
    }
  
    // 构建查询字符串
    buildQueryString(params) {
      if (!params || Object.keys(params).length === 0) {
        return '';
      }
  
      return Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    }
  
    // 文件上传
    uploadFile(filePath, options = {}) {
      return new Promise((resolve, reject) => {
        wx.uploadFile({
          url: options.url,
          filePath: filePath,
          name: options.name || 'file',
          formData: options.formData || {},
          header: options.header || {},
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(JSON.parse(res.data));
            } else {
              reject(new Error(`上传失败: ${res.statusCode}`));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    }
  
    // 文件下载
    downloadFile(url, options = {}) {
      return new Promise((resolve, reject) => {
        wx.downloadFile({
          url: url,
          header: options.header || {},
          success: (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(res.tempFilePath);
            } else {
              reject(new Error(`下载失败: ${res.statusCode}`));
            }
          },
          fail: (error) => {
            reject(error);
          }
        });
      });
    }
  
    // 请求拦截器
    addRequestInterceptor(interceptor) {
      this.requestInterceptors = this.requestInterceptors || [];
      this.requestInterceptors.push(interceptor);
    }
  
    // 响应拦截器
    addResponseInterceptor(interceptor) {
      this.responseInterceptors = this.responseInterceptors || [];
      this.responseInterceptors.push(interceptor);
    }
  
    // 应用请求拦截器
    applyRequestInterceptors(config) {
      if (this.requestInterceptors) {
        this.requestInterceptors.forEach(interceptor => {
          config = interceptor(config);
        });
      }
      return config;
    }
  
    // 应用响应拦截器
    applyResponseInterceptors(response) {
      if (this.responseInterceptors) {
        this.responseInterceptors.forEach(interceptor => {
          response = interceptor(response);
        });
      }
      return response;
    }
  
    // 错误处理
    handleError(error) {
      console.error('API请求错误:', error);
      
      // 根据错误类型进行处理
      if (error.errMsg && error.errMsg.includes('timeout')) {
        wx.showToast({
          title: '请求超时，请检查网络',
          icon: 'none'
        });
      } else if (error.statusCode === 401) {
        wx.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none'
        });
        // 可以在这里处理登录过期逻辑
      } else if (error.statusCode >= 500) {
        wx.showToast({
          title: '服务器错误，请稍后重试',
          icon: 'none'
        });
      } else {
        wx.showToast({
          title: '请求失败，请重试',
          icon: 'none'
        });
      }
    }
  
    // 设置认证token
    setAuthToken(token) {
      this.authToken = token;
    }
  
    // 获取认证头
    getAuthHeader() {
      if (this.authToken) {
        return {
          'Authorization': `Bearer ${this.authToken}`
        };
      }
      return {};
    }
  
    // 取消请求
    cancelRequest(requestId) {
      // 微信小程序不支持取消请求，这里只是标记
      console.log('取消请求:', requestId);
    }
  
    // 批量请求
    async batchRequests(requests) {
      const promises = requests.map(request => {
        return this.request(request).catch(error => {
          console.error('批量请求中的单个请求失败:', error);
          return null;
        });
      });
  
      return Promise.all(promises);
    }
  
    // 并发控制
    async concurrentRequests(requests, maxConcurrent = 3) {
      const results = [];
      const executing = [];
  
      for (const request of requests) {
        const promise = this.request(request).then(result => {
          results.push(result);
          executing.splice(executing.indexOf(promise), 1);
          return result;
        });
  
        executing.push(promise);
  
        if (executing.length >= maxConcurrent) {
          await Promise.race(executing);
        }
      }
  
      await Promise.all(executing);
      return results;
    }
  }
  
  // 创建单例实例
  const apiService = new ApiService();
  
  // 添加默认拦截器
  apiService.addRequestInterceptor((config) => {
    // 添加认证头
    config.header = {
      ...config.header,
      ...apiService.getAuthHeader()
    };
    return config;
  });
  
  apiService.addResponseInterceptor((response) => {
    // 统一处理响应
    if (response.code && response.code !== 0) {
      throw new Error(response.message || '请求失败');
    }
    return response;
  });
  
  module.exports = apiService;