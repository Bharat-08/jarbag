import React from 'react';
import './PremiumModal.css';

const PremiumModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="premium-modal-overlay" onClick={onClose}>
            <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>

                <div className="modal-icon">👑</div>
                <h2 className="modal-title">Unlock Premium Access</h2>
                <p className="modal-description">
                    Get instant access to all exclusive video lectures and study improvements.
                    Upgrade now for free!
                </p>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Maybe Later</button>
                    <button className="btn-confirm-premium" onClick={onConfirm}>
                        Upgrade Instantly
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumModal;
