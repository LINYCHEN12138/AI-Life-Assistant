const storage = require('../../utils/storage.js');

Page({
  data: {
    isEditing: false,
    taskId: null,
    taskForm: {
      title: '',
      description: '',
      deadline: '',
      priority: 'medium', // 'low', 'medium', 'high'
    },
  },

  onLoad(options) {
    if (options.id) {
      // 编辑模式
      const taskId = parseInt(options.id, 10);
      const task = storage.getTaskById(taskId);
      if (task) {
        this.setData({
          isEditing: true,
          taskId: taskId,
          taskForm: {
            title: task.title,
            description: task.description || '',
            deadline: task.deadline || '',
            priority: task.priority || 'medium',
          }
        });
        wx.setNavigationBarTitle({ title: '编辑任务' });
      }
    } else {
      // 新建模式
      wx.setNavigationBarTitle({ title: '创建新任务' });
    }
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`taskForm.${field}`]: e.detail.value
    });
  },
  
  onDateChange(e) {
    this.setData({
      'taskForm.deadline': e.detail.value
    });
  },

  selectPriority(e) {
    this.setData({
      'taskForm.priority': e.currentTarget.dataset.priority
    });
  },

  saveTask() {
    if (!this.data.taskForm.title) {
      wx.showToast({
        title: '任务标题不能为空',
        icon: 'none'
      });
      return;
    }

    const taskData = Object.assign({
      id: this.data.isEditing ? this.data.taskId : Date.now(),
      isCompleted: this.data.isEditing ? storage.getTaskById(this.data.taskId).isCompleted : false
    }, this.data.taskForm);

    if (this.data.isEditing) {
      storage.updateTask(taskData);
    } else {
      storage.addTask(taskData);
    }
    
    wx.showToast({
      title: this.data.isEditing ? '更新成功' : '创建成功',
      icon: 'success'
    });

    setTimeout(() => wx.navigateBack(), 1500);
  },

  deleteTask() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个任务吗？此操作无法撤销。',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          storage.deleteTask(this.data.taskId);
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
          setTimeout(() => wx.navigateBack(), 1500);
        }
      }
    });
  }
}); 