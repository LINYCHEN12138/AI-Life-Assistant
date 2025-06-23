const dateUtils = {
  /**
   * 格式化日期
   * @param {Date | number | string} date - 日期对象、时间戳或日期字符串
   * @param {string} fmt - 格式，如 'YYYY-MM-DD hh:mm:ss'
   * @returns {string}
   */
  formatDate(date, fmt) {
    fmt = fmt || 'YYYY-MM-DD';
    if (!date) return '';
    const d = new Date(date);
    const o = {
      'M+': d.getMonth() + 1, // 月份
      'D+': d.getDate(), // 日
      'h+': d.getHours(), // 小时
      'm+': d.getMinutes(), // 分
      's+': d.getSeconds(), // 秒
      'q+': Math.floor((d.getMonth() + 3) / 3), // 季度
      'S': d.getMilliseconds() // 毫秒
    };
    
    const yearMatch = fmt.match(/(Y+)/);
    if (yearMatch) {
      fmt = fmt.replace(yearMatch[0], (d.getFullYear() + '').substr(4 - yearMatch[0].length));
    }

    for (let k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
      }
    }
    return fmt;
  },

  /**
   * 格式化时间
   * @param {Date | number | string} date - 日期对象、时间戳或日期字符串
   * @returns {string} 格式如 '09:30'
   */
  formatTime(date) {
    return this.formatDate(date, 'hh:mm');
  },

  /**
   * 获取中文星期
   * @param {Date} date - 日期对象
   * @returns {string} 如 '星期一'
   */
  getChineseWeekday(date) {
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return weekdays[new Date(date).getDay()];
  },

  /**
   * 获取某个月的日历数组
   * @param {number} year - 年份
   * @param {number} month - 月份 (1-12)
   * @returns {Array}
   */
  getCalendarDays(year, month) {
    const days = [];
    const date = new Date(year, month - 1, 1);
    const firstDayOfWeek = date.getDay(); // 当月第一天是周几
    const daysInMonth = new Date(year, month, 0).getDate(); // 当月总天数
    
    const today = new Date();
    const todayStr = this.formatDate(today, 'YYYY-MM-DD');

    // 上个月的补全
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 2, daysInPrevMonth - i);
      days.push({
        date: this.formatDate(d, 'YYYY-MM-DD'),
        day: d.getDate(),
        isCurrentMonth: false,
      });
    }

    // 当前月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month - 1, i);
      const dateStr = this.formatDate(d, 'YYYY-MM-DD');
      days.push({
        date: dateStr,
        day: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // 下个月的补全
    const remaining = 42 - days.length; // 6行 * 7天 = 42
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: this.formatDate(d, 'YYYY-MM-DD'),
        day: i,
        isCurrentMonth: false,
      });
    }

    return days;
  }
};

module.exports = dateUtils; 