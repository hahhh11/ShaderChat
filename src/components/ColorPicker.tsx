/*
 * @Author: 98Precent
 * @Date: 2025-12-10 12:48:11
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-12-23 17:05:06
 * @FilePath: /ShaderChat/src/components/ColorPicker.tsx
 */
import React, { useRef } from 'react';

interface ColorPickerProps {
  color: { r: number; g: number; b: number; a?: number };
  onChange: (color: { r: number; g: number; b: number; a?: number }) => void;
  label: string;
  showAlpha?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, showAlpha = true, label }) => {

 // 创建本地颜色副本，避免直接修改props - 确保总是有有效的颜色值
 const localColor = React.useMemo(() => {
   const defaultColor = showAlpha ? { r: 1, g: 1, b: 1, a: 1 } : { r: 1, g: 1, b: 1 };
   
   // 如果color无效，返回默认颜色
   if (!color || typeof color !== 'object') {
     console.warn(`ColorPicker: Invalid color prop for ${label}, using default`, color);
     return defaultColor;
   }
   
   // 创建颜色副本并处理可能的Vector3格式（x,y,z）
   const colorCopy = { ...color };
   
   // 处理Vector3格式（x,y,z -> r,g,b）
   if ('x' in colorCopy && typeof colorCopy.x === 'number') colorCopy.r = colorCopy.x as number;
   if ('y' in colorCopy && typeof colorCopy.y === 'number') colorCopy.g = colorCopy.y as number;
   if ('z' in colorCopy && typeof colorCopy.z === 'number') colorCopy.b = colorCopy.z as number;
   
   // 确保所有颜色分量都是有效数字
   const validatedColor = {
     r: typeof colorCopy.r === 'number' && !isNaN(colorCopy.r) ? Math.max(0, Math.min(1, colorCopy.r)) : 1,
     g: typeof colorCopy.g === 'number' && !isNaN(colorCopy.g) ? Math.max(0, Math.min(1, colorCopy.g)) : 1,
     b: typeof colorCopy.b === 'number' && !isNaN(colorCopy.b) ? Math.max(0, Math.min(1, colorCopy.b)) : 1,
     ...(showAlpha && { a: typeof colorCopy.a === 'number' && !isNaN(colorCopy.a) ? Math.max(0, Math.min(1, colorCopy.a)) : 1 })
   };
   
   console.log(`ColorPicker: Validated color for ${label}:`, validatedColor, 'from original:', color);
   return validatedColor;
 }, [color, label, showAlpha]);

  const pickerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useRef(`color-picker-${Math.random().toString(36).substr(2, 9)}`);

  // 将RGB值转换为十六进制
  const rgbToHex = (r: number, g: number, b: number): string => {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // 将十六进制转换为RGB
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  };

  // 处理颜色变化
  const handleColorChange = (type: 'hex' | 'rgba', value: string | number, channel?: 'r' | 'g' | 'b' | 'a') => {
    console.log(`ColorPicker handleColorChange - type: ${type}, value: ${value}, channel: ${channel}, localColor:`, localColor);
    
    if (type === 'hex' && typeof value === 'string') {
      const rgb = hexToRgb(value);
      const newColor = showAlpha ? { ...rgb, a: localColor.a } : rgb;
      console.log(`ColorPicker onChange called with:`, newColor);
      
      // 验证颜色有效性
      if (newColor && typeof newColor.r === 'number' && typeof newColor.g === 'number' && typeof newColor.b === 'number') {
        onChange(newColor);
      } else {
        console.error(`ColorPicker: Invalid color generated from hex:`, newColor);
      }
      
    } else if (type === 'rgba' && channel && typeof value === 'number') {
      if (showAlpha || channel !== 'a') {
        const newColor = { ...localColor, [channel]: value };
        console.log(`ColorPicker onChange called with:`, newColor);
        
        // 验证颜色有效性
        if (newColor && typeof newColor.r === 'number' && typeof newColor.g === 'number' && typeof newColor.b === 'number') {
          // 确保alpha通道也是有效数字（如果需要）
          if (showAlpha && (typeof newColor.a !== 'number' || isNaN(newColor.a))) {
            newColor.a = 1;
          }
          onChange(newColor);
        } else {
          console.error(`ColorPicker: Invalid color generated from RGBA slider:`, newColor);
        }
      }
    }
  };
  
  return (
   
    <div className="color-picker-container" ref={pickerRef} data-color-picker-id={uniqueId.current}>      
      <div className="color-picker-panel">
        <div className="color-picker-content">
          {/* 左侧：十六进制输入 */}
          <div className="color-input-group">
            <input
              type="color"
              value={rgbToHex(localColor.r, localColor.g, localColor.b)}
              onChange={(e) => handleColorChange('hex', e.target.value)}
              className="color-input-hex"
            />
          </div>
          
          {/* 右侧：RGBA滑块 */}
          <div className="color-sliders">
            <div className="color-slider-group">
              <label>R: {localColor.r.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={localColor.r}
                onChange={(e) => handleColorChange('rgba', parseFloat(e.target.value), 'r')}
                className="color-slider red-slider"
                style={{ '--progress': `${localColor.r * 100}%` }}
              />
            </div>
            <div className="color-slider-group">
              <label>G: {localColor.g.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={localColor.g}
                onChange={(e) => handleColorChange('rgba', parseFloat(e.target.value), 'g')}
                className="color-slider green-slider"
                style={{ '--progress': `${localColor.g * 100}%` }}
              />
            </div>
            <div className="color-slider-group">
              <label>B: {localColor.b.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={localColor.b}
                onChange={(e) => handleColorChange('rgba', parseFloat(e.target.value), 'b')}
                className="color-slider blue-slider"
                style={{ '--progress': `${localColor.b * 100}%` }}
              />
            </div>
            {showAlpha && (
              <div className="color-slider-group">
                <label>A: {localColor.a?.toFixed(2) || '1.00'}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={localColor.a || 1}
                  onChange={(e) => handleColorChange('rgba', parseFloat(e.target.value), 'a')}
                  className="color-slider alpha-slider"
                  style={{ '--progress': `${(localColor.a || 1) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;