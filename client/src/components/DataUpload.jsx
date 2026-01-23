import React, { useState } from 'react';
import api from '../api/axios';
import './DataUpload.css';

const DataUpload = () => {
    const [activeTab, setActiveTab] = useState('tat'); // 'tat' or 'wat'
    const [tatData, setTatData] = useState({ url: '', themes: [''] });
    const [watText, setWatText] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleTatChange = (e) => {
        setTatData({ ...tatData, [e.target.name]: e.target.value });
    };

    const handleThemeChange = (index, value) => {
        const newThemes = [...tatData.themes];
        newThemes[index] = value;
        setTatData({ ...tatData, themes: newThemes });
    };

    const handleAddTheme = () => {
        setTatData({ ...tatData, themes: [...tatData.themes, ''] });
    };

    const handleRemoveTheme = (index) => {
        const newThemes = tatData.themes.filter((_, i) => i !== index);
        setTatData({ ...tatData, themes: newThemes });
    };

    const handleUploadTat = async () => {
        if (!tatData.url) {
            setMessage({ type: 'error', text: 'Image URL is required' });
            return;
        }
        setLoading(true);
        try {
            // Filter empty themes before sending
            const validThemes = tatData.themes.filter(t => t.trim() !== '');

            await api.post('/admin/upload/tat', {
                url: tatData.url,
                descriptions: validThemes
            });
            setMessage({ type: 'success', text: 'TAT Image uploaded successfully!' });
            setTatData({ url: '', themes: [''] });
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

                        <div className="themes-section">
                            <label>Context / Themes (Optional)</label>
                            {tatData.themes.map((theme, index) => (
                                <div key={index} className="theme-input-group" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <input
                                        type="text"
                                        value={theme}
                                        onChange={(e) => handleThemeChange(index, e.target.value)}
                                        placeholder={`Theme ${index + 1} (e.g. Leadership)`}
                                        style={{ flex: 1 }}
                                    />
                                    {tatData.themes.length > 1 && (
                                        <button
                                            className="remove-btn"
                                            onClick={() => handleRemoveTheme(index)}
                                            style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 10px', cursor: 'pointer' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                className="add-btn"
                                onClick={handleAddTheme}
                                style={{ background: 'transparent', border: '1px dashed #4b5563', color: '#9ca3af', width: '100%', padding: '8px', borderRadius: '4px', cursor: 'pointer', marginBottom: '1rem' }}
                            >
                                + Add another theme
                            </button>
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
