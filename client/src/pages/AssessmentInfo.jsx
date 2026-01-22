import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedNavbar from '../components/UnifiedNavbar';
import './FeatureInfo.css'; // Shared styles

export default function AssessmentInfo() {
    const navigate = useNavigate();
    return (
        <div className="feature-info-page">
            <UnifiedNavbar />
            <div className="info-container">
                <h1 className="info-title">Live Assessments</h1>
                <p className="info-subtitle">Master the psychology of defence exams with AI-driven tools.</p>

                <section className="info-section">
                    <h2>Thematic Apperception Test (TAT)</h2>
                    <p>You will be shown ambiguous images and asked to write a story. Our AI analyzes your psychometric traits.</p>
                    <div className="example-box">
                        <strong>Example:</strong>
                        <p><em>Image: A boy sitting alone looking at the sky.</em></p>
                        <p><strong>Response:</strong> Raju, a tailored student, helps his father in the fields...</p>
                    </div>
                </section>

                <section className="info-section">
                    <h2>Word Association Test (WAT)</h2>
                    <p>Respond to words instantly to reveal your subconscious patterns.</p>
                    <div className="example-box">
                        <strong>Example:</strong>
                        <p>Word: <strong>War</strong></p>
                        <p>Response: <strong>Leads to peace.</strong></p>
                    </div>
                </section>

                <button className="btn-action-gold" onClick={() => navigate('/test-mode')}>
                    Start Taking Tests
                </button>
            </div>
        </div>
    );
}
