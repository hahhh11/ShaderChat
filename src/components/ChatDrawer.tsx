import React, { useState, useRef, useEffect } from 'react';

interface Message {
  text: string;
  sender: 'assistant' | 'user';
}

interface ChatDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  inputMessage: string;
  setInputMessage: (value: string) => void;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 设置模态框组件
const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
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
          <div className="setting-item">
            <label>自动回复</label>
            <input type="checkbox" defaultChecked />
            <span>启用自动回复功能</span>
          </div>
          <div className="setting-item">
            <label>回复速度</label>
            <select defaultValue="normal">
              <option value="fast">快速</option>
              <option value="normal">正常</option>
              <option value="slow">慢速</option>
            </select>
          </div>
          <div className="setting-item">
            <label>消息通知</label>
            <input type="checkbox" defaultChecked />
            <span>显示消息通知</span>
          </div>
          <div className="setting-item">
            <label>输入提示</label>
            <input type="checkbox" defaultChecked />
            <span>显示输入提示</span>
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
    </div>
  );
};

const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onToggle,
  messages,
  onSendMessage,
  inputMessage,
  setInputMessage
}) => {
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div id="chat-drawer" className={isOpen ? 'open' : ''}>
      <button className="chat-toggle-btn" onClick={onToggle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>ShaderChat</span>
      </button>
      
      <div id="chat-container">
        <div id="chat-messages">
          <div className="chat-messages-container">
            {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.sender}`}>
                {message.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-message assistant typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div id="chat-input-area">
          <textarea
            id="chat-input"
            placeholder="输入您的问题或指令..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button 
            id="send-btn" 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
          >
            发送
          </button>
        </div>
      </div>
      
      {/* 设置按钮 - 放在聊天抽屉内部，跟随聊天框移动 */}
      <button className="chat-settings-btn" onClick={() => setIsSettingsOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m15.5-4.5l-4.5 4.5m-5-5l-4.5 4.5m4.5 5.5l-4.5 4.5m5-5l-4.5 4.5"></path>
        </svg>
      </button>
      
      {/* 设置模态框 */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default ChatDrawer;