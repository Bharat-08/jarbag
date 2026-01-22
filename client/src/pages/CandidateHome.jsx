import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UnifiedNavbar from '../components/UnifiedNavbar';
import "./CandidateHomePage.css";
// Mapping user requested images to actual existing assets
import heroImg from "../assets/hero_soldier.png";
import practiceCard from "../assets/practice_card.png";
import testCard from "../assets/test_card.png";
import trainingCard from "../assets/training_card.png";
import profilePlaceholder from "../assets/hero_emblem.png"; // Fallback for avatar

export default function CandidateHome() {
    const navigate = useNavigate();
    // const { user, logout } = useAuth(); // Removed as handled in UnifiedNavbar
    // const [isMenuOpen, setIsMenuOpen] = React.useState(false); // Removed

    return (
        <div className="candidate-home">

            {/* TOP NAVBAR */}
            {/* UNIFIED NAVBAR */}
            <UnifiedNavbar />

            {/* SECOND NAV */}
            {/* SECOND NAV - Removed as per user request */}
            <div className="sub-navbar" style={{ display: 'none' }}>
            </div>

            {/* HERO IMAGE */}
            <section className="hero-banner">
                <img
                    src={heroImg}
                    alt="parade"
                />
            </section>

            {/* HEADING */}
            <h1 className="page-title">Select a desired category</h1>

            {/* CATEGORY CARDS */}
            <section className="category-section">

                {/* Practice Mode Card */}
                <div className="category-card" onClick={() => navigate('/practice')}>
                    <img
                        src={practiceCard}
                        alt="Practice"
                    />
                    <button className="btn practice">Practice Mode</button>
                </div>

                {/* Test Mode Card */}
                <div className="category-card" onClick={() => navigate('/test-mode')}>
                    <img
                        src={testCard}
                        alt="Test"
                    />
                    <button className="btn test">Test Mode</button>
                </div>

                {/* 1:1 Mentorship Card (Synced with Landing) */}
                <div className="category-card mentorship-home-card" onClick={() => navigate('/mentor-listing')}>
                    <div className="mentorship-content">
                        <h3>1:1 Mentorship</h3>
                        <p>Connect with experts for guidance.</p>
                    </div>
                </div>

            </section>
        </div>
    );
}