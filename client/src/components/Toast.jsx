import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div className={`toast-notification toast-${type}`}>
            <span className="toast-icon">
                {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <p>{message}</p>
            <button className="toast-close" onClick={onClose}>×</button>
        </div>
    );
};

export default Toast;
