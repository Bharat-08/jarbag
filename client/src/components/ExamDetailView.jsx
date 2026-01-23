import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import LoadingSpinner from './LoadingSpinner';
import './ExamDetailView.css';

const TatResponseCard = ({ item, index }) => {
    const [showReport, setShowReport] = useState(false);

    // Handle both array of objects (new format) and object map (old format) for scores
    let scoresList = [];
    if (Array.isArray(item.scores)) {
        scoresList = item.scores;
    } else if (typeof item.scores === 'object' && item.scores !== null) {
        scoresList = Object.entries(item.scores).map(([k, v]) => ({ parameter: k, score: v }));
    }

    return (
        <div className="response-card tat">
            <div className="stimulus-image">
                <img src={item.trigger} alt={`TAT ${index + 1}`} />
            </div>
            <div className="user-story w-full">
                <div className="story-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0 }}>Story {index + 1}</h4>
                    <button
                        className="btn-view-report"
                        style={{
                            background: showReport ? '#333' : '#d4af37',
                            color: showReport ? '#ccc' : '#000',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}
                        onClick={() => setShowReport(!showReport)}
                    >
                        {showReport ? 'Hide Report' : 'View AI Report'}
                    </button>
                </div>

                <p className="story-text">{item.response}</p>

                {/* Render AI Scores if available */}
                {showReport && (
                    <div className="ai-report-panel" style={{ marginTop: '16px', padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid #444' }}>

                        {item.individualSummary && (
                            <div className="report-summary" style={{ marginBottom: '16px', borderBottom: '1px solid #444', paddingBottom: '12px' }}>
                                <h5 style={{ color: '#d4af37', marginBottom: '8px', fontSize: '0.95rem' }}>AI Assessment Summary</h5>
                                <p style={{ fontSize: '0.9rem', color: '#ccc', lineHeight: '1.5' }}>{item.individualSummary}</p>
                            </div>
                        )}

                        {scoresList.length > 0 ? (
                            <div className="mini-scores-grid">
                                <h5 className="analysis-header" style={{ color: '#999', fontSize: '0.85rem' }}>Detailed OLQ Scores:</h5>
                                <div className="score-grid-layout">
                                    {scoresList.map((entry) => {
                                        const trait = entry.parameter || entry.trait; // Handle variations
                                        const val = entry.score;
                                        return val > 0 && (
                                            <div key={trait} className="score-row">
                                                <span className="trait-name">{trait}</span>
                                                <span className={`trait-val ${val >= 4 ? 'score-high' : val >= 3 ? 'score-mid' : 'score-low'}`}>
                                                    {val}/5
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="analysis-pending mt-4 text-gray-500 italic text-sm">
                                Analysis pending or unavailable.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ExamDetailView = ({ examId, examData, onClose }) => {
    const [exam, setExam] = useState(examData || null);
    const [loading, setLoading] = useState(!examData);

    useEffect(() => {
        if (examData) {
            setExam(examData);
            setLoading(false);
            return;
        }

        const fetchExamDetails = async () => {
            try {
                const res = await api.get(`/admin/activity/${examId}`);
                setExam(res.data);
            } catch (error) {
                console.error("Error fetching exam details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (examId) {
            fetchExamDetails();
        }
    }, [examId, examData]);

    if (loading) return <div className="detail-modal-overlay"><LoadingSpinner fullScreen={false} /></div>;
    if (!exam) return null;

    const { user, examName, testType, score, total, percentage, date, responseDetails } = exam;

    // Parse responseDetails if it's a string, otherwise use as is
    let responses = [];
    try {
        responses = typeof responseDetails === 'string' ? JSON.parse(responseDetails) : responseDetails || [];
    } catch (e) {
        responses = [];
    }

    const getScoreColor = (pct) => {
        if (pct >= 80) return 'text-green-400 border-green-400';
        if (pct >= 60) return 'text-yellow-400 border-yellow-400';
        return 'text-red-400 border-red-400';
    };

    return (
        <div className="detail-modal-overlay">
            <div className="detail-modal-content">
                <div className="detail-header">
                    <div>
                        <h2 className="student-name">{user?.name || 'Unknown Student'}</h2>
                        <p className="exam-meta">{examName} • {new Date(date).toLocaleString()}</p>
                    </div>
                    <div className={`score-large ${getScoreColor(percentage || 0)}`}>
                        {percentage ? `${percentage.toFixed(1)}%` : 'N/A'}
                    </div>
                </div>

                <div className="detail-body">
                    {testType === 'TAT' && (
                        <div className="tat-responses">
                            {responses.map((item, index) => (
                                <TatResponseCard key={index} item={item} index={index} />
                            ))}
                        </div>
                    )}

                    {testType === 'WAT' && (
                        <div className="wat-responses">
                            <table className="wat-table">
                                <thead>
                                    <tr>
                                        <th>Word</th>
                                        <th>Sentence</th>
                                        <th>Analysis</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {responses.map((item, index) => (
                                        <tr key={index}>
                                            <td className="wat-word">{item.word || item.trigger}</td>
                                            <td className="wat-sentence">{item.response}</td>
                                            <td className="wat-analysis text-xs">
                                                {item.scores ? (
                                                    <div className="wat-badges-container">
                                                        {Object.entries(item.scores).map(([trait, val]) => (
                                                            val >= 3 && ( // Only show significant traits
                                                                <span key={trait} className={`trait-badge ${val >= 4 ? 'score-high' : 'score-mid'}`}>
                                                                    {trait}: {val}
                                                                </span>
                                                            )
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500 italic">Analysis unavailable</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {responses.length === 0 && (
                        <div className="no-details">No detailed responses available for this test.</div>
                    )}
                </div>

                <div className="detail-footer">
                    <button className="close-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default ExamDetailView;
