import { MapPin, ArrowUpRight, Grid, Archive, Heart, CheckCircle2, Zap, Globe, Loader2, Sparkles, ShieldCheck, QrCode, LocateFixed } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ItemCard from '../components/ItemCard';
import EditProfileModal from '../components/EditProfileModal';
import useGeolocation from '../hooks/useGeolocation';
import './Profile.css';
import { useState, useEffect } from 'react';


// Removed Fake Items

// Simplified Clock - Editorial Style
const LocalTime = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 60000); // Minute update is fine
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="editorial-time">
            <Globe size={12} />
            <span>NYC {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    );
};

import { useAuth } from '../context/AuthContext';

export default function Profile() {
    const { user, userProfile } = useAuth();
    const { location, loading: geoLoading, error: geoError, getLocation } = useGeolocation();
    const [activeTab, setActiveTab] = useState('rotation');
    const [items, setItems] = useState([]);
    const [loadingStats, setLoadingStats] = useState(true);

    const username = userProfile?.username || user?.user_metadata?.username || user?.email;


    // --- 1. NEW UI STATES (From New Frontend) ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isQrExpanded, setIsQrExpanded] = useState(false);

    // Note: Assuming 'location' state logic is defined above or imported. 
    // If 'getLocation' is missing, ensure you have the function defined.
    useEffect(() => {
        if (typeof getLocation === 'function') getLocation();
    }, []);

    // --- 2. BACKEND DATA FETCHING (From Old Backend) ---
    useEffect(() => {
        if (!username) return;

        const fetchItems = async () => {
            setLoadingStats(true);

            let query = supabase
                .from('clothing')
                .select('*')
                .order('created_at', { ascending: false });

            // Backend Filter Matcher
            if (activeTab === 'rotation') {
                query = query.eq('seller', username);
            } else if (activeTab === 'vault') {
                // Placeholder for vault logic if needed
                setItems([]);
                setLoadingStats(false);
                return;
            } else {
                setItems([]);
                setLoadingStats(false);
                return;
            }

            const { data, error } = await query;

            if (error) {
                console.error("Error fetching items:", error);
            } else {
                setItems(data || []);
            }
            setLoadingStats(false);
        };

        fetchItems();
    }, [username, activeTab]);

    // --- 3. DISPLAY LOGIC (From New Frontend) ---
    const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'ARCHIVIST';
    const formattedName = displayName.toUpperCase();
    const userRole = user?.user_metadata?.bio?.toUpperCase() || 'ARCHIVIST';

    // Robust Location Display (Handles missing 'location' object safely)
    const displayLocation = (typeof location !== 'undefined' && location?.city)
        ? `${location.city.toUpperCase()}, ${location.country || ''}`
        : (user?.user_metadata?.location?.toUpperCase() || 'NEW YORK CITY');

    // --- 4. MERGED FILTER ---
    // Instead of filtering MY_ITEMS (fake), we use 'items' (real Supabase data)
    const filteredItems = items;


    return (
        <div className="manifesto-page">
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            {/* QR EXPANSION OVERLAY */}
            {isQrExpanded && (
                <div className="qr-overlay" onClick={() => setIsQrExpanded(false)}>
                    <div className="qr-expanded-card" onClick={e => e.stopPropagation()}>
                        <QrCode size={200} strokeWidth={1} className="qr-large" />
                        <span className="qr-label">SCAN TO CONNECT</span>
                        <div className="qr-user-id">{user?.id?.toUpperCase()}</div>
                    </div>
                </div>
            )}

            {/* MODERN ABSTRACT BANNER */}
            <div className="abstract-banner">
                <div className="banner-gradient"></div>
                <div className="banner-grid-overlay"></div>
            </div>

            <div className="manifesto-container">
                {/* HEADER */}
                <header className="manifesto-header">
                    <div className="header-top">
                        <div className="id-group">
                            <div className="top-row">
                                <div className="profile-id-badge">ID: {user?.id?.slice(0, 8).toUpperCase() || '8829'}</div>
                                <LocalTime />
                            </div>
                        </div>
                        <div className="header-right-group">
                            <button
                                className="qr-code-wrapper interactable"
                                onClick={() => setIsQrExpanded(true)}
                                title="Expand QR Code"
                            >
                                <QrCode size={40} strokeWidth={1.5} />
                            </button>

                            {/* LIVE LOCATION PILL */}
                            <div className={`profile-location ${location.city ? 'is-live' : ''}`} onClick={getLocation} title="Refresh Location">
                                {geoLoading ? (
                                    <span className="pulsing-dot yellow"></span>
                                ) : location.city ? (
                                    <span className="pulsing-dot green"></span>
                                ) : (
                                    <MapPin size={14} />
                                )}
                                {geoLoading ? 'LOCATING...' : displayLocation}
                            </div>
                        </div>
                    </div>

                    <div className="name-wrapper">
                        {/* Dynamic Name from Settings */}
                        <h1 className="manifesto-name">
                            {userProfile?.username || user?.user_metadata?.username || 'ANONYMOUS'}
                        </h1>

                        <div className="holographic-badge tilt-card">
                            <div className="badge-content">
                                <ShieldCheck size={18} strokeWidth={2.5} />
                                <span>VERIFIED</span>
                            </div>
                            <div className="shine"></div>
                        </div>
                    </div>

                    <div className="header-meta">
                        <span className="meta-tag">{userRole}</span>
                        <span className="meta-divider">/</span>
                        <span className="meta-tag">LVL 05</span>
                        <span className="meta-divider">/</span>
                        <span className="meta-tag">SUSTAINABLE</span>
                        <span className="meta-divider">/</span>
                        <span className="meta-tag flex-center"><Zap size={14} className="text-highlight" /> HIGH_VOLTAGE</span>

                        <button
                            className="edit-link"
                            onClick={() => setIsEditModalOpen(true)}
                        >
                            EDIT PROFILE <ArrowUpRight size={14} />
                        </button>
                    </div>
                </header>

                {/* DATA GRID */}
                <section className="manifesto-stats">
                    <div className="stat-cell">
                        <div className="stat-icon-bg"><Sparkles size={24} /></div>
                        <span className="stat-value">98.5</span>
                        <span className="stat-label">VIBE CHECK</span>
                    </div>
                    <div className="stat-cell border-left border-right">
                        <div className="stat-icon-bg"><Archive size={24} /></div>
                        <span className="stat-value">42</span>
                        <span className="stat-label">CIRCULATED</span>
                    </div>
                    <div className="stat-cell">
                        <div className="stat-icon-bg"><Globe size={24} /></div>
                        <span className="stat-value">350kg</span>
                        <span className="stat-label">IMPACT</span>
                    </div>
                </section>

                {/* TABS */}
                <section className="manifesto-controls">
                    <div className="tabs-wrapper">
                        <button
                            className={`tactile-tab ${activeTab === 'rotation' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rotation')}
                        >
                            <Grid size={16} />
                            <span>ROTATION</span>
                            <span className="tab-count">{activeTab === 'rotation' ? items.length : ''}</span>
                        </button>
                        <button
                            className={`tactile-tab ${activeTab === 'vault' ? 'active' : ''}`}
                            onClick={() => setActiveTab('vault')}
                        >
                            <Archive size={16} />
                            <span>THE VAULT</span>
                            <span className="tab-count">0</span>
                        </button>

                    </div>
                </section>

                {/* GALLERY */}
                <section className="manifesto-gallery">
                    <div className="gallery-grid">
                        {loadingStats ? (
                            <div className="loading-state flex-center" style={{ width: '100%', padding: '4rem' }}>
                                <Loader2 className="spin-icon" size={32} />
                            </div>
                        ) : filteredItems.length > 0 ? (
                            filteredItems.map((item) => (
                                <ItemCard key={item.id} item={mapToCard(item)} />
                            ))
                        ) : (
                            <div className="empty-manifesto">
                                <span>NO ITEMS FOUND</span>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '0.5rem' }}>Upload items to see them here.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
