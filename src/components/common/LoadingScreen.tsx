import React from 'react';
import './LoadingScreen.css';

const LoadingScreen: React.FC = () => {
  return (
    <div className="cyber-loading-container">
      <div className="cyber-loading-content">
        <div className="cyber-cube-wrapper">
          <div className="cyber-cube">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face right"></div>
            <div className="face left"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
        </div>
        <h2 className="glitch-text" data-text="VULN SPECTRA">VULN SPECTRA</h2>
        <div className="cyber-progress-bar">
          <div className="cyber-progress-fill"></div>
        </div>
        <p className="cyber-status-text">Initializing secure protocols...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
