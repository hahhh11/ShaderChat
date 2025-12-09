import React, { useState } from 'react';
import { ModelConfig } from '../types';
import AddModelModal from './AddModelModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  onLanguageChange: (language: string) => void;
  models: ModelConfig[];
  onAddModel: (model: ModelConfig) => void;
  onEditModel: (model: ModelConfig) => void;
  onDeleteModel: (modelId: string) => void;
  onTestModel: (model: ModelConfig) => Promise<boolean>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  language, 
  onLanguageChange,
  models,
  onAddModel,
  onEditModel,
  onDeleteModel,
  onTestModel
}) => {
  const [isAddModelModalOpen, setIsAddModelModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, model: ModelConfig | null}>({show: false, model: null});
  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{modelId: string, success: boolean, message: string} | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteConfirm.model) {
      onDeleteModel(deleteConfirm.model.id);
      setDeleteConfirm({show: false, model: null});
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({show: false, model: null});
  };

  const handleTestModel = async (model: ModelConfig) => {
    setTestingModel(model.id);
    setTestResult(null);
    
    try {
      const success = await onTestModel(model);
      setTestResult({
        modelId: model.id,
        success,
        message: success ? '连接成功' : '连接失败'
      });
    } catch (error) {
      setTestResult({
        modelId: model.id,
        success: false,
        message: `测试失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setTestingModel(null);
    }
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
                        className="model-test-btn" 
                        onClick={() => handleTestModel(model)}
                        disabled={testingModel === model.id}
                        title="测试模型连接"
                        style={{
                          backgroundColor: testResult?.modelId === model.id 
                            ? (testResult.success ? '#4CAF50' : '#f44336')
                            : undefined
                        }}
                      >
                        {testingModel === model.id ? (
                          <span>测试中...</span>
                        ) : testResult?.modelId === model.id ? (
                          testResult.success ? '✓' : '✗'
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5,3 19,12 5,21"></polygon>
                          </svg>
                        )}
                      </button>
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

export default SettingsModal;