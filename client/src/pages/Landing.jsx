import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Import images
import heroEmblem from '../assets/hero_emblem.png';
import heroSoldier from '../assets/hero_soldier.png';
import ppdtSketch from '../assets/ppdt_sketch.png';
import contactNotes from '../assets/contact_notes.png';
// We can use the same sketch for WAT or a CSS gradient, but let's use the provided design idea.
// For WAT, the user design had a pink card with "WAT". I'll replicate that style.

const Landing = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="landing-page">
            {/* Header/Nav */}
            <nav className="landing-nav">
                <div className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#about">About</a>
                    <a href="#contact">Contact</a>
                    <a href="#pricing">Pricing</a>
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
                    <p className="hero-subtitle">Some content here ....</p>
                    <button className="btn-get-started" onClick={() => navigate('/signup')}>Get Started →</button>
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
                    <div className="feature-card ppdt-card">
                        <img src={ppdtSketch} alt="PPDT" className="card-bg-img" />
                        <div className="card-overlay">
                            <h3>PPDT</h3>
                        </div>
                    </div>
                    <div className="feature-card wat-card">
                        <div className="wat-content">
                            <h3>WAT</h3>
                            <h2>PRACTICE - 01</h2>
                        </div>
                        <div className="card-footer">WAT</div>
                    </div>
                </div>
            </section>

            {/* Contact Us */}
            <section id="contact" className="section-container contact-section">
                <h2 className="section-title">Contact Us</h2>
                <div className="contact-grid">
                    <div className="contact-visual">
                        <img src={contactNotes} alt="Inspirational Notes" className="contact-img" />
                    </div>
                    <div className="contact-form-container">
                        <form className="contact-form">
                            <div className="form-row">
                                <input type="text" placeholder="First name" className="input-dark" />
                                <input type="text" placeholder="Last name" className="input-dark" />
                            </div>
                            <input type="email" placeholder="you@company.com" className="input-dark full-width" />
                            <div className="phone-input full-width">
                                <span className="country-code">IN v +91</span>
                                <input type="tel" placeholder="9999999999" className="input-dark-no-border" />
                            </div>
                            <textarea placeholder="Message" className="input-dark full-width textarea-tall"></textarea>

                            <div className="checkbox-row">
                                <input type="checkbox" id="policy" />
                                <label htmlFor="policy" className="small-text">You agree to our friendly privacy policy.</label>
                            </div>

                            <button type="button" className="btn-submit-yellow">Send message</button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
