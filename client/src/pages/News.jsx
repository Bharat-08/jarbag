import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './News.css';

const News = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const res = await api.get('/news');
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
        <div className="news-page">
            <div className="news-container">
                <button
                    onClick={() => navigate('/')}
                    className="btn-news-back"
                >
                    <span>←</span> Dashboard
                </button>

                <header className="news-header">
                    <h1 className="news-title">Daily Defence Updates</h1>
                    <p className="news-subtitle">Live briefings and headlines from the Press Information Bureau, Government of India.</p>
                </header>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Fetching latest inputs...</p>
                    </div>
                ) : error ? (
                    <div className="error-msg">{error}</div>
                ) : (
                    <div className="news-grid">
                        {news.length > 0 ? (
                            news.map((item, index) => (
                                <article key={index} className="news-card">
                                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-card-link-wrapper">
                                        <h3 className="news-card-title">{item.title}</h3>
                                    </a>

                                    {item.publishedAt && (
                                        <time className="news-date">{new Date(item.publishedAt).toDateString()}</time>
                                    )}

                                    {item.description && (
                                        <p className="news-description">
                                            {item.description.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    )}

                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="news-link"
                                    >
                                        Read Official Release ↗
                                    </a>
                                </article>
                            ))
                        ) : (
                            <p className="text-center text-slate-500">No updates found for today.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default News;