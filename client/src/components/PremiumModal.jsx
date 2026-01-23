import React from 'react';
import './PremiumModal.css';

const PremiumModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="premium-modal-overlay" onClick={onClose}>
            <div className="premium-modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose} disabled={isLoading}>&times;</button>

                <div className="modal-header">
                    <div className="premium-indicator"></div>
                    <h2 className="modal-title">Unlock Premium Access</h2>
                </div>

                <div className="modal-body">
                    <ul className="benefit-list">
                        <li className="benefit-item">
                            <span className="benefit-icon">❖</span>
                            <span>Unlimited WAT & TAT evaluations</span>
                        </li>
                        <li className="benefit-item">
                            <span className="benefit-icon">❖</span>
                            <span>Advanced AI performance insights</span>
                        </li>
                        <li className="benefit-item">
                            <span className="benefit-icon">❖</span>
                            <span>1-on-1 mentorship with defence experts</span>
                        </li>
                        <li className="benefit-item">
                            <span className="benefit-icon">❖</span>
                            <span>Exclusive preparation material</span>
                        </li>
                    </ul>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={isLoading}>Maybe Later</button>
                    <button
                        className="btn-primary-gold"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'UPGRADING...' : 'UPGRADE TO PREMIUM'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumModal;
