const storage = require('../../utils/storage.js');

Page({
  data: {
    tasks: [],
    filteredTasks: [],
    currentFilter: 'pending', // 'pending', 'completed', 'all'
    summary: {
      pending: 0,
      completed: 0,
      total: 0
    }
  },

  onShow() {
    this.loadTasks();
  },

  loadTasks() {
    const tasks = storage.getTasks();
    this.setData({ tasks });
    this.updateSummary();
    this.applyFilter();
  },

  updateSummary() {
    const { tasks } = this.data;
    const pending = tasks.filter(t => !t.isCompleted).length;
    const completed = tasks.length - pending;
    this.setData({
      summary: {
        pending,
        completed,
        total: tasks.length
      }
    });
  },

  setFilter(e) {
    this.setData({
      currentFilter: e.currentTarget.dataset.filter
    });
    this.applyFilter();
  },

  applyFilter() {
    const { tasks, currentFilter } = this.data;
    let filteredTasks = [];
    if (currentFilter === 'all') {
      filteredTasks = tasks;
    } else if (currentFilter === 'pending') {
      filteredTasks = tasks.filter(t => !t.isCompleted);
    } else {
      filteredTasks = tasks.filter(t => t.isCompleted);
    }
    this.setData({ filteredTasks });
  },

  toggleComplete(e) {
    const taskId = e.currentTarget.dataset.taskId;
    storage.toggleTaskComplete(taskId);
    this.loadTasks();
  },

  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/task-form/task-form',
    });
  },

  navigateToEdit(e) {
    const taskId = e.currentTarget.dataset.taskId;
    wx.navigateTo({
      url: `/pages/task-form/task-form?id=${taskId}`,
    });
  }
}); 