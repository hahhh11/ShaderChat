import React, { useState } from 'react';
import { ModelConfig } from '../types';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddModel: (model: ModelConfig) => void;
}

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

export default AddModelModal;