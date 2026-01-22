import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import WatResult from '../components/WatResult';
import UnifiedNavbar from '../components/UnifiedNavbar';
import "./WatTest.css";

// Words are fetched from API now

export default function WatTest() {
    const navigate = useNavigate();

    // States: SETUP, TEST, ANALYZING, COMPLETED
    const [step, setStep] = useState('SETUP');
    const [numWords, setNumWords] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    // Dynamic Word Management
    const [availableWords, setAvailableWords] = useState([]);
    const [testWords, setTestWords] = useState([]);

    // Current Response
    const [response, setResponse] = useState('');
    const [allResponses, setAllResponses] = useState([]);

    // Evaluation Data
    const [evaluationData, setEvaluationData] = useState(null);

    const timerRef = useRef(null);

    // Fetch words on mount
    useEffect(() => {
        api.get('/wat/words')
            .then(res => {
                // Assuming res.data is array of objects { id, word } or just array of words?
                // Adjust based on seed data. Seed data was { word: "..." } object usually.
                // If seed script used prisma.create({ data: { word } }), it returns object { id, word, createdAt... }
                // So we map to string or keep object
                if (Array.isArray(res.data)) {
                    setAvailableWords(res.data.map(w => w.word));
                }
            })
            .catch(err => console.error("Failed to load WAT words", err));
    }, []);

    // Timer Logic
    useEffect(() => {
        if (step === 'TEST' && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (step === 'TEST' && timeLeft === 0) {
            handlePhaseComplete(); // Auto next
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, step]);

    const startTest = () => {
        const n = parseInt(numWords);
        const max = availableWords.length;

        if (!n || n < 1 || n > max) {
            alert(`Please enter a valid number of words (1-${max}).`);
            return;
        }

        // Shuffle words to ensure randomness
        const shuffled = [...availableWords].sort(() => 0.5 - Math.random());
        // Better shuffle (Fisher-Yates)
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        setTestWords(shuffled.slice(0, n));
        setStep('TEST');
        setCurrentIndex(0);
        startWord();
    };

    const startWord = () => {
        setResponse('');
        setTimeLeft(15); // 15 seconds per word
    };

    const [isProcessing, setIsProcessing] = useState(false);

    const handlePhaseComplete = () => {
        if (isProcessing) return;
        setIsProcessing(true);

        const currentWord = testWords[currentIndex];

        // Safety check
        if (!currentWord) {
            setIsProcessing(false);
            return;
        }

        const newEntry = { word: currentWord, response: response };

        setAllResponses(prev => [...prev, newEntry]);
    };

    // Handle transitions when responses update
    useEffect(() => {
        if (allResponses.length === 0) return; // Initial load or reset

        // Check if we just finished the last word
        if (allResponses.length === testWords.length && step === 'TEST') {
            submitEvaluation(allResponses);
        } else if (allResponses.length > 0 && allResponses.length < testWords.length && step === 'TEST') {
            // We added a response and there are more words to go
            // Advance to next word
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                startWord(); // Resets timer/response
                setIsProcessing(false); // Reset processing after transition
            }, 100);
        } else {
            // If for some reason allResponses grew but didn't trigger a transition (e.g., testWords.length is 0 or step changed)
            // We should still reset isProcessing if it was set.
            setIsProcessing(false);
        }
    }, [allResponses, testWords.length, step]); // Include step in dependency array

    // Wrapper to handle manual 'Enter'
    const handleNextWord = () => {
        handlePhaseComplete();
    };

    const submitEvaluation = async (responses) => {
        setStep('ANALYZING');
        try {
            const res = await api.post('/wat/evaluate', { responses });
            setEvaluationData(res.data);
            setStep('COMPLETED');
        } catch (error) {
            console.error("WAT Evaluation Failed", error);
            alert("Failed to evaluate responses. Please try again.");
            setStep('COMPLETED'); // Show raw results fallback or error state?
        }
    };

    // Allow user to press Enter to submit early
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleNextWord();
        }
    };

    if (step === 'SETUP') {
        if (availableWords.length === 0) {
            return (
                <div className="wat-test-container">
                    <UnifiedNavbar />
                    <div className="loading-screen text-white">Loading WAT Words...</div>
                </div>
            );
        }
        return (
            <div className="wat-test-container">
                <UnifiedNavbar />
                <div className="setup-box">
                    <h2>WAT Configuration</h2>
                    <p>Enter number of words (Max {availableWords.length})</p>
                    <input
                        type="number"
                        value={numWords}
                        onChange={(e) => setNumWords(e.target.value)}
                        placeholder="e.g. 10"
                        className="setup-input"
                    />
                    <button className="btn-start-test" onClick={startTest}>Start WAT</button>
                    <button className="btn-cancel" onClick={() => navigate('/test-mode')}>Cancel</button>
                </div>
            </div>
        );
    }

    if (step === 'ANALYZING') {
        return (
            <div className="wat-test-container">
                <UnifiedNavbar />
                <div className="text-white text-2xl font-bold animate-pulse text-center">
                    Analyzing psychological traits... <br />
                    <span className="text-sm font-normal text-gray-400">Consulting Gemini 2.5 Flash...</span>
                </div>
            </div>
        )
    }

    if (step === 'COMPLETED') {
        return (
            <div className="wat-test-container overflow-y-auto">
                <UnifiedNavbar />
                <div className="w-full max-w-6xl p-4">
                    {evaluationData ? (
                        <WatResult results={evaluationData} />
                    ) : (
                        <div className="result-box-wide">
                            <h2>Test Completed (No Analysis)</h2>
                            <div className="responses-grid">
                                {allResponses.map((item, idx) => (
                                    <div key={idx} className="grid-row">
                                        <span className="word-col">{item.word}</span>
                                        <span className="resp-col">{item.response || "-"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="text-center mt-8 pb-8">
                        <button className="btn-home" onClick={() => navigate('/candidate-home')}>Go Home</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wat-test-container">
            <UnifiedNavbar />
            <div className="test-header">
                <span>Word: {currentIndex + 1} / {testWords.length}</span>
                <span className={`timer ${timeLeft < 5 ? 'warning' : ''}`}>
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </span>
            </div>

            <div className="test-content-wat">
                <h1 className="display-word">{testWords[currentIndex]}</h1>

                <div className="input-area">
                    <input
                        type="text"
                        className="wat-input"
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Write a sentence..."
                        autoFocus
                    />
                    <p className="hint">Press Enter to skip/next or wait for timer</p>
                </div>
            </div>
        </div>
    );
}
