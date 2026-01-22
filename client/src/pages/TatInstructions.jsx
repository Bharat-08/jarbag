import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "./TatInstructions.css";
import profilePlaceholder from "../assets/hero_emblem.png"; // or user avatar

export default function TatInstructions() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="tat-instructions-page">
            {/* TOP NAVBAR (Reused structure) */}
            <nav className="top-navbar">
                <div className="flex items-center">
                    {/* Logo placeholder if needed */}
                </div>
                <ul className="top-links">
                    <li onClick={() => navigate('/practice')}>Practice</li>
                    <li onClick={() => navigate('/news')}>News</li>
                </ul>
                {/* Filter Input Removed */}
                <div className="flex items-center gap-2 cursor-pointer" onClick={logout} title="Logout">
                    <span className="text-sm font-bold mr-2">{user?.name}</span>
                    <img src={profilePlaceholder} alt="profile" className="top-avatar" />
                </div>
            </nav>

            {/* MAIN CONTENT */}
            <div className="content-container">
                <h1 className="title">TEST MODE (SET 1) <span className="highlight">TAT</span></h1>

                <div className="instruction-block">
                    <h2 className="section-label">Ques:</h2>
                    <p className="intro-text">Get ready Dear Aspirant,</p>
                    <p className="main-text">
                        In the upcoming test session you will be having <span className="highlight">11 photos</span> on which you need to frame and write a story.
                    </p>
                </div>

                <div className="instruction-block">
                    <h2 className="section-label">Instructions:</h2>
                    <ul className="instruction-list">
                        <li>-<span className="highlight">Each photo</span> will be displayed for <span className="highlight">30 seconds</span> and you will have <span className="highlight">4 minutes to write your story.</span></li>
                        <li>-You may skip the photos but <span className="highlight">test once started cannot be paused</span> it will end only till you reach the last photo.</li>
                        <li>-In the last you will have a <span className="highlight">blank slide</span> in which you need to write your own story.</li>
                    </ul>
                </div>

                <div className="instruction-block">
                    <h2 className="section-label">For example -</h2>
                    <p className="main-text">You may write anything or describe any event of your life in form of a story.</p>
                </div>

                {/* BOTTOM BUTTONS */}
                <div className="footer-buttons">
                    <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
                    <button className="btn-start" onClick={() => navigate('/test-mode/tat/active')}>Take Test</button>
                </div>
            </div>
        </div>
    );
}
