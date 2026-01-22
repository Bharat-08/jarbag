import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import images
import heroEmblem from '../assets/hero_emblem.png';
import heroSoldier from '../assets/hero_soldier.png';
import ppdtSketch from '../assets/ppdt_sketch.png';

// We can use the same sketch for WAT or a CSS gradient, but let's use the provided design idea.
// For WAT, the user design had a pink card with "WAT". I'll replicate that style.
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleGetStarted = () => {
        if (!user) {
            navigate('/signup');
            return;
        }

        // Redirect based on role
        if (user.role === 'ADMIN') {
            navigate('/admin-dashboard');
        } else if (user.role === 'MENTOR') {
            navigate('/mentor-dashboard');
        } else if (user.role === 'CANDIDATE') {
            navigate('/candidate-home');
        } else {
            navigate('/news');
        }
    };

    return (
        <div className="landing-page">
            {/* Header/Nav */}
            <nav className="landing-nav">
                <div className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#about">About</a>

                    {/* Pricing removed as per user request */}
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate('/news'); }}>Daily Defence Updates</a>
                    {(!user || user.role !== 'CANDIDATE') && (
                        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/mentor-registration'); }} style={{ color: '#fbbf24' }}>Join Us</a>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (user) {
                            logout();
                        } else {
                            navigate('/login');
                        }
                    }}
                    className="btn-login-yellow"
                >
                    {user ? "Logout" : "Login / Sign Up"}
                </button>
            </nav>

            {/* Hero Section */}
            <section id="home" className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Do you have it<br />
                        in you <span className="text-red">?</span>
                    </h1>
                    {/* Subtitle removed */}
                    <button className="btn-get-started" onClick={handleGetStarted}>Get Started →</button>
                </div>
                <div className="hero-image-container">
                    <img src={heroEmblem} alt="Defence Emblem" className="hero-emblem" />
                </div>
            </section>

            {/* Banner Strip */}
            <div className="banner-strip">
                {/* This would be the parade image strip from the design. 
              We can use the hero_soldier image repeated or just one wide crop if available, 
              but for now let's use a CSS placeholder or the soldier image as a banner background.
          */}
                <img src={heroSoldier} alt="Parade" className="banner-img" />
            </div>

            {/* Who We Are */}
            <section id="about" className="section-container who-we-are">
                <div className="text-content">
                    <h2 className="section-title">Who we are <span className="text-red">?</span></h2>
                    <h3 className="section-subtitle">
                        SSB GUIDANCE | FREE MENTORSHIP | FREE RESOURCES | EXPERT TALKS | MOTIVATION
                    </h3>
                    <p className="section-desc">
                        We along with few veterans are taking up an initiative of providing free mentoring and coaching for Defence exam preparation and SSB interview.
                        Stay tuned with us a lot is there for you all Dear Aspirants that will get you to the doors of the Academy.
                    </p>
                </div>
                <div className="image-content">
                    <img src={heroSoldier} alt="Soldier Saluting" className="about-img" />
                </div>
            </section>

            {/* What do we have */}
            <section className="section-container features-section">
                <h2 className="section-title">What do we have ?</h2>
                <div className="cards-grid">
                    {/* Card 1: Practice Videos */}
                    <div className="feature-card practice-card" onClick={() => navigate('/practice')}>
                        <div className="card-content">
                            <h3>Practice Videos</h3>
                            <p>Watch and learn from expert clips.</p>
                        </div>
                    </div>

                    {/* Card 2: Test */}
                    <div className="feature-card test-card" onClick={() => navigate('/test-mode')}>
                        <div className="card-content">
                            <h3>Test</h3>
                            <p>Take TAT, WAT and other tests.</p>
                        </div>
                    </div>

                    {/* Card 3: 1:1 Mentorship */}
                    <div className="feature-card mentorship-card" onClick={() => navigate('/mentor-listing')}>
                        <div className="card-content">
                            <h3>1:1 Mentorship</h3>
                            <p>Connect with experts for guidance.</p>
                        </div>
                    </div>
                </div>
            </section>


        </div>
    );
};

export default Landing;
