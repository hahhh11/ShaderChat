import React, { useState, useRef, useEffect } from 'react';
import { Message, ModelConfig } from './types';

interface ChatDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  models: ModelConfig[];
  setModels: (models: ModelConfig[]) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  onLanguageChange: (language: string) => void;
  models: ModelConfig[];
  onAddModel: (model: ModelConfig) => void;
  onEditModel: (model: ModelConfig) => void;
  onDeleteModel: (modelId: string) => void;
}

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddModel: (model: ModelConfig) => void;
}

// 添加模型模态框组件
const AddModelModal: React.FC<AddModelModalProps> = ({ isOpen, onClose, onAddModel }) => {
  const [newModel, setNewModel] = useState({
    name: '',
    address: '',
    model: '',
    apiKey: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newModel.name && newModel.address && newModel.model && newModel.apiKey) {
      const modelConfig: ModelConfig = {
        id: Date.now().toString(),
        ...newModel
      };
      onAddModel(modelConfig);
      setNewModel({ name: '', address: '', model: '', apiKey: '' });
      onClose();
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h3>添加新模型</h3>
          <button className="settings-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="settings-modal-content add-model-content">
            <div className="setting-item add-model-item">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z"></path>
                  <path d="M2 17L12 22L22 17"></path>
                  <path d="M2 12L12 17L22 12"></path>
                </svg>
                模型名称
              </label>
              <input 
                type="text" 
                value={newModel.name}
                onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                placeholder="例如: GPT-4"
                required
                className="add-model-input"
              />
            </div>
            <div className="setting-item add-model-item">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <path d="M7.5 16.5L3 19"></path>
                  <path d="M21 8.5L16.5 11"></path>
                  <path d="M3 8.5L7.5 11"></path>
                  <path d="M21 16.5L16.5 14"></path>
                </svg>
                API地址
              </label>
              <input 
                type="text" 
                value={newModel.address}
                onChange={(e) => setNewModel({...newModel, address: e.target.value})}
                placeholder="https://api.openai.com/v1"
                required
                className="add-model-input"
              />
            </div>
            <div className="setting-item add-model-item">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
                模型
              </label>
              <input 
                type="text" 
                value={newModel.model}
                onChange={(e) => setNewModel({...newModel, model: e.target.value})}
                placeholder="gpt-4"
                required
                className="add-model-input"
              />
            </div>
            <div className="setting-item add-model-item">
              <label>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
                API密钥
              </label>
              <input 
                type="password" 
                value={newModel.apiKey}
                onChange={(e) => setNewModel({...newModel, apiKey: e.target.value})}
                placeholder="输入您的API密钥"
                required
                className="add-model-input"
              />
            </div>
          </div>
          <div className="settings-modal-footer add-model-footer">
            <button type="submit" className="settings-modal-btn settings-modal-btn-primary add-model-submit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              添加模型
            </button>
            <button type="button" className="settings-modal-btn settings-modal-btn-secondary" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 编辑模型模态框组件
const EditModelModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUpdateModel: (model: ModelConfig) => void;
  model: ModelConfig | null;
}> = ({ isOpen, onClose, onUpdateModel, model }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [modelName, setModelName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (model) {
      setName(model.name);
      setAddress(model.address);
      setModelName(model.model);
      setApiKey(model.apiKey);
    }
  }, [model]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && address && modelName && apiKey) {
      onUpdateModel({
        ...model!,
        name,
        address,
        model: modelName,
        apiKey
      });
    }
  };

  if (!isOpen || !model) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h3>编辑模型配置</h3>
          <button className="settings-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="settings-modal-content add-model-content">
          <div className="setting-item">
            <label>模型名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入模型显示名称"
              required
            />
          </div>
          <div className="setting-item">
            <label>模型地址</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="https://api.openai.com/v1"
              required
            />
          </div>
          <div className="setting-item">
            <label>模型名称</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="gpt-3.5-turbo"
              required
            />
          </div>
          <div className="setting-item">
            <label>API密钥</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="输入API密钥"
                required
                style={{ flex: 1, paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  padding: '4px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={showApiKey ? "隐藏API密钥" : "显示API密钥"}
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          </div>
          <div className="settings-modal-footer">
            <button type="submit" className="settings-modal-btn settings-modal-btn-primary">
              保存修改
            </button>
            <button type="button" className="settings-modal-btn settings-modal-btn-secondary" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 设置模态框组件
const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  language, 
  onLanguageChange,
  models,
  onAddModel,
  onEditModel,
  onDeleteModel
}) => {
  const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, model: ModelConfig | null}>({show: false, model: null});

  const handleDeleteConfirm = () => {
    if (deleteConfirm.model) {
      onDeleteModel(deleteConfirm.model.id);
      setDeleteConfirm({show: false, model: null});
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({show: false, model: null});
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-modal-header">
          <h3>对话设置</h3>
          <button className="settings-modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="settings-modal-content">
          {/* <div className="setting-item">
            <label>语言设置</label>
            <select value={language} onChange={(e) => onLanguageChange(e.target.value)}>
              <option value="zh-CN">简体中文</option>
              <option value="en">English</option>
            </select>
          </div> */}
          <div className="setting-item">
            <label>已配置模型列表</label>
            <div className="model-list">
              {models.length === 0 ? (
                <div className="model-list-empty">暂无配置模型</div>
              ) : (
                models.map((model) => (
                  <div key={model.id} className="model-list-item">
                    <div className="model-info">
                      <div className="model-name">{model.name}</div>
                      <div className="model-details">{model.model} - {model.address}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="model-edit-btn" 
                        onClick={() => onEditModel(model)}
                        title="编辑模型配置"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="model-delete-btn" 
                        onClick={() => setDeleteConfirm({show: true, model})}
                        title="删除模型"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              className="add-model-btn" 
              onClick={() => setIsAddModelModalOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              添加新模型
            </button>
          </div>
        </div>
        <div className="settings-modal-footer">
          <button className="settings-modal-btn settings-modal-btn-primary" onClick={onClose}>
            确定
          </button>
          <button className="settings-modal-btn settings-modal-btn-secondary" onClick={onClose}>
            取消
          </button>
        </div>
      </div>
      <AddModelModal 
        isOpen={isAddModelModalOpen}
        onClose={() => setIsAddModelModalOpen(false)}
        onAddModel={onAddModel}
      />
      
      {/* 删除确认对话框 */}
      {deleteConfirm.show && deleteConfirm.model && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-header">
              <h3>确认删除</h3>
              <button className="settings-modal-close" onClick={handleDeleteCancel}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            </div>
            <div className="delete-confirm-content">
              <p>确定要删除模型 <strong>{deleteConfirm.model.name}</strong> 吗？</p>
              <p className="delete-confirm-warning">此操作无法撤销。</p>
            </div>
            <div className="delete-confirm-footer">
              <button className="settings-modal-btn settings-modal-btn-secondary" onClick={handleDeleteCancel}>
                取消
              </button>
              <button className="settings-modal-btn settings-modal-btn-primary delete-confirm-btn" onClick={handleDeleteConfirm}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  inputMessage,
  setInputMessage,
  models,
  setModels,
  selectedModel,
  setSelectedModel
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{[key: number]: boolean}>({});
  const [language, setLanguage] = useState('zh-CN');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // localStorage 键名常量
  const STORAGE_KEY = 'shaderchat_models_config';
  
  // 简单的加密/解密函数
  const ENCRYPTION_KEY = 'shaderchat_secure_key_2024';
  
  const encrypt = (text: string): string => {
    try {
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
      }
      return btoa(result); // Base64编码
    } catch (error) {
      console.error('加密失败:', error);
      return text;
    }
  };
  
  const decrypt = (encryptedText: string): string => {
    try {
      const decoded = atob(encryptedText); // Base64解码
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
      }
      return result;
    } catch (error) {
      console.error('解密失败:', error);
      return encryptedText;
    }
  };

  // 从localStorage加载模型配置
  const loadModelsFromStorage = (): ModelConfig[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedModels = JSON.parse(stored);
        // 验证数据格式
        if (Array.isArray(parsedModels)) {
          return parsedModels.filter(model => {
            if (!model || 
                typeof model.id !== 'string' ||
                typeof model.name !== 'string' ||
                typeof model.address !== 'string' ||
                typeof model.model !== 'string' ||
                typeof model.apiKey !== 'string') {
              return false;
            }
            
            // 解密API密钥
            try {
              model.apiKey = decrypt(model.apiKey);
            } catch (error) {
              console.error('解密API密钥失败:', error);
              model.apiKey = '';
            }
            
            return true;
          });
        }
      }
    } catch (error) {
      console.error('从localStorage加载模型配置失败:', error);
    }
    return [];
  };

  // 保存模型配置到localStorage
  const saveModelsToStorage = (models: ModelConfig[]) => {
    try {
      // 创建要保存的模型副本，对API密钥进行加密
      const modelsToSave = models.map(model => ({
        ...model,
        apiKey: encrypt(model.apiKey)
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(modelsToSave));
    } catch (error) {
      console.error('保存模型配置到localStorage失败:', error);
    }
  };

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, model: ModelConfig | null}>({show: false, model: null});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleAddModel = (model: ModelConfig) => {
    const newModels = [...models, model];
    setModels(newModels);
    // 自动选择新添加的模型
    setSelectedModel(model.name);
    showNotification(`模型 "${model.name}" 添加成功`, 'success');
  };

  const handleEditModel = (model: ModelConfig) => {
    setEditingModel(model);
    setIsEditModalOpen(true);
  };

  const handleUpdateModel = (updatedModel: ModelConfig) => {
    setModels(models.map(model => 
      model.id === updatedModel.id ? updatedModel : model
    ));
    setIsEditModalOpen(false);
    setEditingModel(null);
    showNotification(`模型 "${updatedModel.name}" 更新成功`, 'success');
  };

  const handleDeleteModel = (modelId: string) => {
    const modelToDelete = models.find(model => model.id === modelId);
    const remainingModels = models.filter(model => model.id !== modelId);
    setModels(remainingModels);
    
    // 如果删除的是当前选中的模型，自动选择第一个剩余模型
    if (modelToDelete && selectedModel === modelToDelete.name && remainingModels.length > 0) {
      setSelectedModel(remainingModels[0].name);
    } else if (remainingModels.length === 0) {
      // 如果没有剩余模型，清空选择
      setSelectedModel('');
    }
    
    if (modelToDelete) {
      showNotification(`模型 "${modelToDelete.name}" 删除成功`, 'success');
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.model) {
      handleDeleteModel(deleteConfirm.model.id);
      setDeleteConfirm({show: false, model: null});
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({show: false, model: null});
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 组件加载时从localStorage读取模型配置
  useEffect(() => {
    const storedModels = loadModelsFromStorage();
    if (storedModels.length > 0) {
      setModels(storedModels);
      // 自动选择第一个模型
      if (!selectedModel) {
        setSelectedModel(storedModels[0].name);
      }
    }
  }, []);

  // 模型配置变化时保存到localStorage
  useEffect(() => {
    saveModelsToStorage(models);
  }, [models]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setIsTyping(true);
      onSendMessage(inputMessage);
      setInputMessage('');
      
      // 模拟AI回复
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    }
  };

  // 检查输入是否包含引用标记
  const hasShaderReferences = inputMessage.includes('#vs') || inputMessage.includes('#fs');

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessageText = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      // 设置复制成功状态
      setCopiedStates(prev => ({...prev, [index]: true}));
      
      // 3秒后恢复原始状态
      setTimeout(() => {
        setCopiedStates(prev => ({...prev, [index]: false}));
      }, 3000);
      
      console.log('消息已复制到剪贴板');
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };

  const handleMouseEnter = (index: number) => {
    // 鼠标悬停时重置复制状态
    setCopiedStates(prev => ({...prev, [index]: false}));
  };

  return (
    <>
      {/* 通知组件 */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close" 
              onClick={() => setNotification(null)}
              title="关闭通知"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* 独立的切换按钮 - 始终固定在右下角 */}
      <button className={`chat-toggle-btn ${isOpen ? 'move-up' : ''}`} onClick={onToggle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>ShaderChat</span>
      </button>
      
      <div id="chat-drawer" className={isOpen ? 'open' : ''}>
      
      <div id="chat-container">
        <div id="chat-messages">
          <div className="chat-messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`chat-message-container ${message.sender}`} onMouseEnter={() => handleMouseEnter(index)}>
                <div className={`chat-message ${message.sender}`}>
                  {message.text}
                </div>
                <div className="chat-message-actions">
                  <button className={`chat-message-copy-btn ${copiedStates[index] ? 'copied' : ''}`} onClick={(e) => {
                    e.stopPropagation();
                    copyMessageText(message.text, index);
                  }} title={copiedStates[index] ? '已复制!' : '复制消息'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {copiedStates[index] ? (
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"></path>
                      ) : (
                        <>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-message-container assistant">
                <div className="chat-message assistant typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
        
        <div id="chat-input-area">
          {/* 模型选择选项卡 */}
          <div className="model-selector">
            <div className="model-selector-info">
              <span className="model-status-indicator"></span>
            </div>
            <div className="model-selector-header">
              <span className="model-selector-label">Chat with </span>
              {models.length > 0 ? (
                <select 
                  className="model-selector-select" 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              ) : (
                <button 
                  className="model-selector-config-btn" 
                  onClick={() => setIsSettingsOpen(true)}
                >
                  + 配置模型
                </button>
              )}
            </div>
            <button className="model-selector-settings-btn" onClick={() => setIsSettingsOpen(true)} title="设置">
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6750" width="20" height="20"><path d="M825.664646 407.014141c-27.280808 0-51.846465-14.092929-65.551515-37.882828-13.705051-23.660606-13.705051-51.975758 0-75.636364 11.377778-19.911111 4.654545-45.252525-15.256565-56.759595l-111.19192-64.387879c-19.911111-11.507071-45.252525-4.654545-56.759595 15.256565-13.705051 23.660606-38.141414 37.882828-65.551516 37.882829-27.280808 0-51.846465-14.092929-65.551515-37.882829-11.507071-19.911111-36.977778-26.634343-56.759596-15.127272l-111.450505 64.258586c-19.911111 11.377778-26.634343 36.977778-15.127273 56.759595 13.705051 23.660606 13.705051 51.975758 0 75.636364-13.705051 23.660606-38.270707 37.882828-65.551515 37.882828-22.884848 0-41.50303 18.618182-41.50303 41.503031v128.646464c0 22.884848 18.618182 41.50303 41.50303 41.503031 27.280808 0 51.846465 14.092929 65.551515 37.882828 13.705051 23.660606 13.705051 51.975758 0 75.636364-5.559596 9.567677-7.111111 20.816162-4.137373 31.547474 2.844444 10.731313 9.826263 19.652525 19.393939 25.212122l111.450505 64.258585c6.464646 3.749495 13.575758 5.559596 20.686869 5.559596 14.351515 0 28.315152-7.369697 36.072727-20.686868 13.705051-23.789899 38.270707-37.882828 65.551515-37.882829s51.846465 14.092929 65.551515 37.882829c11.507071 19.652525 36.977778 26.634343 56.759596 15.127272l111.19192-64.258585c19.911111-11.377778 26.634343-36.848485 15.256565-56.759596-13.705051-23.660606-13.705051-51.975758 0-75.636364 13.705051-23.660606 38.141414-37.882828 65.551515-37.882828 22.884848 0 41.50303-18.618182 41.503031-41.503031V448.646465c-0.129293-23.014141-18.747475-41.632323-41.632324-41.632324z m3.361617 170.149495c0 1.810101-1.551515 3.361616-3.361617 3.361617-41.115152 0-77.963636 21.333333-98.650505 57.018181-20.557576 35.555556-20.557576 78.222222 0 113.907071 0.775758 1.292929 0.129293 3.749495-1.292929 4.654546l-111.191919 64.258585c-1.551515 0.905051-3.749495 0.258586-4.654546-1.163636-20.557576-35.684848-57.406061-57.018182-98.521212-57.018182h-0.129293c-41.115152 0-77.963636 21.333333-98.650505 57.018182-0.905051 1.551515-2.973737 2.19798-4.654545 1.163636l-111.321212-64.258585-1.163637-4.525253c20.557576-35.684848 20.557576-78.222222 0-113.907071-20.557576-35.555556-57.406061-56.888889-98.650505-56.888889-1.810101 0-3.361616-1.551515-3.361616-3.361616V448.646465c0-1.810101 1.551515-3.361616 3.361616-3.361617 41.115152 0 77.963636-21.333333 98.650505-57.018181 20.557576-35.684848 20.557576-78.222222 0-113.907071-0.905051-1.551515-0.387879-3.620202 1.163637-4.654545l111.450505-64.258586c0.387879-0.258586 0.905051-0.258586 1.422222-0.258586 1.292929 0 2.585859 0.646465 3.232323 1.551515 20.557576 35.684848 57.406061 57.018182 98.650505 57.018182 41.115152 0 77.963636-21.333333 98.521212-56.888889 0.905051-1.680808 2.973737-2.327273 4.654546-1.292929l111.191919 64.258585c1.551515 0.905051 2.19798 2.973737 1.292929 4.654546-20.557576 35.684848-20.557576 78.222222 0 113.907071 20.557576 35.684848 57.406061 57.018182 98.650505 57.018181 1.810101 0 3.361616 1.551515 3.361617 3.361617v128.387878z m0 0" fill="#e6e6e6" p-id="6751"></path><path d="M511.224242 364.735354c-81.713131 0-148.29899 66.456566-148.298989 148.298989 0 81.713131 66.456566 148.169697 148.298989 148.169697 81.713131 0 148.169697-66.456566 148.169697-148.169697 0.129293-81.842424-66.456566-148.29899-148.169697-148.298989z m0 258.197979c-60.638384 0-110.028283-49.389899-110.028282-110.028282 0-60.638384 49.389899-110.028283 110.028282-110.028283 60.638384 0 110.028283 49.389899 110.028283 110.028283 0 60.638384-49.260606 110.028283-110.028283 110.028282z m0 0" fill="#e6e6e6" p-id="6752"></path></svg>
            </button>
          </div>

          <div className="chat-input-container">
            <div
              id="chat-input"
              className="chat-input-div"
              contentEditable
              data-placeholder="输入您的问题或指令... (使用 #vs 或 #fs 引用着色器代码)"
              onInput={(e) => {
                const text = e.currentTarget.textContent || '';
                setInputMessage(text);
                
                // 高亮显示 #vs 和 #fs
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const startOffset = range.startOffset;
                  const container = range.startContainer;
                  
                  // 保存当前光标位置
                  let currentPos = 0;
                  let found = false;
                  
                  const walker = document.createTreeWalker(
                    e.currentTarget,
                    NodeFilter.SHOW_TEXT,
                    null
                  );
                  
                  let node;
                  while (node = walker.nextNode()) {
                    if (node === container) {
                      currentPos += startOffset;
                      found = true;
                      break;
                    }
                    currentPos += node.textContent?.length || 0;
                  }
                  
                  // 重新设置内容并高亮
                  const html = text
                    .replace(/#vs/g, '<span class="shader-ref">#vs</span>')
                    .replace(/#fs/g, '<span class="shader-ref">#fs</span>');
                  
                  if (html !== e.currentTarget.innerHTML) {
                    e.currentTarget.innerHTML = html;
                    
                    // 恢复光标位置
                    const newRange = document.createRange();
                    const newWalker = document.createTreeWalker(
                      e.currentTarget,
                      NodeFilter.SHOW_TEXT,
                      null
                    );
                    
                    let newNode;
                    let pos = 0;
                    while (newNode = newWalker.nextNode()) {
                      const nodeLength = newNode.textContent?.length || 0;
                      if (pos + nodeLength >= currentPos) {
                        newRange.setStart(newNode, Math.min(currentPos - pos, nodeLength));
                        newRange.collapse(true);
                        break;
                      }
                      pos += nodeLength;
                    }
                    
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                  }
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              suppressContentEditableWarning={true}
            />
          </div>
          <button 
            id="send-btn" 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            发送
          </button>
        </div>
      </div>
    </div>
    {/* 设置模态框 */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        language={language}
        onLanguageChange={setLanguage}
        models={models}
        onAddModel={handleAddModel}
        onEditModel={handleEditModel}
        onDeleteModel={handleDeleteModel}
      />
      {/* 编辑模型模态框 */}
      <EditModelModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        model={editingModel}
        onUpdateModel={handleUpdateModel}
      />

      {/* 删除确认对话框 */}
      {deleteConfirm.show && deleteConfirm.model && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-header">
              <h3>确认删除</h3>
            </div>
            <div className="delete-confirm-content">
              <p>确定要删除模型 <strong>"{deleteConfirm.model.name}"</strong> 吗？</p>
              <p className="delete-warning">此操作无法撤销。</p>
            </div>
            <div className="delete-confirm-footer">
              <button className="settings-modal-btn settings-modal-btn-secondary" onClick={handleDeleteCancel}>
                取消
              </button>
              <button className="settings-modal-btn settings-modal-btn-primary delete-confirm-btn" onClick={handleDeleteConfirm}>
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatDrawer;