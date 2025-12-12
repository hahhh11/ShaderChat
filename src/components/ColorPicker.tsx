/*
 * @Author: 98Precent
 * @Date: 2025-12-10 12:48:11
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-12-12 10:22:46
 * @FilePath: /ShaderChat/src/components/ColorPicker.tsx
 */
import React, { useRef } from 'react';

interface ColorPickerProps {
  color: { r: number; g: number; b: number; a?: number };
  onChange: (color: { r: number; g: number; b: number; a?: number }) => void;
  label: string;
  showAlpha?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, showAlpha = true }) => {

  const pickerRef = useRef<HTMLDivElement>(null);

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
    if (type === 'hex' && typeof value === 'string') {
      const rgb = hexToRgb(value);
      if (showAlpha) {
        onChange({ ...rgb, a: color.a });
      } else {
        onChange(rgb);
      }
    } else if (type === 'rgba' && channel && typeof value === 'number') {
      if (showAlpha || channel !== 'a') {
        onChange({ ...color, [channel]: value });
      }
    }
  };

  return (
    <div className="color-picker-container" ref={pickerRef}>      
      <div className="color-picker-panel">
        <div className="color-picker-content">
          {/* 左侧：十六进制输入 */}
          <div className="color-input-group">
            <input
              type="color"
              value={rgbToHex(color.r, color.g, color.b)}
              onChange={(e) => handleColorChange('hex', e.target.value)}
              className="color-input-hex"
            />
          </div>
          
          {/* 右侧：RGBA滑块 */}
          <div className="color-sliders">
            <div className="color-slider-group">
              <label>R: {color.r.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={color.r}
                onChange={(e) => handleColorChange('rgba', parseFloat(e.target.value), 'r')}
                className="color-slider red-slider"
                style={{ '--progress': `${color.r * 100}%` }}
              />
            </div>
            <div className="color-slider-group">
              <label>G: {color.g.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={color.g}
                onChange={(e) => handleColorChange('rgba', parseFloat(e.target.value), 'g')}
                className="color-slider green-slider"
                style={{ '--progress': `${color.g * 100}%` }}
              />
            </div>
            <div className="color-slider-group">
              <label>B: {color.b.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={color.b}
                onChange={(e) => handleColorChange('rgba', parseFloat(e.target.value), 'b')}
                className="color-slider blue-slider"
                style={{ '--progress': `${color.b * 100}%` }}
              />
            </div>
            {showAlpha && (
              <div className="color-slider-group">
                <label>A: {color.a?.toFixed(2) || '1.00'}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={color.a || 1}
                  onChange={(e) => handleColorChange('rgba', parseFloat(e.target.value), 'a')}
                  className="color-slider alpha-slider"
                  style={{ '--progress': `${(color.a || 1) * 100}%` }}
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