import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "./CandidateHomePage.css";
// Mapping user requested images to actual existing assets
import heroImg from "../assets/hero_soldier.png";
import practiceCard from "../assets/practice_card.png";
import testCard from "../assets/test_card.png";
import trainingCard from "../assets/training_card.png";
import profilePlaceholder from "../assets/hero_emblem.png"; // Fallback for avatar

export default function CandidateHome() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="candidate-home">

            {/* TOP NAVBAR */}
            <nav className="top-navbar">
                <ul className="top-links">
                    <li>Posts</li>
                    <li>Blogs</li>
                    <li>Practice</li>
                    <li onClick={() => navigate('/news')}>News</li>
                </ul>

                <input
                    type="text"
                    placeholder="Filter Categories"
                    className="filter-input"
                />

                <div className="flex items-center gap-2 cursor-pointer" onClick={logout} title="Logout">
                    {/* Using the hero emblem or a user initial as avatar */}
                    <span className="text-sm font-bold mr-2">{user?.name}</span>
                    <img
                        src={profilePlaceholder}
                        alt="profile"
                        className="top-avatar"
                    />
                </div>
            </nav>

            {/* SECOND NAV */}
            <div className="sub-navbar">
                <span>SSB Guidance</span>
                <span>|</span>
                <span>Free Mentorship</span>
                <span>|</span>
                <span>Free Resources</span>
                <span>|</span>
                <span>SSB Courses</span>
                <span>|</span>
                <span>About Us</span>
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

                <div className="category-card" onClick={() => console.log('Practice')}>
                    <img
                        src={practiceCard}
                        alt="Practice"
                    />
                    <button className="btn practice">Practice Mode</button>
                </div>

                <div className="category-card" onClick={() => console.log('Test')}>
                    <img
                        src={testCard}
                        alt="Test"
                    />
                    <button className="btn test">Test Mode</button>
                </div>

                <div className="category-card" onClick={() => console.log('Training')}>
                    <img
                        src={trainingCard}
                        alt="Training"
                    />
                    <button className="btn training">Training Mode</button>
                </div>

            </section>
        </div>
    );
}