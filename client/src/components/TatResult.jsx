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

    return (
        <div className="tat-result-container">
            <div className="result-header">
                <h2>Evaluation Result</h2>
            </div>

            {/* Overall Summary Box */}
            <div className="summary-box">
                <div className="summary-title">Overall Feedback</div>
                <p className="summary-text">"{summary}"</p>
            </div>

            {/* Navigation Tabs (if multiple) */}
            {results.length > 1 && (
                <div className="flex justify-center gap-2 mb-6">
                    {results.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeIndex === idx
                                    ? 'bg-yellow-500 text-black shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Story {idx + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Individual Result Card */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-fadeIn">
                <h3 className="text-xl text-yellow-400 mb-4 font-semibold border-b border-gray-700 pb-2">
                    Story {activeIndex + 1} Analysis
                </h3>

                {currentResult.response && (
                    <div className="mb-6 p-4 bg-gray-900 rounded-lg italic text-gray-300">
                        "<span className="text-white">{currentResult.response}</span>"
                    </div>
                )}

                <div className="result-table-container">
                    <table className="result-table">
                        <thead>
                            <tr>
                                <th style={{ width: '25%' }}>Parameter</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Score (5)</th>
                                <th style={{ width: '65%' }}>Remark</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(currentResult.scores || []).map((item, index) => (
                                <tr key={index}>
                                    <td className="param-name">
                                        {item.parameter}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className={`score-badge ${getScoreClass(item.score)}`}>
                                            {item.score}
                                        </span>
                                    </td>
                                    <td className="param-remark">
                                        {item.remark}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="result-footer mt-6">
                <div className="total-score-label">Overall Performance (Avg)</div>
                <div>
                    <span className="total-score-value">{totalScore || result.individualTotal || 0}</span>
                    <span className="total-max"> / 80</span>
                </div>
            </div>
        </div>
    );
}
