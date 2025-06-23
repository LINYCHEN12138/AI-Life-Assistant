// utils/ai-service.js - AI服务模块

// AI服务配置
const AI_CONFIG = {
  // 支持多种AI服务商
  providers: {
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      maxTokens: 2000
    },
    wenxin: {
      name: '文心一言',
      baseUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat',
      model: 'completions',
      maxTokens: 2000
    },
    tongyi: {
      name: '通义千问',
      baseUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      model: 'qwen-turbo',
      maxTokens: 2000
    },
    kimi: {
      name: 'Kimi',
      baseUrl: 'https://api.moonshot.cn/v1/chat/completions',
      model: 'moonshot-v1-8k',
      maxTokens: 2000
    }
  },
  
  // 默认配置
  defaultProvider: 'kimi',
  apiKey: '。。。', // 在此替换为你的API Key
  timeout: 30000,
  retryTimes: 3
};

// 意图识别关键词
const INTENT_KEYWORDS = {
  schedule: ['日程', '安排', '会议', '约会', '提醒', '时间', '几点', '什么时候'],
  task: ['任务', '待办', '工作', '项目', '完成', '截止', '期限'],
  reminder: ['提醒', '闹钟', '通知', '记得', '别忘了'],
  weather: ['天气', '下雨', '温度', '冷热'],
  news: ['新闻', '资讯', '热点', '最新'],
  help: ['帮助', '怎么', '如何', '问题', '支持']
};

// 时间解析关键词
const TIME_KEYWORDS = {
  today: ['今天', '今日', '现在'],
  tomorrow: ['明天', '明日'],
  nextWeek: ['下周', '下个星期'],
  nextMonth: ['下个月', '下月'],
  morning: ['早上', '上午', '早晨'],
  afternoon: ['下午', '午后'],
  evening: ['晚上', '傍晚', '夜晚'],
  night: ['深夜', '半夜', '凌晨']
};

class AIService {
  constructor() {
    this.config = this.loadConfig();
    this.conversationHistory = [];
    this.maxHistoryLength = 10;
  }

  // 加载配置
  loadConfig() {
    const savedConfig = wx.getStorageSync('aiConfig');
    return Object.assign({}, AI_CONFIG, savedConfig);
  }

  // 基础对话功能
  async chat(message, context = []) {
    try {
      // 意图识别
      const intent = this.recognizeIntent(message);
      
      // 根据意图处理
      if (intent.type === 'schedule') {
        return await this.handleScheduleIntent(message, intent);
      } else if (intent.type === 'task') {
        return await this.handleTaskIntent(message, intent);
      } else if (intent.type === 'reminder') {
        return await this.handleReminderIntent(message, intent);
      } else {
        // 通用对话
        return await this.generalChat(message, context);
      }
    } catch (error) {
      console.error('AI对话错误:', error);
      throw error;
    }
  }

  // 意图识别
  recognizeIntent(text) {
    const lowerText = text.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword)) {
          return {
            type: intent,
            confidence: 0.8,
            keyword: keyword
          };
        }
      }
    }
    
    return {
      type: 'general',
      confidence: 0.5
    };
  }

  // 处理日程意图
  async handleScheduleIntent(message, intent) {
    const scheduleData = this.parseScheduleFromText(message);
    
    if (scheduleData) {
      return {
        contentType: 'schedule',
        content: '我帮你创建了一个日程',
        scheduleData: scheduleData
      };
    } else {
      // 如果解析失败，询问更多信息
      return {
        contentType: 'text',
        content: '请告诉我具体的日程信息，比如时间、地点等。'
      };
    }
  }

  // 处理任务意图
  async handleTaskIntent(message, intent) {
    const taskData = this.parseTaskFromText(message);
    
    if (taskData) {
      return {
        contentType: 'task',
        content: '我帮你创建了一个任务',
        taskData: taskData
      };
    } else {
      return {
        contentType: 'text',
        content: '请告诉我具体的任务信息，比如任务名称、截止时间等。'
      };
    }
  }

  // 处理提醒意图
  async handleReminderIntent(message, intent) {
    const reminderData = this.parseReminderFromText(message);
    
    if (reminderData) {
      return {
        contentType: 'reminder',
        content: '我帮你设置了一个提醒',
        reminderData: reminderData
      };
    } else {
      return {
        contentType: 'text',
        content: '请告诉我具体的提醒信息，比如提醒时间和内容。'
      };
    }
  }

  // 通用对话
  async generalChat(message, context) {
    const response = await this.callAIAPI(message, context);
    return {
      contentType: 'text',
      content: response
    };
  }

  // 调用AI API
  async callAIAPI(message, context) {
    if (context === undefined) {
      context = [];
    }
    const provider = this.config.providers[this.config.defaultProvider];
    
    if (!provider) {
      throw new Error('未配置AI服务提供商');
    }

    const requestData = this.buildRequestData(message, context, provider);
    
    try {
      const response = await this.makeRequest(provider.baseUrl, requestData);
      return this.parseResponse(response, provider.name);
    } catch (error) {
      console.error('AI API调用失败:', error);
      throw error;
    }
  }

  // 构建请求数据
  buildRequestData(message, context, provider) {
    const model = provider.model;
    const commonBody = this.buildCommonBody(model);

    switch (provider.name) {
      case 'OpenAI':
      case 'Kimi':
        return Object.assign({}, commonBody, {
          messages: this.buildConversation(message, context)
        });
      case '文心一言':
        return Object.assign({}, commonBody, {
          messages: this.buildConversation(message, context)
        });
      case '通义千问':
        return Object.assign({}, commonBody, {
          input: {
            prompt: message
          },
          parameters: {
            result_format: 'text'
          }
        });
      default:
        return {};
    }
  }

  // 构建通用请求体
  buildCommonBody(model) {
    return {
      model: model,
      temperature: 0.7,
      stream: false
    };
  }

  // 构建对话历史
  buildConversation(message, context) {
    const messages = [
      {
        role: 'system',
        content: '你是一个智能生活助手，可以帮助用户管理日程、任务、提醒等。请用友好、简洁的方式回答用户的问题。'
      }
    ];

    // 添加上下文
    if (context && context.length > 0) {
      context.slice(-5).forEach(msg => {
        // 只添加文本类型的消息到上下文中
        if (msg.contentType === 'text' && typeof msg.content === 'string' && msg.content) {
          messages.push({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        }
      });
    }

    // 添加当前消息
    messages.push({
      role: 'user',
      content: message
    });

    return messages;
  }

  // 发送请求
  async makeRequest(url, data) {
    let retries = this.config.retryTimes;
    let delay = 1000; // 初始延迟1秒

    while (retries > 0) {
      try {
        const response = await new Promise((resolve, reject) => {
          wx.request({
            url: url,
            method: 'POST',
            header: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.apiKey}`
            },
            data: data,
            timeout: this.config.timeout,
            success: (res) => {
              if (res.statusCode === 429) {
                // 请求过于频繁，需要重试
                console.warn(`API请求过于频繁(429)，将在 ${delay}ms 后重试...`);
                reject({ type: 'retry', delay: delay, response: res });
              } else if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(res.data);
              } else {
                console.error('API请求成功但状态码非200:', res);
                reject(new Error(`API请求失败: ${res.statusCode}, 错误信息: ${res.errMsg}`));
              }
            },
            fail: (err) => {
              console.error('API网络请求失败:', err);
              reject(new Error(`网络请求失败: ${err.errMsg}`));
            }
          });
        });
        return response; // 成功则返回结果
      } catch (error) {
        if (error.type === 'retry') {
          retries--;
          if (retries === 0) {
            console.error('API请求重试次数已用完，最后一次错误:', error.response);
            throw new Error(`API请求失败: 超过最大重试次数`);
          }
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // 指数增加延迟
        } else {
          throw error; // 非重试类型的错误直接抛出
        }
      }
    }
  }

  // 解析响应
  parseResponse(response, providerName) {
    switch (providerName) {
      case 'OpenAI':
        return response.choices[0].message.content;
      case '文心一言':
        return response.result;
      case '通义千问':
        return response.output.text;
      default:
        return response.choices?.[0]?.message?.content || response.result || '抱歉，我无法理解您的请求。';
    }
  }

  // 从文本解析日程信息
  parseScheduleFromText(text) {
    const schedule = {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      location: '',
      category: 'personal',
      reminder: 15
    };

    // 提取时间信息
    const timeInfo = this.extractTimeInfo(text);
    if (timeInfo) {
      schedule.startTime = timeInfo.startTime;
      schedule.endTime = timeInfo.endTime;
    }

    // 提取地点信息
    const locationMatch = text.match(/在(.+?)(?:开会|见面|进行|举行)/);
    if (locationMatch) {
      schedule.location = locationMatch[1];
    }

    // 提取标题
    const titleMatch = text.match(/(?:安排|添加|创建)(.+?)(?:的日程|会议|约会)/);
    if (titleMatch) {
      schedule.title = titleMatch[1];
    } else {
      // 如果没有明确标题，使用时间作为标题
      schedule.title = `日程 - ${schedule.startTime}`;
    }

    return schedule.title ? schedule : null;
  }

  // 从文本解析任务信息
  parseTaskFromText(text) {
    const task = {
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
      category: 'work',
      estimatedTime: 60
    };

    // 提取任务标题
    const titleMatch = text.match(/(?:创建|添加|安排)(.+?)(?:任务|工作|项目)/);
    if (titleMatch) {
      task.title = titleMatch[1];
    }

    // 提取截止时间
    const deadlineInfo = this.extractTimeInfo(text);
    if (deadlineInfo) {
      task.deadline = deadlineInfo.startTime;
    }

    // 提取优先级
    if (text.includes('紧急') || text.includes('重要')) {
      task.priority = 'high';
    } else if (text.includes('一般') || text.includes('普通')) {
      task.priority = 'low';
    }

    return task.title ? task : null;
  }

  // 从文本解析提醒信息
  parseReminderFromText(text) {
    const reminder = {
      title: '',
      time: '',
      content: '',
      repeat: 'none'
    };

    // 提取提醒时间
    const timeInfo = this.extractTimeInfo(text);
    if (timeInfo) {
      reminder.time = timeInfo.startTime;
    }

    // 提取提醒内容
    const contentMatch = text.match(/提醒(.+?)(?:在|到|时间)/);
    if (contentMatch) {
      reminder.content = contentMatch[1];
    }

    return reminder.time ? reminder : null;
  }

  // 提取时间信息
  extractTimeInfo(text) {
    const timeInfo = {
      startTime: '',
      endTime: ''
    };

    // 解析具体时间
    const timeMatch = text.match(/(\d{1,2})[点时:：](\d{0,2})/);
    if (timeMatch) {
      const hour = timeMatch[1];
      const minute = timeMatch[2] || '00';
      timeInfo.startTime = `${hour}:${minute}`;
    }

    // 解析日期
    const today = new Date();
    if (text.includes('明天')) {
      today.setDate(today.getDate() + 1);
    } else if (text.includes('后天')) {
      today.setDate(today.getDate() + 2);
    } else if (text.includes('下周')) {
      today.setDate(today.getDate() + 7);
    }

    const dateStr = today.toISOString().split('T')[0];
    timeInfo.startTime = `${dateStr} ${timeInfo.startTime}`;

    return timeInfo.startTime ? timeInfo : null;
  }

  // 更新配置
  updateConfig(newConfig) {
    this.config = Object.assign({}, this.config, newConfig);
    wx.setStorageSync('aiConfig', this.config);
  }

  // 获取支持的模型列表
  getSupportedModels() {
    const models = [];
    for (const [key, provider] of Object.entries(this.config.providers)) {
      models.push({
        key: key,
        name: provider.name,
        model: provider.model
      });
    }
    return models;
  }

  // 测试连接
  async testConnection() {
    try {
      const response = await this.callAIAPI('你好');
      return {
        success: true,
        message: '连接成功',
        response: response
      };
    } catch (error) {
      return {
        success: false,
        message: '连接失败',
        error: error.message
      };
    }
  }
}

// 创建并导出实例
const aiService = new AIService();
module.exports = aiService; 
