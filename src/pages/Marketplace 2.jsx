import { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ItemCard from '../components/ItemCard';
import Input from '../components/Input';
import Button from '../components/Button';
import './Marketplace.css';

import { MARKETPLACE_ITEMS } from '../data/marketplaceItems';

const ITEMS_PER_PAGE = 9; // 3 rows of 3

const DROP_ITEMS = MARKETPLACE_ITEMS.map((item, i) => ({
    ...item,
    status: i === 1 ? 'SOLD OUT' : i === 3 ? 'RARE' : null,
    dropTime: i === 0 ? '10m left' : null
}));

import ItemModal from '../components/ItemModal';

export default function Marketplace() {
    // Timer state
    const [timeLeft, setTimeLeft] = useState(8099);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [selectedItem, setSelectedItem] = useState(null);

    // Unified Filter State
    const [filters, setFilters] = useState({
        search: '',
        types: [],          // ['Buy', 'Swap', 'Donate']
        genders: [],        // ['Female', 'Male', 'Kids', 'Unisex']
        maxDistance: 20,    // km value
        tags: []            // ['Rare Finds', 'Trending', 'New Arrivals', 'Sold Out']
    });

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
    const filteredItems = DROP_ITEMS.filter((item) => {
        // 1. Search
        const matchesSearch = item.title.toLowerCase().includes(filters.search.toLowerCase());

        // 2. Type (Types is "selling type" in user req: Buy/Swap/Donate)
        // If types array is empty, show all. If not, item.type must be in array.
        const matchesType = filters.types.length === 0 || filters.types.includes(item.type);

        // 3. Gender (Category in data)
        const matchesGender = filters.genders.length === 0 || filters.genders.includes(item.category);

        // 4. Distance
        const itemDist = item.distanceValue || 100;
        const matchesDistance = itemDist <= filters.maxDistance;

        // 5. Tags (Hot Suggestions)
        let matchesTags = true;
        if (filters.tags.length > 0) {
            // Check specific conditions based on tag name
            const checks = filters.tags.map(tag => {
                if (tag === 'Rare Finds') return item.status === 'RARE';
                if (tag === 'Sold Out') return item.status === 'SOLD OUT';
                if (tag === 'New Arrivals') return item.condition === 'New' || item.condition === 'Like New';
                if (tag === 'Trending') return true;
                return false;
            });
            // If item matches ANY of the selected tag conditions
            matchesTags = checks.some(Boolean);
        }

        return matchesSearch && matchesType && matchesGender && matchesDistance && matchesTags;
    });

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

    // safe guard current page
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const currentItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 86400)); // Reset to 24h if 0
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

                        {/* Section 4: Gender/Vibe */}
                        <div className="filter-group">
                            <h4 className="filter-group-title">Vibe</h4>
                            <div className="filter-options">
                                {['Female', 'Male', 'Kids', 'Unisex'].map(g => (
                                    <button
                                        key={g}
                                        className={`filter-chip ${filters.genders.includes(g) ? 'active' : ''}`}
                                        onClick={() => toggleFilter('genders', g)}
                                    >
                                        {g}
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
                        <button className="reset-btn" onClick={() => setFilters({ search: '', types: [], genders: [], maxDistance: 50, tags: [] })} style={{ fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--color-text-secondary)' }}>
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
                            onClick={() => setSelectedItem(item)}
                        >
                            {item.status === 'SOLD OUT' && <div className="drop-badge badge-sold">SOLD OUT</div>}
                            {item.status === 'RARE' && <div className="drop-badge badge-rare">RARE FIND</div>}

                            <ItemCard item={item} />

                            {item.dropTime && (
                                <div className="drop-urgent-tag animate-pulse">
                                    Closing in {item.dropTime}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="no-results">
                        <p>No items found matching your vibe.</p>
                        <Button onClick={() => setFilters({ search: '', types: [], genders: [], maxDistance: 50, tags: [] })}>Clear Filters</Button>
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
