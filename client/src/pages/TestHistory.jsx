import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedNavbar from '../components/UnifiedNavbar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';
import ExamDetailView from '../components/ExamDetailView';
import './TestMode.css'; // Reusing styles where possible

export default function TestHistory() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/usage/history');
                setHistory(res.data);
            } catch (err) {
                console.error("Failed to load history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="candidate-home">
            <UnifiedNavbar />

            <div className="test-mode-container">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px', gap: '20px' }}>
                    {/* <button onClick={() => navigate(-1)} className="btn-back-history">
                        ← Back
                    </button> */}
                    <h2 className="page-heading" style={{ margin: 0 }}>TEST HISTORY</h2>
                </div>

                {history.length === 0 ? (
                    <div className="history-empty">
                        <h3>No test attempts yet.</h3>
                        <p>Complete a TAT or WAT session to see your results here.</p>
                        <button onClick={() => navigate('/test-mode')} className="btn-start-test">
                            Start a Test
                        </button>
                    </div>
                ) : (
                    <div className="history-grid">
                        {history.map((record) => (
                            <div key={record.id} className="history-card">
                                <div className="history-header">
                                    <span className={`history-type ${record.testType}`}>{record.testType}</span>
                                    <span className="history-date">
                                        {new Date(record.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="history-body">
                                    <div className="score-circle">
                                        <span className="score-val">{record.score || 0}</span>
                                        <span className="score-total">/{record.total}</span>
                                    </div>
                                    <div className="history-feedback">
                                        <h4>AI Feedback</h4>
                                        <p>{record.feedback ? record.feedback.substring(0, 100) + '...' : 'No feedback available.'}</p>
                                    </div>
                                </div>

                                <div className="history-footer">
                                    {/* Link to detail view if we have one, otherwise just show summary */}
                                    <button
                                        className="btn-view-details"
                                        onClick={() => setSelectedTest(record)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedTest && (
                <ExamDetailView
                    examData={selectedTest}
                    onClose={() => setSelectedTest(null)}
                />
            )}
        </div>
    );
}
