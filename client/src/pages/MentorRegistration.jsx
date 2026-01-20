import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MentorRegistration = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        expertise: 'GTO',
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!file) {
            setError('Please upload a document.');
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('expertise', formData.expertise);
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
        <div className="auth-container">
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
                        <label style={{ display: 'block', textAlign: 'left', marginBottom: '0.5rem', color: '#94a3b8' }}>Area of Expertise</label>
                        <select
                            name="expertise"
                            className="form-control"
                            value={formData.expertise}
                            onChange={handleChange}
                            style={{ appearance: 'auto' }}
                        >
                            <option value="GTO">GTO</option>
                            <option value="Psychological">Psychological</option>
                            <option value="1 on 1 Interview Expertise">1 on 1 Interview Expertise</option>
                        </select>
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
                        className="btn-link"
                        style={{ marginTop: '1rem', display: 'block', width: '100%', textAlign: 'center' }}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MentorRegistration;
