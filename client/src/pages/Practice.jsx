import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import UnifiedNavbar from '../components/UnifiedNavbar';
import PremiumModal from '../components/PremiumModal';
import './Practice.css';

export default function Practice() {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [accessLevel, setAccessLevel] = useState('FREE');
    const [loading, setLoading] = useState(true);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await api.get('/content/view');
            setVideos(res.data.videos || []);
            setAccessLevel(res.data.accessLevel || 'FREE');
        } catch (err) {
            console.error('Failed to load content', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = () => {
        setShowPremiumModal(true);
    };

    const confirmUpgrade = async () => {
        try {
            const res = await api.post('/auth/upgrade');
            if (res.data.success) {
                // Refresh content to see unlocked videos immediately
                await fetchContent();
                setShowPremiumModal(false);
                // Optional: Show a toast here if I had one
            }
        } catch (err) {
            console.error("Upgrade failed", err);
            alert("Upgrade failed. Please try again."); // Fallback for error or use custom toast
        }
    };

    // CRITICAL FIX: Converts "vimeo.com" links to "player.vimeo.com" links
    const getEmbedUrl = (url) => {
        if (!url) return "";

        // 1. If it's already a correct player URL, return it
        if (url.includes('player.vimeo.com')) return url;

        // 2. If it's a standard Vimeo URL (e.g. https://vimeo.com/1156730233)
        // We extract the ID and build the embed URL
        const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
        const match = url.match(vimeoRegex);
        if (match && match[1]) {
            return `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`;
        }

        // 3. Fallback for other URLs (like YouTube)
        return url;
    };

    // Helper Component for Lazy Loading
    const VideoCard = ({ video, index, isLocked, onUpgrade }) => {
        const [play, setPlay] = useState(false);

        return (
            <div className={`video-card ${isLocked ? 'locked' : ''}`}>
                <div className="video-info-top">
                    <h3>Module {index + 1}: {isLocked ? "Premium Content" : "Video Lecture"}</h3>
                </div>

                <div className="video-wrapper">
                    {isLocked ? (
                        <div className="lock-overlay" onClick={onUpgrade}>
                            <div className="lock-content">
                                <span className="lock-icon">🔒</span>
                                <h3>Locked Content</h3>
                                <p>Upgrade to Premium to access this lecture</p>
                                <button className="btn-unlock">Let's Upgrade</button>
                            </div>
                        </div>
                    ) : play ? (
                        <iframe
                            src={getEmbedUrl(video.url)}
                            title={`Lecture ${index + 1}`}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="video-iframe"
                        ></iframe>
                    ) : (
                        <div className="video-placeholder" onClick={() => setPlay(true)}>
                            <div className="play-button">▶</div>
                            <p>Click to Load Video</p>
                        </div>
                    )}
                </div>

                <div className="video-info-bottom">
                    <span className="video-date">
                        {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Available Now'}
                    </span>
                    {isLocked && <span className="status-badge">Locked</span>}
                </div>
            </div>
        );
    };

    if (loading) return <div className="practice-container" style={{ color: 'white', padding: '2rem' }}>Loading content...</div>;

    return (
        <div className="practice-container">
            <UnifiedNavbar />

            <div className="practice-header-section">
                <h1 className="page-title-gradient">
                    Practice Lectures
                    <span className={`plan-badge-large ${accessLevel.toLowerCase()}`}>
                        {accessLevel === 'PREMIUM' ? 'PREMIUM 👑' : 'FREE ACCESS'}
                    </span>
                </h1>
                <p className="page-subtitle">Master your skills with our curated video lectures.</p>
            </div>

            <div className="video-grid">
                {videos.map((video, index) => {
                    // Use backend 'locked' status OR fallback to index logic
                    const isLocked = video.locked !== undefined
                        ? video.locked
                        : (accessLevel === 'FREE' && index > 0);

                    return (
                        <VideoCard
                            key={video.id || index}
                            video={video}
                            index={index}
                            isLocked={isLocked}
                            onUpgrade={handleUpgrade}
                        />
                    );
                })}
            </div>

            {videos.length === 0 && (
                <div className="no-content">
                    <p>No practice lectures available at the moment.</p>
                </div>
            )}

            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                onConfirm={confirmUpgrade}
            />
        </div>
    );
}