# ShaderChat 🎨

一个基于WebGL的交互式着色器编辑器，支持实时代码编辑、预览和AI辅助编程。

## ✨ 主要功能

### 🎯 核心特性
- **实时代码编辑**: 支持顶点着色器(#vs)和片段着色器(#fs)的实时代码编辑
- **智能引用系统**: 使用`#vs`和`#fs`快速引用对应的着色器代码
- **AI辅助编程**: 集成AI模型，提供着色器代码优化和生成建议
- **即时预览**: 代码修改后实时渲染预览效果
- **多模型支持**: 支持多种AI模型（Kimi、DeepSeek、Gemini、ChatGPT等）

### 🚀 高级功能
- **智能路径处理**: 自动检测和修复API路径，避免404错误
- **Token限制优化**: 提升至2000 tokens，支持更复杂的着色器代码
- **代码高亮**: `#vs`和`#fs`引用标记具有特殊的蓝色渐变高亮样式
- **响应式设计**: 适配不同屏幕尺寸，支持面板大小调整

## 🛠️ 技术栈

- **前端框架**: React + TypeScript
- **构建工具**: Vite
- **样式**: CSS3 + 渐变动画
- **WebGL**: 原生WebGL API
- **AI集成**: 多模型API支持

## 📦 安装和运行

### 环境要求
- Node.js 16+
- pnpm（推荐）或 npm

### 快速开始

```bash
# 克隆项目
git clone https://github.com/hahhh11/ShaderChat.git
cd ShaderChat

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 🎮 使用示例

### 基本使用
1. 在左侧编辑器中编写顶点着色器和片段着色器代码
2. 点击右下角ShaderChat按钮唤起对话框
3. 配置各个平台大模型配置（API Key会加密保存在本地）
4. 在对话框中输入`#vs`或`#fs`来引用对应的着色器代码
5. 使用AI功能优化代码：例如"请帮我优化 #vs 顶点着色器"
6. 根据返回的代码替换原有代码

### AI辅助功能
- **代码优化**: "#fs 请优化我的片段着色器性能"
- **效果生成**: "创建一个波浪效果的顶点着色器"
- **错误修复**: "#fs 修复这个着色器的编译错误"

## 🎨 界面预览

- **编辑器面板**: 左侧代码编辑器，支持语法高亮
- **预览面板**: 右侧实时WebGL渲染预览
- **聊天面板**: 右侧底部AI对话界面，支持智能引用
- **导航栏**: 顶部模型选择和功能菜单

## TODO

- [x] 直接应用大模型返回的shader代码
- [ ] 完善unifroms类型及取值
- [ ] 提示当前uniforms的取值
- [ ] diff大模型返回和现有shader的差异
- [ ] 历史对话记录及shader代码保存

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- WebGL社区提供的优秀资源和教程
- 开源AI模型API提供商
- React和Vite生态系统

## 📞 联系方式

- 项目地址: [https://github.com/hahhh11/ShaderChat](https://github.com/hahhh11/ShaderChat)
- 问题反馈: [Issues](https://github.com/hahhh11/ShaderChat/issues)

---

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**