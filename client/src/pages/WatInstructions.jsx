import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedNavbar from '../components/UnifiedNavbar';
import api from '../api/axios';
import './WatInstructions.css';

export default function WatInstructions() {
    const navigate = useNavigate();
    const [numWords, setNumWords] = useState(2);
    const [maxWords, setMaxWords] = useState(100); // Default fallback
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await api.get('/wat/words');
                if (res.data && Array.isArray(res.data)) {
                    setMaxWords(res.data.length);
                    // Adjust default if db has fewer words
                    if (res.data.length < 2) setNumWords(res.data.length);
                }
            } catch (err) {
                console.error("Failed to fetch WAT words count", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCount();
    }, []);

    const handleStart = () => {
        const n = parseInt(numWords);
        if (isNaN(n) || n < 1) {
            setError("Please enter a valid number (minimum 1).");
            return;
        }
        if (n > maxWords) {
            setError(`Only ${maxWords} words are available. Please reduce the count.`);
            return;
        }

        navigate('/test-mode/wat/active', {
            state: { configWords: n }
        });
    };

    return (
        <div className="wat-inst-container">
            <UnifiedNavbar />

            <div className="inst-content-wrapper">
                <div className="inst-card">
                    <div className="inst-header">
                        <h1 className="inst-title">Word Association Test</h1>
                        <span className="inst-subtitle">Psychological Reaction Assessment</span>
                    </div>

                    <div className="inst-grid">
                        {/* LEFT: INSTRUCTIONS */}
                        <div className="guide-section">
                            <h3>Assessment Guidelines</h3>
                            <ul className="guide-list">
                                <li className="guide-item">
                                    <span className="guide-icon">1</span>
                                    <div className="guide-text">
                                        <h4>Observe the Word</h4>
                                        <p>A word will be displayed on the screen for 15 seconds. Read it carefully.</p>
                                    </div>
                                </li>
                                <li className="guide-item">
                                    <span className="guide-icon">2</span>
                                    <div className="guide-text">
                                        <h4>Type Response</h4>
                                        <p>Type the very first thought or sentence that comes to your mind. Do not overthink.</p>
                                    </div>
                                </li>
                                <li className="guide-item">
                                    <span className="guide-icon">3</span>
                                    <div className="guide-text">
                                        <h4>Speed is Key</h4>
                                        <p>The system will auto-advance after 15 seconds. If you finish early, press Enter.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* RIGHT: CONFIG & START */}
                        <div className="action-section">
                            <div className="config-box">
                                <label className="config-label">Number of Words (Max: {maxWords})</label>
                                <input
                                    type="number"
                                    className="config-input"
                                    value={numWords}
                                    onChange={(e) => {
                                        setNumWords(e.target.value);
                                        setError('');
                                    }}
                                    min="1"
                                    max={maxWords}
                                    placeholder={`1 - ${maxWords}`}
                                />
                                {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '5px' }}>{error}</p>}
                            </div>

                            <button className="btn-start-inst" onClick={handleStart} disabled={loading}>
                                {loading ? 'Loading Resources...' : 'Begin Assessment'}
                            </button>

                            <button className="btn-back-inst" onClick={() => navigate('/test-mode')}>
                                Cancel & Return
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}