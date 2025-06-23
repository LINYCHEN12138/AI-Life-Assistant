const aiService = require('../../utils/ai-service.js');

Page({
  data: {
    config: {},
    providerRange: [],
    providerIndex: 0,
  },
  onLoad() {
    const config = aiService.loadConfig();
    const providers = aiService.getSupportedModels();
    const providerIndex = providers.findIndex(p => p.key === config.defaultProvider);
    this.setData({
      config: config,
      providerRange: providers.map(p => p.name),
      providerIndex: providerIndex > -1 ? providerIndex : 0
    });
  },
  onProviderChange(e) {
    const newIndex = e.detail.value;
    const providers = aiService.getSupportedModels();
    const newProviderId = providers[newIndex].key;
    this.setData({
      providerIndex: newIndex,
      'config.defaultProvider': newProviderId
    });
  },
  onApiKeyInput(e) {
    this.setData({'config.apiKey': e.detail.value});
  },
  saveConfig() {
    aiService.updateConfig(this.data.config);
    wx.showToast({ title: '保存成功' });
  }
}); 