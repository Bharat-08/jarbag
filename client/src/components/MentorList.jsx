import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './MentorList.css';
import MentorProfileModal from './MentorProfileModal';

const MentorList = () => {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMentorId, setSelectedMentorId] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchMentors = async () => {
            try {
                const res = await api.get('/admin/mentors');
                setMentors(res.data);
            } catch (err) {
                console.error("Error fetching mentors:", err);
                setError("Failed to load mentor data.");
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();
    }, []);

    const filteredMentors = mentors.filter(mentor => {
        if (filter === 'All') return true;

        const exp = (mentor.expertise || '').toLowerCase();

        if (filter === 'GTO') return exp.includes('gto');
        if (filter === 'Psychology') return exp.includes('psych');
        if (filter === 'Interview') return exp.includes('interview');
        if (filter === 'PI & Comm') return exp.includes('pi') || exp.includes('comm');

        return true;
    });

    if (loading) return <div className="mentor-loading">Loading mentors...</div>;
    if (error) return <div className="mentor-error">{error}</div>;

    return (
        <div className="mentor-list-container">
            <div className="mentor-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 className="section-title">Mentor Directory</h2>
                    <div className="filter-controls">
                        {['All', 'GTO', 'Psychology', 'Interview', 'PI & Comm'].map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mentor-stats">
                    <span className="stat-pill">{filteredMentors.length} Mentors</span>
                </div>
            </div>

            <div className="mentors-grid">
                {filteredMentors.length === 0 ? (
                    <div className="no-mentors">No {filter} mentors found.</div>
                ) : (
                    filteredMentors.map((mentor) => (
                        <div key={mentor.id} className="mentor-card">
                            <div className="card-header">
                                <div className="avatar">
                                    {mentor.profileImage ? (
                                        <img src={mentor.profileImage} alt={mentor.name} />
                                    ) : (
                                        <span>{mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}</span>
                                    )}
                                </div>
                                <div className="header-info">
                                    <h3 className="mentor-name">{mentor.name || 'Unnamed Mentor'}</h3>
                                    <span className="mentor-rank">{mentor.rank || 'Mentor'}</span>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="badges-row">
                                    {mentor.expertise && (
                                        <span className="expertise-badge">{mentor.expertise}</span>
                                    )}
                                </div>

                                <div className="stats-row">
                                    <div className="stat-item">
                                        <span className="icon">⏳</span>
                                        <span>{mentor.yearsOfExperience ? `${mentor.yearsOfExperience} Yrs Exp` : 'N/A'}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="icon">⭐</span>
                                        <span>{mentor.rating ? Number(mentor.rating).toFixed(1) : '5.0'}</span>
                                    </div>
                                </div>

                                <p className="mentor-bio">
                                    {mentor.bio ? (
                                        mentor.bio.length > 80 ? `${mentor.bio.substring(0, 80)}...` : mentor.bio
                                    ) : 'No biography available for this mentor.'}
                                </p>
                            </div>

                            <div className="card-footer">
                                <span className={`status-indicator ${mentor.isApproved !== false ? 'active' : 'pending'}`}>
                                    <span className="dot"></span> {mentor.isApproved !== false ? 'Active' : 'Pending'}
                                </span>
                                <button className="view-btn" onClick={() => setSelectedMentorId(mentor.id)}>View Profile</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {selectedMentorId && (
                <MentorProfileModal
                    mentorId={selectedMentorId}
                    onClose={() => setSelectedMentorId(null)}
                />
            )}
        </div>
    );
};

export default MentorList;
