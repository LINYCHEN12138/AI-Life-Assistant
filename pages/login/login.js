const storage = require('../../utils/storage.js');

Page({
  data: {
    avatarUrl: '',
    nickname: '',
    motto: ''
  },
  onLoad() {
    const userInfo = storage.getUserInfo();
    if (userInfo) {
      this.setData({
        avatarUrl: userInfo.avatarUrl,
        nickname: userInfo.nickName,
        motto: userInfo.motto || ''
      });
    }
  },
  onChooseAvatar(e) {
    // 用户选择头像后的回调
    const { avatarUrl } = e.detail;
    this.setData({
      avatarUrl,
    });
  },
  onNicknameInput(e) {
    this.setData({
      nickname: e.detail.value
    });
  },
  onMottoInput(e) {
    this.setData({
      motto: e.detail.value
    });
  },
  saveProfile() {
    if (!this.data.nickname) {
      wx.showToast({
        title: '昵称不能为空',
        icon: 'none'
      });
      return;
    }

    // 组装新的用户信息
    // 注意：在实际应用中，avatarUrl应该是上传到云存储后的永久链接
    const newUserInfo = {
      nickName: this.data.nickname,
      avatarUrl: this.data.avatarUrl,
      motto: this.data.motto,
    };

    storage.saveUserInfo(newUserInfo);

    wx.showToast({
      title: '保存成功',
      icon: 'success',
      duration: 1500,
      complete: () => {
        // 1.5秒后自动返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  }
}); 