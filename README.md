# AI生活助手小程序

一个基于微信小程序的智能生活管理助手，集成了AI对话、日程管理、任务管理等功能。

## 功能特性

### 🤖 AI智能对话
- 支持文字和语音输入
- 智能意图识别（日程、任务、提醒等）
- 自然语言处理日程和任务创建
- 多轮对话上下文管理

### 📅 智能日程管理
- 日历视图（月视图/日视图）
- 自然语言添加日程
- 日程冲突检测
- 智能提醒功能
- 日程分类和颜色标记

### 📝 任务管理系统
- 任务的增删改查
- 优先级智能排序
- 任务分类和标签
- 进度追踪和可视化
- 任务完成统计

### 📊 数据分析
- 任务完成趋势分析
- 时间利用统计
- 优先级分布分析
- AI智能洞察和建议

### ⚙️ 个性化设置
- 深色/浅色主题切换
- AI服务配置
- 数据备份和恢复
- 隐私设置

## 项目结构

```
AI生活助手/
├── app.js                 # 小程序入口文件
├── app.json              # 全局配置文件
├── app.wxss              # 全局样式文件
├── project.config.json   # 项目配置文件
├── sitemap.json          # 站点地图配置
├── pages/                # 页面目录
│   ├── home/             # 首页-AI对话界面
│   ├── schedule/         # 日程管理页面
│   ├── tasks/            # 任务管理页面
│   ├── analysis/         # 数据分析页面
│   └── profile/          # 个人中心页面
├── components/           # 组件目录
│   ├── chat-bubble/      # 聊天气泡组件
│   ├── task-item/        # 任务卡片组件
│   └── calendar-view/    # 日历组件
├── utils/                # 工具目录
│   ├── api.js            # API调用封装
│   ├── storage.js        # 本地存储封装
│   ├── ai-service.js     # AI服务封装
│   └── date-utils.js     # 日期处理工具
└── images/               # 静态资源目录
```

## 技术栈

- **前端框架**: 微信小程序原生开发
- **AI服务**: 支持OpenAI、文心一言、通义千问等
- **数据存储**: 微信小程序本地存储
- **UI设计**: 现代化设计风格，支持深色模式

## 开发环境

1. 下载并安装[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 克隆项目到本地
3. 在微信开发者工具中导入项目
4. 配置AppID（可在微信公众平台申请）

## 配置说明

### AI服务配置

在 `utils/ai-service.js` 中配置AI服务参数：

```javascript
const AI_CONFIG = {
  providers: {
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      maxTokens: 2000
    }
  },
  defaultProvider: 'openai',
  apiKey: 'your-api-key-here'
};
```

### 项目配置

在 `project.config.json` 中修改项目配置：

```json
{
  "appid": "your-app-id-here",
  "projectname": "AI生活助手"
}
```

## 使用说明

### 1. AI对话功能
- 在首页输入文字或使用语音输入
- AI会自动识别意图并生成相应回复
- 支持日程、任务、提醒等智能操作

### 2. 日程管理
- 点击"日程"标签进入日程管理
- 支持月视图和日视图切换
- 点击"+"按钮添加新日程
- 支持自然语言输入（如"明天下午3点开会"）

### 3. 任务管理
- 点击"任务"标签进入任务管理
- 支持任务创建、编辑、删除
- 可设置优先级、截止时间、标签等
- 支持任务状态跟踪

### 4. 数据分析
- 点击"分析"标签查看数据统计
- 包含任务完成趋势、时间分析等
- AI会提供个性化建议

## 开发计划

- [ ] 云端数据同步
- [ ] 团队协作功能
- [ ] 更多AI模型支持
- [ ] 语音识别优化
- [ ] 离线功能支持

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: your-email@example.com

## 更新日志

### v1.0.0 (2025-01-XX)
- 初始版本发布
- 基础AI对话功能
- 日程和任务管理
- 数据分析功能
- 个性化设置 