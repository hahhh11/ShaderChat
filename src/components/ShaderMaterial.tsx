import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface UniformValue {
  value: number | { x: number; y: number; z?: number };
}

interface Uniforms {
  [key: string]: UniformValue;
  iTime: { value: number };
  iResolution: { value: { x: number; y: number } };
}

interface ShaderMaterialProps {
  uniforms: Uniforms;
  vertexShader: string;
  fragmentShader: string;
}

const ShaderMaterial: React.FC<ShaderMaterialProps> = ({ uniforms, vertexShader, fragmentShader }) => {
  // 使用useRef来存储uniforms引用，避免直接修改props
  const uniformsRef = useRef(uniforms);
  
  // 当uniforms变化时更新引用
  React.useEffect(() => {
    uniformsRef.current = uniforms;
  }, [uniforms]);

  // 使用useFrame钩子在每一帧更新iTime
  useFrame((state) => {
    if (uniformsRef.current && uniformsRef.current.iTime) {
      uniformsRef.current.iTime.value = state.clock.elapsedTime;
    }
  });

  // 使用useMemo来创建材质，避免重复创建
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide
    });
  }, [uniforms, vertexShader, fragmentShader]);

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
};

export default ShaderMaterial;