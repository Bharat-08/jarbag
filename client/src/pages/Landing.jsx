import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Images
import heroEmblem from '../assets/hero_emblem.png';

import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [showProfileMenu, setShowProfileMenu] = React.useState(false);
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
            navigate('/signup');
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

    return (
        <div className="landing-page">
            {/* 1. Custom ShieldForce Header */}
            <header className="shield-header">
                <a href="/" className="shield-brand">
                    <span className="brand-icon">🛡️</span>
                    <div className="brand-text">
                        <span className="brand-name">ShieldForce</span>
                        <span className="brand-tagline">Prepare. Protect. Prevail.</span>
                    </div>
                </a>

                <nav className="shield-nav">
                    <a href="#about" className="nav-link">About Us</a>
                    <a href="#offer" className="nav-link">What We Offer</a>
                    <span onClick={() => navigate('/news')} className="nav-link">News</span>
                </nav>

                <div className="header-actions">
                    {!user ? (
                        <>
                            <button className="btn-login-outline" onClick={() => navigate('/login')}>
                                Login
                            </button>
                            <div className="mentor-join-wrapper">
                                <button className="btn-join-gold" onClick={() => navigate('/mentor-registration')}>
                                    Join Us Mentors
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {!user.isPremium && (
                                <button className="btn-unlock-premium" onClick={() => navigate('/#offer')}>
                                    <span>👑</span> Unlock Premium
                                </button>
                            )}
                            <div className="profile-container-relative" style={{ position: 'relative' }} ref={landingDropdownRef}>
                                <div className="profile-container" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                                    <span className="profile-name">{user.name || 'User'}</span>
                                    <div className="profile-icon">
                                        <img src={heroEmblem} alt="Profile" />
                                    </div>
                                </div>

                                {/* Profile Dropdown Menu */}
                                {showProfileMenu && (
                                    <div className="profile-dropdown">
                                        <div className="dropdown-header">
                                            <h4>{user.name || 'User'}</h4>
                                            <span className="user-email">{user.email || 'user@shieldforce.in'}</span>
                                        </div>

                                        <div className="dropdown-divider"></div>

                                        <div className="dropdown-row">
                                            <span className="row-label">Plan:</span>
                                            <span className={`plan-badge ${user.isPremium ? 'premium' : 'free'}`}>
                                                {user.isPremium ? 'PREMIUM 👑' : 'FREE'}
                                            </span>
                                        </div>
                                        {user.isPremium && (
                                            <div className="dropdown-row">
                                                <span className="row-label">Expires:</span>
                                                <span className="row-value">{user.subscriptionEndDate ? new Date(user.subscriptionEndDate).toLocaleDateString() : 'Lifetime'}</span>
                                            </div>
                                        )}

                                        <div className="dropdown-divider"></div>

                                        <button className="btn-logout" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* 2. Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="headline-wrapper">
                        <div className="headline-line"></div>
                        <h1 className="hero-headline">
                            Do You<br />
                            Have It<br />
                            <span className="text-gold shimmer-text">In You <span className="question-mark">?</span></span>
                        </h1>
                    </div>
                    <p className="hero-subtext">
                        The nation calls for the brave. Join the elite community of defence aspirants and forge your path to the academy with ShieldForce.
                    </p>
                    <div className="cta-wrapper">
                        <button className="btn-hero-tactical" onClick={handleGetStarted}>
                            Get Started <span className="tactical-arrow">→</span>
                        </button>
                    </div>
                </div>
                <div className="hero-visual">
                    <img src={heroEmblem} alt="Defence Emblem" className="hero-emblem" />
                </div>
            </section>

            {/* 3. About Us Section */}
            <section id="about" className="shield-section about-section">
                <div className="about-grid">
                    <div className="about-text">
                        <h2 className="section-title">Who We Are<span className="text-gold">.</span></h2>
                        <p className="section-desc">
                            We are a dedicated team of veterans and experts committed to guiding the next generation of officers. ShieldForce provides a disciplined, structured environment to prepare for SSB interviews and written exams.
                        </p>
                        <h3>Mission</h3>
                        <p>To provide accessible, high-quality mentorship to every defence aspirant in India.</p>
                    </div>

                    {/* Mission Visual Placeholder */}
                    <div className="about-visual mission-placeholder">
                        <div className="mission-content">
                            <span className="mission-icon">🎯</span>
                            <h4>Our Mission</h4>
                            <p>Forging Future Leaders</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. What We Offer */}
            <section id="offer" className="shield-section">
                <h2 className="section-title">What We Offer<span className="text-gold">.</span></h2>
                <p className="section-desc">Comprehensive tools designed for your success.</p>

                <div className="offer-grid">
                    <div className="offer-card" onClick={() => navigate('/features/assessments')}>
                        <div className="card-icon">📝</div>
                        <h3>Live Assessments</h3>
                        <p>Experience realistic TAT, WAT & SRT. View examples and understand how AI analyzes your responses.</p>
                    </div>

                    <div className="offer-card" onClick={() => navigate('/features/content')}>
                        <div className="card-icon">🎥</div>
                        <h3>Expert Content</h3>
                        <p>Learn from the best. Top mentors from around the globe share exclusive strategies and insights.</p>
                    </div>

                    <div className="offer-card" onClick={() => navigate('/features/mentorship')}>
                        <div className="card-icon">🤝</div>
                        <h3>1:1 Mentorship</h3>
                        <p>Your personal roadmap to success. Click to understand our step-by-step guidance process.</p>
                    </div>
                </div>
            </section>

            {/* 5. News Preview */}
            <section id="news" className="shield-section" style={{ background: '#0a0a0a' }}>
                <h2 className="section-title">Defence Chronicles<span className="text-gold">.</span></h2>
                <p className="section-desc">Stay updated with the latest notifications and strategic affairs.</p>

                <div className="news-preview">
                    <button className="btn-news" onClick={() => navigate('/news')}>
                        Read Latest Updates →
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '2rem 6%', borderTop: '1px solid #222', textAlign: 'center', color: '#555', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} ShieldForce. All Rights Reserved. Jai Hind.
            </footer>
        </div>
    );
};

export default Landing;
