import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UnifiedNavbar from '../components/UnifiedNavbar';
import "./TestMode.css";
// Reusing assets
import heroImg from "../assets/hero_soldier.png";
import testCard from "../assets/test_card.png"; // Fallback for TAT/WAT if specific ones not available
import profilePlaceholder from "../assets/hero_emblem.png";

export default function TestMode() {
    const navigate = useNavigate();
    // const { user, logout } = useAuth();
    // const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="candidate-home">
            {/* UNIFIED NAVBAR */}
            <UnifiedNavbar />

            {/* SUB NAV */}
            {/* SUB NAV - Removed */}

            {/* HERO IMAGE */}
            <section className="hero-banner relative">
                <img src={heroImg} alt="parade" />

            </section>

            {/* MAIN CONTENT */}
            <div className="test-mode-container">
                <h2 className="page-heading">TEST MODE</h2>

                <div className="test-cards-grid">
                    {/* TAT Card */}
                    <div className="test-card-wrapper" onClick={() => navigate('/test-mode/tat')}>
                        <div className="test-card-border bg-gray-700">
                            <img src={testCard} alt="TAT" />
                        </div>
                        <div className="test-footer-tat">
                            THEMATIC APPRECIATION TEST (TAT)
                        </div>
                    </div>

                    {/* WAT Card */}
                    <div className="test-card-wrapper" onClick={() => navigate('/test-mode/wat/active')}>
                        <div className="test-card-border bg-gray-700">
                            <img src={testCard} alt="WAT" />
                        </div>
                        <div className="test-footer-wat">
                            WORD ASSOCIATION TEST (WAT)
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
