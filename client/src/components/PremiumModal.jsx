import React from 'react';
import './PremiumModal.css';

const PremiumModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="premium-modal-overlay">
            <div className="premium-modal-content">
                <button className="close-btn" onClick={onClose}>&times;</button>

                <div className="modal-header">
                    <span className="crown-icon">👑</span>
                    <h2>Unlock Premium Access</h2>
                </div>

                <p className="modal-body">
                    Get exclusive access to top-rated mentors, unlimited practice resources, and personalized guidance.
                </p>

                <ul className="premium-features">
                    <li>✨ Book 1-on-1 Sessions</li>
                    <li>✨ Access Exclusive Courses</li>
                    <li>✨ Unlimited Mock Tests</li>
                </ul>

                <button className="btn-upgrade" onClick={onConfirm}>
                    Get Premium Now →
                </button>
            </div>
        </div>
    );
};

export default PremiumModal;
