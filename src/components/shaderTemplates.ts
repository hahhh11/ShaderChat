export const defaultVertexShader = `
uniform float u_scale; // 示例 uniform
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