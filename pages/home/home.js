// pages/home/home.js
const aiService = require('../../utils/ai-service.js');
const storage = require('../../utils/storage.js');

Page({
  data: {
    messages: [],
    inputText: '',
    isRecording: false,
    scrollToMessage: '',
    recordingManager: null,
    innerAudioContext: null
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    // 页面显示时仅加载聊天记录
    this.loadChatHistory();
  },

  // 初始化页面
  initPage() {
    // 初始化录音管理器
    this.initRecorderManager();
    
    // 初始化音频播放器
    this.initAudioContext();
  },

  // 初始化录音管理器
  initRecorderManager() {
    this.recordingManager = wx.getRecorderManager();
    
    this.recordingManager.onStart(() => {
      console.log('录音开始');
      this.setData({ isRecording: true });
    });

    this.recordingManager.onStop((res) => {
      console.log('录音结束', res);
      this.setData({ isRecording: false });
      this.handleVoiceRecord(res);
    });

    this.recordingManager.onError((res) => {
      console.error('录音错误', res);
      this.setData({ isRecording: false });
      wx.showToast({
        title: '录音失败',
        icon: 'error'
      });
    });
  },

  // 初始化音频播放器
  initAudioContext() {
    this.innerAudioContext = wx.createInnerAudioContext();
    
    this.innerAudioContext.onError((res) => {
      console.error('音频播放错误', res);
      wx.showToast({
        title: '播放失败',
        icon: 'error'
      });
    });
  },

  // 加载聊天历史
  loadChatHistory() {
    const history = storage.getChatHistory();
    if (history && history.length > 0) {
      this.setData({ messages: history }, () => {
        this.scrollToBottom();
      });
    }
  },

  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 发送消息
  sendMessage() {
    const text = this.data.inputText.trim();
    if (!text) return;

    // 添加用户消息
    const userMessage = {
      id: this.generateMessageId(),
      type: 'user',
      contentType: 'text',
      content: text,
      timestamp: Date.now()
    };

    this.addMessage(userMessage);
    this.setData({ inputText: '' });

    // 发送到AI服务
    this.sendToAI(text);
  },

  // 发送到AI服务
  async sendToAI(text) {
    // 添加AI加载消息
    const loadingMessage = {
      id: this.generateMessageId(),
      type: 'ai',
      contentType: 'text',
      content: '',
      loading: true,
      timestamp: Date.now()
    };

    this.addMessage(loadingMessage);

    try {
      // 调用AI服务
      const response = await aiService.chat(text, this.data.messages);
      
      // 安全检查：确认当前页面仍然是home页
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (!currentPage || currentPage.route !== 'pages/home/home') {
        console.log('AI响应返回时，用户已离开聊天页面，终止UI更新。');
        return;
      }
      
      // 更新AI消息
      const aiMessage = Object.assign({}, loadingMessage, {
        content: response.content,
        contentType: response.contentType || 'text',
        loading: false,
        isConfirmed: false
      });

      if (response.contentType === 'schedule') {
        aiMessage.content = response.scheduleData;
      } else if (response.contentType === 'task') {
        aiMessage.content = response.taskData;
      }

      this.updateMessage(aiMessage);
      this.scrollToBottom();

    } catch (error) {
      console.error('AI服务调用失败', error);
      
      // 安全检查：确认当前页面仍然是home页
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      if (!currentPage || currentPage.route !== 'pages/home/home') {
        console.log('AI错误返回时，用户已离开聊天页面，终止UI更新。');
        return;
      }
      
      // 更新错误消息
      const errorMessage = Object.assign({}, loadingMessage, {
        content: '抱歉，我遇到了一些问题，请稍后再试。',
        loading: false
      });

      this.updateMessage(errorMessage);
      this.scrollToBottom();
    }
  },

  // 开始录音
  startRecording() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              this.recordingManager.start({
                duration: 60000,
                sampleRate: 16000,
                numberOfChannels: 1,
                encodeBitRate: 48000,
                format: 'mp3'
              });
            },
            fail: () => {
              wx.showModal({
                title: '录音权限未授权',
                content: '请授权录音权限，否则无法使用语音功能',
                showCancel: true,
                confirmText: '去授权',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        } else {
          this.recordingManager.start({
            duration: 60000,
            sampleRate: 16000,
            numberOfChannels: 1,
            encodeBitRate: 48000,
            format: 'mp3'
          });
        }
      }
    });
  },

  // 停止录音
  stopRecording() {
    this.recordingManager.stop();
  },

  // 处理语音录音
  async handleVoiceRecord(res) {
    if (res.duration < 1000) {
      wx.showToast({
        title: '录音时间太短',
        icon: 'none'
      });
      return;
    }

    // 添加用户语音消息
    const userMessage = {
      id: this.generateMessageId(),
      type: 'user',
      contentType: 'voice',
      content: res.tempFilePath,
      duration: Math.round(res.duration / 1000),
      timestamp: Date.now()
    };

    this.addMessage(userMessage);

    try {
      // 语音转文字
      const text = await this.voiceToText(res.tempFilePath);
      
      // 发送到AI服务
      this.sendToAI(text);
      
    } catch (error) {
      console.error('语音转文字失败', error);
      wx.showToast({
        title: '语音识别失败',
        icon: 'error'
      });
    }
  },

  // 语音转文字
  async voiceToText(filePath) {
    // 这里应该调用语音识别API
    // 暂时返回模拟结果
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('这是一个语音转文字的结果');
      }, 1000);
    });
  },

  // 播放语音
  playVoice(e) {
    const url = e.currentTarget.dataset.url;
    this.innerAudioContext.src = url;
    this.innerAudioContext.play();
  },

  // 快速操作
  quickAction(e) {
    const action = e.currentTarget.dataset.action;
    let url = '';

    switch (action) {
      case 'schedule':
        url = '/pages/schedule-form/schedule-form';
        break;
      case 'task':
        url = '/pages/task-form/task-form';
        break;
      case 'reminder':
        wx.showToast({ title: '提醒功能待开发', icon: 'none' });
        return;
    }

    wx.navigateTo({ url });
  },

  // 确认日程
  confirmSchedule(e) {
    const messageId = e.currentTarget.dataset.id;
    const message = this.data.messages.find(m => m.id === messageId);

    if (message && message.content.type === 'schedule') {
      storage.addSchedule(message.content);
      this.updateMessage({ ...message, isConfirmed: true });
    }
  },

  // 修改日程
  modifySchedule(e) {
    const messageId = e.currentTarget.dataset.id;
    const message = this.data.messages.find(m => m.id === messageId);
    if (message) {
      wx.navigateTo({
        url: `/pages/schedule-form/schedule-form?id=${message.content.id}`
      });
    }
  },

  // 确认任务
  confirmTask(e) {
    const messageId = e.currentTarget.dataset.id;
    const message = this.data.messages.find(m => m.id === messageId);

    if (message && message.content.type === 'task') {
      storage.addTask(message.content);
      this.updateMessage({ ...message, isConfirmed: true });
    }
  },

  // 修改任务
  modifyTask(e) {
    const messageId = e.currentTarget.dataset.id;
    const message = this.data.messages.find(m => m.id === messageId);
    if (message) {
      wx.navigateTo({
        url: `/pages/task-form/task-form?id=${message.content.id}`
      });
    }
  },

  // 添加消息
  addMessage(message) {
    this.setData({
      messages: [...this.data.messages, message]
    }, () => {
      this.scrollToBottom();
      storage.saveChatHistory(this.data.messages);
    });
  },

  // 更新消息
  updateMessage(updatedMessage) {
    const messages = this.data.messages.map(msg => {
      if (msg.id === updatedMessage.id) {
        return updatedMessage;
      }
      return msg;
    });
    this.setData({ messages }, () => {
      storage.saveChatHistory(this.data.messages);
    });
  },

  // 滚动到底部
  scrollToBottom() {
    setTimeout(() => {
      const messages = this.data.messages;
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        this.setData({
          scrollToMessage: `msg-${lastMessage.id}`
        });
      }
    }, 100);
  },

  // 生成消息ID
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  onUnload() {
    // 清理资源
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
    }
  }
}); 