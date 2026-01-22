import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import UnifiedNavbar from '../components/UnifiedNavbar';
import './News.css';

import LoadingSpinner from '../components/LoadingSpinner';

export default function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch news from your existing backend endpoint
        const fetchNews = async () => {
            try {
                const response = await api.get('/news');
                // Handling different response structures for safety
                const articles = response.data.updates || response.data || [];
                setNews(articles);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch news:", err);
                setError("Unable to load latest defense updates.");
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="news-page-container">
            {/* 1. Consistent Navbar */}
            <UnifiedNavbar />

            {/* 2. Content Wrapper */}
            <div className="news-content-wrapper">
                <div className="news-header-section">
                    <h1 className="news-page-title">Defense Chronicles</h1>
                    <p className="news-page-subtitle">Latest strategic updates and SSB relevant current affairs</p>
                </div>

                {loading ? (
                    <LoadingSpinner fullScreen={false} />
                ) : error ? (
                    <div className="news-error">
                        <p>{error}</p>
                        <button className="btn-retry" onClick={() => window.location.reload()}>Retry Connection</button>
                    </div>
                ) : (
                    <div className="news-grid">
                        {news.length > 0 ? (
                            news.map((item, index) => (
                                <div key={item.id || index} className="news-card">
                                    <div className="news-card-content">
                                        <span className="news-date">
                                            {item.date ? new Date(item.date).toLocaleDateString() : 'Recent Update'}
                                        </span>
                                        <h3 className="news-title">{item.title}</h3>
                                        <p className="news-description">
                                            {item.description
                                                ? (item.description.length > 120 ? item.description.substring(0, 120) + "..." : item.description)
                                                : "No description available."}
                                        </p>
                                        <a
                                            href={item.link || "#"}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="news-read-more"
                                        >
                                            Read Full Release &rarr;
                                        </a>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="news-empty">No updates available at the moment.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}