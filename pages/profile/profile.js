// pages/profile/profile.js
const storage = require('../../utils/storage.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.loadUserInfo();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  loadUserInfo() {
    const userInfo = storage.getUserInfo();
    if (userInfo) {
      setTimeout(() => {
        this.setData({ userInfo: userInfo });
      }, 0);
    }
  },

  login() {
    // 如果已登录，则不执行任何操作
    if (this.data.userInfo) {
      console.log('用户已登录，无需重复跳转。');
      // 可选：跳转到更详细的个人资料页
      // wx.navigateTo({ url: '/pages/user-detail/user-detail' });
      return;
    }

    // 如果未登录，才跳转到登录页
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },
  
  clearData() {
    wx.showModal({
      title: '确认操作',
      content: '确定要清空所有日程和任务数据吗？此操作无法撤销。',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          storage.saveSchedules([]);
          storage.saveTasks([]);
          wx.showToast({
            title: '数据已清空',
            icon: 'success',
            duration: 2000
          });
          // 可选：清空后刷新其他页面或跳转
        }
      }
    })
  },

  navigateTo(e) {
    const page = e.currentTarget.dataset.page;
    let url = '';

    switch (page) {
      case 'settings':
        url = '/pages/settings/settings';
        break;
      case 'ai-config':
        url = '/pages/ai-config/ai-config';
        break;
      case 'backup':
        url = '/pages/backup/backup';
        break;
      case 'about':
        url = '/pages/about/about';
        break;
      default:
        wx.showToast({ title: '功能开发中', icon: 'none' });
        return;
    }

    wx.navigateTo({
      url: url,
      fail: () => {
        wx.showToast({ title: '页面不存在，请先创建', icon: 'none' });
      }
    });
  },

  rateApp() {
    wx.showModal({
      title: '喜欢我们吗？',
      content: '如果觉得AI生活助手好用，请与朋友分享吧！您的支持是我们前进的最大动力。',
      confirmText: '去分享',
      showCancel: true,
      success: (res) => {
        if (res.confirm) {
          // 引导用户使用右上角菜单进行分享
          wx.showToast({
            title: '点击右上角[...]进行分享',
            icon: 'none'
          });
        }
      }
    });
  },

  exportData() {
    wx.showModal({
      title: '导出数据',
      content: '该功能会将您的日程和任务数据导出为JSON格式文本，您可以手动复制并保存。',
      success: (res) => {
        if (!res.confirm) return;

        const schedules = storage.getSchedules() || [];
        const tasks = storage.getTasks() || [];
        const dataToExport = JSON.stringify({ schedules, tasks }, null, 2);
        
        wx.navigateTo({
          url: `/pages/data-display/data-display?data=${encodeURIComponent(dataToExport)}`,
        });
      }
    });
  },

  shareApp() {
    wx.showToast({
      title: '功能待开发',
      icon: 'none'
    });
  }
})