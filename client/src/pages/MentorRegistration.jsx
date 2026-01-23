import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MentorRegistration.css';
import UnifiedNavbar from '../components/UnifiedNavbar';

const MentorRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        expertise: [],
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleExpertiseChange = (e) => {
        const { value, checked } = e.target;
        let updatedExpertise = [...formData.expertise];
        if (checked) {
            updatedExpertise.push(value);
        } else {
            updatedExpertise = updatedExpertise.filter((item) => item !== value);
        }
        setFormData({ ...formData, expertise: updatedExpertise });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (formData.expertise.length === 0) {
            setError('Please select at least one area of expertise.');
            setLoading(false);
            return;
        }

        // Validate Name
        const trimmedName = formData.name.trim();
        const nameRegex = /^[a-zA-Z\u00C0-\u00FF' -]+$/;
        if (trimmedName.length < 2) {
            setError('Name must be at least 2 characters long.');
            setLoading(false);
            return;
        }
        if (!nameRegex.test(trimmedName)) {
            setError('Name contains invalid characters. Please use a proper name.');
            setLoading(false);
            return;
        }
        if (trimmedName.includes("  ")) {
            setError('Name contains improper spacing.');
            setLoading(false);
            return;
        }
        const lowerName = trimmedName.toLowerCase();
        const forbiddenNames = ['admin', 'administrator', 'user', 'test', 'unknown', 'anonymous', 'null', 'undefined', 'object', 'chair', 'table'];
        if (forbiddenNames.includes(lowerName)) {
            setError('Please use your real name.');
            setLoading(false);
            return;
        }

        if (!file) {
            setError('Please upload a document.');
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        // Send as comma-separated string
        data.append('expertise', formData.expertise.join(', '));
        data.append('document', file);

        try {
            const res = await axios.post('http://localhost:3000/api/mentors/register', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(res.data.message);
            // Optional: Redirect after success
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container mentor-auth-override" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10 }}>
                <UnifiedNavbar hideLinks={true} />
            </div>
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <h1 className="auth-title">Join as a Mentor</h1>
                <p className="auth-subtitle">Share your expertise and guide the next generation.</p>

                {message && <div style={{ color: '#22c55e', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '0.5rem' }}>{message}</div>}
                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            className="form-control"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.8rem', color: '#94a3b8' }}>Area of Expertise</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {['GTO', 'Psychological', '1 on 1 Interview Expertise'].map((option) => (
                                <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ccc', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', border: '1px solid #333' }}>
                                    <input
                                        type="checkbox"
                                        value={option}
                                        checked={formData.expertise.includes(option)}
                                        onChange={handleExpertiseChange}
                                        style={{ width: '18px', height: '18px', accentColor: '#fbbf24' }}
                                    />
                                    {option}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', color: '#94a3b8' }}>Upload Verification Document (ID/Certificate)</label>
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="form-control"
                            onChange={handleFileChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Processing...' : 'Register as Mentor'}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="btn-cancel"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MentorRegistration;
