import React from 'react';

function LoadingScreen({ progress }) {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="logo-large">✦</div>
        <h1>XRRAI Hologram</h1>
        <p>Loading volumetric experience...</p>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

export default LoadingScreen;
