import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Recycle, TrendingUp, Users, Zap, Leaf, Flame, RefreshCcw, Sparkles, Mountain, Monitor } from 'lucide-react';
import Button from '../components/Button';
import api from '../api';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();

    // --- Voting Logic ---
    // Initialize votes from localStorage or default values
    const [votes, setVotes] = useState(() => {
        const saved = localStorage.getItem('looma_vobe_check');
        return saved ? JSON.parse(saved) : { a: 1240, b: 985, userVoted: null };
    });

    const totalVotes = votes.a + votes.b;
    const percentA = Math.round((votes.a / totalVotes) * 100);
    const percentB = 100 - percentA;

    const handleVote = (option) => {
        if (votes.userVoted) return; // Prevent double voting

        const newVotes = {
            ...votes,
            [option]: votes[option] + 1,
            userVoted: option
        };

        setVotes(newVotes);
        localStorage.setItem('looma_vobe_check', JSON.stringify(newVotes));
    };

    // --- Animation Logic ---
    // Custom hook for counting up animation
    const useCountUp = (end, duration = 2000) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            let startTime = null;
            const animate = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const progress = Math.min((currentTime - startTime) / duration, 1);
                // Ease out quart
                const ease = 1 - Math.pow(1 - progress, 4);

                setCount(Math.floor(ease * end));

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        }, [end, duration]);

        return count;
    };

    // Animated values
    const statTextiles = useCountUp(0);
    const statWater = useCountUp(0);
    const statLoopers = useCountUp(0);

    // Format large numbers
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toLocaleString();
    };

    // --- Backend Data ---
    const [activities, setActivities] = useState([
        { id: 1, user: 'alex', action: 'swapped a North Face Jacket', icon: <Zap size={16} className="icon-cinnamon" />, boldClass: 'text-cinnamon' },
        { id: 2, user: 'sara', action: 'saved 500L of water', icon: <Leaf size={16} className="icon-accent" />, boldClass: 'text-accent' },
        { id: 3, user: 'Market', action: 'New Drop: Vintage Levis', icon: <Flame size={16} className="icon-cinnamon" />, boldClass: 'text-cinnamon' },
        { id: 4, user: 'mike', action: 'listed 3 new items', icon: <Zap size={16} className="icon-accent" />, boldClass: 'text-accent' },
        { id: 5, user: 'System', action: '124 items diverted today', icon: <RefreshCcw size={16} className="icon-cinnamon" />, boldClass: 'text-cinnamon' }
    ]);

    // Fetch posts/activities from backend
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // We'll use the posts endpoint as a proxy for "activity" for now
                // In a real app, we might have a dedicated activity stream endpoint
                const posts = await api.get('/posts');
                if (posts && posts.length > 0) {
                    const mapped = posts.slice(0, 5).map(p => ({
                        id: p.id,
                        user: p.userName || 'User',
                        action: p.type === 'recycle_haul' ? 'recycled a haul' : `posted: ${p.content.substring(0, 20)}...`,
                        icon: <Zap size={16} className="icon-cinnamon" />,
                        boldClass: 'text-cinnamon'
                    }));
                    // Only override if we have enough data to make it look good, otherwise mix or keep default
                    if (mapped.length >= 3) {
                        setActivities(prev => [...mapped, ...prev.slice(0, 2)]);
                    }
                }
            } catch (err) {
                console.log("Using default activity stream");
            }
        };
        fetchPosts();
    }, []);

    const renderActivityItem = (item) => (
        <span key={item.id}>
            {item.icon} <b className={item.boldClass}>{item.user.startsWith('@') ? item.user : '@' + item.user}</b> {item.action}
        </span>
    );

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="home-hero">
                <h1 className="home-title">
                    Welcome to the <br />
                    <span style={{ color: 'var(--color-primary)' }}>Circular Loop.</span>
                </h1>
                <p className="home-subtitle">
                    LOOMA is more than a marketplace. It's a movement to keep fabric in motion and out of landfills.
                    Connect your closet, close the loop.
                </p>
                <Button variant="primary" size="lg" onClick={() => navigate('/marketplace')}>
                    Start Exploring <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                </Button>
            </section>

            {/* Loop Live Marquee */}
            <div className="loop-live-banner">
                <div className="loop-track">
                    {/* Original Set */}
                    <div className="loop-content">
                        {activities.map((item, idx) => (
                            <span key={`a-${idx}`}>
                                {renderActivityItem(item)}
                                <span className="separator">●</span>
                            </span>
                        ))}
                    </div>
                    {/* Duplicate Set for Seamless Loop */}
                    <div className="loop-content" aria-hidden="true">
                        {activities.map((item, idx) => (
                            <span key={`b-${idx}`}>
                                {renderActivityItem(item)}
                                <span className="separator">●</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Style Poll Section - Battle Mode */}
            <section className="poll-section">
                <div className="section-header-wrapper">
                    <h2 className="section-header">Vibe Check <Sparkles size={24} style={{ display: 'inline', marginLeft: '8px', color: 'var(--color-accent)' }} /></h2>
                    <span className="poll-timer">Ends in 2h 14m</span>
                </div>

                <div className="poll-container">
                    <div className={`poll-card option-a ${votes.userVoted === 'a' ? 'voted-active' : ''}`}>
                        <div className="poll-content">
                            <span className="poll-icon"><Mountain size={48} /></span>
                            <h3 className="poll-title">Gorpcore</h3>
                            <div className="poll-bar">
                                <div className="poll-fill" style={{ width: `${percentA}%` }}></div>
                                <span className="poll-percent">{percentA}%</span>
                            </div>
                            <Button
                                variant={votes.userVoted === 'a' ? 'primary' : 'outline'}
                                size="sm"
                                className="vote-btn"
                                onClick={() => handleVote('a')}
                                disabled={!!votes.userVoted}
                            >
                                {votes.userVoted === 'a' ? 'You Voted!' : 'Vote Mountain'}
                            </Button>
                        </div>
                        <div className="poll-bg-pattern"></div>
                    </div>

                    <div className="poll-vs-badge">
                        <span>VS</span>
                    </div>

                    <div className={`poll-card option-b ${votes.userVoted === 'b' ? 'voted-active' : ''}`}>
                        <div className="poll-content">
                            <span className="poll-icon"><Monitor size={48} /></span>
                            <h3 className="poll-title">Y2K Cyber</h3>
                            <div className="poll-bar">
                                <div className="poll-fill" style={{ width: `${percentB}%` }}></div>
                                <span className="poll-percent">{percentB}%</span>
                            </div>
                            <Button
                                variant={votes.userVoted === 'b' ? 'primary' : 'outline'}
                                size="sm"
                                className="vote-btn"
                                onClick={() => handleVote('b')}
                                disabled={!!votes.userVoted}
                            >
                                {votes.userVoted === 'b' ? 'You Voted!' : 'Vote Cyber'}
                            </Button>
                        </div>
                        <div className="poll-bg-pattern"></div>
                    </div>
                </div>
            </section>

            {/* Mission Grid */}
            <section className="mission-grid">
                <div className="mission-card">
                    <div className="card-icon">
                        <Recycle size={24} />
                    </div>
                    <h3 className="card-title">Swap & Save</h3>
                    <p className="card-desc">
                        Trade pieces you don't wear for ones you will. Save money and the planet by keeping clothes in circulation.
                    </p>
                </div>

                <div className="mission-card">
                    <div className="card-icon">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="card-title">Earn Credits</h3>
                    <p className="card-desc">
                        Get rewarded for every item you list. Use LOOMA credits to cop exclusive drops from top curators.
                    </p>
                </div>

                <div className="mission-card">
                    <div className="card-icon">
                        <Users size={24} />
                    </div>
                    <h3 className="card-title">Community First</h3>
                    <p className="card-desc">
                        Join a tribe of conscious creators. Share your fits, climb the leaderboards, and define the new sustainable drip.
                    </p>
                </div>
            </section>

            {/* Impact Stats - Kinetic Bento */}
            <section className="stats-section">
                <div className="stats-header">
                    <h2 className="stats-title">OUR COLLECTIVE <br /><span className="text-highlight">IMPACT</span></h2>
                    <p className="stats-subtitle">Real-time data from the loop.</p>
                </div>

                <div className="stats-bento">
                    <div className="stat-card stat-large animate-pop-in" style={{ animationDelay: '0.1s' }}>
                        <div className="stat-icon-bg"><RefreshCcw /></div>
                        <h3 className="stat-value">{statTextiles.toLocaleString()}<span className="stat-unit">kg</span></h3>
                        <p className="stat-label">Textiles Diverted from Landfills</p>
                    </div>

                    <div className="stat-card stat-medium variant-water animate-pop-in" style={{ animationDelay: '0.2s' }}>
                        <div className="stat-top">
                            <Leaf size={24} />
                            <span className="live-indicator">● LIVE</span>
                        </div>
                        <h3 className="stat-value">{formatNumber(statWater)}</h3>
                        <p className="stat-label">Liters of Water Saved</p>
                    </div>

                    <div className="stat-card stat-medium variant-community animate-pop-in" style={{ animationDelay: '0.3s' }}>
                        <div className="people-stack">
                            <div className="avatar-circle" style={{ background: '#D65A31' }}>A</div>
                            <div className="avatar-circle" style={{ background: '#C2F83E' }}>J</div>
                            <div className="avatar-circle" style={{ background: '#2D1B1B', color: '#FFF' }}>+</div>
                        </div>
                        <h3 className="stat-value">{formatNumber(statLoopers)}</h3>
                        <p className="stat-label">Active Loopers Joining the Movement</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
