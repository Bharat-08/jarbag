import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import UnifiedNavbar from '../components/UnifiedNavbar';
import "./TatTest.css";
import TatResult from '../components/TatResult';
import testImage from "../assets/test_card.png";

export default function TatTest() {
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we received configuration from the Instructions page
    const incomingConfig = location.state?.configImages;

    // States: SETUP, TEST, EVALUATING, COMPLETED
    const [step, setStep] = useState('SETUP');
    const [numImages, setNumImages] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Dynamic Image Management
    const [availableImages, setAvailableImages] = useState([]);
    const [testImages, setTestImages] = useState([]);

    // Phase: VIEW (5s), RESPOND (60s)
    const [phase, setPhase] = useState('VIEW');
    const [timeLeft, setTimeLeft] = useState(0);

    // Inputs
    const [response, setResponse] = useState('');
    const [allResponses, setAllResponses] = useState([]);

    // Evaluation Result
    const [evaluationResult, setEvaluationResult] = useState(null);

    const timerRef = useRef(null);

    // Fetch images on mount
    useEffect(() => {
        api.get('/tat/images')
            .then(res => {
                setAvailableImages(res.data);
            })
            .catch(err => {
                console.error("Failed to load TAT images", err);
                // Fallback for UI testing if backend fails
                setAvailableImages(Array(12).fill({ id: 'dummy', url: testImage }));
            });
    }, []);

    // AUTO-START LOGIC: If we have incoming config + images are loaded, start immediately
    useEffect(() => {
        if (step === 'SETUP' && incomingConfig && availableImages.length > 0) {
            console.log("Auto-starting TAT with config:", incomingConfig);

            // Logic to start test
            const n = Math.min(parseInt(incomingConfig), availableImages.length);
            const shuffled = [...availableImages].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, n);

            setTestImages(selected);
            setStep('TEST');
            setCurrentIndex(0);

            // Set initial phase manually here to ensure sync
            setPhase('VIEW');
            setTimeLeft(5);
        }
    }, [availableImages, incomingConfig, step]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    // Timer Logic
    useEffect(() => {
        if (step === 'TEST' && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (step === 'TEST' && timeLeft === 0) {
            handlePhaseComplete();
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, step, phase]);

    // Manual Start (Fallback if no config passed)
    const startTestManual = () => {
        let n = parseInt(numImages);
        const max = availableImages.length || 12;

        if (!numImages) n = Math.min(max, 12);

        if (n < 1 || n > max) {
            alert(`Please enter a valid number of images (1-${max}).`);
            return;
        }

        const shuffled = [...availableImages].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, n);

        setTestImages(selected);
        setStep('TEST');
        setCurrentIndex(0);
        startPhase('VIEW');
    };

    const startPhase = (newPhase) => {
        setPhase(newPhase);
        if (newPhase === 'VIEW') {
            setTimeLeft(5); // 5 seconds view
        } else {
            setTimeLeft(60); // 60 seconds write
            setResponse(''); // Reset input
        }
    };

    const handlePhaseComplete = () => {
        if (phase === 'VIEW') {
            startPhase('RESPOND');
        } else {
            // RESPOND phase over
            saveResponse();
        }
    };

    const saveResponse = async () => {
        // Save locally
        const currentImage = testImages[currentIndex];
        const currentStory = {
            index: currentIndex,
            text: response,
            imageId: currentImage?.id
        };
        const newResponses = [...allResponses, currentStory];
        setAllResponses(newResponses);

        const n = testImages.length;
        if (currentIndex + 1 < n) {
            // Next image
            setCurrentIndex(prev => prev + 1);
            startPhase('VIEW');
        } else {
            // Test Done
            setStep('EVALUATING');

            try {
                const res = await api.post('/tat/evaluate', {
                    stories: newResponses
                });
                setEvaluationResult(res.data);
                setStep('COMPLETED');
            } catch (error) {
                console.error("Evaluation Failed", error);
                alert("Failed to evaluate. Please try again.");
                setStep('COMPLETED');
            }
        }
    };

    const handleSubmitEarly = () => {
        if (phase === 'RESPOND') {
            handlePhaseComplete();
        }
    };

    // --- RENDER: SETUP ---
    if (step === 'SETUP') {
        // If we have incoming config, show a loader while auto-start effect kicks in
        if (incomingConfig) {
            return (
                <div className="tat-test-container">
                    <UnifiedNavbar />
                    <div className="setup-wrapper">
                        <div className="loader-container">
                            <div className="loading-text">Initializing Test...</div>
                            <div className="loading-sub">Preparing image sequence</div>
                        </div>
                    </div>
                </div>
            );
        }

        // Fallback: Show Manual Setup if accessed directly without config
        return (
            <div className="tat-test-container">
                <UnifiedNavbar />
                <div className="setup-wrapper">
                    <div className="setup-card">
                        <h2>TAT Configuration</h2>
                        <p>Thematic Apperception Test Practice</p>

                        <div className="input-group">
                            <label className="input-label">Number of Images (Max: {availableImages.length})</label>
                            <input
                                type="number"
                                value={numImages}
                                onChange={(e) => setNumImages(e.target.value)}
                                placeholder="e.g. 5"
                                className="setup-input"
                                min="1"
                                max={availableImages.length}
                            />
                        </div>

                        <div className="setup-actions">
                            <button className="btn-primary-tat" onClick={startTestManual}>
                                Start Assessment
                            </button>
                            <button className="btn-secondary-tat" onClick={() => navigate('/test-mode')}>
                                Return to Menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: EVALUATING ---
    if (step === 'EVALUATING') {
        return (
            <div className="tat-test-container">
                <UnifiedNavbar />
                <div className="setup-wrapper">
                    <div className="loader-container">
                        <div className="loading-text">fetching scores...</div>
                        <div className="loading-sub">Analyzing your psychological responses</div>
                    </div>
                </div>
            </div>
        )
    }

    // --- RENDER: COMPLETED ---
    if (step === 'COMPLETED') {
        return (
            <div className="tat-test-container">
                <UnifiedNavbar />
                <div className="result-card-wrapper">
                    <h2 className="text-3xl font-bold text-center mb-6 text-white">Assessment Report</h2>

                    {evaluationResult ? (
                        <TatResult evaluation={evaluationResult} />
                    ) : (
                        <p className="text-center text-gray-400">No evaluation generated.</p>
                    )}

                    <div className="text-center mt-12 pb-12">
                        <button
                            onClick={() => navigate('/candidate-home')}
                            style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: '#111827',
                                padding: '1rem 3rem',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                borderRadius: '12px',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3), 0 10px 15px -3px rgba(245, 158, 11, 0.2)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                            onMouseEnter={e => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 10px 25px -5px rgba(245, 158, 11, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 6px -1px rgba(245, 158, 11, 0.3), 0 10px 15px -3px rgba(245, 158, 11, 0.2)';
                            }}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDER: ACTIVE TEST ---
    return (
        <div className="tat-test-container">
            {/* STICKY HEADER */}
            <div className="test-header-bar">
                <div className="progress-indicator">
                    <span className="progress-label">Image Progress</span>
                    <span className="progress-value">
                        {currentIndex + 1} <span style={{ color: '#64748b' }}>/</span> {testImages.length}
                    </span>
                </div>

                <div className="timer-box">
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>REMAINING</span>
                    <span className={`timer-count ${timeLeft < 10 ? 'urgent' : ''}`}>
                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </span>
                </div>

                <div className={`phase-badge ${phase === 'VIEW' ? 'phase-view' : 'phase-write'}`}>
                    {phase === 'VIEW' ? 'OBSERVE' : 'WRITE STORY'}
                </div>
            </div>

            {/* TEST CONTENT */}
            <div className="tat-content-wrapper">
                {phase === 'VIEW' ? (
                    <div className="image-frame">
                        <img
                            src={testImages[currentIndex]?.url || testImage}
                            alt="Observation"
                            className="active-test-image"
                        />
                    </div>
                ) : (
                    <div className="response-container">
                        <h3 className="response-instruction">Write a story based on the image you just saw.</h3>
                        <textarea
                            className="response-textarea"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Describe what led to the situation, what is happening now, and the outcome..."
                            autoFocus
                        />
                        <div className="response-footer">
                            <button className="btn-submit-action" onClick={handleSubmitEarly}>
                                Submit & Next Image
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}