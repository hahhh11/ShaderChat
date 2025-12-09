import { Uniforms } from './types';

export const discoverUniformNames = (fsSource: string): string[] => {
  const regex = /uniform\s+float\s+([a-zA-Z_]\w*);/g;
  let match;
  const names = new Set<string>();
  const excluded = ['iTime', 'iResolution', 'projectionMatrix', 'modelViewMatrix', 'viewMatrix', 'normalMatrix', 'cameraPosition'];
  
  while ((match = regex.exec(fsSource)) !== null) {
    const name = match[1];
    if (!excluded.includes(name)) {
      names.add(name);
    }
  }
  return Array.from(names);
};

export const setupUniforms = (
  uniformNames: string[],
  customUniforms: Uniforms,
  setCustomUniforms: (uniforms: Uniforms) => void,
  uniforms: Uniforms,
  setUniforms: (uniforms: Uniforms) => void
): void => {
  const newCustomUniforms = { ...customUniforms };
  let hasChanges = false;
  
  // 添加或初始化新的Uniforms
  uniformNames.forEach(name => {
    if (!(name in newCustomUniforms)) {
      newCustomUniforms[name] = { value: 0.5 };
      hasChanges = true;
    }
  });
  
  // 删除不再需要的Uniforms
  Object.keys(newCustomUniforms).forEach(name => {
    if (!uniformNames.includes(name)) {
      delete newCustomUniforms[name];
      hasChanges = true;
    }
  });
  
  // 只有在有变化时才更新状态
  if (hasChanges) {
    setCustomUniforms(newCustomUniforms);
    
    // 更新合并后的Uniforms - 保留内置uniforms的值
    const mergedUniforms: Uniforms = {
      ...uniforms,
      ...newCustomUniforms
    };
    
    // 确保内置uniforms不被覆盖
    if (uniforms.iTime) mergedUniforms.iTime = uniforms.iTime;
    if (uniforms.iResolution) mergedUniforms.iResolution = uniforms.iResolution;
    
    setUniforms(mergedUniforms);
  }
};