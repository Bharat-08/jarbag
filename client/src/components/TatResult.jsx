import React, { useState } from 'react';
import './TatResult.css';

export default function TatResult({ evaluation }) {
    if (!evaluation) return null;

    // Handle both new multi-image format and legacy single format
    const results = evaluation.results || (evaluation.scores ? [evaluation] : []);
    const { summary, totalScore } = evaluation;

    const [activeIndex, setActiveIndex] = useState(0);

    const getScoreClass = (score) => {
        if (score >= 4) return 'score-high';
        if (score === 3) return 'score-mid';
        return 'score-low';
    };

    if (results.length === 0) return <div className="text-white">No results available.</div>;

    const currentResult = results[activeIndex];
    const score = totalScore || (currentResult && currentResult.individualTotal) || 0;

    return (
        <div className="tat-result-container">
            <div className="result-header">
                <h2>Psychological Assessment Report</h2>
            </div>

            {/* Overall Summary Box */}
            <div className="summary-box">
                <div className="summary-title">Assessor's Overall Feedback</div>
                <p className="summary-text">{summary || "No summary provided."}</p>
            </div>

            {/* Navigation Tabs (if multiple) */}
            {results.length > 1 && (
                <div className="tabs-container">
                    {results.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`tab-btn ${activeIndex === idx ? 'tab-btn-active' : 'tab-btn-inactive'}`}
                        >
                            Story {idx + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Individual Result Card */}
            <div className="story-analysis-card">
                <div className="story-header">
                    <h3>Story Analysis {results.length > 1 ? `(${activeIndex + 1}/${results.length})` : ''}</h3>
                </div>

                {currentResult.response && (
                    <div className="user-response-block">
                        <span className="response-label">Candidate's Response</span>
                        <p className="response-content">"{currentResult.response}"</p>
                    </div>
                )}

                <div className="result-table-container">
                    <table className="result-table">
                        <thead>
                            <tr>
                                <th style={{ width: '30%' }}>Parameter</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Score</th>
                                <th style={{ width: '60%' }}>Assessor's Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(currentResult.scores || []).map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <span className="param-name">{item.parameter}</span>
                                    </td>
                                    <td className="score-cell">
                                        <span className={`score-badge-new ${getScoreClass(item.score)}`}>
                                            {item.score}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="param-remark">{item.remark}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="report-footer">
                <div className="total-score-box">
                    <span className="total-label">Total Proficiency Score</span>
                    <div className="total-value-row">
                        {score}<span className="total-max">/80</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
