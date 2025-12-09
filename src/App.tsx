import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import {
  ShaderMaterial,
  CodeEditor,
  ChatDrawer,
  NavigationBar,
  Uniforms,
  Message,
  ModelConfig,
  defaultVertexShader,
  defaultFragmentShader,
  discoverUniformNames,
  setupUniforms
} from './components';
import './App.css';

// 自定义CSS属性类型声明
declare module 'react' {
  interface CSSProperties {
    '--progress'?: string;
  }
}


// 类型定义已在components中导出

// 组件已在components中导出

// 主应用组件
function App() {
  // 状态管理
  const [vertexShader, setVertexShader] = useState<string>(defaultVertexShader);
  const [fragmentShader, setFragmentShader] = useState<string>(defaultFragmentShader);
  const [uniforms, setUniforms] = useState<Uniforms>({
    iTime: { value: 0.0 },
    iResolution: { value: { x: 0, y: 0 } }
  });
  const [customUniforms, setCustomUniforms] = useState<Uniforms>({} as Uniforms);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: '欢迎使用 ShaderChat！您可以在这里输入问题或指令。', sender: 'assistant' }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isVsCollapsed, setIsVsCollapsed] = useState<boolean>(false);
  const [isFsCollapsed, setIsFsCollapsed] = useState<boolean>(false);
  
  // 可调整宽度状态
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(400);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // 控制面板显示状态
  const [showUniformControls, setShowUniformControls] = useState<boolean>(true);
  
  // 画布尺寸引用
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // 时间动画引用
  const animationRef = useRef<number>(0);
  
  // 模型配置状态
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  

  
  // 使用防抖机制处理Fragment Shader变化
  const handleFragmentShaderChange = useCallback((newFragmentShader: string) => {
    setFragmentShader(newFragmentShader);
    // 延迟uniforms更新，避免频繁重新渲染
    setTimeout(() => {
      const uniformNames = discoverUniformNames(newFragmentShader);
      setupUniforms(uniformNames, customUniforms, setCustomUniforms, uniforms, setUniforms);
    }, 100);
  }, [customUniforms, uniforms]);
  
  // 在CodeEditor组件中使用
  const handleFragmentShaderChangeWrapper = (newFragmentShader: string) => {
    handleFragmentShaderChange(newFragmentShader);
  };

  // 编译和链接Shaders - 优化依赖项，避免重复调用
  useEffect(() => {
    const uniformNames = discoverUniformNames(fragmentShader);
    setupUniforms(uniformNames, customUniforms, setCustomUniforms, uniforms, setUniforms);
  }, [fragmentShader]); // 移除customUniforms依赖，避免循环更新
  
  // 更新iResolution
  // useEffect(() => {
  //   const updateResolution = () => {
  //     if (canvasRef.current) {
  //       // const rect = canvasRef.current.getBoundingClientRect();
  //       // setUniforms(prev => ({
  //       //   ...prev,
  //       //   iResolution: { value: { x: rect.width, y: rect.height } }
  //       // }));
  //     }
  //   };
    
  //   updateResolution();
  //   window.addEventListener('resize', updateResolution);
    
  //   return () => window.removeEventListener('resize', updateResolution);
  // }, []);
  
  // 更新Uniform值 - 优化性能，避免重复设置相同值
  const updateUniformValue = useCallback((name: string, value: number): void => {
    setCustomUniforms(prev => {
      const currentValue = prev[name]?.value;
      // 只在值真正变化时更新
      if (currentValue === value) return prev;
      return {
        ...prev,
        [name]: { value }
      };
    });
    
    setUniforms(prev => {
      const currentValue = prev[name]?.value;
      // 只在值真正变化时更新
      if (currentValue === value) return prev;
      return {
        ...prev,
        [name]: { value }
      };
    });
  }, []);
  
  // 动画循环 - 移除iTime更新，由ShaderMaterial内部处理
  useEffect(() => {
    // 这里不再需要更新iTime，因为ShaderMaterial内部会处理
    // 保留这个effect以备将来需要其他动画更新
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // 发送消息到AI模型
  const sendMessage = async (message: string): Promise<void> => {
    if (!message.trim()) return;
    
    // 处理#vs和#fs引用
    let processedMessage = message;
    if (message.includes('#vs')) {
      processedMessage = processedMessage.replace(/#vs/g, `\n=== Vertex Shader代码 ===\n${vertexShader}\n=== Vertex Shader代码结束 ===\n`);
    }
    if (message.includes('#fs')) {
      processedMessage = processedMessage.replace(/#fs/g, `\n=== Fragment Shader代码 ===\n${fragmentShader}\n=== Fragment Shader代码结束 ===\n`);
    }
    
    // 添加用户消息（显示原始消息）
    const newMessages = [...messages, { text: message, sender: 'user' as const }];
    setMessages(newMessages);
    setInputMessage('');
    
    // 如果没有选中模型，显示错误消息
    if (!selectedModel) {
      const errorMessage: Message = {
        text: '请先配置并选择一个AI模型',
        sender: 'assistant' as const
      };
      setMessages([...newMessages, errorMessage]);
      return;
    }
    
    // 查找选中的模型配置
    const currentModel = models.find(model => model.name === selectedModel);
    if (!currentModel) {
      const errorMessage: Message = {
        text: '找不到选中的模型配置',
        sender: 'assistant' as const
      };
      setMessages([...newMessages, errorMessage]);
      return;
    }
    
    try {
      // 根据模型地址判断API类型
      let response;
      
      if (currentModel.address.includes('openai.com')) {
        // OpenAI API
        response = await fetch(`${currentModel.address}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentModel.apiKey}`
          },
          body: JSON.stringify({
            model: currentModel.model,
            messages: [
              {
                role: 'user',
                content: processedMessage // 使用处理后的消息
              }
            ],
            max_tokens: 2000, // 增加token限制以容纳shader代码
            temperature: 0.7
          })
        });
        
        if (!response.ok) {
          throw new Error(`OpenAI API错误: ${response.status}`);
        }
        
        const data = await response.json();
        const assistantMessage: Message = {
          text: data.choices[0].message.content,
          sender: 'assistant' as const
        };
        setMessages([...newMessages, assistantMessage]);
        
      } else {
        // 其他兼容OpenAI API的模型
        // 检查地址是否已经包含/v1，避免重复添加
        const baseAddress = currentModel.address.endsWith('/v1') ? currentModel.address : `${currentModel.address}/v1`;
        response = await fetch(`${baseAddress}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentModel.apiKey}`
          },
          body: JSON.stringify({
            model: currentModel.model,
            messages: [
              {
                role: 'user',
                content: processedMessage // 使用处理后的消息
              }
            ],
            max_tokens: 2000, // 增加token限制以容纳shader代码
            temperature: 0.7
          })
        });
        
        if (!response.ok) {
          throw new Error(`API错误: ${response.status}`);
        }
        
        const data = await response.json();
        const assistantMessage: Message = {
          text: data.choices[0].message.content,
          sender: 'assistant' as const
        };
        setMessages([...newMessages, assistantMessage]);
      }
      
    } catch (error) {
      console.error('API调用失败:', error);
      const errorMessage: Message = {
        text: `抱歉，模型调用失败: ${error instanceof Error ? error.message : '未知错误'}`,
        sender: 'assistant' as const
      };
      setMessages([...newMessages, errorMessage]);
    }
  };
  
  // 折叠按钮处理
  const toggleVsCollapse = () => {
    setIsVsCollapsed(!isVsCollapsed);
  };
  
  const toggleFsCollapse = () => {
    setIsFsCollapsed(!isFsCollapsed);
  };
  
  // 切换控制面板显示
  const toggleUniformControls = () => {
    setShowUniformControls(!showUniformControls);
  };
  
  // 控制面板在3D Preview内部，不需要调整外部边距
  useEffect(() => {
    // 控制面板现在放在3D Preview内部，使用绝对定位
    // 不需要调整外部容器尺寸
  }, [showUniformControls]);
  
  // 优化的拖动处理函数
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    document.body.classList.add('resizing');
    
    const startX = e.clientX;
    const startWidth = leftPanelWidth;
    const minWidth = 300;
    const maxWidth = Math.max(500, window.innerWidth - 400);
    
    let animationFrameId: number | null = null;
    let lastUpdateTime = 0;
    const throttleDelay = 16; // 约60fps
    
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      
      // 节流控制，防止过于频繁的更新
      if (now - lastUpdateTime < throttleDelay) return;
      lastUpdateTime = now;
      
      // 使用requestAnimationFrame优化性能
      if (animationFrameId) return;
      
      animationFrameId = requestAnimationFrame(() => {
        const deltaX = e.clientX - startX;
        const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
        setLeftPanelWidth(newWidth);
        animationFrameId = null;
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.classList.remove('resizing');
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // 拖动结束后立即触发resize事件
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <div id="main-container">
      <NavigationBar />
      <div id="app-container">
        {/* 左侧编辑器面板 */}
        <div 
          id="editor-panel" 
          className={`${isVsCollapsed ? 'collapsed-vs' : ''} ${isFsCollapsed ? 'collapsed-fs' : ''}`}
          style={{ width: `${leftPanelWidth}px` }}
        >
          <div className="panel-header">
            Vertex Shader (VS)
            <button className={`collapse-btn ${isVsCollapsed ? 'collapsed' : ''}`} onClick={toggleVsCollapse} data-target="vs"></button>
          </div>
          <div id="editor-vs">
            <CodeEditor 
              id="vs-editor" 
              defaultValue={vertexShader} 
              onChange={setVertexShader} 
            />
          </div>
          
          <div className="panel-header">
            Fragment Shader (FS)
            <button className={`collapse-btn ${isFsCollapsed ? 'collapsed' : ''}`} onClick={toggleFsCollapse} data-target="fs"></button>
          </div>
          <div id="editor-fs">
            <CodeEditor 
              id="fs-editor" 
              defaultValue={fragmentShader} 
              onChange={handleFragmentShaderChangeWrapper} 
            />
          </div>
        </div>
        
        {/* 可拖动分隔条 */}
        <div 
          className={`resizable-divider ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleMouseDown}
        />
        
        {/* 右侧预览容器 */}
        <div id="preview-container">
          {/* 3D预览面板 */}
          <div id="preview-panel">
            <div className="panel-header">
              3D PREVIEW
              <button 
                className={`controls-toggle-btn ${showUniformControls ? 'active' : ''}`}
                onClick={toggleUniformControls}
                title={showUniformControls ? "隐藏控制面板" : "显示控制面板"}
              >
                Uniforms
              </button>
            </div>
            <div id="shader-canvas" ref={canvasRef}>
              <Canvas resize={{ scroll: false }} style={{ width: '100%', height: '100%' }} gl={{ preserveDrawingBuffer: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 2]} />
                <OrbitControls 
                  enableDamping 
                  dampingFactor={0.05} 
                  minDistance={1} 
                  maxDistance={5} 
                  enableZoom={false} 
                />
                <ambientLight intensity={0.5} />
                <ShaderMaterial 
                  uniforms={uniforms} 
                  vertexShader={vertexShader} 
                  fragmentShader={fragmentShader} 
                />
              </Canvas>
            </div>
          </div>
        </div>
        
        {/* 控制面板 - 移到右侧，从右边滑出 */}
        <div id="controls-panel" className={showUniformControls ? 'visible' : 'hidden'}>
          
          <div id="uniforms-controls">
            {Object.keys(customUniforms).map(name => (
              <div key={name} className="uniform-control">
                <label>{name}</label>
                <div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={(customUniforms[name].value as number).toFixed(2)} 
                    onChange={(e) => updateUniformValue(name, parseFloat(e.target.value))}
                    style={{ '--progress': `${(customUniforms[name].value as number) * 100}%` }}
                  />
                  <span>{(customUniforms[name].value as number).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 聊天抽屉 */}
      <ChatDrawer
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        messages={messages}
        onSendMessage={sendMessage}
        inputMessage={inputMessage}
        setInputMessage={setInputMessage}
        models={models}
        setModels={setModels}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
      />
    </div>
  );
}

export default App;