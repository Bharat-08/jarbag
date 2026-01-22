// src/components/StudentList.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './StudentList.css';

function StudentList() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true); // 1. Add loading state
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setLoading(true); // Ensure loading starts
                const res = await api.get('/admin/students');
                setStudents(res.data);
            } catch (err) {
                console.error("Error fetching students", err);
            } finally {
                setLoading(false); // 2. Stop loading when fetch is done (success or fail)
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student => {
        if (filter === 'premium') return student.isPremium;
        if (filter === 'free') return !student.isPremium;
        return true;
    });

    // 3. Add a loading check in the render
    if (loading) {
        return <div style={{ padding: '20px', color: '#fff', textAlign: 'center' }}>Loading students...</div>;
    }

    return (
        <div className="student-section">
            <h2 className="section-title">
                Students Directory
                <div className="filter-controls">
                    <button
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn btn-premium ${filter === 'premium' ? 'active' : ''}`}
                        onClick={() => setFilter('premium')}
                    >
                        Premium
                    </button>
                    <button
                        className={`filter-btn btn-free ${filter === 'free' ? 'active' : ''}`}
                        onClick={() => setFilter('free')}
                    >
                        Free
                    </button>
                </div>
            </h2>

            <div className="students-grid">
                {filteredStudents.length === 0 ? (
                    <p style={{ color: '#a0a0d0', gridColumn: '1/-1', textAlign: 'center' }}>No {filter} students found.</p>
                ) : (
                    filteredStudents.map((student) => (
                        <div key={student.id} className="student-card">
                            <div className="student-header">
                                <h3>{student.name || 'Unnamed'}</h3>
                                <span className={`status-badge ${student.isPremium ? 'active' : 'inactive'}`}>
                                    {student.isPremium ? 'Premium' : 'Free'}
                                </span>
                            </div>
                            <div className="student-info">
                                <div>ID: {student.id}</div>
                                <div>Joined: {new Date(student.createdAt).toLocaleDateString()}</div>
                                <div>Email: {student.email}</div>
                                {student.isPremium && student.subscriptionStartDate && (
                                    <div className="subscription-info">
                                        <div className="sub-row">
                                            <span className="sub-label">Started:</span>
                                            <span className="sub-date">{new Date(student.subscriptionStartDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="sub-row">
                                            <span className="sub-label">Expires:</span>
                                            <span className="sub-date">{new Date(student.subscriptionEndDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default StudentList;