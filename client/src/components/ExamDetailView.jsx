import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './ExamDetailView.css';

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

    if (loading) return <div className="detail-modal-overlay"><div className="detail-loading">Loading details...</div></div>;
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
        if (pct >= 60) return 'text-yellow-400 border-yellow-400';
        return 'text-red-400 border-red-400';
    };

    const hasValidScores = (scores) => {
        if (!scores) return false;
        if (Array.isArray(scores)) return scores.length > 0;
        return Object.keys(scores).length > 0;
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
                                <div key={index} className="response-card tat">
                                    <div className="stimulus-image">
                                        <img src={item.trigger} alt={`TAT ${index + 1}`} />
                                    </div>
                                    <div className="user-story w-full">
                                        <h4>Story {index + 1}</h4>
                                        <p className="story-text">{item.response}</p>

                                        <div className="mini-scores-grid mt-4">
                                            <h5 className="analysis-header">Psychological Analysis:</h5>
                                            {hasValidScores(item.scores) ? (
                                                <div className="score-grid-layout">
                                                    {(Array.isArray(item.scores) ? item.scores : Object.entries(item.scores).map(([k, v]) => ({ parameter: k, score: v }))).map((entry) => {
                                                        const trait = entry.parameter || entry.trait; // Handle varying key names
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
                                            ) : (
                                                <div className="analysis-pending">Analysis Not Completed</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
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
                                                {hasValidScores(item.scores) ? (
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
                                                    <span className="analysis-pending">Analysis Not Completed</span>
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
