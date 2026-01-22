import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UnifiedNavbar from '../components/UnifiedNavbar';
import api from '../api/axios';
import PremiumModal from '../components/PremiumModal';
import LoadingSpinner from '../components/LoadingSpinner';
import "./TestMode.css";
// Reusing assets
import heroImg from "../assets/hero_soldier.png";
import testCard from "../assets/test_card.png";

export default function TestMode() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [usage, setUsage] = useState({ isPremium: false, tatCount: 0, watCount: 0, limit: 2 });
    const [loading, setLoading] = useState(true);
    const [showPremium, setShowPremium] = useState(false);

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const res = await api.get('/usage/status');
                setUsage(res.data);
            } catch (err) {
                console.error("Failed to fetch usage:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsage();
    }, []);

    const handleTestClick = (testType, count) => {
        if (!usage.isPremium && count >= usage.limit) {
            setShowPremium(true);
            return;
        }
        navigate(`/test-mode/${testType}`);
    };

    // Helper to render attempts badge
    const renderAttempts = (count) => {
        if (usage.isPremium) return <span className="attempt-badge premium">Unlimited 👑</span>;
        const left = Math.max(0, usage.limit - count);
        return (
            <span className={`attempt-badge ${left === 0 ? 'zero' : ''}`}>
                {left} Attempts Left
            </span>
        );
    };

    const isLocked = (count) => !usage.isPremium && count >= usage.limit;

    if (loading) return <LoadingSpinner />;

    return (
        <div className="candidate-home">
            {/* UNIFIED NAVBAR */}
            <UnifiedNavbar />

            {/* HERO IMAGE */}
            <section className="hero-banner relative">
                <img src={heroImg} alt="parade" />
            </section>

            {/* MAIN CONTENT */}
            <div className="test-mode-container">
                <div className="test-header-row">
                    <h2 className="page-heading">TEST MODE</h2>
                    {!usage.isPremium && (
                        <div className="free-limit-alert">
                            Free Plan: {usage.limit} attempts per test
                        </div>
                    )}
                    <button className="btn-view-history" onClick={() => navigate('/test-history')}>
                        <span>📜</span> View Previous Tests
                    </button>
                </div>

                <div className="test-cards-grid">
                    {/* TAT Card */}
                    <div
                        className={`test-card-wrapper ${isLocked(usage.tatCount) ? 'locked' : ''}`}
                        onClick={() => handleTestClick('tat', usage.tatCount)}
                    >
                        <div className="test-card-border bg-gray-700">
                            <img src={testCard} alt="TAT" />
                            {isLocked(usage.tatCount) && (
                                <div className="card-lock-overlay">
                                    <span>🔒 Premium Only</span>
                                </div>
                            )}
                        </div>
                        <div className="test-footer-tat">
                            THEMATIC APPERCEPTION TEST (TAT)
                            <div className="attempt-row">{renderAttempts(usage.tatCount)}</div>
                        </div>
                    </div>

                    {/* WAT Card */}
                    <div
                        className={`test-card-wrapper ${isLocked(usage.watCount) ? 'locked' : ''}`}
                        onClick={() => handleTestClick('wat', usage.watCount)}
                    >
                        <div className="test-card-border bg-gray-700">
                            <img src={testCard} alt="WAT" />
                            {isLocked(usage.watCount) && (
                                <div className="card-lock-overlay">
                                    <span>🔒 Premium Only</span>
                                </div>
                            )}
                        </div>
                        <div className="test-footer-wat">
                            WORD ASSOCIATION TEST (WAT)
                            <div className="attempt-row">{renderAttempts(usage.watCount)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <PremiumModal
                isOpen={showPremium}
                onClose={() => setShowPremium(false)}
                onConfirm={() => navigate('/premium')}
            />
        </div>
    );
}