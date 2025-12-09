/*
 * @Author: 98Precent
 * @Date: 2025-12-08 16:32:17
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-12-08 17:59:30
 * @FilePath: /ShaderChat/src/components/index.ts
 */
export { default as NavigationBar } from "./NavigationBar";
export { default as ChatDrawer } from "./ChatDrawer";
export { default as CodeEditor } from "./CodeEditor";
export { default as ShaderMaterial } from "./ShaderMaterial";
export { default as ResizableDivider } from "./ResizableDivider";
export { defaultVertexShader, defaultFragmentShader } from "./shaderTemplates";
export type { Uniforms } from "./types";
export type { Message } from "./types";
export type { ModelConfig } from "./types";
export { discoverUniformNames, setupUniforms } from "./shaderUtils";
