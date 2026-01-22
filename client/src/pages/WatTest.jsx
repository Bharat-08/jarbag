import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import UnifiedNavbar from '../components/UnifiedNavbar';
import './WatTest.css';
import WatResult from '../components/WatResult';

export default function WatTest() {
    const navigate = useNavigate();
    const location = useLocation();

    // Config from previous page (if any)
    const incomingConfig = location.state?.configWords;

    // States
    const [step, setStep] = useState('SETUP'); // SETUP, TEST, EVALUATING, COMPLETED
    const [availableWords, setAvailableWords] = useState([]);
    const [testWords, setTestWords] = useState([]);

    // Active Test State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15); // Standard WAT is 15s per word
    const [response, setResponse] = useState('');
    const [allResponses, setAllResponses] = useState([]);

    // Evaluation
    const [evaluationResult, setEvaluationResult] = useState(null);

    const timerRef = useRef(null);

    // 1. Fetch Words on Mount
    useEffect(() => {
        api.get('/wat/words')
            .then(res => {
                // FIX: Check if data exists and is not empty
                if (res.data && res.data.length > 0) {
                    // FIX: Map database 'word' field to frontend 'text' field
                    const normalized = res.data.map(w => ({
                        id: w.id,
                        // Handle DB format (w.word), legacy object (w.text), or raw string (w)
                        text: w.word || w.text || (typeof w === 'string' ? w : '')
                    }));
                    setAvailableWords(normalized);
                } else {
                    // Trigger catch block to use fallbacks if DB is empty
                    throw new Error("Empty word list from API");
                }
            })
            .catch(err => {
                console.warn("Using fallback WAT words:", err.message);
                // Fallback words ensures the test runs even if DB is empty
                setAvailableWords([
                    { text: "LEADER", id: "f1" }, { text: "RISK", id: "f2" },
                    { text: "FAMILY", id: "f3" }, { text: "WAR", id: "f4" },
                    { text: "LOVE", id: "f5" }, { text: "DUTY", id: "f6" },
                    { text: "SUCCESS", id: "f7" }, { text: "FAILURE", id: "f8" },
                    { text: "ARMY", id: "f9" }, { text: "TEAM", id: "f10" }
                ]);
            });
    }, []);

    // 2. Auto-Start Logic
    useEffect(() => {
        if (step === 'SETUP' && availableWords.length > 0) {
            startTest(incomingConfig || 60); // Default 60 if no config
        }
    }, [availableWords, incomingConfig, step]);

    const startTest = (count) => {
        const n = Math.min(parseInt(count), availableWords.length);
        const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, n);

        setTestWords(selected);
        setStep('TEST');
        setCurrentIndex(0);
        setTimeLeft(15);
        setResponse('');
    };

    // --- CORE LOGIC: Robust transition handling ---
    const submitTest = useCallback(async (finalResponses) => {
        // Immediately update step to prevent any further timer ticks or actions
        setStep('EVALUATING');
        try {
            const res = await api.post('/wat/evaluate', { responses: finalResponses });
            setEvaluationResult(res.data);
            setStep('COMPLETED');
        } catch (error) {
            console.error("WAT Evaluation error", error);
            setEvaluationResult({ finalScorecard: { "Reasoning Ability": 0 }, feedback: "Evaluation failed. Please check network." });
            setStep('COMPLETED');
        }
    }, []);

    const handleNextWord = useCallback(async () => {
        // Safety check: Don't proceed if we're not in TEST mode
        if (step !== 'TEST') return;

        const currentWord = testWords[currentIndex];

        // Guard against missing data to prevent crashes
        if (!currentWord) {
            console.error("WAT Critical Error: Word data missing. Ending test.");
            submitTest(allResponses);
            return;
        }

        // 1. Save current response
        const newRecord = {
            word: currentWord.text,
            response: response,
            timeTaken: 15 - timeLeft
        };

        const updatedResponses = [...allResponses, newRecord];
        setAllResponses(updatedResponses);

        // 2. Check if end of test
        if (currentIndex + 1 < testWords.length) {
            // Move to next word
            setCurrentIndex(prev => prev + 1);
            setTimeLeft(15);
            setResponse('');
        } else {
            // End of Test - Submit
            submitTest(updatedResponses);
        }
    }, [currentIndex, testWords, response, allResponses, step, timeLeft, submitTest]);

    // 3. Timer Logic
    useEffect(() => {
        if (step === 'TEST' && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (step === 'TEST' && timeLeft <= 0) {
            // Time's up! Trigger next word logic.
            handleNextWord();
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, step, handleNextWord]);

    // Handle "Enter" key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNextWord();
        }
    };

    // --- RENDER STAGES ---
    if (step === 'SETUP') {
        return (
            <div className="wat-test-container">
                <UnifiedNavbar />
                <div className="loader-container" style={{ marginTop: '10vh' }}>
                    <div className="loading-text">Initializing WAT...</div>
                    <div className="loading-sub">Loading word association set</div>
                </div>
            </div>
        );
    }

    if (step === 'EVALUATING') {
        return (
            <div className="wat-test-container">
                <UnifiedNavbar />
                <div className="loader-container" style={{ marginTop: '20vh' }}>
                    <div className="loading-text">Analyzing Responses...</div>
                    <div className="loading-sub">Please wait while we process your test.</div>
                </div>
            </div>
        );
    }

    if (step === 'COMPLETED') {
        return (
            <div className="wat-test-container">
                <UnifiedNavbar />
                <div className="result-card-wrapper">
                    <h2 className="text-3xl font-bold text-center mb-6 text-white">WAT Assessment Report</h2>
                    {evaluationResult ? (
                        <WatResult results={evaluationResult} />
                    ) : (
                        <p className="text-center text-gray-400">No evaluation generated.</p>
                    )}
                    <div className="text-center mt-8">
                        <button
                            className="btn-submit-action"
                            style={{ background: '#fbbf24', color: 'black', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                            onClick={() => navigate('/candidate-home')}
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- ACTIVE TEST RENDER ---
    return (
        <div className="wat-test-container">
            <div className="test-header-bar">
                <div className="progress-indicator">
                    <span className="progress-label">Word Progress</span>
                    <span className="progress-value">
                        {currentIndex + 1} <span style={{ color: '#64748b' }}>/</span> {testWords.length}
                    </span>
                </div>

                <div className="timer-box">
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>SECONDS LEFT</span>
                    <span className={`timer-count ${timeLeft <= 5 ? 'urgent' : ''}`}>
                        {timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </span>
                </div>

                <div className="phase-badge">QUICK REACTION</div>
            </div>

            <div className="wat-content-wrapper">
                <div className="word-display-card">
                    <h1 className="word-text">{testWords[currentIndex]?.text || "..."}</h1>
                </div>

                <div className="response-area">
                    <input
                        type="text"
                        className="wat-input"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your thought here..."
                        autoFocus
                        autoComplete="off"
                    />
                    <div className="input-hint">
                        <span>Press <strong>Enter</strong> to submit immediately</span>
                        <button className="btn-skip" onClick={handleNextWord}>Skip Word</button>
                    </div>
                </div>
            </div>
        </div>
    );
}