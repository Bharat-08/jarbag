import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import UnifiedNavbar from '../components/UnifiedNavbar';
import "./TatTest.css";
import TatResult from '../components/TatResult'; // Import Result Component
// Reuse test card or placeholder image for the test
import testImage from "../assets/test_card.png";

export default function TatTest() {
    const navigate = useNavigate();

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
            .then(res => setAvailableImages(res.data))
            .catch(err => console.error("Failed to load TAT images", err));
    }, []);

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

    const startTest = () => {
        const n = parseInt(numImages);
        const max = availableImages.length;

        if (!n || n < 1 || n > max) {
            alert(`Please enter a valid number of images (1-${max}).`);
            return;
        }

        // Shuffle and pick n images
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
        // Save locally - Store the correct image ID with the response
        const currentImage = testImages[currentIndex];
        const currentStory = {
            index: currentIndex,
            text: response,
            imageId: currentImage.id
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
            setStep('EVALUATING'); // Show loading

            try {
                // For demo, we evaluate the LAST written story using its SPECIFIC image ID
                const res = await api.post('/tat/evaluate', {
                    stories: newResponses // Send FULL list of stories
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

    if (step === 'SETUP') {
        return (
            <div className="tat-test-container">
                <UnifiedNavbar />
                <div className="setup-box">
                    <h2>Configuration</h2>
                    <p>Enter number of images (Max {availableImages.length})</p>
                    <input
                        type="number"
                        value={numImages}
                        onChange={(e) => setNumImages(e.target.value)}
                        placeholder={`e.g. ${Math.min(10, availableImages.length)}`}
                        className="setup-input"
                    />
                    <button className="btn-start-test" onClick={startTest}>Start TAT</button>
                    <button className="btn-cancel" onClick={() => navigate('/test-mode/tat')}>Cancel</button>
                </div>
            </div>
        );
    }

    if (step === 'EVALUATING') {
        return (
            <div className="tat-test-container">
                <UnifiedNavbar />
                <div className="text-white text-2xl font-bold animate-pulse">
                    Evaluating your psych profile... <br />
                    <span className="text-sm font-normal text-gray-400">Consulting Gemini AI Assessor...</span>
                </div>
            </div>
        )
    }

    if (step === 'COMPLETED') {
        return (
            <div className="tat-test-container overflow-y-auto">
                <UnifiedNavbar />
                <div className="result-box w-full max-w-4xl p-6">
                    <h2 className="text-3xl font-bold text-center mb-6">Test Completed</h2>

                    {evaluationResult ? (
                        <TatResult evaluation={evaluationResult} />
                    ) : (
                        <p>No evaluation generated.</p>
                    )}

                    <button className="btn-home mt-8" onClick={() => navigate('/candidate-home')}>Go Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="tat-test-container">
            <UnifiedNavbar />
            <div className="test-header">
                <span>Image: {currentIndex + 1} / {testImages.length}</span>
                <span className={`timer ${timeLeft < 10 ? 'warning' : ''}`}>
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                </span>
                <span>Phase: {phase === 'VIEW' ? 'OBSERVE' : 'WRITE NOW'}</span>
            </div>

            <div className="test-content">
                {phase === 'VIEW' ? (
                    <div className="image-view">
                        <img
                            src={testImages[currentIndex]?.url || testImage}
                            alt="Observation"
                            className="test-image"
                        />
                    </div>
                ) : (
                    <div className="response-view">
                        <h3>Write your story</h3>
                        <textarea
                            className="response-input"
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            placeholder="Type your story here..."
                            autoFocus
                        />
                        <button className="btn-submit-early" onClick={handleSubmitEarly}>Submit & Next</button>
                    </div>
                )}
            </div>
        </div>
    );
}
