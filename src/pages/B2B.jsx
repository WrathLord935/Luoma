import { useState, useEffect } from 'react';
import {
    Briefcase, Package, ArrowUpRight, Activity,
    Terminal, Globe, ShieldCheck, BarChart3, TrendingUp, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation'; // Import the hook
import './B2B.css';

// Added Mock Coordinates (Lat/Lng) - Centered around Kerala
const MOCK_MANIFEST = [
    { id: 'MTL-882', item: 'Coconut Husk (Raw)', qty: '500kg', origin: 'Aluva Industrial Estate', velocity: 85, status: 'available', coords: { lat: 10.1076, lng: 76.3516 } }, // Aluva
    { id: 'MTL-901', item: 'Rubber Latex', qty: '120L', origin: 'Kottayam Rubber Board', velocity: 42, status: 'transit', coords: { lat: 9.5916, lng: 76.5221 } }, // Kottayam
    { id: 'MTL-774', item: 'Areca Nut Shells', qty: '1.2T', origin: 'Kalamassery Agro Park', velocity: 65, status: 'available', coords: { lat: 10.0528, lng: 76.3078 } }, // Kalamassery
    { id: 'MTL-299', item: 'Coir Fiber', qty: '300kg', origin: 'Alleppey Coir Hub', velocity: 20, status: 'backorder', coords: { lat: 9.4981, lng: 76.3388 } }, // Alleppey
    { id: 'MTL-551', item: 'Spices (Mixed)', qty: '80kg', origin: 'Munnar Spice Gardens', velocity: 92, status: 'available', coords: { lat: 10.0889, lng: 77.0595 } }, // Munnar
    { id: 'MTL-602', item: 'Bamboo Pulp', qty: '250kg', origin: 'Nilambur Forest Corp', velocity: 70, status: 'available', coords: { lat: 11.2709, lng: 76.2202 } }, // Nilambur
    { id: 'MTL-115', item: 'Cashew Shell Liquid', qty: '50L', origin: 'Kollam Cashew Factory', velocity: 30, status: 'transit', coords: { lat: 8.8932, lng: 76.6141 } }, // Kollam
];

// Haversine Formula for Distance (km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d);
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

export default function B2B() {
    const { user } = useAuth();
    const { location, getLocation, loading: locLoading } = useGeolocation();

    const [analyzing, setAnalyzing] = useState(false);
    const [logs, setLogs] = useState(['> SYSTEM READY', '> AWAITING INPUT...']);
    const [sortByDistance, setSortByDistance] = useState(false);
    const [manifest, setManifest] = useState(MOCK_MANIFEST);

    // Initial Location Fetch
    useEffect(() => {
        getLocation();
    }, []);

    // Update distances when location changes
    useEffect(() => {
        if (location.latitude && location.longitude) {
            const updatedManifest = MOCK_MANIFEST.map(item => ({
                ...item,
                distance: calculateDistance(
                    location.latitude,
                    location.longitude,
                    item.coords.lat,
                    item.coords.lng
                )
            }));

            if (sortByDistance) {
                updatedManifest.sort((a, b) => (a.distance || 99999) - (b.distance || 99999));
            }

            setManifest(updatedManifest);
        } else {
            // If location is not available, reset manifest or handle accordingly
            setManifest(MOCK_MANIFEST);
        }
    }, [location, sortByDistance]);

    const toggleSort = () => {
        setSortByDistance(!sortByDistance);
    };

    const exportToCSV = () => {
        const headers = ['ID,ITEM,QUANTITY,ORIGIN,DISTANCE_KM,STATUS,VELOCITY'];
        const rows = manifest.map(row =>
            `${row.id},"${row.item}","${row.qty}","${row.origin}",${row.distance || 0},${row.status},${row.velocity}`
        );
        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `surplus_manifest_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const addLog = (msg, type = 'info') => {
        setLogs(prev => [...prev.slice(-6), `> ${msg}`]); // Keep last 7 logs
    };

    const runSmartTrade = () => {
        setAnalyzing(true);
        setLogs(['> INITIALIZING ORACLE...', '> SCANNING GLOBAL ROUTES...']);

        let steps = [
            'Analyzing Vector: NYC -> MEMPHIS',
            'Checking Tariff Updates...',
            'Detected Arbitrage: DENIM (+42%)',
            'OPTIMIZATION COMPLETE.'
        ];

        steps.forEach((step, i) => {
            setTimeout(() => {
                addLog(step);
                if (i === steps.length - 1) setAnalyzing(false);
            }, (i + 1) * 800);
        });
    };

    return (
        <div className="container b2b-page">
            <header className="b2b-header">
                <div>
                    <h1 className="b2b-title">B2B_EXCHANGE</h1>
                    <div className="b2b-subtitle">
                        SURPLUS TRADING TERMINAL // V.2.0.4
                    </div>
                </div>
                <div className="business-badge">
                    <ShieldCheck size={16} /> VERIFIED_PARTNER: {user?.user_metadata?.username?.toUpperCase() || 'UNIT-01'}
                </div>
            </header>

            <div className="b2b-grid">
                {/* LEFT: LIVE MANIFEST */}
                <div className="left-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* VELOCITY GRAPH */}
                    <div className="b2b-panel">
                        <div className="panel-title">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <TrendingUp size={16} /> MARKET_VELOCITY_INDEX
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#666' }}>24H TREND</span>
                        </div>
                        <div className="velocity-container">
                            {manifest.map((m, i) => (
                                <div key={m.id} className="v-bar-group">
                                    <div className="v-bar" style={{ height: `${m.velocity}%`, background: m.velocity > 80 ? '#00E676' : undefined }}></div>
                                    <span className="v-label">{m.id.split('-')[1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MANIFEST TABLE */}
                    <div className="b2b-panel">
                        <div className="panel-title">
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Package size={16} /> LIVE_MANIFEST
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {/* NEAR ME FILTER */}
                                <button
                                    className={`action-btn ${sortByDistance ? 'active' : ''}`}
                                    onClick={toggleSort}
                                    style={{ background: sortByDistance ? '#00E676' : 'transparent', color: sortByDistance ? '#000' : 'inherit' }}
                                >
                                    {locLoading ? 'LOCATING...' : (sortByDistance ? 'SORT: NEAREST' : 'FILTER: NEAR ME')}
                                </button>
                                <button className="action-btn" onClick={exportToCSV}>EXPORT_CSV</button>
                            </div>
                        </div>
                        <table className="manifest-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>MATERIAL</th>
                                    <th>QTY</th>
                                    <th>ORIGIN</th>
                                    <th>DIST</th> {/* New Column */}
                                    <th>STATUS</th>
                                    <th>ACT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {manifest.map(row => (
                                    <tr key={row.id} className="manifest-row">
                                        <td className="material-id">{row.id}</td>
                                        <td>{row.item}</td>
                                        <td>{row.qty}</td>
                                        <td>{row.origin}</td>
                                        <td style={{ fontFamily: 'monospace', color: row.distance && row.distance < 500 ? '#00E676' : 'inherit' }}>
                                            {row.distance !== undefined ? `${row.distance}km` : '--'}
                                        </td>
                                        <td>
                                            <span className={`status-cell ${row.status}`}>{row.status.toUpperCase()}</span>
                                        </td>
                                        <td>
                                            <button className="action-btn"><ArrowUpRight size={12} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT: ORACLE TERMINAL */}
                <div className="right-col" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="b2b-panel" style={{ background: '#000', color: '#FFF', border: 'none' }}>
                        <div className="panel-title" style={{ borderColor: '#333' }}>
                            <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <Terminal size={16} /> ORACLE_V2
                            </span>
                            <div style={{ width: '8px', height: '8px', background: '#0F0', borderRadius: '50%', boxShadow: '0 0 10px #0F0' }}></div>
                        </div>

                        <div className="terminal-ui">
                            <div className="scanline"></div>
                            <div className="terminal-log">
                                {logs.map((log, i) => (
                                    <div key={i} className="log-entry">{log}</div>
                                ))}
                            </div>
                        </div>

                        <button
                            className="execute-btn"
                            onClick={runSmartTrade}
                            disabled={analyzing}
                        >
                            {analyzing ? (
                                <> <Activity className="spin" /> CALCULATING... </>
                            ) : (
                                <>RUN_OPTIMIZATION</>
                            )}
                        </button>
                    </div>

                    {/* MAP PLACEHOLDER */}
                    <div className="b2b-panel" style={{ flex: 1, minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e0e0', flexDirection: 'column', gap: '10px' }}>
                        <Globe size={48} style={{ opacity: 0.2 }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.5 }}>GLOBAL_LOGISTICS_MAP</span>
                        <div style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
                            {location.city ? `NODE_DETECTED: ${location.city.toUpperCase()}` : 'SEARCHING FOR NODE...'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
