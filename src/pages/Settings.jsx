import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Bell, Lock, User, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import Toast from '../components/Toast';
import './Settings.css';

const Toggle = ({ label, checked, onChange }) => (
    <div className="config-toggle-row">
        <span className="config-label">{label}</span>
        <button
            className={`config-switch ${checked ? 'active' : ''}`}
            onClick={() => onChange(!checked)}
        >
            <div className="switch-handle" />
        </button>
    </div>
);

export default function Settings() {
    const { user } = useAuth();
    const { location: geoData, loading: geoLoading, getLocation } = useGeolocation();

    // State for identity - Initialize with user data or defaults
    const [name, setName] = useState(user?.user_metadata?.username || 'TEJAS PATEL');
    const [bio, setBio] = useState(user?.user_metadata?.bio || 'ARCHIVIST');
    const [location, setLocation] = useState(user?.user_metadata?.location || 'NEW YORK CITY');

    // Toast State
    const [toast, setToast] = useState(null); // { message, type }

    // Update state if user data loads later
    useEffect(() => {
        if (user) {
            if (user.user_metadata?.username) setName(user.user_metadata.username);
            if (user.user_metadata?.bio) setBio(user.user_metadata.bio);
            if (user.user_metadata?.location) setLocation(user.user_metadata.location);
        }
    }, [user]);

    // Update location when geolocation finishes
    useEffect(() => {
        if (geoData.city) {
            setLocation(`${geoData.city.toUpperCase()}, ${geoData.country || ''}`);
        }
    }, [geoData]);

    const handleLocateScale = () => {
        getLocation();
    };

    // State for preferences
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [publicProfile, setPublicProfile] = useState(true);
    const [dataSharing, setDataSharing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { updateUserProfile, logout } = useAuth(); // Destructure methods

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateUserProfile({
                username: name,
                bio,
                location
            });
            setToast({ message: "CONFIGURATION SYNCED SUCCESSFULLY", type: 'success' });
        } catch (error) {
            console.error("Failed to save settings:", error);
            setToast({ message: "FAILED TO SYNC CONFIGURATION", type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="config-page">
            <div className="config-container">
                {/* TOAST NOTIFICATION */}
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}

                {/* HEADER */}
                <header className="config-header">
                    <h1 className="config-title">SYSTEM CONFIGURATION</h1>
                    <div className="config-meta">
                        <span>USER_ID: {user?.id?.slice(0, 8).toUpperCase() || '8829-TP'}</span>
                        <span>STATUS: ACTIVE</span>
                    </div>
                </header>

                {/* SECTION: IDENTITY */}
                <section className="config-section">
                    <div className="section-header">
                        <User size={16} />
                        <h2>IDENTITY MATRIX</h2>
                    </div>

                    <div className="input-group">
                        <label>DISPLAY NAME</label>
                        <input
                            type="text"
                            className="config-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>ROLE / BIO</label>
                        <input
                            type="text"
                            className="config-input"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            LOCATION NODE
                            <button
                                onClick={handleLocateScale}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-primary)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {geoLoading ? 'TRIANGULATING...' : <><MapPin size={12} /> AUTO-LOCATE</>}
                            </button>
                        </label>
                        <input
                            type="text"
                            className="config-input"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </section>

                {/* SECTION: PREFERENCES */}
                <section className="config-section">
                    <div className="section-header">
                        <Bell size={16} />
                        <h2>NOTIFICATION RELAY</h2>
                    </div>

                    <div className="toggles-wrapper">
                        <Toggle
                            label="EMAIL ALERTS"
                            checked={emailAlerts}
                            onChange={setEmailAlerts}
                        />
                        <Toggle
                            label="PUBLIC VISIBILITY"
                            checked={publicProfile}
                            onChange={setPublicProfile}
                        />
                        <Toggle
                            label="DATA SHARING"
                            checked={dataSharing}
                            onChange={setDataSharing}
                        />
                    </div>
                </section>

                {/* SECTION: DANGER ZONE */}
                <section className="config-section danger-zone">
                    <div className="section-header">
                        <AlertTriangle size={16} />
                        <h2>DANGER ZONE</h2>
                    </div>

                    <div className="danger-actions">
                        <p className="danger-text">
                            Irreversible actions. Proceed with caution.
                        </p>
                        <button className="btn-danger">
                            DEACTIVATE ACCOUNT
                        </button>
                    </div>
                </section>

                {/* FOOTER ACTIONS */}
                <div className="config-footer">
                    <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                        <Save size={16} />
                        {isSaving ? 'UPLOADING...' : 'SAVE CHANGES'}
                    </button>
                    <button className="btn-logout" onClick={() => logout()}>
                        <LogOut size={16} />
                        LOGOUT
                    </button>
                </div>
            </div>
        </div>
    );
}
