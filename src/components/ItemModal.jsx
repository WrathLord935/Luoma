import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { X, MapPin, MessageCircle, Heart, Share2, Check, ArrowLeft, Send, Sparkles, AlertCircle, Wand2, Calendar, Edit2, Trash2 } from 'lucide-react';
import Button from './Button';
import './ItemModal.css';
import { generateDIYIdeas, generateDIYImage } from '../services/ai';

// Mock Safe Spots
const SAFE_SPOTS = [
    { id: 1, name: 'Central Perks Cafe', address: '123 Main St', distance: '0.5km' },
    { id: 2, name: 'City Mall Entrance', address: '456 Commerce Blvd', distance: '1.2km' },
    { id: 3, name: 'Community Library', address: '789 Book Rd', distance: '0.8km' }
];

export default function ItemModal({ item, onClose }) {
    const { user, userProfile } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState('details'); // 'details', 'chat', 'logistics'
    const [isShared, setIsShared] = useState(false);

    // Chat State
    const [messages, setMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    // Logistics State
    const [selectedSpot, setSelectedSpot] = useState(null);

    // AI DIY State
    const [aiIdeas, setAiIdeas] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiImage, setAiImage] = useState(null);
    const [aiImageLoading, setAiImageLoading] = useState(false);
    const [expandedIdea, setExpandedIdea] = useState(null);

    const [firstLoad, setFirstLoad] = useState(true);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (item) { // Only reset chat if it's a different item or fresh open
            if (firstLoad) {
                setView('details');
                setMessages([
                    { id: 1, sender: 'system', text: `Start a conversation about ${item.title}` },
                    { id: 2, sender: 'owner', text: `Hi! Let me know if you have any questions.` }
                ]);
                setSelectedSpot(null);
                setAiIdeas(null); // Reset AI
                setAiImage(null);
                setFirstLoad(false);
            }
        }
    }, [item]);

    // Cleanup when closing
    useEffect(() => {
        if (!item) setFirstLoad(true);
    }, [item]);

    // Scroll chat to bottom
    useEffect(() => {
        if (view === 'chat' && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, view, isTyping]);

    if (!item) return null;

    const handleLike = async () => {
        if (!user || !userProfile) return alert("Please sign in to favorite items.");

        const currentFavs = userProfile?.favourites || [];
        const isCurrentlyLiked = currentFavs.includes(item.id);

        // Optimistic UI update only - Backend Disabled per Revert Request
        if (isCurrentlyLiked) {
            setIsLiked(false);
        } else {
            setIsLiked(true);
        }

        // Backend logic removed.
    };



    const handleShare = async () => {
        const shareData = {
            title: `Check out this ${item.title} on LOOMA`,
            text: `Found this cool ${item.title} by ${item.owner}.`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log('Error sharing', err);
            }
        } else {
            navigator.clipboard.writeText(`Check out this ${item.title}: ${window.location.href}`);
            setIsShared(true);
            setTimeout(() => setIsShared(false), 2000);
        }
    };

    const sendMessage = () => {
        if (!chatInput.trim()) return;

        const userMsg = { id: Date.now(), sender: 'me', text: chatInput };
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsTyping(true);

        // Simulate "real" 2-way delay
        setTimeout(() => {
            const reply = {
                id: Date.now() + 1,
                sender: 'owner',
                text: "Thanks for asking! Yes, it's still available. When can you meet?"
            };
            setMessages(prev => [...prev, reply]);
            setIsTyping(false);
        }, 2000);
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this item? This cannot be undone.")) {
            const { error } = await supabase
                .from('clothing')
                .delete()
                .eq('id', item.id);

            if (error) {
                console.error("Error deleting item:", error);
                alert("Failed to delete item.");
            } else {
                alert("Item deleted successfully.");
                onClose();
                window.location.reload(); // Simple refresh to clear it from list
            }
        }
    };

    const handleUpcycle = async () => {
        setView('upcycle');
        if (!aiIdeas) {
            setAiLoading(true);
            try {
                const data = await generateDIYIdeas(item);
                setAiIdeas(data.ideas);
                // Pre-fetch image for first idea
                if (data.ideas.length > 0) {
                    handleGenerateImage(data.ideas[0].title);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setAiLoading(false);
            }
        }
    };

    const handleGenerateImage = async (ideaTitle) => {
        setAiImageLoading(true);
        setAiImage(null);
        try {
            const url = await generateDIYImage(ideaTitle);
            setAiImage(url);
        } catch (err) {
            console.error(err);
        } finally {
            setAiImageLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content animate-pop-in ${view === 'upcycle' ? 'modal-wide' : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                {/* Back Button for sub-views */}
                {view !== 'details' && (
                    <button className="modal-back" onClick={() => setView('details')}>
                        <ArrowLeft size={24} />
                    </button>
                )}

                <div className="modal-grid">
                    <div className="modal-image-col">
                        <div className="modal-image-wrapper">
                            <img src={view === 'upcycle' && aiImage ? aiImage : item.image} alt={item.title} className="modal-image" />
                            {view === 'upcycle' && aiImageLoading && (
                                <div className="loading-overlay">
                                    <Sparkles className="spin-slow" size={32} />
                                </div>
                            )}

                            {item.status && view !== 'upcycle' && (
                                <div className={`modal-badge badge-${item.status === 'SOLD OUT' ? 'sold' : 'rare'}`}>
                                    {item.status}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-details-col">

                        {/* VIEW 1: DETAILS */}
                        {view === 'details' && (
                            <>
                                <div className="modal-header">
                                    <div className="modal-sup">
                                        <span className="modal-category">{item.category}</span>
                                        <span className="modal-dot">•</span>
                                        <span className="modal-condition">{item.condition}</span>
                                    </div>
                                    <h2 className="modal-title">{item.title}</h2>
                                    <div className="modal-meta">
                                        <div className="modal-location">
                                            <MapPin size={16} className="text-accent" />
                                            <span>{item.distance} away</span>
                                        </div>
                                        <div className="modal-size">Size: {item.size}</div>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    {(userProfile?.username === item.owner || user?.email === item.owner) ? (
                                        <div className="owner-actions" style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                            <Button className="flex-1" onClick={() => navigate(`/edit/${item.id}`)}>
                                                <Edit2 size={20} />
                                                Edit
                                            </Button>
                                            <Button variant="outline" className="flex-1" onClick={handleDelete} style={{ borderColor: 'red', color: 'red' }}>
                                                <Trash2 size={20} />
                                                Delete
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button className="flex-1" onClick={() => setView('chat')}>
                                            <MessageCircle size={20} />
                                            Message {item.owner}
                                        </Button>
                                    )}

                                    <Button variant="outline" className="split-btn" onClick={() => setView('logistics')}>
                                        {item.type === 'Donate' ? 'Claim (Free)' : item.type}
                                    </Button>
                                    <Button variant="outline" className="split-btn action-magic" onClick={handleUpcycle}>
                                        <Wand2 size={18} />
                                        Magic Upcycle
                                    </Button>
                                    <button className="icon-btn-large" onClick={handleShare}>
                                        {isShared ? <Check size={24} /> : <Share2 size={24} />}
                                    </button>
                                </div>

                                <div className="modal-description">
                                    <h3>About this item</h3>
                                    <p>
                                        {item.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="modal-seller">
                                    <div className="seller-avatar">{item.owner[0]}</div>
                                    <div className="seller-info">
                                        <div className="seller-name">Listed by {item.owner}</div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* VIEW 2: CHAT */}
                        {view === 'chat' && (
                            <div className="modal-view-container animate-fade-in">
                                <h3 className="view-title">Chat with {item.owner}</h3>
                                <div className="chat-window">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`chat-bubble ${msg.sender === 'me' ? 'me' : 'them'}`}>
                                            {msg.text}
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="typing-indicator">{item.owner} is typing...</div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                                <div className="chat-input-area">
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        autoFocus
                                    />
                                    <button className="send-btn" onClick={sendMessage}>
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* VIEW 3: LOGISTICS */}
                        {view === 'logistics' && (
                            <div className="modal-view-container animate-fade-in">
                                <h3 className="view-title">
                                    {item.type === 'Donate' ? 'Pickup Instructions' : 'Select a Safe Spot'}
                                </h3>

                                {item.type === 'Donate' ? (
                                    <div className="logistics-content">
                                        <div className="info-card">
                                            <p><strong>Seller's Rule from {item.owner}:</strong></p>
                                            <p style={{ marginTop: '4px', fontStyle: 'italic' }}>"Please pick up from the front desk during business hours."</p>
                                            <p className="address"><MapPin size={16} /> 101 College Dorms, Block B</p>
                                        </div>
                                        <div style={{ marginTop: 'auto' }}>
                                            <Button className="w-full">Confirm Pickup</Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="logistics-content">
                                        <p className="subtitle">Choose a verified safe location for your <strong>{item.type}</strong>:</p>
                                        <div className="spots-list">
                                            {SAFE_SPOTS.map(spot => (
                                                <div
                                                    key={spot.id}
                                                    className={`spot-card ${selectedSpot === spot.id ? 'selected' : ''}`}
                                                    onClick={() => setSelectedSpot(spot.id)}
                                                >
                                                    <div className="spot-info">
                                                        <strong>{spot.name}</strong>
                                                        <span>{spot.address} ({spot.distance})</span>
                                                    </div>
                                                    {selectedSpot === spot.id && <Check size={20} className="text-accent" />}
                                                </div>
                                            ))}
                                        </div>
                                        <Button className="w-full" disabled={!selectedSpot}>
                                            Propose Meetup
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* VIEW 4: MAGIC UPCYCLE */}
                        {view === 'upcycle' && (
                            <div className="modal-view-container animate-fade-in">
                                <h3 className="view-title">
                                    <Sparkles size={18} className="text-highlight" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'text-bottom' }} />
                                    Magic Upcycle
                                </h3>
                                <p className="subtitle">AI-powered DIY ideas for this item.</p>

                                <div className="upcycle-content">
                                    {aiLoading ? (
                                        <div className="ai-loading-state">
                                            <Sparkles className="spin-icon text-highlight" size={32} />
                                            <p>Analyzing fabric potentials...</p>
                                        </div>
                                    ) : (
                                        <div className="ideas-feed">
                                            {aiIdeas && aiIdeas.map((idea, idx) => (
                                                <div key={idx} className="idea-card">
                                                    <div className="idea-header">
                                                        <h4>{idea.title}</h4>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {idea.feasibilityScore && (
                                                                <span className="feasibility-score" title={`Feasibility: ${idea.feasibilityScore}/10`}>
                                                                    {idea.feasibilityScore}/10
                                                                </span>
                                                            )}
                                                            <span className={`difficulty-badge ${idea.difficulty.toLowerCase()}`}>{idea.difficulty}</span>
                                                        </div>
                                                    </div>
                                                    <p>{idea.description}</p>

                                                    {idea.materials && idea.materials.length > 0 && (
                                                        <div className="idea-materials">
                                                            <small><strong>Materials:</strong> {idea.materials.join(', ')}</small>
                                                        </div>
                                                    )}

                                                    {idea.steps && idea.steps.length > 0 && (
                                                        <div className="idea-steps-section">
                                                            <button
                                                                className="steps-toggle-btn"
                                                                onClick={() => setExpandedIdea(expandedIdea === idx ? null : idx)}
                                                            >
                                                                {expandedIdea === idx ? '▼' : '▶'} Step-by-Step Instructions ({idea.steps.length} steps)
                                                            </button>

                                                            {expandedIdea === idx && (
                                                                <ol className="steps-list">
                                                                    {idea.steps.map((step, stepIdx) => (
                                                                        <li key={stepIdx}>{step}</li>
                                                                    ))}
                                                                </ol>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="idea-footer">
                                                        <Button size="sm" variant="ghost" className="try-btn" onClick={() => handleGenerateImage(idea.title)}>
                                                            Visualize <Wand2 size={14} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
