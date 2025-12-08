import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ResizableDividerProps {
  onResize: (delta: number) => void;
  minLeftWidth?: number;
  minRightWidth?: number;
  className?: string;
}

const ResizableDivider: React.FC<ResizableDividerProps> = ({
  onResize,
  minLeftWidth = 200,
  minRightWidth = 300,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const dividerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startLeftWidthRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    
    // 获取左侧容器的当前宽度
    const container = dividerRef.current?.parentElement;
    if (container) {
      const leftPanel = container.querySelector('#editor-panel') as HTMLElement;
      if (leftPanel) {
        startLeftWidthRef.current = leftPanel.offsetWidth;
      }
    }
    
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startXRef.current;
    const newLeftWidth = startLeftWidthRef.current + deltaX;
    
    // 检查最小宽度限制
    const container = dividerRef.current?.parentElement;
    if (container) {
      const totalWidth = container.offsetWidth;
      const rightWidth = totalWidth - newLeftWidth;
      
      if (newLeftWidth >= minLeftWidth && rightWidth >= minRightWidth) {
        onResize(deltaX);
      }
    }
  }, [isDragging, onResize, minLeftWidth, minRightWidth]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={dividerRef}
      className={`resizable-divider ${className} ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      style={{
        width: '4px',
        background: isDragging ? '#007acc' : '#333',
        cursor: 'col-resize',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        zIndex: 1000,
        userSelect: 'none'
      }}
    />
  );
};

export default ResizableDivider;