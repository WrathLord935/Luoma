import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../api';
import './Marketplace.css';

import { supabase } from '../lib/supabase';

const ITEMS_PER_PAGE = 9; // 3 rows of 3

import ItemModal from '../components/ItemModal';

export default function Marketplace() {
    // Timer state
    const [timeLeft, setTimeLeft] = useState(8099);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [selectedItem, setSelectedItem] = useState(null);

    // Data State
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Unified Filter State
    const [filters, setFilters] = useState({
        search: '',
        types: [],          // ['sell', 'swap', 'donate'] (DB uses lowercase)
        categories: [],     // ['tops', 'bottoms', 'shoes', 'accessories'] (DB uses lowercase)
        maxDistance: 50,    // km value
        tags: []            // ['Rare Finds', 'Trending', 'New Arrivals', 'Sold Out']
    });

    // Fetch Real Items
    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('clothing')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching market items:", error);
            } else {
                setItems(data || []);
            }
            setLoading(false);
        };
        fetchItems();
    }, []);

    // Helper to toggle array items
    const toggleFilter = (category, value) => {
        setFilters(prev => {
            const current = prev[category];
            const newArray = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [category]: newArray };
        });
    };

    // Helper to handle simple updates
    const updateFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };



    // Filter Logic
    const filteredItems = items.filter((item) => {
        // 1. Search
        const matchesSearch = item.itemname.toLowerCase().includes(filters.search.toLowerCase());

        // 2. Type (DB: 'sell', 'swap', 'donate')
        // Marketplace UI uses 'Buy' (for sell), 'Swap', 'Donate'. DB has 'sell'.
        // We need to map UI 'Buy' -> DB 'sell'.
        const matchesType = filters.types.length === 0 || filters.types.some(t => {
            const dbType = item.medium?.toLowerCase();
            if (t === 'Buy') return dbType === 'sell';
            return dbType === t.toLowerCase();
        });

        // 3. Category (DB: 'tops', 'bottoms' etc.)
        const matchesCategory = filters.categories.length === 0 || filters.categories.some(c => item.clothType?.toLowerCase() === c.toLowerCase());

        // 4. Distance (Skipped for now as we don't have coords)
        // const itemDist = item.distanceValue || 100;
        // const matchesDistance = itemDist <= filters.maxDistance;
        const matchesDistance = true;

        // 5. Tags (Hot Suggestions)
        // Basic mapping for now
        let matchesTags = true;
        if (filters.tags.length > 0) {
            const checks = filters.tags.map(tag => {
                if (tag === 'New Arrivals') return true; // All are new technically
                if (tag === 'Rare Finds') return item.condition === 'new' || item.condition === 'like_new';
                return false;
            });
            matchesTags = checks.some(Boolean);
        }

        return matchesSearch && matchesType && matchesCategory && matchesDistance && matchesTags;
    });

    // --- Pagination Logic ---
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Format seconds into HH:MM:SS
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return {
            h: h.toString().padStart(2, '0'),
            m: m.toString().padStart(2, '0'),
            s: s.toString().padStart(2, '0')
        };
    };

    const { h, m, s } = formatTime(timeLeft);

    return (
        <div className="marketplace-page">
            <div className="marketplace-header">
                <div>
                    <h2 className="marketplace-title">NEXT DROP <br /><span className="text-highlight">LIVE</span></h2>
                    <div className="drop-timer">
                        <span>{h}</span>:<span>{m}</span>:<span>{s}</span>
                    </div>
                </div>
                <div className="marketplace-controls">
                    {/* Section 1: Search */}
                    <Input
                        placeholder="Search the drop..."
                        icon={SearchIcon}
                        containerClassName="search-bar"
                        value={filters.search}
                        onChange={(e) => updateFilter('search', e.target.value)}
                    />

                    <div className="filter-dashboard-grid">

                        {/* Section 2: Type (Sell/Buy/Donate) */}
                        <div className="filter-group">
                            <h4 className="filter-group-title">Type</h4>
                            <div className="filter-options">
                                {['Buy', 'Swap', 'Donate'].map(type => (
                                    <button
                                        key={type}
                                        className={`filter-chip ${filters.types.includes(type) ? 'active' : ''}`}
                                        onClick={() => toggleFilter('types', type)}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 3: Distance */}
                        <div className="filter-group">
                            <h4 className="filter-group-title">Distance: {filters.maxDistance}km</h4>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={filters.maxDistance}
                                className="range-slider"
                                onChange={(e) => updateFilter('maxDistance', Number(e.target.value))}
                            />
                        </div>

                        {/* Section 4: Category (Replaces Vibe/Gender) */}
                        <div className="filter-group">
                            <h4 className="filter-group-title">Category</h4>
                            <div className="filter-options">
                                {['tops', 'bottoms', 'shoes', 'accessories'].map(c => (
                                    <button
                                        key={c}
                                        className={`filter-chip ${filters.categories.includes(c) ? 'active' : ''}`}
                                        onClick={() => toggleFilter('categories', c)}
                                        style={{ textTransform: 'capitalize' }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 5: Hot Suggestions */}
                        <div className="filter-group">
                            <h4 className="filter-group-title">Hot</h4>
                            <div className="filter-options">
                                {['Rare Finds', 'Trending', 'New Arrivals', 'Sold Out'].map(tag => (
                                    <button
                                        key={tag}
                                        className={`filter-chip special ${filters.tags.includes(tag) ? 'active' : ''}`}
                                        onClick={() => toggleFilter('tags', tag)}
                                    >
                                        {tag === 'Rare Finds' && <Sparkles size={12} />}
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="filter-footer" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button className="reset-btn" onClick={() => setFilters({ search: '', types: [], categories: [], maxDistance: 50, tags: [] })} style={{ fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-text-secondary)' }}>
                            Reset Filters
                        </button>
                        <div className="results-count" style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                            {filteredItems.length} items found
                        </div>
                    </div>
                </div>
            </div>

            <div className="items-grid drop-grid">
                {currentItems.length > 0 ? (
                    currentItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="drop-item-wrapper animate-fade-up"
                            style={{ animationDelay: `${index * 0.05}s`, cursor: 'pointer' }}
                            onClick={() => setSelectedItem({
                                ...item,
                                title: item.itemname,
                                image: item.image_url,
                                type: item.medium,
                                owner: item.seller
                            })}
                        >
                            <ItemCard item={{
                                id: item.id,
                                title: item.itemname,
                                image: item.image_url,
                                size: item.size,
                                condition: item.condition,
                                type: item.medium, // 'sell', 'swap'
                                price: item.price,
                                owner: item.seller, // 'user'
                                distance: item.location || '0km'
                            }} />
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <p>No items found matching your vibe.</p>
                        <Button onClick={() => setFilters({ search: '', types: [], categories: [], maxDistance: 50, tags: [] })}>Clear Filters</Button>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination-controls">
                    <button
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                className={`page-number ${currentPage === page ? 'active' : ''}`}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <button
                        className="page-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </div>
    );
}
