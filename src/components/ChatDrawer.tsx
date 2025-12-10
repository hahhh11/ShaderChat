import React, { useState, useRef, useEffect } from 'react';
import { Message, ModelConfig } from './types';
import SettingsModal from './modals/SettingsModal';
import EditModelModal from './modals/EditModelModal';

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
  onTestModel: (model: ModelConfig) => Promise<boolean>;
  onApplyVertexShader?: (code: string) => void;
  onApplyFragmentShader?: (code: string) => void;
}

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
  setSelectedModel,
  onTestModel,
  onApplyVertexShader,
  onApplyFragmentShader
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{[key: number]: boolean}>({});
  const [editingModel, setEditingModel] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 防止初始渲染时的闪烁
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // 通知状态
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // 显示通知函数
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 添加模型处理函数
  const handleAddModel = (model: any) => {
    const newModels = [...models, model];
    setModels(newModels);
    // 自动选择新添加的模型
    setSelectedModel(model.name);
    showNotification(`模型 "${model.name}" 添加成功`, 'success');
  };

  const handleUpdateModel = (updatedModel: any) => {
    setModels(models.map(model => 
      model.id === updatedModel.id ? updatedModel : model
    ));
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

  const handleEditModel = (model: any) => {
    setEditingModel(model);
    setIsEditModalOpen(true);
  };

  

  const handleTestModel = async (model: ModelConfig): Promise<boolean> => {
    try {
      // 调用父组件传递的测试函数
      return await onTestModel(model);
    } catch (error) {
      console.error('测试模型失败:', error);
      showNotification(`测试模型失败: ${error instanceof Error ? error.message : '未知错误'}`, 'error');
      return false;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 渲染消息内容，支持Markdown格式
  const renderMessageContent = (text: string) => {
    // 检查是否是AI响应格式（支持多种格式变体）
    const hasFormatMarkers = text.includes('=== FORMAT START ===') && text.includes('=== FORMAT END ===');
    const hasMarkdownHeaders = text.includes('**修改说明：**') || text.includes('**Vertex Shader代码：**');
    
    if (hasFormatMarkers || hasMarkdownHeaders) {
      // 提取各个部分 - 支持多种格式变体
      const descriptionMatch = text.match(/\*\*修改说明：\*\*\s*\n?([^*]*?)(?=\*\*Vertex|$)/s) || 
                               text.match(/返回了\*\*修改说明：\*\*\s*\n?([^*]*?)(?=\*\*Vertex|$)/s);
      const vertexMatch = text.match(/\*\*Vertex Shader代码：\*\*\s*\n?```glsl\s*\n?([\s\S]*?)\s*\n?```/s) ||
                         text.match(/\*\*Vertex Shader代码：\*\*\s*\n?([\s\S]*?)(?=\*\*Fragment|$)/s);
      const fragmentMatch = text.match(/\*\*Fragment Shader代码：\*\*\s*\n?```glsl\s*\n?([\s\S]*?)\s*\n?```/s) ||
                           text.match(/\*\*Fragment Shader代码：\*\*\s*\n?([\s\S]*?)(?=\*\*主要|$)/s) ||
                           text.match(/```glsl\s*\n?([\s\S]*?)\s*\n?```/s);
      const changesMatch = text.match(/\*\*主要变更：\*\*\s*\n?([\s\S]*?)(?=\*\*Vertex|$)/s) ||
                          text.match(/\*\*主要变更：\*\*\s*\n?([\s\S]*?)$/s);

      return (
        <div className="ai-response-formatted">
          {descriptionMatch && (
            <div className="response-section">
              <h4>📝 修改说明</h4>
              <p style={{whiteSpace: 'pre-wrap'}}>{descriptionMatch[1].trim()}</p>
            </div>
          )}
          
          {vertexMatch && vertexMatch[1].trim() !== '无修改' && (
            <div className="response-section">
              <div className="code-section-header">
                <h4>🔺 Vertex Shader</h4>
                <button 
                  className="chat-message-apply-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onApplyVertexShader) {
                      onApplyVertexShader(vertexMatch[1].trim());
                      // 临时改变按钮文本
                      const btn = e.target as HTMLButtonElement;
                      const originalText = btn.innerHTML;
                      btn.innerHTML = '✓';
                      btn.style.color = '#4CAF50';
                      setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.color = '';
                      }, 2000);
                    }
                  }}
                  title="应用Vertex Shader代码到编辑器"
                >
                  应用
                </button>
              </div>
              <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}><code className="glsl-code">{vertexMatch[1].trim()}</code></pre>
            </div>
          )}
          
          {fragmentMatch && fragmentMatch[1].trim() !== '无修改' && (
            <div className="response-section">
              <div className="code-section-header">
                <h4>🔸 Fragment Shader</h4>
                <button 
                  className="chat-message-apply-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onApplyFragmentShader) {
                      onApplyFragmentShader(fragmentMatch[1].trim());
                      // 临时改变按钮文本
                      const btn = e.target as HTMLButtonElement;
                      const originalText = btn.innerHTML;
                      btn.innerHTML = '✓';
                      btn.style.color = '#4CAF50';
                      setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.color = '';
                      }, 2000);
                    }
                  }}
                  title="应用Fragment Shader代码到编辑器"
                >
                  应用
                </button>
              </div>
              <pre style={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}><code className="glsl-code">{fragmentMatch[1].trim()}</code></pre>
            </div>
          )}
          
          {changesMatch && (
            <div className="response-section">
              <h4>🔄 主要变更</h4>
              <div className="changes-list">
                {changesMatch[1].trim().split('\n').map((line, i) => {
                  const cleanLine = line.replace(/^-\s*/, '').replace(/^•\s*/, '').trim();
                  return cleanLine ? <div key={i} className="change-item">• {cleanLine}</div> : null;
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // 普通消息，直接显示
    return <>{text}</>;
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setIsTyping(true);
      onSendMessage(inputMessage);
      setInputMessage('');
      
      // 清空输入框内容
      const chatInput = document.getElementById('chat-input');
      if (chatInput) {
        chatInput.textContent = '';
      }
      
      // 模拟AI回复
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
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
              onClick={() => showNotification(null as any)}
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
      
      <div id="chat-drawer" className={isMounted && isOpen ? 'open' : ''} style={!isMounted ? { display: 'none' } : {}}>
      
      <div id="chat-container">
        <div id="chat-messages">
          <div className="chat-messages-container">
            {messages.map((message, index) => {
              // 检查是否是AI响应格式
              const isAIResponse = message.text.includes('=== FORMAT START ===') && message.text.includes('=== FORMAT END ===');
              
              return (
                <div key={index} className={`chat-message-container ${message.sender}`} onMouseEnter={() => handleMouseEnter(index)}>
                  <div className={`chat-message ${message.sender} ${isAIResponse ? 'ai-response-message' : ''}`}>
                    {renderMessageContent(message.text)}
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
              );
            })}
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
                  
                  const walker = document.createTreeWalker(
                    e.currentTarget,
                    NodeFilter.SHOW_TEXT,
                    null
                  );
                  
                  let node;
                  while (node = walker.nextNode()) {
                    if (node === container) {
                      currentPos += startOffset;
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
        models={models}
        onAddModel={handleAddModel}
        onEditModel={handleEditModel}
        onDeleteModel={handleDeleteModel}
        onTestModel={handleTestModel}
      />
      {/* 编辑模型模态框 */}
      <EditModelModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        model={editingModel}
        onUpdateModel={handleUpdateModel}
      />


    </>
  );
};

export default ChatDrawer;