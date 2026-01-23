import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Images
import heroEmblem from '../assets/hero_emblem.png';
import PremiumModal from '../components/PremiumModal';

import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const { user, logout, upgradeToPremium } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = React.useState(false);
    const [isUpgrading, setIsUpgrading] = React.useState(false);
    const landingDropdownRef = React.useRef(null);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event) {
            if (landingDropdownRef.current && !landingDropdownRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [landingDropdownRef]);

    const handleGetStarted = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role === 'ADMIN') navigate('/admin-dashboard');
        else if (user.role === 'MENTOR') navigate('/mentor-dashboard');
        else navigate('/candidate-home');
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setShowProfileMenu(false);
    };

    const handleUpgrade = async () => {
        setIsUpgrading(true);
        try {
            await upgradeToPremium();
            setIsPremiumModalOpen(false);
        } catch (error) {
            console.error("Upgrade failed:", error);
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div className="landing-page">
            {/* 1. Header - Visually synced with UnifiedNavbar (80px, Blur, Border) */}
            <header className="landing-header">
                <div className="landing-brand" onClick={() => navigate('/')}>
                    <span className="brand-icon">🛡️</span>
                    <span className="brand-name">ShieldForce</span>
                </div>

                <nav className="landing-nav">
                    <a href="#about" className="nav-link">About</a>
                    <a href="#offer" className="nav-link">Features</a>
                    <span onClick={() => navigate('/news')} className="nav-link">News</span>
                </nav>

                <div className="landing-auth-actions">
                    {!user ? (
                        <>
                            <button className="btn-login-ghost" onClick={() => navigate('/login')}>
                                Login
                            </button>
                            <button className="btn-join-gold" onClick={() => navigate('/mentor-registration')}>
                                Join as Mentor
                            </button>
                        </>
                    ) : (
                        <div className="landing-user-controls">
                            {!user.isPremium && (
                                <button className="btn-unlock-premium" onClick={() => setIsPremiumModalOpen(true)}>
                                    <span>👑</span> Premium
                                </button>
                            )}

                            <div className="landing-profile-wrapper" ref={landingDropdownRef}>
                                <div className="landing-profile-trigger" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                                    <span className="user-name-display">{user.name || 'User'}</span>
                                    <img src={heroEmblem} alt="Profile" className="landing-avatar" />
                                </div>

                                {showProfileMenu && (
                                    <div className="landing-dropdown-menu">
                                        <div className="dropdown-user-info">
                                            <div className="u-name">{user.name || 'User'}</div>
                                            <div className="u-email">{user.email}</div>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <div className="dropdown-item">
                                            <span>Plan</span>
                                            <span className={`plan-tag ${user.isPremium ? 'premium' : 'free'}`}>
                                                {user.isPremium ? 'PRO' : 'FREE'}
                                            </span>
                                        </div>
                                        {user.isPremium && (
                                            <div className="dropdown-item date-row">
                                                <span>Expires:</span>
                                                <span className="date-val">
                                                    {user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : 'Lifetime'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="dropdown-divider"></div>
                                        <button className="btn-logout-full" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* 2. Hero Section - Synced Red/Black Gradient Background */}
            <section className="landing-hero">
                <div className="hero-text-container">
                    <h1 className="hero-title">
                        DO YOU HAVE IT<br />
                        <span className="text-highlight">IN YOU?</span>
                    </h1>
                    <p className="hero-description">
                        The nation calls for the brave. Join the elite community of defence aspirants and forge your path to the academy with ShieldForce.
                    </p>
                    <button className="btn-cta-primary" onClick={handleGetStarted}>
                        Get Started <span className="icon-arrow">→</span>
                    </button>
                </div>
                <div className="hero-image-container">
                    <img src={heroEmblem} alt="ShieldForce Emblem" className="hero-img-responsive" />
                </div>
            </section>

            {/* 3. About Section */}
            <section id="about" className="landing-section">
                <div className="section-content split-layout">
                    <div className="text-block">
                        <h2 className="section-heading">Who We Are<span className="dot-accent">.</span></h2>
                        <p className="text-body">
                            We are a dedicated team of veterans and experts committed to guiding the next generation of officers. ShieldForce provides a disciplined, structured environment to prepare for SSB interviews and written exams.
                        </p>
                        <div className="mission-highlight">
                            <h3>Our Mission</h3>
                            <p>To provide accessible, high-quality mentorship to every defence aspirant in India.</p>
                        </div>
                    </div>
                    <div className="visual-block placeholder-visual">
                        <div className="visual-center">
                            <span className="visual-emoji">🎯</span>
                            <h4>Forging Leaders</h4>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Features / Offer Section - Cards matched to Dashboard */}
            <section id="offer" className="landing-section">
                <h2 className="section-heading center-text">What We Offer<span className="dot-accent">.</span></h2>
                <p className="section-subheading center-text">Comprehensive tools designed for your success.</p>

                <div className="features-grid">
                    <div className="feature-card" onClick={() => navigate('/features/assessments')}>
                        <div className="card-icon">📝</div>
                        <h3>Live Assessments</h3>
                        <p>Experience realistic TAT, WAT & SRT. View examples and understand how AI analyzes your responses.</p>
                    </div>

                    <div className="feature-card" onClick={() => navigate('/features/content')}>
                        <div className="card-icon">🎥</div>
                        <h3>Expert Content</h3>
                        <p>Learn from the best. Top mentors from around the globe share exclusive strategies and insights.</p>
                    </div>

                    <div className="feature-card" onClick={() => navigate('/features/mentorship')}>
                        <div className="card-icon">🤝</div>
                        <h3>1:1 Mentorship</h3>
                        <p>Your personal roadmap to success. Click to understand our step-by-step guidance process.</p>
                    </div>
                </div>
            </section>

            {/* 5. News CTA */}
            <section id="news" className="landing-section news-cta-section">
                <div className="news-banner-card">
                    <div className="news-info">
                        <h2>Defence Chronicles</h2>
                        <p>Stay updated with the latest notifications and strategic affairs.</p>
                    </div>
                    <button className="btn-outline-gold" onClick={() => navigate('/news')}>
                        Read Updates
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                &copy; {new Date().getFullYear()} ShieldForce. All Rights Reserved. Jai Hind.
            </footer>

            <PremiumModal
                isOpen={isPremiumModalOpen}
                onClose={() => setIsPremiumModalOpen(false)}
                onConfirm={handleUpgrade}
                isLoading={isUpgrading}
            />
        </div>
    );
};

export default Landing;