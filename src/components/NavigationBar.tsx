/*
 * @Author: 98Precent
 * @Date: 2025-12-08 17:34:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2025-12-09 09:37:32
 * @FilePath: /ShaderChat/src/components/NavigationBar.tsx
 */
import React from 'react';

const NavigationBar: React.FC = () => {
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
        {/* <button className="nav-btn primary">Theme</button> */}
        {/* <button className="nav-btn primary">Export</button>
        <button className="nav-btn">Settings</button> */}
      </div>
    </nav>
  );
};

export default NavigationBar;