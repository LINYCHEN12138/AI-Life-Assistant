// pages/backup/backup.js
const storage = require('../../utils/storage.js');

Page({
  data: {},
  onLoad() {
    // 移除this.storage = new StorageManager();
  },
  backupData() {
    const schedules = storage.getSchedules() || [];
    const tasks = storage.getTasks() || [];
    const history = storage.getChatHistory() || [];
    const data = { schedules, tasks, history };
    const dataStr = JSON.stringify(data, null, 2);
    wx.setClipboardData({
      data: dataStr,
      success: () => wx.showToast({ title: '已复制到剪贴板' })
    });
  },
  restoreData() {
    wx.getClipboardData({
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.schedules && data.tasks && data.history) {
            storage.saveSchedules(data.schedules);
            storage.saveTasks(data.tasks);
            storage.saveChatHistory(data.history);
            wx.showModal({
              title: '恢复成功',
              content: '数据已从剪贴板恢复。',
              showCancel: false
            });
          } else {
            throw new Error('格式不正确');
          }
        } catch (e) {
          wx.showToast({ title: '恢复失败,剪贴板内容不是有效的备份数据', icon: 'none' });
        }
      }
    });
  }
}); 