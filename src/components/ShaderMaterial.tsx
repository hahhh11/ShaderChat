import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface UniformValue {
  value: number | { x: number; y: number; z?: number } | { r: number; g: number; b: number } | { r: number; g: number; b: number; a: number };
  type?: 'float' | 'vec2' | 'vec3' | 'color' | 'vec4';
}

interface Uniforms {
  [key: string]: UniformValue;
  iTime: { value: number };
  iResolution: { value: { x: number; y: number; z?: number } };
}

interface ShaderMaterialProps {
  uniforms: Uniforms;
  vertexShader: string;
  fragmentShader: string;
}

const ShaderMaterial: React.FC<ShaderMaterialProps> = ({ uniforms, vertexShader, fragmentShader }) => {
  // 使用useRef来存储材质引用，避免重复创建
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  
  // 只在vertexShader或fragmentShader变化时重新创建材质
  const material = useMemo(() => {
    materialRef.current = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide
    });
    return materialRef.current;
  }, [vertexShader, fragmentShader]); // 移除uniforms依赖，避免频繁重建

  // 更新uniforms值而不重新创建材质
  useEffect(() => {
    if (materialRef.current) {
      // 只更新变化的uniforms值
      Object.keys(uniforms).forEach(key => {
        if (materialRef.current!.uniforms[key]) {
          const uniform = uniforms[key];
          // 处理vec3类型 - 转换为THREE.Vector3
          if (uniform.type === 'vec3' || (typeof uniform.value === 'object' && 'r' in uniform.value && !('a' in uniform.value))) {
            const color = uniform.value as { r: number; g: number; b: number };
            materialRef.current!.uniforms[key].value = new THREE.Vector3(color.r, color.g, color.b);
          }
          // 处理vec4类型 - 转换为THREE.Vector4
          else if (uniform.type === 'vec4' || (typeof uniform.value === 'object' && 'r' in uniform.value && 'a' in uniform.value)) {
            const color = uniform.value as { r: number; g: number; b: number; a: number };
            materialRef.current!.uniforms[key].value = new THREE.Vector4(color.r, color.g, color.b, color.a);
          } else {
            materialRef.current!.uniforms[key].value = uniform.value;
          }
        }
      });
    }
  }, [uniforms]); // 监听uniforms变化，但只更新值不重建材质

  // 使用useFrame钩子在每一帧更新iTime
  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms.iTime) {
      materialRef.current.uniforms.iTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

export default ShaderMaterial;