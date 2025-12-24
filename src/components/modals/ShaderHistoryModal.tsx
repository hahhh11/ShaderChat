import React, { useState } from 'react';

export interface ShaderHistory {
  id: string;
  name: string;
  vertexShader: string;
  fragmentShader: string;
  uniforms: any;
  customUniforms: any;
  timestamp: number;
  thumbnail?: string;
}

export interface ShaderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ShaderHistory[];
  onLoadHistory: (history: ShaderHistory) => void;
  onDeleteHistory: (id: string) => void;
  onRenameHistory: (id: string, newName: string) => void;
  onSaveCurrent: (name: string) => void;
}



const ShaderHistoryModal: React.FC<ShaderHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadHistory,
  onDeleteHistory,
  onRenameHistory,
  onSaveCurrent
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [saveName, setSaveName] = useState('');

  if (!isOpen) return null;

  const handleRename = (id: string) => {
    if (editingName.trim()) {
      onRenameHistory(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleSave = () => {
    if (saveName.trim()) {
      onSaveCurrent(saveName.trim());
      setSaveName('');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="shader-history-overlay" onClick={onClose}>
      <div className="shader-history-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shader-history-header">
          <h2>Shader 历史记录</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="save-current-section">
          <h3>保存当前 Shader</h3>
          <div className="save-input-group">
            <input
              type="text"
              placeholder="输入名称..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
            <button 
              className="save-btn"
              onClick={handleSave}
              disabled={!saveName.trim()}
            >
              保存
            </button>
          </div>
        </div>

        <div className="history-list-section">
          <h3>历史记录 ({history.length})</h3>
          {history.length === 0 ? (
            <div className="empty-state">
              <p>暂无历史记录</p>
              <p className="hint">保存您的第一个 shader 吧！</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-content">
                    {editingId === item.id ? (
                      <input
                        type="text"
                        className="rename-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={() => handleRename(item.id)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRename(item.id)}
                        autoFocus
                      />
                    ) : (
                      <>
                        <div className="history-item-header">
                          <h4 className="history-name">{item.name}</h4>
                          <div className="history-actions">
                            <button
                              className="action-btn rename-btn"
                              onClick={() => {
                                setEditingId(item.id);
                                setEditingName(item.name);
                              }}
                              title="重命名"
                            >
                              ✎
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => {
                                if (window.confirm(`确定要删除 "${item.name}" 吗？`)) {
                                  onDeleteHistory(item.id);
                                }
                              }}
                              title="删除"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                        <p className="history-time">{formatDate(item.timestamp)}</p>
                        <div className="history-preview">
                          <div className="preview-info">
                            <span className="preview-label">顶点着色器:</span>
                            <span className="preview-length">{item.vertexShader.length} 字符</span>
                          </div>
                          <div className="preview-info">
                            <span className="preview-label">片段着色器:</span>
                            <span className="preview-length">{item.fragmentShader.length} 字符</span>
                          </div>
                          <div className="preview-info">
                            <span className="preview-label">Uniforms:</span>
                            <span className="preview-length">{Object.keys(item.uniforms).length} 个</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    className="load-btn"
                    onClick={() => onLoadHistory(item)}
                  >
                    加载
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShaderHistoryModal;
