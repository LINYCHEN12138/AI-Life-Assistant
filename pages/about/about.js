Page({
  data: {
    version: '1.0.0',
    githubUrl: 'https://github.com/your-repo' // 替换为你的项目地址
  },
  copyUrl() {
    wx.setClipboardData({
      data: this.data.githubUrl,
      success: () => wx.showToast({ title: '已复制仓库地址' })
    });
  }
}); 