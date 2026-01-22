import React from 'react';
import './WatResult.css';

export default function WatResult({ results }) {
    if (!results) return null;

    const { finalScorecard, sentenceWise } = results;

    const getScoreColor = (value) => {
        const num = parseFloat(value);
        if (num >= 3.5) return 'score-text-high';
        if (num >= 2.5) return 'score-text-mid';
        return 'score-text-low';
    };

    // Helper to extract top qualities from a sentence's score map
    const getTopQualities = (scores) => {
        if (!scores) return [];
        return Object.entries(scores)
            .filter(([_, val]) => val >= 3) // Only show significant scores
            .sort((a, b) => b[1] - a[1]) // Sort highest first
            .slice(0, 3); // Take top 3
    };

    return (
        <div className="wat-result-container">
            <div className="result-header">
                <h2>WAT Psychological Profile</h2>
            </div>

            {/* OVERALL SCORECARD */}
            <h3 className="text-xl text-white mb-4 font-bold border-l-4 border-yellow-500 pl-3">Aggregate OLQ Scores out of 5</h3>
            <div className="scorecard-grid">
                {Object.entries(finalScorecard).map(([olq, score]) => (
                    <div key={olq} className="olq-card">
                        <span className="olq-label">{olq}</span>
                        <div className={`olq-value ${getScoreColor(score)}`}>
                            {score}
                        </div>
                    </div>
                ))}
            </div>

            {/* SENTENCE WISE BREAKDOWN */}
            <div className="wat-table-section">
                <h3>Sentence Analysis</h3>
                <div className="wat-table-container">
                    <table className="wat-table">
                        <thead>
                            <tr>
                                <th className="col-word">Word</th>
                                <th className="col-sentence">Response</th>
                                <th className="col-analysis">Detected Traits</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sentenceWise.map((item, idx) => {
                                const topTraits = getTopQualities(item.scores);
                                return (
                                    <tr key={idx}>
                                        <td className="col-word">{item.word}</td>
                                        <td className="col-sentence">"{item.response}"</td>
                                        <td className="col-analysis">
                                            {topTraits.length > 0 ? (
                                                topTraits.map(([k, v]) => (
                                                    <span key={k} className="mini-badge high">
                                                        {k} ({v})
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="mini-badge">Neutral / No strong trait</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
