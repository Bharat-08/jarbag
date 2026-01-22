import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedNavbar from '../components/UnifiedNavbar';
import './FeatureInfo.css';

export default function MentorshipInfo() {
    const navigate = useNavigate();
    return (
        <div className="feature-info-page">
            <UnifiedNavbar />
            <div className="info-container">
                <h1 className="info-title">1:1 Mentorship</h1>
                <p className="info-subtitle">Personalized guidance to polish your officer-like qualities.</p>

                <section className="info-section">
                    <h2>How It Happens</h2>
                    <div className="step-list">
                        <div className="step-item">
                            <span className="step-num">1</span>
                            <p><strong>Browse Profiles:</strong> View detailed profiles of mentors, their background, and expertise.</p>
                        </div>
                        <div className="step-item">
                            <span className="step-num">2</span>
                            <p><strong>Book a Slot:</strong> Choose a time that works for you for a video call or chat session.</p>
                        </div>
                        <div className="step-item">
                            <span className="step-num">3</span>
                            <p><strong>Get Feedback:</strong> Receive personalized feedback on your psych results, interview answers, and overall demeanor.</p>
                        </div>
                    </div>
                </section>

                <button className="btn-action-gold" onClick={() => navigate('/mentor-listing')}>
                    Find Your Mentor
                </button>
            </div>
        </div>
    );
}
