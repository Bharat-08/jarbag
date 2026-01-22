import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedNavbar from '../components/UnifiedNavbar';
import './FeatureInfo.css';

export default function ContentInfo() {
    const navigate = useNavigate();
    return (
        <div className="feature-info-page">
            <UnifiedNavbar />
            <div className="info-container">
                <h1 className="info-title">Expert Content</h1>
                <p className="info-subtitle">Curated by the best minds in defence training.</p>

                <section className="info-section">
                    <h2>Global Mentorship Network</h2>
                    <p>
                        We host content from the best mentors from all over the world.
                        Retired officers, psychologists, and successful candidates share their
                        strategies, lecturettes, and group discussion tips.
                    </p>
                </section>

                <section className="info-section">
                    <h2>What You'll Find</h2>
                    <ul>
                        <li>Video Lectures on Current Affairs</li>
                        <li>Mock Interview Deconstructions</li>
                        <li>PP&DT Practice Scenarios</li>
                    </ul>
                </section>

                <button className="btn-action-gold" onClick={() => navigate('/practice')}>
                    Browse Video Content
                </button>
            </div>
        </div>
    );
}
