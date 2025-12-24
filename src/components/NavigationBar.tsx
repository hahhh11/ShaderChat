/*
 * @Author: 98Precent
 * @Date: 2025-12-08 17:34:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-12-23 14:49:12
 * @FilePath: /ShaderChat/src/components/NavigationBar.tsx
 */
import React from 'react';

interface NavigationBarProps {
  onLoadVec3Shader?: () => void;
  onHistoryClick?: () => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ onHistoryClick }) => {
  return (
    <nav className="navigation-bar">
      <div className="nav-brand">
        <h1>ShaderChat</h1>
      </div>
      <div className="nav-links">
        {/* <button className="nav-btn">File</button>
        <button className="nav-btn">Edit</button>
        <button className="nav-btn">View</button>
        <button className="nav-btn">Help</button> */}
      </div>
      <div className="nav-actions">
        <button 
          className="nav-btn" 
          onClick={onHistoryClick}
          title="查看历史记录"
        >
          <span className="fas fa-history"></span>
        </button>
        {/* <button className="nav-btn primary">Export</button>
        <button className="nav-btn">Settings</button> */}
      </div>
    </nav>
  );
};

export default NavigationBar;