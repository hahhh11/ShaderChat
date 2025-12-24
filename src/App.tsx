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
  sampler2DFragmentShader,
  discoverUniformNames,
  setupUniforms,
  areUniformValuesEqual,
  useModels,
  ColorPicker,
  ShaderHistoryModal,
  ShaderHistory
} from './components';
import { UniformValue } from './components/types';
import { debounce } from './utils/debounce';
import './App.css';
import './styles/uniform-controls.css'
import './styles/chat-drawer.css'
import './styles/shader-history.css'
import './styles/fontawesome.min.css';

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
  // 状态管理 - 默认使用纹理采样模板
  const [vertexShader, setVertexShader] = useState<string>(defaultVertexShader);
  const [fragmentShader, setFragmentShader] = useState<string>(sampler2DFragmentShader);
  // 传入ShaderMaterial的uniforms
  const [uniforms, setUniforms] = useState<Uniforms>({
    iTime: { value: 0.0 },
    iResolution: { value: { x: 1, y: 1 }, type: 'vec2' }
  });
  // 用户编辑的uniforms
  const [customUniforms, setCustomUniforms] = useState<Uniforms>({} as Uniforms);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: '欢迎使用 ShaderChat！您可以在这里输入问题或指令。', sender: 'assistant' }
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isVsCollapsed, setIsVsCollapsed] = useState<boolean>(false);
  const [isFsCollapsed, setIsFsCollapsed] = useState<boolean>(false);

  // 确保ChatDrawer默认关闭
  useEffect(() => {
    setIsChatOpen(false);
  }, []);

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedHistory = localStorage.getItem('shaderHistory');
    if (savedHistory) {
      try {
        setShaderHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    }
  }, []);

  // 保存历史记录到localStorage
  const saveHistoryToStorage = useCallback((history: ShaderHistory[]) => {
    try {
      localStorage.setItem('shaderHistory', JSON.stringify(history));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }, []);

  // 组件挂载时自动加载纹理采样模板
  useEffect(() => {
    loadTextureSamplingTemplate();
  }, []);
  
  // 可调整宽度状态
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(400);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // 控制面板显示状态
  const [showUniformControls, setShowUniformControls] = useState<boolean>(true);
  
  // 形状切换状态
  const [currentShape, setCurrentShape] = useState<'plane' | 'cube' | 'sphere'>('plane');
  
  // 历史记录状态
  const [shaderHistory, setShaderHistory] = useState<ShaderHistory[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  
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

  // 加载纹理采样模板
  const loadTextureSamplingTemplate = () => {
    setVertexShader(defaultVertexShader);
    setFragmentShader(sampler2DFragmentShader);
  };

  // 生成diff比较函数已移除

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
  

  
  // 处理Fragment Shader变化 - 使用防抖避免频繁更新
  const handleFragmentShaderChange = useCallback((newFragmentShader: string) => {
    setFragmentShader(newFragmentShader);
  }, []);

  // 防抖处理uniform更新 - 避免打字时频繁重置
  const debouncedUniformUpdate = useCallback(
    debounce((shader: string) => {
      const uniformNames = discoverUniformNames(shader);
      setupUniforms(uniformNames, customUniforms, setCustomUniforms, uniforms, setUniforms, shader);
    }, 500), // 500ms防抖延迟
    [customUniforms, uniforms]
  );

  // 监听fragmentShader变化，使用防抖更新uniforms
  useEffect(() => {
    if (fragmentShader) {
      debouncedUniformUpdate(fragmentShader);
    }
  }, [fragmentShader, customUniforms, debouncedUniformUpdate]);
  
  // 在CodeEditor组件中使用
  const handleFragmentShaderChangeWrapper = (newFragmentShader: string) => {
    handleFragmentShaderChange(newFragmentShader);
  };
  
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
    console.log('updateUniformValue',name,value);
    console.log(uniforms);
    setCustomUniforms(prev => {
      const currentValue = prev[name]?.value;
      const currentType = prev[name]?.type;
      // 使用精确的值比较，只在值真正变化时更新
      // if (areUniformValuesEqual(currentValue, value)) return prev;
      const newUniforms = { ...prev };
      newUniforms[name] = { value, type: currentType || 'float' };
      return newUniforms;
    });
    
    setUniforms(prev => {
      const currentValue = prev[name]?.value;
      const currentType = prev[name]?.type;
      // 使用精确的值比较，只在值真正变化时更新
      // if (areUniformValuesEqual(currentValue, value)) return prev;
      return {
        ...prev,
        [name]: { value, type: currentType || 'float' }
      };
    });
  }, []);

  // 更新vec3 Uniform值 - 优化性能，避免重复设置相同值
  const updateVec3UniformValue = useCallback((name: string, value: { r: number; g: number; b: number }): void => {
    console.log('updateVec3UniformValue',name,value);
    
    // 验证输入值的有效性
    if (!value || typeof value.r !== 'number' || typeof value.g !== 'number' || typeof value.b !== 'number') {
      console.error(`updateVec3UniformValue: Invalid value for ${name}:`, value);
      return;
    }
    
    // 确保值在有效范围内
    const validatedValue = {
      r: Math.max(0, Math.min(1, value.r)),
      g: Math.max(0, Math.min(1, value.g)),
      b: Math.max(0, Math.min(1, value.b))
    };
    
    console.log(`updateVec3UniformValue: Setting ${name} to [${validatedValue.r}, ${validatedValue.g}, ${validatedValue.b}]`);
    
    setCustomUniforms(prev => {
      const newState = {
        ...prev,
        [name]: { value: validatedValue, type: 'vec3' } as UniformValue
      };
      console.log(`updateVec3UniformValue: customUniforms before update:`, prev);
      console.log(`updateVec3UniformValue: customUniforms after update:`, newState);
      return newState;
    });
    
    setUniforms(prev => {
      const newState = {
        ...prev,
        [name]: { value: validatedValue, type: 'vec3' } as UniformValue
      };
      console.log(`updateVec3UniformValue: uniforms before update:`, prev);
      console.log(`updateVec3UniformValue: uniforms after update:`, newState);
      return newState;
    });
  }, []);

  // 更新vec4 Uniform值 - 优化性能，避免重复设置相同值
  const updateVec4UniformValue = useCallback((name: string, value: { r: number; g: number; b: number; a: number }): void => {
    console.log('updateVec4UniformValue',name,value);
    
    // 验证输入值的有效性
    if (!value || typeof value.r !== 'number' || typeof value.g !== 'number' || typeof value.b !== 'number' || typeof value.a !== 'number') {
      console.error(`updateVec4UniformValue: Invalid value for ${name}:`, value);
      return;
    }
    
    // 确保值在有效范围内
    const validatedValue = {
      r: Math.max(0, Math.min(1, value.r)),
      g: Math.max(0, Math.min(1, value.g)),
      b: Math.max(0, Math.min(1, value.b)),
      a: Math.max(0, Math.min(1, value.a))
    };
    
    console.log(`updateVec4UniformValue: Setting ${name} to [${validatedValue.r}, ${validatedValue.g}, ${validatedValue.b}, ${validatedValue.a}]`);
    
    setCustomUniforms(prev => {
      return {
        ...prev,
        [name]: { value: validatedValue, type: 'vec4' }
      };
    });
    
    setUniforms(prev => {
      return {
        ...prev,
        [name]: { value: validatedValue, type: 'vec4' }
      };
    });
  }, []);

  // 处理图片上传 - 优化为直接存储base64数据
  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageUpload = useCallback((name: string, file: File): void => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      
      // 创建Image对象用于验证图片有效性
      const img = new Image();
      img.onload = () => {
        // 存储base64数据而不是HTMLImageElement，更轻量且易于序列化
        const imageData = {
          src: base64Data,
          width: img.naturalWidth,
          height: img.naturalHeight
        };
        
        setCustomUniforms(prev => {
          const currentValue = prev[name]?.value;
          // 使用精确的值比较，只在值真正变化时更新
          if (areUniformValuesEqual(currentValue, imageData)) return prev;
          return {
            ...prev,
            [name]: { value: imageData, type: 'sampler2D' }
          };
        });
        
        setUniforms(prev => {
          const currentValue = prev[name]?.value;
          // 使用精确的值比较，只在值真正变化时更新
          if (areUniformValuesEqual(currentValue, imageData)) return prev;
          return {
            ...prev,
            [name]: { value: imageData, type: 'sampler2D' }
          };
        });
      };
      
      img.onerror = () => {
        console.error('图片加载失败:', file.name);
      };
      
      img.src = base64Data;
    };
    
    reader.onerror = () => {
      console.error('文件读取失败:', file.name);
    };
    
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, name: string) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(name, file);
      }
    }
  };
  
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
  
  // 保存当前shader到历史记录
  const handleSaveCurrentShader = useCallback((name: string) => {
    const newHistory: ShaderHistory = {
      id: Date.now().toString(),
      name,
      vertexShader,
      fragmentShader,
      uniforms,
      customUniforms,
      timestamp: Date.now()
    };
    
    const updatedHistory = [...shaderHistory, newHistory];
    setShaderHistory(updatedHistory);
    saveHistoryToStorage(updatedHistory);
  }, [vertexShader, fragmentShader, uniforms, customUniforms, shaderHistory, saveHistoryToStorage]);

  // 加载历史记录
  const handleLoadHistory = useCallback((history: ShaderHistory) => {
    setVertexShader(history.vertexShader);
    setFragmentShader(history.fragmentShader);
    setUniforms(history.uniforms);
    setCustomUniforms(history.customUniforms);
    setIsHistoryPanelOpen(false);
  }, []);

  // 删除历史记录
  const handleDeleteHistory = useCallback((id: string) => {
    const updatedHistory = shaderHistory.filter(item => item.id !== id);
    setShaderHistory(updatedHistory);
    saveHistoryToStorage(updatedHistory);
  }, [shaderHistory, saveHistoryToStorage]);

  // 重命名历史记录
  const handleRenameHistory = useCallback((id: string, newName: string) => {
    const updatedHistory = shaderHistory.map(item => 
      item.id === id ? { ...item, name: newName } : item
    );
    setShaderHistory(updatedHistory);
    saveHistoryToStorage(updatedHistory);
  }, [shaderHistory, saveHistoryToStorage]);

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
      <NavigationBar onHistoryClick={() => setIsHistoryPanelOpen(true)} />
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
              PREVIEW
              <div className="panel-header-controls">
                <button 
                className={`controls-toggle-btn ${showUniformControls ? 'active' : ''}`}
                onClick={toggleUniformControls}
                title={showUniformControls ? "隐藏控制面板" : "显示控制面板"}
              >
                Uniforms
              </button>
              </div>
            </div>
            <div id="shader-canvas" ref={canvasRef}>
              {/* 形状切换按钮 - 浮动到canvas上方 */}
              <div className="shape-controls">
                <button 
                  className={`shape-btn ${currentShape === 'plane' ? 'active' : ''}`}
                  onClick={() => setCurrentShape('plane')}
                  title="平面"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12h20"/>
                    <path d="M2 16h20"/>
                    <path d="M2 20h20"/>
                    <path d="M2 4h20"/>
                    <path d="M2 8h20"/>
                  </svg>
                </button>
                <button 
                  className={`shape-btn ${currentShape === 'cube' ? 'active' : ''}`}
                  onClick={() => setCurrentShape('cube')}
                  title="方块"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <rect x="7" y="7" width="10" height="10" rx="1"/>
                  </svg>
                </button>
                <button 
                  className={`shape-btn ${currentShape === 'sphere' ? 'active' : ''}`}
                  onClick={() => setCurrentShape('sphere')}
                  title="球体"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9"/>
                    <ellipse cx="12" cy="12" rx="9" ry="4"/>
                  </svg>
                </button>
              </div>
              <Canvas resize={{ scroll: false }} style={{ width: '100%', height: '100%' }} gl={{ preserveDrawingBuffer: true }}>
                <PerspectiveCamera makeDefault position={[0, 0, 2]} />
                <OrbitControls 
                  enableDamping 
                  dampingFactor={0.05} 
                  minDistance={1} 
                  maxDistance={4} 
                  enableZoom={false} 
                />
                <ambientLight intensity={0.5} />
                <ShaderMaterial 
                  uniforms={uniforms} 
                  vertexShader={vertexShader} 
                  fragmentShader={fragmentShader} 
                  transparent={true}
                  shape={currentShape}
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
                onApplyVertexShader={setVertexShader}
                onApplyFragmentShader={setFragmentShader}
              />
            </div>
          </div>
        </div>
        
        {/* 控制面板 - 移到右侧，从右边滑出 */}
        <div id="controls-panel" className={showUniformControls ? 'visible' : 'hidden'}>
          
          <div id="uniforms-controls">
            {Object.keys(customUniforms).map(name => {
              const uniform = customUniforms[name];
              const isVec3 = uniform.type === 'vec3' || (uniform.value && typeof uniform.value === 'object' && 'r' in uniform.value && !('a' in uniform.value));
              const isVec4 = uniform.type === 'vec4' || (uniform.value && typeof uniform.value === 'object' && 'r' in uniform.value && 'a' in uniform.value);
              const isSampler2D = uniform.type === 'sampler2D' || uniform.value instanceof HTMLImageElement || (uniform.value && typeof uniform.value === 'object' && 'src' in uniform.value);
              if (isSampler2D) {
                return (
                  <div key={name} className="uniform-control sampler2d-control">
                    <label>{name}</label>
                    <div 
                      className={`image-upload-container ${isDragOver ? 'drag-over' : ''} ${uniform.value ? 'has-image' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, name)}
                    >
                      {uniform.value ? (
                        <div className="image-preview has-image">
                          <img 
                            src={typeof uniform.value === 'object' && 'src' in uniform.value ? (uniform.value as { src: string }).src : (uniform.value as HTMLImageElement).src} 
                            alt={name}
                            width="120"
                            height="120"
                          />
                          <button 
                            className="remove-image-btn"
                            onClick={() => {
                              setCustomUniforms(prev => ({
                                ...prev,
                                [name]: { value: null, type: 'sampler2D' }
                              }));
                              setUniforms(prev => ({
                                ...prev,
                                [name]: { value: null, type: 'sampler2D' }
                              }));
                            }}
                            title="移除图片"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="upload-placeholder">
                          <div>拖拽图片到此处</div>
                          <div style={{ fontSize: '12px', opacity: 0.7 }}>或点击按钮选择</div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(name, file);
                          }
                        }}
                        style={{ display: 'none' }}
                        id={`image-upload-${name}`}
                      />
                      <label htmlFor={`image-upload-${name}`} className="upload-button">
                        选择图片
                      </label>
                    </div>
                  </div>
                );
              }
              if (isVec3 || isVec4) {
                return (
                  
                  <div key={name} className={`uniform-control ${isVec4 ? 'vec4-control' : 'vec3-control'}`}>
                    <label>{name}</label>
                    <ColorPicker
                      color={(() => {
                        console.log(`App: Rendering ColorPicker for ${name}, uniform.value:`, uniform.value);
                        
                        if (isVec3) {
                          const vec3Value = uniform.value as { r?: number; g?: number; b?: number; x?: number; y?: number; z?: number };
                          // 处理Vector3格式 (x,y,z) 或 RGB格式 (r,g,b)
                          if (vec3Value) {
                            if (typeof vec3Value.x === 'number' && typeof vec3Value.y === 'number' && typeof vec3Value.z === 'number') {
                              console.log(`App: Converting Vector3 format for ${name}:`, vec3Value);
                              return { r: vec3Value.x, g: vec3Value.y, b: vec3Value.z };
                            } else if (typeof vec3Value.r === 'number' && typeof vec3Value.g === 'number' && typeof vec3Value.b === 'number') {
                              console.log(`App: Using RGB format for ${name}:`, vec3Value);
                              return { r: vec3Value.r, g: vec3Value.g, b: vec3Value.b };
                            }
                          }
                          console.log(`App: Using default color for ${name}`);
                          return { r: 1, g: 1, b: 1 };
                        } else {
                          const vec4Value = uniform.value as { r: number; g: number; b: number; a: number };
                          console.log(`App: Using vec4 format for ${name}:`, vec4Value);
                          return vec4Value || { r: 1, g: 1, b: 1, a: 1 };
                        }
                      })()}
                      onChange={(color) => {
                        // 直接使用正确的颜色格式，不需要复杂的转换逻辑
                        console.log(`App ColorPicker onChange - name: ${name}, color:`, color);
                        console.log(`App ColorPicker onChange - color.r: ${color?.r}, color.g: ${color?.g}, color.b: ${color?.b}${!isVec3 ? ', color.a: ' + color?.a : ''}`);
                        
                        if (isVec3) {
                          const vec3Color = color as { r: number; g: number; b: number };
                          if (vec3Color && typeof vec3Color.r === 'number' && typeof vec3Color.g === 'number' && typeof vec3Color.b === 'number') {
                            updateVec3UniformValue(name, vec3Color);
                          } else {
                            console.error(`App ColorPicker onChange - Invalid vec3 color for ${name}:`, vec3Color);
                          }
                        } else {
                          const vec4Color = color as { r: number; g: number; b: number; a: number };
                          if (vec4Color && typeof vec4Color.r === 'number' && typeof vec4Color.g === 'number' && typeof vec4Color.b === 'number' && typeof vec4Color.a === 'number') {
                            updateVec4UniformValue(name, vec4Color);
                          } else {
                            console.error(`App ColorPicker onChange - Invalid vec4 color for ${name}:`, vec4Color);
                          }
                        }
                      }}
                      label={name}
                      showAlpha={!isVec3}
                    />
                  </div>
                );
              }
              
              return (
                <div key={name} className="uniform-control">
                  <label>{name}</label>
                  <div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.01" 
                      value={(uniform.value as number).toFixed(2)} 
                      onChange={(e) => updateUniformValue(name, parseFloat(e.target.value))}
                      style={{ '--progress': `${(uniform.value as number) * 100}%` }}
                    />
                    <span>{(uniform.value as number).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 历史记录面板 */}
      <ShaderHistoryModal
        isOpen={isHistoryPanelOpen}
        onClose={() => setIsHistoryPanelOpen(false)}
        history={shaderHistory}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={handleDeleteHistory}
        onRenameHistory={handleRenameHistory}
        onSaveCurrent={handleSaveCurrentShader}
      />
    </div>
  );
}

export default App;