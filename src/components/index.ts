/*
 * @Author: 98Precent
 * @Date: 2025-12-09 15:35:00
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-12-23 14:02:53
 * @FilePath: /ShaderChat/src/components/index.ts
 */
// 导出所有组件
export { default as NavigationBar } from "./NavigationBar";
export { default as ChatDrawer } from "./ChatDrawer";
export { default as CodeEditor } from "./CodeEditor";
export { default as ShaderMaterial } from "./ShaderMaterial";
export { default as ResizableDivider } from "./ResizableDivider";
export { default as AddModelModal } from "./modals/AddModelModal";
export { default as EditModelModal } from "./modals/EditModelModal";
export { default as SettingsModal } from "./modals/SettingsModal";
export { default as ColorPicker } from "./ColorPicker";
export { default as ShaderHistoryModal } from "./modals/ShaderHistoryModal";

// 导出工具函数和常量
export { defaultVertexShader, defaultFragmentShader, vec3ColorFragmentShader, sampler2DFragmentShader } from "./shaderTemplates";
export { discoverUniformNames, setupUniforms, areUniformValuesEqual } from "./shaderUtils";
export * from "../utils/storage";

// 导出类型定义
export type { Uniforms } from "./types";
export type { Message } from "./types";
export type { ModelConfig } from "./types";
export type { ShaderHistory } from "./modals/ShaderHistoryModal";

// 导出自定义Hook
export * from "../hooks/useModels";
