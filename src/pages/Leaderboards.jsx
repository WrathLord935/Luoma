import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Leaderboards.css';
import { Trophy, Heart, Award, ArrowUp, Crown, Camera, Calendar } from 'lucide-react';
import Button from '../components/Button';
import ItemModal from '../components/ItemModal';

const MOCK_CREATIONS = [
    { id: 101, title: 'Reworked Denim Jacket', owner: '@alex_styles', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', votes: 45, category: 'Outerwear', condition: 'Functionally New', size: 'M', distance: '0.5km', type: 'Trade' },
    { id: 102, title: 'Patchwork Tote', owner: '@eco_em', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', votes: 32, category: 'Accessories', condition: 'Good', size: 'One Size', distance: '1.2km', type: 'Sell' },
    { id: 103, title: 'Vintage Band Tee Flip', owner: '@retro_king', image: 'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', votes: 28, category: 'Tops', condition: 'Vintage', size: 'L', distance: '3.5km', type: 'Trade' },
    { id: 104, title: 'Hand-Painted Jeans', owner: '@art_wear', image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', votes: 67, category: 'Bottoms', condition: 'New with Tags', size: '32', distance: '2.0km', type: 'Sell' },
    { id: 105, title: 'Crochet Bucket Hat', owner: '@yarn_guru', image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', votes: 19, category: 'Accessories', condition: 'Handmade', size: 'One Size', distance: '0.8km', type: 'Donate' },
    { id: 106, title: 'Upcycled Cargo Pants', owner: '@street_sage', image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', votes: 55, category: 'Bottoms', condition: 'Good', size: '34', distance: '1.5km', type: 'Trade' },
];

const DONORS_monthly = [
    { rank: 1, name: '@sarah_gives', donated: 14, avatar: 'S' },
    { rank: 2, name: '@mike_recycle', donated: 12, avatar: 'M' },
    { rank: 3, name: '@jenna_loops', donated: 9, avatar: 'J' },
    { rank: 4, name: '@chris_green', donated: 7, avatar: 'C' },
    { rank: 5, name: '@pat_planet', donated: 5, avatar: 'P' },
    { rank: 6, name: '@kim_thrifty', donated: 4, avatar: 'K' },
    { rank: 7, name: '@alex_styles', donated: 2, avatar: 'A' },
];

const DONORS_all_time = [
    { rank: 1, name: '@sarah_gives', donated: 142, avatar: 'S' },
    { rank: 2, name: '@mike_recycle', donated: 98, avatar: 'M' },
    { rank: 3, name: '@jenna_loops', donated: 76, avatar: 'J' },
    { rank: 4, name: '@chris_green', donated: 45, avatar: 'C' },
    { rank: 5, name: '@pat_planet', donated: 32, avatar: 'P' },
    { rank: 6, name: '@kim_thrifty', donated: 28, avatar: 'K' },
    { rank: 7, name: '@alex_styles', donated: 15, avatar: 'A' },
];

function Leaderboards() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('creations'); // 'creations' | 'donors'
    const [timeFrame, setTimeFrame] = useState('all_time'); // 'monthly' | 'all_time'
    const [userVotes, setUserVotes] = useState({});
    const [creations, setCreations] = useState(MOCK_CREATIONS);
    const [selectedItem, setSelectedItem] = useState(null);

    // Load votes from local storage on mount
    useEffect(() => {
        const storedVotes = JSON.parse(localStorage.getItem('looma_votes') || '{}');
        setUserVotes(storedVotes);
    }, []);

    const handleUpvote = (id, e) => {
        e.stopPropagation(); // Prevent opening modal when voting
        const isVoted = userVotes[id];
        const newVotes = { ...userVotes, [id]: !isVoted };

        setUserVotes(newVotes);
        localStorage.setItem('looma_votes', JSON.stringify(newVotes));

        // Optimistically update counts
        setCreations(prev => prev.map(item =>
            item.id === id
                ? { ...item, votes: item.votes + (isVoted ? -1 : 1) }
                : item
        ));
    };

    const activeDonors = timeFrame === 'monthly' ? DONORS_monthly : DONORS_all_time;
    const top3 = activeDonors.slice(0, 3);
    const restOfDonors = activeDonors.slice(3);

    // Helper to render podium step
    const renderPodiumStep = (donor, position, rank) => (
        <div className={`podium-step position-${position} rank-${rank}`}>
            <div className="podium-avatar-wrapper">
                <div className="podium-avatar">{donor.avatar}</div>
                <div className="podium-rank-badge">{rank}</div>
                {rank === 1 && <div className="podium-glow"></div>}
            </div>
            <div className="podium-block">
                {rank === 1 && <Crown className="podium-crown" size={32} />}
                <div className="podium-info">
                    <span className="podium-name">{donor.name}</span>
                    <span className="podium-score">{donor.donated}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="leaderboards-page">
            <h1 className="page-title">Community Hall of Fame</h1>

            <div className="leaderboard-tabs">
                <button
                    className={`tab-btn ${activeTab === 'creations' ? 'active' : ''}`}
                    onClick={() => setActiveTab('creations')}
                >
                    <Heart size={20} />
                    Marketplace Creations
                </button>
                <button
                    className={`tab-btn ${activeTab === 'donors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('donors')}
                >
                    <Trophy size={20} />
                    Top Donors
                </button>
            </div>

            <div className="leaderboard-content">
                {activeTab === 'creations' ? (
                    <div className="creations-section animate-fade-in">
                        <div className="contest-banner">
                            <div className="contest-info">
                                <h3>Monthly Theme: Denim Redux</h3>
                                <p>Show us how you style or rework denim!</p>
                            </div>
                            <Button className="contest-btn" onClick={() => navigate('/upload')}>
                                <Camera size={18} /> Submit Entry
                            </Button>
                        </div>

                        <div className="creations-grid">
                            {creations.sort((a, b) => b.votes - a.votes).map((item, index) => (
                                <div
                                    key={item.id}
                                    className="creation-card"
                                    onClick={() => setSelectedItem(item)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="card-rank">#{index + 1}</div>
                                    <div className="creation-image-wrapper">
                                        <img src={item.image} alt={item.title} className="creation-image" />
                                        <div className="creation-overlay">
                                            <button
                                                className={`vote-btn ${userVotes[item.id] ? 'voted' : ''}`}
                                                onClick={(e) => handleUpvote(item.id, e)}
                                            >
                                                <ArrowUp size={24} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="creation-details">
                                        <h3>{item.title}</h3>
                                        <div className="creation-meta">
                                            <span className="owner">{item.owner}</span>
                                            <span className="votes">
                                                <Heart size={14} fill="currentColor" /> {item.votes}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="donors-section animate-fade-in">
                        <div className="time-filter-container">
                            <div className="time-toggle">
                                <button
                                    className={`toggle-option ${timeFrame === 'monthly' ? 'active' : ''}`}
                                    onClick={() => setTimeFrame('monthly')}
                                >
                                    This Month
                                </button>
                                <button
                                    className={`toggle-option ${timeFrame === 'all_time' ? 'active' : ''}`}
                                    onClick={() => setTimeFrame('all_time')}
                                >
                                    All Time
                                </button>
                            </div>
                        </div>

                        {/* PODIUM VIEW */}
                        <div className="podium-container">
                            {/* Rank 2 (Left) */}
                            {renderPodiumStep(top3[1], 'left', 2)}
                            {/* Rank 1 (Center) */}
                            {renderPodiumStep(top3[0], 'center', 1)}
                            {/* Rank 3 (Right) */}
                            {renderPodiumStep(top3[2], 'right', 3)}
                        </div>

                        <div className="donors-list">
                            {restOfDonors.map((donor) => (
                                <div key={donor.rank} className="donor-row">
                                    <div className="rank-badge-small">#{donor.rank}</div>
                                    <div className="donor-info">
                                        <div className="donor-avatar small">{donor.avatar}</div>
                                        <span className="donor-name">{donor.name}</span>
                                    </div>
                                    <div className="donor-stats">
                                        <span className="stat-value small">{donor.donated}</span>
                                        <span className="stat-label">items</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {selectedItem && (
                <ItemModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
}

export default Leaderboards;
