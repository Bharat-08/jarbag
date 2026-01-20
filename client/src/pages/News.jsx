import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const News = () => {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/news');
                setSummary(res.data.summary);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch daily updates.');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="news-page" style={{
            minHeight: '100vh',
            background: '#0f172a',
            color: '#f8fafc',
            padding: '4rem 2rem',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/hi')}
                    className="btn-back"
                >
                    ← Back to Dashboard
                </button>

                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    marginBottom: '2rem',
                    background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Daily Defence Updates
                </h1>

                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: '#94a3b8' }}>
                        <div className="spinner" style={{ marginBottom: '1rem' }}>Processing...</div>
                        <p>Gathering intel from PIB and summarizing...</p>
                    </div>
                ) : error ? (
                    <div className="error-msg">{error}</div>
                ) : (
                    <div className="news-content" style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        padding: '2rem',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        lineHeight: '1.8'
                    }}>
                        <ReactMarkdown
                            components={{
                                h2: ({ node, ...props }) => <h2 style={{ color: '#fbbf24', marginTop: '1.5rem', marginBottom: '1rem' }} {...props} />,
                                ul: ({ node, ...props }) => <ul style={{ paddingLeft: '1.5rem' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />,
                                p: ({ node, ...props }) => <p style={{ marginBottom: '1rem', color: '#cbd5e1' }} {...props} />
                            }}
                        >
                            {summary}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
