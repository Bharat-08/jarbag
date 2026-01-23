// src/components/StatsCards.jsx
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import './StatsCards.css';

function StatsCards({ stats, loading }) {
    const navigate = useNavigate();

    if (loading) return (
        <div style={{ minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            <LoadingSpinner fullScreen={false} />
        </div>
    );

    // Destructure with default values to prevent crashes if data isn't loaded yet
    const { totalStudents = 0, totalMentors = 0, contentCount = 0, subscribedStudents = 0 } = stats || {};

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <div className="label">Total Students</div>
                <div className="value">{totalStudents}</div>
            </div>

            <div className="stat-card">
                <div className="label">Subscribed Students</div>
                <div className="value">{subscribedStudents}</div>
            </div>

            <div className="stat-card">
                <div className="label">Total Mentors</div>
                <div className="value">{totalMentors}</div>
            </div>

            <div className="stat-card wide">
                <div className="label">Pending Mentor Approvals</div>
                <div className="value">0</div>
            </div>

            <div className="stat-card wide">
                <div className="label">Total Exams Conducted</div>
                <div className="value">{contentCount}</div>
            </div>
        </div>
    );
}

export default StatsCards;
