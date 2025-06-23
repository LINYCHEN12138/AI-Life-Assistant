// utils/storage.js - 本地存储管理模块

const STORAGE_KEYS = {
  USER_INFO: 'userInfo',
  CHAT_HISTORY: 'chatHistory',
  SCHEDULES: 'schedules',
  TASKS: 'tasks',
};

class StorageManager {

  // --- 基础方法 ---
  set(key, data) {
    try {
      wx.setStorageSync(key, data);
    } catch (e) {
      console.error(`[Storage] Set storage for key "${key}" failed:`, e);
    }
  }

  get(key, defaultValue) {
    if (defaultValue === undefined) {
      defaultValue = null;
    }
    try {
      const value = wx.getStorageSync(key);
      return value === '' || value === null || value === undefined ? defaultValue : value;
    } catch (e) {
      console.error(`[Storage] Get storage for key "${key}" failed:`, e);
      return defaultValue;
    }
  }

  remove(key) {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      console.error(`[Storage] Remove storage for key "${key}" failed:`, e);
    }
  }

  // --- 辅助方法 ---
  generateId(prefix) {
    prefix = prefix || 'id';
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // --- 用户信息 ---
  saveUserInfo(userInfo) { this.set(STORAGE_KEYS.USER_INFO, userInfo); }
  getUserInfo() { return this.get(STORAGE_KEYS.USER_INFO, null); }

  // --- 聊天记录 ---
  saveChatHistory(messages) { this.set(STORAGE_KEYS.CHAT_HISTORY, messages.slice(-100)); }
  getChatHistory() { return this.get(STORAGE_KEYS.CHAT_HISTORY, []); }

  // --- 日程管理 ---
  getSchedules() {
    const schedules = this.get(STORAGE_KEYS.SCHEDULES, []);
    return Array.isArray(schedules) ? schedules : [];
  }
  saveSchedules(schedules) { this.set(STORAGE_KEYS.SCHEDULES, schedules); }
  
  getScheduleById(scheduleId) {
    return this.getSchedules().find(s => s.id === scheduleId);
  }

  addSchedule(scheduleData) {
    const schedules = this.getSchedules();
    const newSchedule = Object.assign({}, scheduleData, {
      id: this.generateId('schedule'),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
    schedules.push(newSchedule);
    this.saveSchedules(schedules);
  }

  updateSchedule(scheduleData) {
    const schedules = this.getSchedules();
    const index = schedules.findIndex(s => s.id === scheduleData.id);
    if (index !== -1) {
      schedules[index] = Object.assign({}, schedules[index], scheduleData, {
        updatedAt: new Date().toISOString(),
      });
      this.saveSchedules(schedules);
    }
  }

  deleteSchedule(scheduleId) {
    const schedules = this.getSchedules().filter(s => s.id !== scheduleId);
    this.saveSchedules(schedules);
  }

  toggleScheduleComplete(scheduleId) {
    const schedules = this.getSchedules();
    const index = schedules.findIndex(s => s.id === scheduleId);
    if (index !== -1) {
      schedules[index].isCompleted = !schedules[index].isCompleted;
      this.saveSchedules(schedules);
    }
  }

  // --- 任务管理 ---
  getTasks() {
    const tasks = this.get(STORAGE_KEYS.TASKS, []);
    return Array.isArray(tasks) ? tasks : [];
  }
  saveTasks(tasks) { this.set(STORAGE_KEYS.TASKS, tasks); }

  getTaskById(taskId) {
    return this.getTasks().find(t => t.id === taskId);
  }

  addTask(taskData) {
    const tasks = this.getTasks();
    const newTask = Object.assign({}, taskData, {
      id: this.generateId('task'),
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
    tasks.push(newTask);
    this.saveTasks(tasks);
  }

  updateTask(taskData) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskData.id);
    if (index !== -1) {
      tasks[index] = Object.assign({}, tasks[index], taskData, {
        updatedAt: new Date().toISOString(),
      });
      this.saveTasks(tasks);
    }
  }

  deleteTask(taskId) {
    const tasks = this.getTasks().filter(t => t.id !== taskId);
    this.saveTasks(tasks);
  }

  toggleTaskComplete(taskId) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index].isCompleted = !tasks[index].isCompleted;
      this.saveTasks(tasks);
    }
  }
}

// 创建并导出实例
const storage = new StorageManager();
module.exports = storage; 