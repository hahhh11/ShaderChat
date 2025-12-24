import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Uniforms } from './types';

interface ShaderMaterialProps {
  uniforms: Uniforms;
  vertexShader: string;
  fragmentShader: string;
  transparent?: boolean;
  shape?: 'plane' | 'cube' | 'sphere';
}

const ShaderMaterial: React.FC<ShaderMaterialProps> = ({ uniforms, vertexShader, fragmentShader, transparent = false, shape = 'plane' }) => {
  // 使用useRef来存储材质引用，避免重复创建
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [materialReady, setMaterialReady] = useState(false);
  console.log('ShaderMaterial',uniforms,JSON.stringify(uniforms));
  // 使用防抖延迟500ms创建材质
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      console.log('防抖设置shaderMaterial', uniforms);
      materialRef.current = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
        transparent: transparent
      });
      setMaterialReady(true);
    }, 500);
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [vertexShader, fragmentShader, transparent, uniforms]); 

  // 更新uniforms值而不重新创建材质
  useEffect(() => {
    if (materialRef.current) {
      Object.keys(uniforms).forEach(key => {
        
        if (!materialRef.current!.uniforms[key]) {
          materialRef.current!.uniforms[key] = { value: null };
        }
        
        if (materialRef.current!.uniforms[key]) {
          const uniform = uniforms[key];
          const currentValue = materialRef.current!.uniforms[key].value;

          if (uniform.value === null) {
            if (currentValue !== null) {
              materialRef.current!.uniforms[key].value = null;
            }
            return;
          }
          
          if (uniform.type === 'sampler2D') {
            if (uniform.value && typeof uniform.value === 'object' && 'src' in uniform.value) {
              const imageData = uniform.value as { src: string; width?: number; height?: number };
              
              if (currentValue instanceof THREE.Texture && currentValue.image && currentValue.image.src === imageData.src) {
                return;
              }
              
              const img = new Image();
              img.onload = () => {
                const texture = new THREE.Texture(img);
                texture.needsUpdate = true;
                materialRef.current!.uniforms[key].value = texture;
              };
              img.src = imageData.src;
            } else if (uniform.value === null) {
              if (currentValue !== null) {
                materialRef.current!.uniforms[key].value = null;
              }
            }
          }
          else if (uniform.type === 'vec2' || (typeof uniform.value === 'object' && uniform.value !== null && !('a' in uniform.value) && !('r' in uniform.value) && typeof (uniform.value as any).x === 'number' && typeof (uniform.value as any).y === 'number' && !(typeof (uniform.value as any).z === 'number'))) {
            const vec2Value = uniform.value as { x: number; y: number };
            
            if (currentValue instanceof THREE.Vector2) {
              // 使用容差值进行浮点数比较，避免精度问题导致的更新失败
              const EPSILON = 0.0001;
              if (Math.abs(currentValue.x - vec2Value.x) < EPSILON && 
                  Math.abs(currentValue.y - vec2Value.y) < EPSILON) {
                console.log(`ShaderMaterial: Skipping vec2 update for ${key}, values are identical within tolerance`);
                return;
              }
              console.log(`ShaderMaterial: Updating vec2 ${key} from [${currentValue.x}, ${currentValue.y}] to [${vec2Value.x}, ${vec2Value.y}]`);
            } else {
              console.log(`ShaderMaterial: Creating new vec2 ${key} with [${vec2Value.x}, ${vec2Value.y}]`);
            }
            materialRef.current!.uniforms[key].value = new THREE.Vector2(vec2Value.x, vec2Value.y);
          }
          else if (uniform.type === 'vec3' || (typeof uniform.value === 'object' && uniform.value !== null && !('a' in uniform.value))) {
            let color: { r: number; g: number; b: number };
            
            // 处理不同的vec3格式：RGB对象或Vector3对象
            const valueObj = uniform.value as { r?: number; g?: number; b?: number; x?: number; y?: number; z?: number };
            
            if (typeof valueObj.r === 'number' && typeof valueObj.g === 'number' && typeof valueObj.b === 'number') {
              // RGB格式
              color = { r: valueObj.r, g: valueObj.g, b: valueObj.b };
            } else if (typeof valueObj.x === 'number' && typeof valueObj.y === 'number') {
              // Vector3格式 - 转换为RGB (处理2D和3D向量)
              const z = typeof valueObj.z === 'number' ? valueObj.z : 0;
              color = { r: valueObj.x, g: valueObj.y, b: z };
              console.log(`ShaderMaterial: Converting Vector format for ${key}:`, valueObj, '->', color);
            } else {
              console.error(`ShaderMaterial: Invalid vec3 format for ${key}:`, uniform.value);
              return;
            }
            
            if (currentValue instanceof THREE.Vector3) {
              // 使用容差值进行浮点数比较，避免精度问题导致的更新失败
              const EPSILON = 0.0001;
              if (Math.abs(currentValue.x - color.r) < EPSILON && 
                  Math.abs(currentValue.y - color.g) < EPSILON && 
                  Math.abs(currentValue.z - color.b) < EPSILON) {
                console.log(`ShaderMaterial: Skipping vec3 update for ${key}, values are identical within tolerance`);
                return;
              }
              console.log(`ShaderMaterial: Updating vec3 ${key} from [${currentValue.x}, ${currentValue.y}, ${currentValue.z}] to [${color.r}, ${color.g}, ${color.b}], color:`, color);
            } else {
              console.log(`ShaderMaterial: Creating new vec3 ${key} with [${color.r}, ${color.g}, ${color.b}]`);
            }
            materialRef.current!.uniforms[key].value = new THREE.Vector3(color.r, color.g, color.b);
          }
          else if (uniform.type === 'vec4' || (typeof uniform.value === 'object' && 'r' in uniform.value && 'a' in uniform.value)) {
            const color = uniform.value as { r: number; g: number; b: number; a: number };
            if (currentValue instanceof THREE.Vector4) {
              // 使用容差值进行浮点数比较，避免精度问题导致的更新失败
              const EPSILON = 0.0001;
              if (Math.abs(currentValue.x - color.r) < EPSILON && 
                  Math.abs(currentValue.y - color.g) < EPSILON && 
                  Math.abs(currentValue.z - color.b) < EPSILON && 
                  Math.abs(currentValue.w - color.a) < EPSILON) {
                return;
              }
            }
            materialRef.current!.uniforms[key].value = new THREE.Vector4(color.r, color.g, color.b, color.a);
          }
          else {
            if (currentValue !== uniform.value) {
              materialRef.current!.uniforms[key].value = uniform.value;
            }
          }
        }
      });
    }
  }, [uniforms]);

  // 使用useFrame钩子在每一帧更新iTime
  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms.iTime) {
      materialRef.current.uniforms.iTime.value = state.clock.elapsedTime;
    }
  });

  // 根据形状选择几何体
  const geometry = useMemo(() => {
    switch (shape) {
      case 'cube':
        return <boxGeometry args={[0.9, 0.9, 0.9]} />;
      case 'sphere':
        return <sphereGeometry args={[0.7, 32, 32]} />;
      case 'plane':
      default:
        return <planeGeometry args={[1.3, 1.3]} />;
    }
  }, [shape]);

  if (!materialReady || !materialRef.current) {
    return null;
  }

  return (
    <mesh rotation={shape == 'cube'?[0.5,0.5,0]:[0, 0, 0]}>
      {geometry}
      <primitive object={materialRef.current} attach="material" />
    </mesh>
  );
};

export default ShaderMaterial;