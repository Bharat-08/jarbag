import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loadingLocal, setLoadingLocal] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingLocal(true);

        // Validate Name
        const trimmedName = name.trim();
        const nameRegex = /^[a-zA-Z\u00C0-\u00FF' -]+$/;
        if (trimmedName.length < 2) {
            setError('Name must be at least 2 characters long.');
            setLoadingLocal(false);
            return;
        }
        if (!nameRegex.test(trimmedName)) {
            setError('Name contains invalid characters. Please use a proper name.');
            setLoadingLocal(false);
            return;
        }
        if (trimmedName.includes("  ")) {
            setError('Name contains improper spacing.');
            setLoadingLocal(false);
            return;
        }
        const lowerName = trimmedName.toLowerCase();
        const forbiddenNames = ['admin', 'administrator', 'user', 'test', 'unknown', 'anonymous', 'null', 'undefined', 'object', 'chair', 'table'];
        if (forbiddenNames.includes(lowerName)) {
            setError('Please use your real name.');
            setLoadingLocal(false);
            return;
        }

        try {
            await signup(email, password, name);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to sign up');
        } finally {
            setLoadingLocal(false);
        }
    };

    return (
        <div className="auth-container" style={{ position: 'relative' }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '30px',
                    left: '30px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.currentTarget.style.borderColor = 'white';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
            >
                ←
            </button>
            <div className="auth-card">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join us to experience the future</p>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn" disabled={loadingLocal}>
                        {loadingLocal ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
