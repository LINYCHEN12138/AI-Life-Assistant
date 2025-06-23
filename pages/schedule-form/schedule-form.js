const storage = require('../../utils/storage.js');
const dateUtils = require('../../utils/date-utils.js');

Page({
  data: {
    isEditing: false,
    scheduleId: null,
    scheduleForm: {
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
    },
  },

  onLoad(options) {
    if (options.id) {
      // 编辑模式
      const scheduleId = parseInt(options.id, 10);
      const schedule = storage.getScheduleById(scheduleId);
      if (schedule) {
        this.setData({
          isEditing: true,
          scheduleId: scheduleId,
          scheduleForm: {
            title: schedule.title,
            description: schedule.description || '',
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime || '',
          }
        });
        wx.setNavigationBarTitle({ title: '编辑日程' });
      }
    } else {
      // 新建模式
      this.setData({
        'scheduleForm.date': dateUtils.formatDate(new Date(), 'YYYY-MM-DD'),
      });
      wx.setNavigationBarTitle({ title: '添加日程' });
    }
  },

  // 表单输入处理
  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`scheduleForm.${field}`]: e.detail.value
    });
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      'scheduleForm.date': e.detail.value
    });
  },

  // 时间选择
  onTimeChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`scheduleForm.${field}`]: e.detail.value
    });
  },

  // 保存日程
  saveSchedule() {
    if (!this.data.scheduleForm.title || !this.data.scheduleForm.date || !this.data.scheduleForm.startTime) {
      wx.showToast({
        title: '请填写必填项',
        icon: 'none'
      });
      return;
    }

    const scheduleData = Object.assign({
      id: this.data.isEditing ? this.data.scheduleId : Date.now()
    }, this.data.scheduleForm);

    if (this.data.isEditing) {
      storage.updateSchedule(scheduleData);
    } else {
      storage.addSchedule(scheduleData);
    }
    
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });

    // 返回上一页并触发更新
    setTimeout(() => {
      wx.navigateBack();
    }, 1500);
  }
}); 