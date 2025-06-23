Page({
  data: {
    theme: 'light',
  },
  onLoad() {
    const app = getApp();
    this.setData({
      theme: app.globalData.theme
    });
  },
  themeChange(e) {
    const theme = e.detail.value;
    getApp().globalData.theme = theme;
    wx.setStorageSync('theme', theme);
    this.setData({ theme });
    // 这里可以添加一个全局事件来通知其他页面更换主题
    wx.showToast({ title: '主题已切换', icon: 'none' });
  }
}); 