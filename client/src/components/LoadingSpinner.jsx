import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = true }) => {
    return (
        <div className={`spinner-container ${fullScreen ? 'fullscreen' : ''}`}>
            <div className="shield-spinner"></div>
            <p className="loading-text">Loading...</p>
        </div>
    );
};

export default LoadingSpinner;
