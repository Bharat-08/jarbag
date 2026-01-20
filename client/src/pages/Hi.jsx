import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Hi = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="hi-page">
            <h1 className="hi-text">Hi</h1>
            <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '2rem' }}>
                Welcome, {user?.name || user?.email || 'User'}
            </p>
            <p style={{ color: '#3b82f6', fontSize: '1rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {user?.role}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                    onClick={() => navigate('/news')}
                    className="btn"
                    style={{ maxWidth: '200px', background: '#fbbf24', color: '#000' }}
                >
                    Daily Defence Updates
                </button>
                <button
                    onClick={logout}
                    className="btn"
                    style={{ maxWidth: '200px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Hi;
