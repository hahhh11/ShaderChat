/*
 * @Author: 98Precent
 * @Date: 2025-12-09 15:35:00
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-12-10 14:18:13
 * @FilePath: /ShaderChat/src/components/shaderTemplates.ts
 */
export const defaultVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const defaultFragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform float u_custom_float; // <-- 示例自定义 Uniform
uniform float u_scale;        // <-- 示例自定义 Uniform

varying vec2 vUv; 

void main() {
    vec2 uv = vUv - 0.5; // 中心归零
    
    // 基础颜色随时间变化
    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx * 6.0 + vec3(0, 2, 4));

    // 使用自定义 Uniforms 进行效果控制
    float effect = sin(length(uv) * 20.0 + iTime * u_scale) * 0.1 * u_custom_float;
    
    col.r += effect;
    col.b -= effect;
    
    gl_FragColor = vec4(col, 1.0);
}
`;

export const vec3ColorFragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 uBackgroundColor;
uniform vec3 uForegroundColor;
uniform vec3 uAccentColor;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    // 创建渐变背景
    vec3 bg = mix(uBackgroundColor, uForegroundColor, uv.y);
    
    // 添加动态效果
    float wave = sin(uv.x * 10.0 + iTime) * 0.1;
    bg += uAccentColor * wave;
    
    // 添加圆形图案
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(uv, center);
    vec3 finalColor = mix(bg, uAccentColor, smoothstep(0.3, 0.2, dist));
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export const sampler2DFragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform sampler2D uTexture;
uniform float uTextureIntensity;
uniform vec3 uTintColor;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    // 基础颜色
    vec3 baseColor = 0.5 + 0.5 * cos(iTime + uv.xyx * 6.0 + vec3(0, 2, 4));
    
    // 采样纹理
    vec4 texColor = texture2D(uTexture, uv);
    
    // 混合纹理和基础颜色
    vec3 finalColor = mix(baseColor, texColor.rgb * uTintColor, uTextureIntensity * texColor.a);
    
    // 添加一些动态效果
    finalColor += sin(uv.x * 20.0 + iTime * 2.0) * 0.05;
    finalColor += cos(uv.y * 15.0 + iTime * 1.5) * 0.05;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;
