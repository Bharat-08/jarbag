// src/components/ExamActivities.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import ExamDetailView from './ExamDetailView';
import LoadingSpinner from './LoadingSpinner';
import './ExamActivities.css';

function ExamActivities() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExamId, setSelectedExamId] = useState(null);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await api.get('/admin/activities');
                setActivities(res.data);
            } catch (err) {
                console.error("Error fetching activities", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivities();
    }, []);

    const getScoreColor = (percentage) => {
        // Handle null/undefined percentage gracefully
        if (percentage === undefined || percentage === null) return 'warning';
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'danger';
    };

    return (
        <div className="exam-activities">
            <div className="header-section">
                <h2 className="section-title">Exam Activities Log</h2>
                <p className="section-subtitle">
                    Recent student exam submissions and scores
                </p>
            </div>

            <div className="table-container">
                {loading ? (
                    <div style={{ height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <LoadingSpinner fullScreen={false} />
                    </div>
                ) : activities.length === 0 ? (
                    <div className="empty-state">
                        <p>No exam activities recorded yet.</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="exam-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Exam</th>
                                    <th>Date</th>
                                    <th>Score</th>
                                    <th>Percentage</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((item, index) => {
                                    // Calculate metrics if not explicitly provided
                                    // Prefer backend provided percentage, fallback to calculation
                                    let pct = item.percentage;
                                    if (pct === undefined || pct === null) {
                                        const score = item.score || 0;
                                        const total = item.total || 10;
                                        pct = Math.round((score / total) * 100);
                                    } else {
                                        pct = Math.round(pct);
                                    }

                                    const totalDisplay = item.total || 10;
                                    const scoreDisplay = item.score !== null ? item.score : '-';

                                    return (
                                        <tr key={item.id || index} className={index % 2 === 0 ? 'even-row' : ''}>
                                            <td className="student-name">{item.user?.name || item.user?.email || 'Unknown'}</td>
                                            <td>{item.examName || item.testType || 'Unknown Test'}</td>
                                            <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`score-badge ${getScoreColor(pct)}`}>
                                                    {scoreDisplay}/{totalDisplay}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`percentage ${getScoreColor(pct)}`}>
                                                    {pct}%
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="view-btn"
                                                    onClick={() => setSelectedExamId(item.id)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selectedExamId && (
                <ExamDetailView
                    examId={selectedExamId}
                    onClose={() => setSelectedExamId(null)}
                />
            )}
        </div>
    );
}

export default ExamActivities;
