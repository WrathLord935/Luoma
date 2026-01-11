import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ShoppingBag, Users, Upload, User, Settings, LogOut, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace' },
    { icon: Users, label: 'Leaderboards', path: '/leaderboards' },
    { icon: Briefcase, label: 'Surplus Exchange', path: '/b2b' },
    { icon: Upload, label: 'Upload Item', path: '/upload' },
    { icon: User, label: 'Profile', path: '/profile' },
];

const YarnBall = ({ size = 24, className = "" }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        {/* Main Ball Outline */}
        <circle cx="11" cy="11" r="8" />

        {/* Winding Threads */}
        <path d="M11 3a16 16 0 0 0 6 12" />
        <path d="M13 19a16 16 0 0 0-8-12" />
        <path d="M5 11a12 12 0 0 1 12 0" />
        <path d="M5 11c0 3 3 5 6 5" />

        {/* Loose Tail */}
        <path d="M16 17c1.5 1.5 3 2.5 5 1.5 1.5-.75 2-2.5 2-4" />
    </svg>
);

export default function Sidebar({ isCollapsed, toggleSidebar }) {
    const { signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate('/auth');
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
            <div className="sidebar-header">
                <h1 className="brand-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {isCollapsed ? (
                        <YarnBall size={40} className="spin-slow" />
                    ) : (
                        <>
                            <span>L</span>
                            <YarnBall size={34} className="spin-hover" />
                            <YarnBall size={34} className="spin-hover-reverse" />
                            <span>MA</span>
                        </>
                    )}
                </h1>
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    {isCollapsed ? <ChevronRight size={20} strokeWidth={3} /> : <ChevronLeft size={20} strokeWidth={3} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
                        title={isCollapsed ? item.label : ''}
                    >
                        <item.icon size={24} />
                        <span className="nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/settings" className="nav-item" title={isCollapsed ? 'Settings' : ''}>
                    <Settings size={24} />
                    <span className="nav-label">Settings</span>
                </NavLink>
                <button
                    className="nav-item nav-item--danger"
                    title={isCollapsed ? 'Logout' : ''}
                    onClick={handleLogout}
                >
                    <LogOut size={24} />
                    <span className="nav-label">Logout</span>
                </button>
            </div>
        </aside>
    );
}
