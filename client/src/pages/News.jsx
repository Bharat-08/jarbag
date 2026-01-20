import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/news');
                // api returns { updates: [...], ... }
                setNews(res.data.updates || []);
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
                    onClick={() => navigate('/')}
                    className="btn-back text-sm mb-6 text-slate-400 hover:text-white transition-colors"
                >
                    ← Back to Dashboard
                </button>

                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    marginBottom: '0.5rem',
                    background: 'linear-gradient(to right, #fbbf24, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Daily Defence Updates
                </h1>
                <p className="text-slate-400 mb-8">Latest headlines from Press Information Bureau</p>

                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: '#94a3b8' }}>
                        <div className="spinner" style={{ marginBottom: '1rem' }}>Loading feeds...</div>
                    </div>
                ) : error ? (
                    <div className="error-msg text-red-400 text-center">{error}</div>
                ) : (
                    <div className="news-grid flex flex-col gap-4">
                        {news.length > 0 ? (
                            news.map((item, index) => (
                                <div key={index} style={{
                                    background: 'rgba(30, 41, 59, 0.5)',
                                    padding: '1.5rem',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    transition: 'transform 0.2s',
                                    cursor: 'default'
                                }} className="hover:bg-slate-800/80">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
                                        <h3 className="text-xl font-bold text-amber-400 mb-2 group-hover:text-amber-300 transition-colors">
                                            {item.title}
                                        </h3>
                                    </a>
                                    {item.publishedAt && (
                                        <p className="text-xs text-slate-500 mb-3">{new Date(item.publishedAt).toDateString()}</p>
                                    )}
                                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                        {item.description ? item.description.replace(/<[^>]*>?/gm, '') : 'No description available.'}
                                    </p>
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-xs font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wide"
                                    >
                                        Read Full Release →
                                    </a>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-slate-500">No updates found at this time.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;
