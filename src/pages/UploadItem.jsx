import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Upload, X, Wand2, MapPin, Shirt, Scissors, Tag, Zap, Sparkles, ArrowRight, ArrowLeft, Check, ArrowLeftRight } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import ItemCard from '../components/ItemCard';
import './UploadItem.css';

const CATEGORIES = [
    { id: 'tops', label: 'Tops', icon: Shirt, desc: 'Tees, Hoodies, Jackets' },
    { id: 'bottoms', label: 'Bottoms', icon: Scissors, desc: 'Jeans, Skirts, Shorts' },
    { id: 'shoes', label: 'Shoes', icon: Tag, desc: 'Sneakers, Boots, Loafers' },
    { id: 'accessories', label: 'Access.', icon: Zap, desc: 'Jewelry, Bags, Hats' },
];

const CONDITIONS = [
    { id: 'new', label: 'New', color: '#10B981', desc: 'Never worn, with tags' },
    { id: 'like_new', label: 'Like New', color: '#3B82F6', desc: 'Worn once or twice' },
    { id: 'good', label: 'Good', color: '#F59E0B', desc: 'Well loved, lots of life' },
    { id: 'fair', label: 'Fair', color: '#EF4444', desc: 'Visible wear or flaws' },
];

export default function UploadItem() {
    const navigate = useNavigate();
    const { user, userProfile } = useAuth();
    const { id } = useParams();
    const isEditMode = !!id;
    const [step, setStep] = useState(1); // Reset to 1 for real flow
    const [dragging, setDragging] = useState(false);
    const [images, setImages] = useState([]); // Empty default
    const [selectedFile, setSelectedFile] = useState(null);
    const [isThinking, setIsThinking] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: 'Debug Item',
        description: 'Testing UI',
        price: '50',
        type: 'sell',
        category: 'tops',
        condition: 'new',
        location: 'New York, NY',
        width: '22',
        length: '28',
        size: 'L'
    });

    // Load existing data if Edit Mode
    useEffect(() => {
        if (isEditMode && id) {
            const fetchItem = async () => {
                const { data, error } = await supabase
                    .from('clothing')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) {
                    console.error("Error fetching item for edit:", error);
                    alert("Could not load item details.");
                    navigate('/marketplace');
                } else if (data) {
                    setFormData({
                        title: data.itemname,
                        description: data.description,
                        price: data.price ? String(data.price) : '',
                        type: data.medium || 'sell',
                        category: data.clothType || 'tops',
                        condition: data.condition || 'good',
                        location: data.location || 'New York, NY',
                        width: data.width ? String(data.width) : '',
                        length: data.length ? String(data.length) : '',
                        size: data.size || ''
                    });
                    if (data.image_url) {
                        setImages([data.image_url]);
                    }
                    setStep(3); // Jump to details view for quick edit
                }
            };
            fetchItem();
        }
    }, [isEditMode, id, navigate]);

    // Mock Drag & Drop
    const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const newImage = "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"; // Higher quality mock
        setImages([...images, newImage]);
        if (step === 1) setTimeout(() => setStep(2), 600); // Auto-advance for flow
    };

    const handleMagicFill = () => {
        setIsThinking(true);
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                title: 'Vintage 90s Patchwork Denim Jacket',
                description: 'Authentic 90s denim jacket with custom patchwork details. Over-dyed wash, slightly distressed. Perfect for layering.',
                price: '45',
                type: 'sell',
                width: '22',
                length: '26',
                size: 'L' // AI Calculated from 22" width
            }));
            setIsThinking(false);
        }, 1500);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = async () => {
        if (!selectedFile) {
            alert("Please upload an image first!");
            return;
        }

        setUploading(true);
        try {
            // 1. Upload Image (Only if new file selected)
            let publicUrl = images[0] || '';

            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('clothing-images')
                    .upload(filePath, selectedFile);

                if (uploadError) {
                    console.error("Storage Upload Error:", uploadError);
                    throw new Error(`Storage Error: ${uploadError.message} (Check Storage Policies)`);
                }

                const { data: { publicUrl: newUrl } } = supabase.storage
                    .from('clothing-images')
                    .getPublicUrl(filePath);

                publicUrl = newUrl;
            }

            // 2. Insert or Update into Database
            const itemData = {
                seller: userProfile?.username || user?.user_metadata?.username || user?.email, // Fallback
                itemname: formData.title,
                description: formData.description,
                image_url: publicUrl,

                // Categories & Filters
                clothType: formData.category, // 'tops', 'bottoms' etc.
                medium: formData.type, // 'swap', 'sell' etc.
                condition: formData.condition, // 'new', 'good' etc.

                // Sizing & Dims
                size: formData.size || 'OS', // Text size: 'L', 'M', etc.
                width: parseFloat(formData.width) || null,
                length: parseFloat(formData.length) || null,

                // Meta
                price: formData.price ? parseFloat(formData.price) : 0,
                location: formData.location
            };

            let dbError;

            if (isEditMode) {
                const { error } = await supabase
                    .from('clothing')
                    .update(itemData)
                    .eq('id', id);
                dbError = error;
            } else {
                const { data, error } = await supabase
                    .from('clothing')
                    .insert([itemData])
                    .select(); // Select to get the ID

                dbError = error;

                // Add to Community Leaderboard
                if (data && data.length > 0) {
                    const newItemId = data[0].id;
                    const { error: lbError } = await supabase
                        .from('communityLeaderboard')
                        .insert([{ item_id: newItemId, favs: 0 }]);

                    if (lbError) console.error("Leaderboard Error:", lbError);
                }
            }

            if (dbError) {
                console.error("Database Insert Error:", dbError);
                throw new Error(`Database Error: ${dbError.message} (Check Table RLS)`);
            }

            navigate('/marketplace');
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    // Preview Item Construction
    const previewItem = {
        id: 'preview',
        title: formData.title || 'Untitled Item',
        image: images[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80',
        type: formData.type.toUpperCase(),
        size: formData.size,
        condition: CONDITIONS.find(c => c.id === formData.condition)?.label || 'Condition',
        distance: '0.1 miles',
        owner: 'You',
        price: formData.price
    };

    return (
        <div className="story-mode-container">
            {/* PROGRESS BAR */}
            <div className="story-progress">
                <div className={`progress-segment ${step >= 1 ? 'active' : ''}`}></div>
                <div className={`progress-segment ${step >= 2 ? 'active' : ''}`}></div>
                <div className={`progress-segment ${step >= 3 ? 'active' : ''}`}></div>
            </div>

            {/* STEP 1: THE DRIPP (MEDIA) */}
            {step === 1 && (
                <div className="story-step-1 animate-fade-in">
                    <h1 className="step-title">First, show us the dripp.</h1>
                    <p className="step-subtitle">Drag and drop your photos here, or click to browse.</p>

                    <input
                        type="file"
                        id="media-upload"
                        className="hidden-file-input"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setSelectedFile(file);
                                const previewUrl = URL.createObjectURL(file);
                                setImages([previewUrl]);
                                setTimeout(() => setStep(2), 600);
                            }
                        }}
                        style={{ display: 'none' }}
                    />

                    <div
                        className={`immersive-dropzone ${dragging ? 'dragging' : ''} ${images.length > 0 ? 'has-image' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('media-upload').click()}
                        style={{ backgroundImage: images.length > 0 ? `url(${images[0]})` : 'none' }}
                    >
                        <div className="dropzone-content">
                            <div className="upload-circle">
                                <Upload size={40} />
                            </div>
                            <span className="drop-text">Drop it like it's hot (or click)</span>
                        </div>
                        {images.length > 0 && <div className="dropzone-overlay" />}
                    </div>

                    {images.length > 0 && (
                        <div className="step-actions">
                            <Button onClick={nextStep} size="lg" className="next-btn-lg">
                                Looks Good <ArrowRight size={20} />
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* STEP 2: THE VIBE (CATEGORY & CONDITION) */}
            {step === 2 && (
                <div className="story-step-2 animate-slide-in-right">
                    <h1 className="step-title">What's the vibe?</h1>

                    <div className="vibe-section">
                        <label>Category</label>
                        <div className="big-grid-options">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`big-option-card ${formData.category === cat.id ? 'selected' : ''}`}
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                >
                                    <cat.icon size={32} />
                                    <span className="opt-label">{cat.label}</span>
                                    <span className="opt-desc">{cat.desc}</span>
                                    {formData.category === cat.id && <div className="check-badge"><Check size={14} /></div>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="vibe-section">
                        <label>Condition</label>
                        <div className="big-grid-options">
                            {CONDITIONS.map(cond => (
                                <button
                                    key={cond.id}
                                    className={`big-option-card ${formData.condition === cond.id ? 'selected' : ''}`}
                                    onClick={() => setFormData({ ...formData, condition: cond.id })}
                                    style={{ '--accent-color': cond.color }}
                                >
                                    <div className="color-dot" style={{ background: cond.color }} />
                                    <span className="opt-label">{cond.label}</span>
                                    <span className="opt-desc">{cond.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="step-nav">
                        <Button className="nav-back" onClick={prevStep} variant="ghost">
                            <ArrowLeft size={18} /> Back
                        </Button>
                        <Button
                            onClick={nextStep}
                            disabled={!formData.category || !formData.condition}
                            className="nav-next"
                        >
                            Next <ArrowRight size={18} />
                        </Button>
                    </div>
                </div>
            )}

            {/* STEP 3: THE STORY (DETAILS) */}
            {step === 3 && (
                <div className="story-step-3 animate-slide-in-right">
                    <div className="step-3-layout">
                        {/* LEFT: LIVE PREVIEW */}
                        <div className="preview-params">
                            <div className="live-card-wrapper">
                                <ItemCard item={previewItem} />
                            </div>
                            <p className="preview-caption">This is how it looks in the feed.</p>
                        </div>

                        {/* RIGHT: FORM */}
                        <div className="details-form">
                            <div className="details-header">
                                <h2>The Title & Story</h2>
                                <Button
                                    className={`magic-btn-sm ${isThinking ? 'thinking' : ''}`}
                                    onClick={handleMagicFill}
                                    disabled={isThinking}
                                >
                                    <Sparkles size={16} className={isThinking ? 'spin-icon' : ''} />
                                    {isThinking ? 'Writing...' : 'Auto-Write'}
                                </Button>
                            </div>

                            <Input
                                placeholder="Give it a catchy title..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="story-input-title"
                            />

                            <textarea
                                className="story-textarea"
                                rows={4}
                                placeholder="What's the story? Size? Flaws? Vibes?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />

                            <div className="form-row-split measurement-row-container">
                                <div className="split-col measure-col">
                                    <label className="tech-label">
                                        <ArrowLeftRight size={14} />
                                        {formData.category === 'bottoms' ? 'Waist & Inseam' : 'Measurements'}
                                    </label>
                                    <div className="measurements-grid">
                                        <div className="measure-input-group">
                                            <div className="input-with-icon">
                                                <Input
                                                    placeholder={formData.category === 'bottoms' ? "30" : "22"}
                                                    className="measure-input"
                                                    value={formData.width || ''}
                                                    onChange={(e) => {
                                                        const width = e.target.value;
                                                        setFormData(prev => {
                                                            const newData = { ...prev, width };

                                                            // Enhanced AI Sizing Logic
                                                            let newSize = prev.size;
                                                            const val = parseInt(width);

                                                            if (val) {
                                                                if (formData.category === 'bottoms') {
                                                                    // Waist Sizing (Standard US Men's roughly)
                                                                    if (val < 28) newSize = 'XS';
                                                                    else if (val < 30) newSize = 'S';
                                                                    else if (val < 32) newSize = 'M';
                                                                    else if (val < 34) newSize = 'L';
                                                                    else newSize = 'XL';
                                                                } else {
                                                                    // Pit-to-Pit Sizing
                                                                    if (val < 19) newSize = 'XS';
                                                                    else if (val < 21) newSize = 'S';
                                                                    else if (val < 23) newSize = 'M';
                                                                    else if (val < 25) newSize = 'L';
                                                                    else newSize = 'XL';
                                                                }
                                                            }
                                                            return { ...newData, size: newSize };
                                                        });
                                                    }}
                                                />
                                                <span className="unit-label">IN</span>
                                            </div>
                                            <span className="measure-label">
                                                {formData.category === 'bottoms' ? 'Waist' : 'Width'}
                                            </span>
                                        </div>
                                        <div className="measure-divider">×</div>
                                        <div className="measure-input-group">
                                            <div className="input-with-icon">
                                                <Input
                                                    placeholder={formData.category === 'bottoms' ? "32" : "28"}
                                                    className="measure-input"
                                                    value={formData.length || ''}
                                                    onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                                                />
                                                <span className="unit-label">IN</span>
                                            </div>
                                            <span className="measure-label">
                                                {formData.category === 'bottoms' ? 'Inseam' : 'Length'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="split-col ai-col">
                                    <label className="tech-label">Fit Check AI</label>
                                    <div className="ai-size-card">
                                        <div className="ai-header">
                                            <Sparkles size={12} className="ai-sparkle" />
                                            <span>ESTIMATED FIT</span>
                                        </div>
                                        <div className="ai-value-row">
                                            <span className="ai-size-value">{formData.size || '-'}</span>
                                            {formData.size && <span className="ai-confidence">98% Match</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-row-split">
                                <div className="split-col">
                                    <label>Type</label>
                                    <div className="pill-toggle">
                                        {['swap', 'sell', 'donate'].map(t => (
                                            <button
                                                key={t}
                                                className={formData.type === t ? 'active' : ''}
                                                onClick={() => setFormData({ ...formData, type: t })}
                                            >
                                                {t.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {formData.type === 'sell' && (
                                    <div className="split-col">
                                        <label>Price</label>
                                        <Input
                                            placeholder="$0.00"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="step-nav final-nav">
                                <Button className="nav-back" onClick={prevStep} variant="ghost">
                                    <ArrowLeft size={18} /> Back
                                </Button>
                                <Button size="lg" className="launch-btn" onClick={handleSubmit} disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Launch Listing'} {!uploading && <ArrowRight size={20} />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
