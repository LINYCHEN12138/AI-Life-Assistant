Page({
  data: {
    jsonData: ''
  },
  onLoad(options) {
    if (options.data) {
      this.setData({
        jsonData: decodeURIComponent(options.data)
      });
    }
  },
  copyData() {
    wx.setClipboardData({
      data: this.data.jsonData,
      success: () => wx.showToast({ title: '已复制' })
    });
  }
}); 