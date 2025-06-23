Component({
    properties: {
      messageId: {
        type: String,
        value: ''
      },
      isConfirmed: {
        type: Boolean,
        value: false
      },
      type: {
        type: String,
        value: 'user' // 'user' 或 'ai'
      },
      contentType: {
        type: String,
        value: 'text' // 'text', 'voice', 'schedule', 'task'
      },
      content: {
        type: String,
        value: ''
      },
      duration: {
        type: Number,
        value: 0
      },
      loading: {
        type: Boolean,
        value: false
      }
    },
  
    data: {
      // 组件内部数据
    },
  
    methods: {
      // 播放语音
      playVoice() {
        this.triggerEvent('playvoice', {
          url: this.data.content
        });
      },
  
      // 确认日程
      confirmSchedule() {
        this.triggerEvent('confirmschedule', {
          schedule: this.data.content,
          messageId: this.data.messageId
        });
      },
  
      // 修改日程
      modifySchedule() {
        this.triggerEvent('modifyschedule', {
          schedule: this.data.content
        });
      },
  
      // 确认任务
      confirmTask() {
        this.triggerEvent('confirmtask', {
          task: this.data.content,
          messageId: this.data.messageId
        });
      },
  
      // 修改任务
      modifyTask() {
        this.triggerEvent('modifytask', {
          task: this.data.content
        });
      }
    }
  }); 