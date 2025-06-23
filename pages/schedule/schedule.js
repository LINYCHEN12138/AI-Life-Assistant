// pages/schedule/schedule.js
const storage = require('../../utils/storage.js');
const dateUtils = require('../../utils/date-utils.js');

Page({
  data: {
    currentDate: '',
    currentDay: '',
    viewMode: 'month', // 'month' 或 'day'
    monthTitle: '',
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    schedules: [],
    filteredSchedules: [],
    currentFilter: 'all',
    showModal: false,
    editingSchedule: null,
    scheduleForm: {
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      category: 'personal',
      location: '',
      reminderIndex: 0
    },
    categories: [
      { value: 'work', label: '工作', icon: '💼' },
      { value: 'personal', label: '个人', icon: '👤' },
      { value: 'health', label: '健康', icon: '🏃' },
      { value: 'family', label: '家庭', icon: '👨‍👩‍👧‍👦' },
      { value: 'study', label: '学习', icon: '📚' }
    ],
    reminderOptions: [
      { label: '不提醒', value: 0 },
      { label: '提前5分钟', value: 5 },
      { label: '提前15分钟', value: 15 },
      { label: '提前30分钟', value: 30 },
      { label: '提前1小时', value: 60 }
    ]
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    this.loadSchedules();
  },

  // 初始化页面
  initPage() {
    const now = new Date();
    this.setData({
      currentDate: dateUtils.formatDate(now, 'YYYY年MM月DD日'),
      currentDay: dateUtils.getChineseWeekday(now)
    });
    
    this.generateCalendar();
    this.loadSchedules();
  },

  // 生成日历数据
  generateCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    this.setData({
      monthTitle: `${year}年${month}月`
    });

    const calendarDays = dateUtils.getCalendarDays(year, month);
    this.setData({ calendarDays });
  },

  // 加载日程数据
  loadSchedules() {
    const schedules = storage.getSchedules();
    const processedSchedules = schedules.map(schedule => {
      const startTime = new Date(schedule.startTime);
      const endTime = new Date(schedule.endTime);
      
      return {
        ...schedule,
        startTime: dateUtils.formatTime(startTime),
        endTime: dateUtils.formatTime(endTime),
        date: dateUtils.formatDate(startTime, 'YYYY-MM-DD'),
        statusText: this.getStatusText(schedule),
        categoryText: this.getCategoryText(schedule.category)
      };
    });

    this.setData({ schedules: processedSchedules });
    this.filterAndSortSchedules();
    this.updateCalendarWithSchedules();
  },

  // 更新日历显示日程
  updateCalendarWithSchedules() {
    const calendarDays = this.data.calendarDays.map(day => {
      const daySchedules = this.data.schedules.filter(schedule => 
        schedule.date === day.date
      );
      
      return {
        ...day,
        hasSchedule: daySchedules.length > 0,
        scheduleCount: daySchedules.length
      };
    });

    this.setData({ calendarDays });
  },

  // 切换视图模式
  switchView() {
    const newMode = this.data.viewMode === 'month' ? 'day' : 'month';
    this.setData({ viewMode: newMode });
  },

  // 上个月
  prevMonth() {
    // 实现月份切换逻辑
    console.log('上个月');
  },

  // 下个月
  nextMonth() {
    // 实现月份切换逻辑
    console.log('下个月');
  },

  // 选择日期
  selectDate(e) {
    const date = e.currentTarget.dataset.date;
    this.setData({ viewMode: 'day' });
    // 可以在这里实现日期选择逻辑
  },

  // 设置筛选
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    this.filterAndSortSchedules();
  },

  // 筛选和排序日程
  filterAndSortSchedules() {
    let filteredSchedules = [...this.data.schedules];

    // 筛选
    if (this.data.currentFilter !== 'all') {
      filteredSchedules = filteredSchedules.filter(schedule => 
        schedule.category === this.data.currentFilter
      );
    }

    // 按时间排序
    filteredSchedules.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    this.setData({ filteredSchedules });
  },

  // 添加日程
  addSchedule() {
    wx.navigateTo({
      url: '/pages/schedule-form/schedule-form'
    });
  },

  // 编辑日程
  editSchedule(e) {
    const schedule = e.currentTarget.dataset.schedule;
    wx.navigateTo({
      url: `/pages/schedule-form/schedule-form?schedule=${encodeURIComponent(JSON.stringify(schedule))}`
    });
  },

  // 表单输入处理
  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`scheduleForm.${field}`]: value
    });
  },

  // 日期选择
  onDateChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`scheduleForm.${field}`]: value
    });
  },

  // 时间选择
  onTimeChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`scheduleForm.${field}`]: value
    });
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      'scheduleForm.category': category
    });
  },

  // 提醒选择
  onReminderChange(e) {
    this.setData({
      'scheduleForm.reminderIndex': e.detail.value
    });
  },

  // 保存日程
  saveSchedule() {
    const form = this.data.scheduleForm;
    
    if (!form.title.trim()) {
      wx.showToast({
        title: '请输入日程标题',
        icon: 'none'
      });
      return;
    }

    const scheduleData = {
      title: form.title.trim(),
      description: form.description.trim(),
      startTime: `${form.startDate} ${form.startTime}`,
      endTime: `${form.endDate} ${form.endTime}`,
      category: form.category,
      location: form.location.trim(),
      reminder: this.data.reminderOptions[form.reminderIndex].value,
      isCompleted: false
    };

    if (this.data.editingSchedule) {
      // 更新日程
      storage.updateSchedule(this.data.editingSchedule.id, scheduleData);
    } else {
      // 创建新日程
      storage.addSchedule(scheduleData);
    }

    this.closeModal();
    this.loadSchedules();

    wx.showToast({
      title: this.data.editingSchedule ? '日程已更新' : '日程已创建',
      icon: 'success'
    });
  },

  // 切换完成状态
  toggleComplete(e) {
    const id = e.currentTarget.dataset.id;
    storage.toggleScheduleComplete(id);
    this.loadSchedules();
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showModal: false,
      editingSchedule: null
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    // 阻止事件冒泡
  },

  // 获取状态文本
  getStatusText(schedule) {
    if (schedule.isCompleted) {
      return '已完成';
    }
    
    const now = new Date();
    const startTime = new Date(schedule.startTime);
    
    if (startTime < now) {
      return '已开始';
    }
    
    return '未开始';
  },

  // 获取分类文本
  getCategoryText(category) {
    const categoryMap = {
      work: '工作',
      personal: '个人',
      health: '健康',
      family: '家庭',
      study: '学习'
    };
    return categoryMap[category] || '其他';
  },

  // 获取提醒索引
  getReminderIndex(reminder) {
    return this.data.reminderOptions.findIndex(option => option.value === reminder);
  }
}); 