import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import UnifiedNavbar from '../components/UnifiedNavbar';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loadingLocal, setLoadingLocal] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check if we were redirected here from another page
    const from = location.state?.from || null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoadingLocal(true);
        try {
            const response = await login(email, password);

            // LOGIC CHANGE: If 'from' exists, go back there. Else go to default dashboard.
            // LOGIC CHANGE: If 'from' exists, go back there ONLY if authorized.
            let validRedirect = false;
            // 'from' is a location object, so we must check from.pathname
            const fromPath = from?.pathname || '';

            if (fromPath) {
                // Prevent Candidates from going to Mentor/Admin pages
                if (response.user.role === 'CANDIDATE' && !fromPath.includes('mentor') && !fromPath.includes('admin')) {
                    validRedirect = true;
                }
                // Prevent Mentors from going to Admin pages
                else if (response.user.role === 'MENTOR' && !fromPath.includes('admin')) {
                    validRedirect = true;
                }
                // Admin: Only use 'from' if it's an specific Admin page (deep link). Otherwise force Dashboard.
                else if (response.user.role === 'ADMIN') {
                    if (fromPath.includes('/admin')) {
                        validRedirect = true;
                    } else {
                        validRedirect = false; // Force default dashboard redirect
                    }
                }
            }

            if (from && validRedirect) {
                navigate(from, { replace: true });
            } else {
                // Default Routing based on Role
                if (response.user.role === 'ADMIN') {
                    navigate('/admin-dashboard');
                } else if (response.user.role === 'CANDIDATE') {
                    navigate('/candidate-home');
                } else if (response.user.role === 'MENTOR') {
                    navigate('/mentor-dashboard');
                } else {
                    navigate('/news');
                }
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoadingLocal(false);
        }
    };

    return (
        <div className="auth-container" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10 }}>
                <UnifiedNavbar hideLinks={true} />
            </div>
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Enter your credentials to continue</p>

                {error && <div className="error-msg">{error}</div>}

                {/* Optional: Show a message if they were redirected */}
                {from && <div style={{ marginBottom: '10px', color: '#fbbf24', fontSize: '0.9rem' }}>Please sign in to access that page.</div>}

                <form onSubmit={handleSubmit}>
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
                        {loadingLocal ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;