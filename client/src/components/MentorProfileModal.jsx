import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import './MentorProfileModal.css';

const MentorProfileModal = ({ mentorId, onClose }) => {
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMentorDetails = async () => {
            try {
                const res = await api.get(`/admin/mentor/${mentorId}`);
                setMentor(res.data);
            } catch (err) {
                console.error("Error fetching mentor details:", err);
                setError(err.response?.status === 404 ? "Mentor not found" : "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        if (mentorId) {
            fetchMentorDetails();
        }
    }, [mentorId]);

    if (loading) return (
        <div className="mentor-modal-overlay">
            <div className="mentor-loading">Loading profile...</div>
        </div>
    );

    if (error) return (
        <div className="mentor-modal-overlay">
            <div className="mentor-modal-content" style={{ padding: '2rem', textAlign: 'center' }}>
                <h3 style={{ color: '#f87171' }}>Error</h3>
                <p style={{ color: '#ccc' }}>{error}</p>
                <button className="action-btn" onClick={onClose} style={{ marginTop: '1rem', background: '#333' }}>Close</button>
            </div>
        </div>
    );

    if (!mentor) return null;

    return (
        <div className="mentor-modal-overlay">
            <div className="mentor-modal-content">
                <div className="modal-header">
                    <div className="header-left">
                        <div className="modal-avatar">
                            {mentor.profileImage ? (
                                <img src={mentor.profileImage} alt={mentor.name} />
                            ) : (
                                <span>{mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}</span>
                            )}
                        </div>
                        <div className="header-text">
                            <h2 className="modal-name">{mentor.name}</h2>
                            <div className="header-badges">
                                <span className="modal-rank-badge">{mentor.rank || 'Mentor'}</span>
                                <span className={`modal-status-badge ${mentor.isApproved !== false ? 'active' : 'pending'}`}>
                                    {mentor.isApproved !== false ? 'Active' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    <div className="profile-grid">
                        <div className="left-column">
                            <h3 className="column-title">Personal Info</h3>
                            <div className="info-item">
                                <label>Email</label>
                                <p>{mentor.email}</p>
                            </div>
                            <div className="info-item">
                                <label>Joined</label>
                                <p>{new Date(mentor.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</p>
                            </div>
                            <div className="info-item">
                                <label>Verification Document</label>
                                {mentor.documentUrl ? (
                                    <a href={mentor.documentUrl} target="_blank" rel="noopener noreferrer" className="doc-link-card">
                                        <span className="icon">📄</span> View Document
                                    </a>
                                ) : (
                                    <p className="text-muted">No document uploaded</p>
                                )}
                            </div>
                        </div>

                        <div className="right-column">
                            <h3 className="column-title">Professional Profile</h3>

                            <div className="modal-stats-row">
                                <div className="modal-stat-card">
                                    <div className="stat-val">{mentor.yearsOfExperience || 0}</div>
                                    <div className="stat-label">Years Exp</div>
                                </div>
                                <div className="modal-stat-card">
                                    <div className="stat-val">{mentor.rating ? Number(mentor.rating).toFixed(1) : '5.0'}</div>
                                    <div className="stat-label">Rating</div>
                                </div>
                                <div className="modal-stat-card">
                                    <div className="stat-val">{mentor.reviewCount || 0}</div>
                                    <div className="stat-label">Reviews</div>
                                </div>
                                <div className="modal-stat-card">
                                    <div className="stat-val">₹{mentor.price || 999}</div>
                                    <div className="stat-label">Session</div>
                                </div>
                            </div>

                            <div className="info-section">
                                <label>Expertise</label>
                                <div className="tags-container">
                                    {mentor.expertise ? (
                                        mentor.expertise.split(',').map((tag, index) => (
                                            <span key={index} className="modal-tag">{tag.trim()}</span>
                                        ))
                                    ) : (
                                        <span className="text-muted">No expertise listed</span>
                                    )}
                                </div>
                            </div>

                            <div className="info-section">
                                <label>Biography</label>
                                <p className="bio-text">{mentor.bio || 'No biography provided.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MentorProfileModal;
