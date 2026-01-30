import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import profilePlaceholder from "../assets/hero_emblem.png"; // Ensure this path is correct relative to components folder
import PremiumModal from './PremiumModal';
import './UnifiedNavbar.css';

const UnifiedNavbar = ({ hideLinks = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, upgradeToPremium } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isUpgrading, setIsUpgrading] = useState(false);
    const dropdownRef = React.useRef(null);

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            await upgradeToPremium();
            setIsPremiumModalOpen(false);
            // Optionally add toast success here
        } catch (error) {
            console.error("Upgrade failed:", error);
            // Optionally add toast error here
        } finally {
            setIsUpgrading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true }); // Explicit navigation to clear history state
    };

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
                                        <button className="unified-btn-logout-red" onClick={handleLogout}>
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
            <PremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                onConfirm={handleUpgrade}
                isLoading={isUpgrading}
            />
        </>
    );
};

export default UnifiedNavbar;
