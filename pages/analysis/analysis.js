// pages/analysis/analysis.js
const storage = require('../../utils/storage.js');
const dateUtils = require('../../utils/date-utils.js');

Page({
  data: {
    stats: {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      avgCompletionTime: 'N/A',
      priority: {
        high: 0,
        medium: 0,
        low: 0,
      },
    },
    chartData: {
      weeklyTrend: [],
    },
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
    this.generateAnalytics();
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

  generateAnalytics() {
    const tasks = storage.getTasks();
    if (!tasks || tasks.length === 0) return;

    // 1. 总体概览
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.isCompleted).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. 平均完成周期
    const completedWithTime = tasks.filter(t => t.isCompleted && t.createdAt && t.updatedAt);
    let avgCompletionTime = 'N/A';
    if (completedWithTime.length > 0) {
      const totalMillis = completedWithTime.reduce((sum, task) => {
        return sum + (new Date(task.updatedAt) - new Date(task.createdAt));
      }, 0);
      const avgMillis = totalMillis / completedWithTime.length;
      const avgDays = avgMillis / (1000 * 60 * 60 * 24);
      avgCompletionTime = avgDays.toFixed(1) + '天';
    }
    
    // 3. 优先级分布
    const priority = tasks.reduce((acc, task) => {
      acc[task.priority || 'medium']++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    this.setData({
      stats: {
        totalTasks,
        completedTasks,
        completionRate,
        avgCompletionTime,
        priority,
      }
    });

    // 4. 本周任务完成趋势
    this.generateWeeklyTrend(tasks);
  },

  generateWeeklyTrend(tasks) {
    const weeklyTrend = [];
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const today = new Date();
    
    let maxCount = 0;

    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const dayStr = dateUtils.formatDate(day, 'YYYY-MM-DD');
      
      const completedOnDay = tasks.filter(t => 
        t.isCompleted && dateUtils.formatDate(new Date(t.updatedAt), 'YYYY-MM-DD') === dayStr
      ).length;

      if (completedOnDay > maxCount) {
        maxCount = completedOnDay;
      }

      weeklyTrend.push({
        day: weekdays[day.getDay()],
        count: completedOnDay,
      });
    }

    // 计算百分比高度
    const chartData = weeklyTrend.map(item => ({
      ...item,
      percentage: maxCount > 0 ? (item.count / maxCount) * 100 : 0
    }));

    this.setData({
      'chartData.weeklyTrend': chartData,
    });
  },
});