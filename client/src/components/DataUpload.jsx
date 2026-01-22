import React, { useState } from 'react';
import api from '../api/axios';
import './DataUpload.css';

const DataUpload = () => {
    const [activeTab, setActiveTab] = useState('tat'); // 'tat' or 'wat'
    const [tatData, setTatData] = useState({ url: '', description1: '', description2: '', description3: '' });
    const [watText, setWatText] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleTatChange = (e) => {
        setTatData({ ...tatData, [e.target.name]: e.target.value });
    };

    const handleUploadTat = async () => {
        if (!tatData.url) {
            setMessage({ type: 'error', text: 'Image URL is required' });
            return;
        }
        setLoading(true);
        try {
            await api.post('/admin/upload/tat', tatData);
            setMessage({ type: 'success', text: 'TAT Image uploaded successfully!' });
            setTatData({ url: '', description1: '', description2: '', description3: '' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const handleUploadWat = async () => {
        if (!watText.trim()) {
            setMessage({ type: 'error', text: 'Please enter at least one word' });
            return;
        }

        const words = watText.split(/[\n,]+/).map(w => w.trim()).filter(w => w.length > 0);
        if (words.length === 0) {
            setMessage({ type: 'error', text: 'No valid words found' });
            return;
        }

        setLoading(true);
        try {
            await api.post('/admin/upload/wat', { words });
            setMessage({ type: 'success', text: `Successfully uploaded ${words.length} words!` });
            setWatText('');
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to upload words. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="data-upload-container">
            <div className="upload-tabs">
                <button
                    className={`tab-btn ${activeTab === 'tat' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('tat'); setMessage({ type: '', text: '' }); }}
                >
                    TAT (Images)
                </button>
                <button
                    className={`tab-btn ${activeTab === 'wat' ? 'active' : ''}`}
                    onClick={() => { setActiveTab('wat'); setMessage({ type: '', text: '' }); }}
                >
                    WAT (Words)
                </button>
            </div>

            <div className="upload-content">
                {message.text && (
                    <div className={`message-banner ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'tat' ? (
                    <div className="tat-form">
                        <div className="form-group">
                            <label>Image URL</label>
                            <input
                                type="text"
                                name="url"
                                value={tatData.url}
                                onChange={handleTatChange}
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        {tatData.url && (
                            <div className="image-preview">
                                <img src={tatData.url} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Context / Theme 1 (Optional)</label>
                            <input
                                type="text"
                                name="description1"
                                value={tatData.description1}
                                onChange={handleTatChange}
                                placeholder="e.g. Leadership under pressure"
                            />
                        </div>
                        <div className="form-group">
                            <label>Context / Theme 2 (Optional)</label>
                            <input
                                type="text"
                                name="description2"
                                value={tatData.description2}
                                onChange={handleTatChange}
                                placeholder="e.g. Group dynamics"
                            />
                        </div>
                        <div className="form-group">
                            <label>Context / Theme 3 (Optional)</label>
                            <input
                                type="text"
                                name="description3"
                                value={tatData.description3}
                                onChange={handleTatChange}
                                placeholder="e.g. Outdoor activity"
                            />
                        </div>

                        <button className="upload-btn primary" onClick={handleUploadTat} disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </div>
                ) : (
                    <div className="wat-form">
                        <div className="form-group">
                            <label>Paste Words</label>
                            <p className="helper-text">Enter words separated by commas or new lines.</p>
                            <textarea
                                value={watText}
                                onChange={(e) => setWatText(e.target.value)}
                                placeholder="Courage, Determination, Leader..."
                                rows={8}
                            />
                        </div>

                        <button className="upload-btn primary" onClick={handleUploadWat} disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload Words'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataUpload;
