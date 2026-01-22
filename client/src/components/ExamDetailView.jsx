import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './ExamDetailView.css';

const ExamDetailView = ({ examId, onClose }) => {
    const [exam, setExam] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
    }, [examId]);

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
                                <div key={index} className="response-card tat">
                                    <div className="stimulus-image">
                                        <img src={item.trigger} alt={`TAT ${index + 1}`} />
                                    </div>
                                    <div className="user-story w-full">
                                        <h4>Story {index + 1}</h4>
                                        <p className="story-text">{item.response}</p>

                                        {/* Render AI Scores if available */}
                                        {item.scores && (
                                            <div className="mini-scores-grid mt-4">
                                                {/* <h5 className="text-sm font-semibold text-sky-400 mb-2">Psychological Analysis:</h5> */}
                                                <div className="grid grid-cols-2 gap-2 text-xs">
                                                    {Object.entries(item.scores).map(([trait, val]) => (
                                                        val > 0 && (
                                                            <div key={trait} className="flex justify-between border-b border-gray-700 pb-1">
                                                                <span className="text-gray-400">{trait}</span>
                                                                <span className={`font-bold ${val >= 4 ? 'text-green-400' : val >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                                    {val}/5
                                                                </span>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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
                                        {/* <th>Analysis</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {responses.map((item, index) => (
                                        <tr key={index}>
                                            <td className="wat-word">{item.trigger}</td>
                                            <td className="wat-sentence">{item.response}</td>
                                            {/* <td className="wat-analysis text-xs">
                                                {item.scores && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.entries(item.scores).map(([trait, val]) => (
                                                            val >= 3 && ( // Only show significant traits to save space
                                                                <span key={trait} className={`px-2 py-1 rounded bg-gray-800 ${val >= 4 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                                    {trait.split(' ')[0]}: {val}
                                                                </span>
                                                            )
                                                        ))}
                                                    </div>
                                                )}
                                            </td> */}
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
