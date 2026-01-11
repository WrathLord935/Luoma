import React, { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './EditProfileModal.css';

export default function EditProfileModal({ isOpen, onClose }) {
    const { user, updateUserProfile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Initial state from user metadata
    const [formData, setFormData] = useState({
        username: user?.user_metadata?.username || '',
        bio: user?.user_metadata?.bio || '',
        location: user?.user_metadata?.location || 'New York City' // Default fallback
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserProfile(formData);
            onClose();
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h2>EDIT IDENTITY</h2>
                    <button onClick={onClose} className="close-btn" disabled={loading}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="form-group">
                        <label>DISPLAY NAME</label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                            placeholder="ARCHIVIST_NAME"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>BIO / ROLE</label>
                        <input
                            type="text"
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Sustainable Designer..."
                        />
                    </div>

                    <div className="form-group">
                        <label>LOCATION NODE</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            placeholder="New York City"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
                            CANCEL
                        </button>
                        <button type="submit" className="btn-save-primary" disabled={loading}>
                            {loading ? <Loader2 className="spin" size={16} /> : <Save size={16} />}
                            SAVE CHANGES
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
