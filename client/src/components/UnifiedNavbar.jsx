import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import profilePlaceholder from "../assets/hero_emblem.png"; // Ensure this path is correct relative to components folder
import './UnifiedNavbar.css';

const UnifiedNavbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="unified-navbar">
            <ul className="unified-links">
                <li onClick={() => navigate('/practice')}>Practice</li>
                <li onClick={() => navigate('/news')}>News</li>
            </ul>

            <div className="unified-profile-container">
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    title="Profile"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <span className="text-sm font-bold mr-2" style={{ color: 'white' }}>{user?.name}</span>
                    <img
                        src={profilePlaceholder}
                        alt="profile"
                        className="unified-top-avatar"
                    />
                </div>

                {isMenuOpen && (
                    <div className="unified-profile-dropdown">
                        <div className="unified-dropdown-header">
                            <div className="unified-user-name">{user?.name}</div>
                            <div className="unified-user-email">{user?.email}</div>
                        </div>

                        <div className="unified-dropdown-body">
                            <div className="unified-plan-status">
                                <span className="unified-plan-label">Plan:</span>
                                <span className={`unified-plan-badge ${user?.isPremium ? 'premium' : 'free'}`}>
                                    {user?.isPremium ? 'Premium 👑' : 'Free'}
                                </span>
                            </div>
                            {user?.isPremium && (
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
            </div>
        </nav>
    );
};

export default UnifiedNavbar;
