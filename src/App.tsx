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
  setupUniforms,
  useModels
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

  // AI响应解析状态
  const [parsedResponse, setParsedResponse] = useState<{
    description: string;
    vertexShader: string;
    fragmentShader: string;
    changes: string[];
  } | null>(null);

  // 应用AI生成的shader代码
  const applyShaderChanges = () => {
    if (parsedResponse) {
      if (parsedResponse.vertexShader && parsedResponse.vertexShader !== '无修改') {
        setVertexShader(parsedResponse.vertexShader);
      }
      if (parsedResponse.fragmentShader && parsedResponse.fragmentShader !== '无修改') {
        setFragmentShader(parsedResponse.fragmentShader);
      }
      setParsedResponse(null); // 清除解析结果
    }
  };

  // 生成diff比较
  const generateDiff = (oldCode: string, newCode: string, type: 'vs' | 'fs') => {
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');
    
    // 简单的行级diff算法
    const maxLines = Math.max(oldLines.length, newLines.length);
    const diffLines = [];
    
    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i] || '';
      const newLine = newLines[i] || '';
      
      if (oldLine !== newLine) {
        if (oldLine && newLine) {
          diffLines.push({ type: 'modified', lineNum: i + 1, oldLine, newLine });
        } else if (oldLine && !newLine) {
          diffLines.push({ type: 'deleted', lineNum: i + 1, line: oldLine });
        } else if (!oldLine && newLine) {
          diffLines.push({ type: 'added', lineNum: i + 1, line: newLine });
        }
      }
    }
    
    return diffLines;
  };

  // 解析AI响应的函数
  const parseAIResponse = (responseText: string) => {
    const formatStart = responseText.indexOf('=== FORMAT START ===');
    const formatEnd = responseText.indexOf('=== FORMAT END ===');
    
    if (formatStart === -1 || formatEnd === -1) {
      return null; // 不是固定格式，返回null
    }
    
    const formatContent = responseText.substring(formatStart + 20, formatEnd).trim();
    
    // 提取各个部分
    const descriptionMatch = formatContent.match(/\*\*修改说明：\*\*\s*\n([^*]+)/);
    const vertexShaderMatch = formatContent.match(/\*\*Vertex Shader代码：\*\*\s*\n```glsl\s*\n([\s\S]*?)\n```/);
    const fragmentShaderMatch = formatContent.match(/\*\*Fragment Shader代码：\*\*\s*\n```glsl\s*\n([\s\S]*?)\n```/);
    const changesMatch = formatContent.match(/\*\*主要变更：\*\*\s*\n([\s\S]*?)(?=\n\*|$)/);
    
    if (!descriptionMatch || !vertexShaderMatch || !fragmentShaderMatch) {
      return null; // 格式不完整
    }
    
    const description = descriptionMatch[1].trim();
    const vertexShader = vertexShaderMatch[1].trim();
    const fragmentShader = fragmentShaderMatch[1].trim();
    
    // 解析变更列表
    let changes: string[] = [];
    if (changesMatch) {
      changes = changesMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('- '))
        .map(line => line.substring(2));
    }
    
    return {
      description,
      vertexShader: vertexShader === '无修改' ? '无修改' : vertexShader,
      fragmentShader: fragmentShader === '无修改' ? '无修改' : fragmentShader,
      changes
    };
  };
  
  // 模型配置状态 - 使用useModels Hook
  const {
    models,
    setModels,
    selectedModel,
    setSelectedModel
  } = useModels();

  const handleTestModel = async (model: ModelConfig): Promise<boolean> => {
    try {
      console.log('测试模型连接:', model.name);
      console.log('模型配置详情:', {
        name: model.name,
        address: model.address,
        model: model.model,
        hasApiKey: !!model.apiKey,
        apiKeyLength: model.apiKey?.length || 0
      });
      
      // 简单的API测试请求
      const testMessages = [
        {
          role: 'user',
          content: 'Hello, this is a test message. Please respond with "OK".'
        }
      ];
      
      const requestBody = {
        model: model.model,
        messages: testMessages,
        temperature: 0.1,
        max_tokens: 10
      };
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (model.apiKey) {
        headers['Authorization'] = `Bearer ${model.apiKey}`;
      }
      
      // 根据模型地址判断API类型并构建正确的URL
      let apiUrl: string;
      
      if (model.address.includes('openai.com')) {
        // OpenAI API
        apiUrl = `${model.address}/chat/completions`;
      } else {
        // 其他兼容OpenAI API的模型
        // 检查地址是否已经包含/v1，避免重复添加
        const baseAddress = model.address.endsWith('/v1') ? model.address : `${model.address}/v1`;
        apiUrl = `${baseAddress}/chat/completions`;
      }
      
      console.log('测试请求URL:', apiUrl);
      console.log('请求头:', headers);
      console.log('请求体:', requestBody);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });
      
      console.log('测试响应状态:', response.status);
      console.log('测试响应头:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('测试失败，状态码:', response.status, '错误信息:', errorText);
        return false;
      }
      
      const data = await response.json();
      console.log('测试响应数据:', data);
      return true;
      
    } catch (error) {
      console.error('测试模型连接失败:', error);
      return false;
    }
  };
  

  
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

    // 添加系统提示词，要求模型返回固定格式
    const systemPrompt = `你是一个专业的GLSL着色器专家。当用户要求修改或生成着色器代码时，请按照以下格式返回：

=== FORMAT START ===
**修改说明：**
[简要描述你做了什么修改]

**Vertex Shader代码：**
\`\`\`glsl
[新的顶点着色器代码，如果没有修改则写"无修改"]
\`\`\`

**Fragment Shader代码：**
\`\`\`glsl
[新的片段着色器代码，如果没有修改则写"无修改"]
\`\`\`

**主要变更：**
- [列出主要变更点]
=== FORMAT END ===

重要规则：
1. 必须严格遵循上述格式
2. 代码块必须标明glsl语言类型
3. 如果某个着色器没有修改，要写"无修改"
4. 修改说明要简洁明了
5. 主要变更要用列表形式`;

    // 构建最终的消息内容
    const finalMessage = `${systemPrompt}\n\n用户请求：${processedMessage}`;
    
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
    
    // 调试信息：检查模型配置
    console.log('当前模型配置:', {
      name: currentModel.name,
      address: currentModel.address,
      model: currentModel.model,
      hasApiKey: !!currentModel.apiKey,
      apiKeyLength: currentModel.apiKey?.length || 0
    });
    
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
                role: 'system',
                content: systemPrompt
              },
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
        const responseText = data.choices[0].message.content;
        
        // 尝试解析固定格式的响应
        const parsed = parseAIResponse(responseText);
        if (parsed) {
          // 如果是固定格式，显示解析后的信息
          const formattedMessage = `### 🎨 修改说明\n${parsed.description}\n\n### 📊 着色器更新状态\n- **顶点着色器：** ${parsed.vertexShader === '无修改' ? '✅ 无修改' : '🔄 已更新'}\n- **片段着色器：** ${parsed.fragmentShader === '无修改' ? '✅ 无修改' : '🔄 已更新'}\n\n### 📝 主要变更\n${parsed.changes.map(change => `- ${change}`).join('\n')}\n\n### 💡 操作提示\n点击上方"应用更改"按钮来更新代码，或查看右侧原始响应内容。`;
          
          const assistantMessage: Message = {
            text: formattedMessage,
            sender: 'assistant' as const,
            metadata: {
              type: 'shader_update',
              parsed: parsed,
              originalText: responseText
            }
          };
          setMessages([...newMessages, assistantMessage]);
          setParsedResponse(parsed); // 保存解析结果用于应用
        } else {
          // 如果不是固定格式，按原样显示
          const assistantMessage: Message = {
            text: responseText,
            sender: 'assistant' as const
          };
          setMessages([...newMessages, assistantMessage]);
        }
        
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
                role: 'system',
                content: systemPrompt
              },
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
        const responseText = data.choices[0].message.content;
        
        // 尝试解析固定格式的响应
        const parsed = parseAIResponse(responseText);
        if (parsed) {
          // 如果是固定格式，显示解析后的信息
          const formattedMessage = `=== FORMAT START ===

**修改说明：**
${parsed.description}

**Vertex Shader代码：**
\`\`\`glsl
${parsed.vertexShader}
\`\`\`

**Fragment Shader代码：**
\`\`\`glsl
${parsed.fragmentShader}
\`\`\`

**主要变更：**
${parsed.changes.map(change => `- ${change}`).join('\n')}

=== FORMAT END ===`;
          
          const assistantMessage: Message = {
            text: formattedMessage,
            sender: 'assistant' as const,
            metadata: {
              type: 'shader_update',
              parsed: parsed,
              originalText: responseText
            }
          };
          setMessages([...newMessages, assistantMessage]);
          setParsedResponse(parsed); // 保存解析结果用于应用
        } else {
          // 如果不是固定格式，按原样显示
          const assistantMessage: Message = {
            text: responseText,
            sender: 'assistant' as const
          };
          setMessages([...newMessages, assistantMessage]);
        }
      }
      
    } catch (error) {
      console.error('API调用失败:', error);
      let errorText = '抱歉，模型调用失败: ';
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorText += 'API密钥无效或已过期，请检查模型配置中的API密钥';
        } else if (error.message.includes('404')) {
          errorText += 'API地址错误或模型不存在，请检查模型配置';
        } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorText += '网络连接失败，请检查网络连接和API地址';
        } else {
          errorText += error.message;
        }
      } else {
        errorText += '未知错误';
      }
      
      const errorMessage: Message = {
        text: errorText,
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
            
            {/* AI建议的应用按钮 */}
            {parsedResponse && parsedResponse.vertexShader !== '无修改' && (
              <div className="ai-suggestion-banner">
                <span>🤖 AI建议更新顶点着色器</span>
                <button className="ai-apply-btn" onClick={applyShaderChanges}>
                  应用更改
                </button>
              </div>
            )}
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
            
            {/* AI建议的应用按钮 */}
            {parsedResponse && parsedResponse.fragmentShader !== '无修改' && (
              <div className="ai-suggestion-banner">
                <span>🤖 AI建议更新片段着色器</span>
                <button className="ai-apply-btn" onClick={applyShaderChanges}>
                  应用更改
                </button>
              </div>
            )}
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
              
              {/* 聊天抽屉 - 现在位于shader-canvas内部 */}
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
                onTestModel={handleTestModel}
              />
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
      

    </div>
  );
}

export default App;