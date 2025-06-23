// app.js - AI生活助手小程序入口文件
App({
  // 全局数据
  globalData: {
    userInfo: null,
    isLogin: false,
    theme: 'light', // light, dark
    aiConfig: {
      apiKey: '',
      model: 'gpt-3.5-turbo',
      baseUrl: 'https://api.openai.com/v1'
    },
    appVersion: '1.0.0'
  },

  // 小程序初始化完成时触发
  onLaunch() {
    console.log('AI生活助手启动');
    this.initApp();
  },

  // 小程序显示时触发
  onShow() {
    console.log('小程序显示');
  },

  // 小程序隐藏时触发
  onHide() {
    console.log('小程序隐藏');
  },

  // 初始化应用
  initApp() {
    // 检查登录状态
    this.checkLoginStatus();
    
    // 初始化主题
    this.initTheme();
    
    // 初始化AI配置
    this.initAIConfig();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
    }
  },

  // 初始化主题
  initTheme() {
    const theme = wx.getStorageSync('theme') || 'light';
    this.globalData.theme = theme;
    this.setTheme(theme);
  },

  // 设置主题
  setTheme(theme) {
    this.globalData.theme = theme;
    wx.setStorageSync('theme', theme);
    
    // 设置导航栏样式
    wx.setNavigationBarColor({
      frontColor: theme === 'dark' ? '#ffffff' : '#000000',
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
    });
  },

  // 初始化AI配置
  initAIConfig() {
    const aiConfig = wx.getStorageSync('aiConfig');
    if (aiConfig) {
      this.globalData.aiConfig = Object.assign({}, this.globalData.aiConfig, aiConfig);
    }
  },

  // 全局错误处理
  onError(error) {
    console.error('小程序错误:', error);
    // 可以在这里添加错误上报逻辑
  },

  // 全局未处理的Promise拒绝
  onUnhandledRejection(res) {
    console.error('未处理的Promise拒绝:', res.reason);
  }
}); 