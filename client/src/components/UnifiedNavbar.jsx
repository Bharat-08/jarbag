import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import profilePlaceholder from "../assets/hero_emblem.png"; // Ensure this path is correct relative to components folder
import './UnifiedNavbar.css';

const UnifiedNavbar = ({ hideLinks = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return 'active';
        if (path !== '/' && location.pathname.startsWith(path)) return 'active';
        if (path === '/candidate-home' && (location.pathname.startsWith('/test-mode') || location.pathname.startsWith('/practice'))) return 'active';
        return '';
    };

    return (
        <>
            <nav className="unified-navbar">
                {location.pathname !== '/' && (
                    <button
                        className="unified-btn-back"
                        onClick={() => navigate(-1)}
                        title="Go Back"
                    >
                        <span className="back-arrow">←</span>
                    </button>
                )}

                {!hideLinks && (
                    <ul className="unified-links">
                        <li
                            className={isActive('/')}
                            onClick={() => navigate('/')}
                        >
                            Headquarters
                        </li>
                        <li
                            className={isActive('/candidate-home')}
                            onClick={() => navigate('/candidate-home')}
                        >
                            Training Grounds
                        </li>
                        <li
                            className={isActive('/news')}
                            onClick={() => navigate('/news')}
                        >
                            News
                        </li>
                    </ul>
                )}

                <div className="unified-profile-container" ref={dropdownRef} style={{ display: 'flex', alignItems: 'center' }}>
                    {user ? (
                        <>
                            {!user.isPremium && (
                                <button className="btn-unlock-premium" onClick={() => setIsPremiumModalOpen(true)}>
                                    <span>👑</span> Unlock Premium
                                </button>
                            )}
                            <div
                                className="unified-profile-header"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                title="Profile"
                            >
                                <span className="text-sm font-bold mr-2" style={{ color: 'white' }}>{user.name}</span>
                                <img
                                    src={profilePlaceholder}
                                    alt="profile"
                                    className="unified-top-avatar"
                                />
                            </div>

                            {isMenuOpen && (
                                <div className="unified-profile-dropdown">
                                    <div className="unified-dropdown-header">
                                        <div className="unified-user-name">{user.name}</div>
                                        <div className="unified-user-email">{user.email}</div>
                                    </div>

                                    <div className="unified-dropdown-body">
                                        <div className="unified-plan-status">
                                            <span className="unified-plan-label">Plan:</span>
                                            <span className={`unified-plan-badge ${user.isPremium ? 'premium' : 'free'}`}>
                                                {user.isPremium ? 'Premium 👑' : 'Free'}
                                            </span>
                                        </div>
                                        {user.isPremium && (
                                            <div className="unified-subscription-info">
                                                <div className="unified-sub-row">
                                                    <span>Expires:</span>
                                                    <span>{user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : 'Lifetime'}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="unified-dropdown-footer">
                                        <button className="unified-btn-logout-red" onClick={logout}>
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // Optional: Login button if needed, but for now user just wants profile hidden
                        null
                    )}
                </div>
            </nav>

            {/* PREMIUM MODAL */}
            {isPremiumModalOpen && (
                <div className="premium-modal-overlay">
                    <div className="premium-modal-content">
                        <span className="pm-icon">👑</span>
                        <h2 className="pm-title">Unlock Premium Access</h2>
                        <p className="pm-message">
                            Gain access to unlimited WAT/TAT evaluations, detailed AI analytics, 1-on-1 mentorship, and exclusive study materials.
                        </p>
                        <button
                            className="pm-btn-contact"
                            onClick={() => window.open('mailto:support@shieldforce.com?subject=Premium Access Request', '_blank')}
                        >
                            Contact for Access
                        </button>
                        <button className="pm-btn-close" onClick={() => setIsPremiumModalOpen(false)}>
                            Maybe Later
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default UnifiedNavbar;
