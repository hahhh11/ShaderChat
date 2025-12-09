import React, { useState, useEffect } from 'react';
import { ModelConfig } from '../types';

interface EditModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateModel: (model: ModelConfig) => void;
  model: ModelConfig | null;
}

const EditModelModal: React.FC<EditModelModalProps> = ({ isOpen, onClose, onUpdateModel, model }) => {
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

export default EditModelModal;