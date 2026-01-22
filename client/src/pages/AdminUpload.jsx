import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './AdminUpload.css';

export default function AdminUpload() {
    const navigate = useNavigate();
    const [links, setLinks] = useState(['']); // Start with one empty input
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleAddInput = () => {
        setLinks([...links, '']);
    };

    const handleChange = (index, value) => {
        const newLinks = [...links];
        newLinks[index] = value;
        setLinks(newLinks);
    };

    const handleRemove = (index) => {
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validLinks = links.filter(l => l.trim() !== '');
        if (validLinks.length === 0) {
            setMessage("Please enter at least one link.");
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            await api.post('/content/upload', { links: validLinks });
            setMessage('Content uploaded successfully!');
            setLinks(['']); // Reset
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.error || "Failed to upload.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-upload-page">
            <div className="upload-container">
                <h1>Upload content on platform</h1>

                {message && <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

                <form onSubmit={handleSubmit}>
                    {links.map((link, index) => (
                        <div key={index} className="input-group">
                            <input
                                type="text"
                                placeholder="Paste YouTube Link here..."
                                value={link}
                                onChange={(e) => handleChange(index, e.target.value)}
                                className="link-input"
                            />
                            {links.length > 1 && (
                                <button type="button" className="btn-remove" onClick={() => handleRemove(index)}>X</button>
                            )}
                        </div>
                    ))}

                    <div className="actions">
                        <button type="button" className="btn-add" onClick={handleAddInput}>
                            +
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Uploading...' : 'Submit Content'}
                        </button>
                    </div>

                    <button type="button" className="btn-back-home" onClick={() => navigate('/candidate-home')}>
                        Back Home
                    </button>
                </form>
            </div>
        </div>
    );
}
