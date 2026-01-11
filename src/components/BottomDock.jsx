import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Users, Upload, User, Settings } from 'lucide-react';
import './BottomDock.css';

const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: ShoppingBag, label: 'Market', path: '/marketplace' },
    { icon: Upload, label: 'Upload', path: '/upload', isPrimary: true },
    { icon: Users, label: 'Leaderboard', path: '/leaderboards' },
    { icon: User, label: 'Profile', path: '/profile' },
];

export default function BottomDock() {
    return (
        <nav className="bottom-dock">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `dock-item ${isActive ? 'active' : ''} ${item.isPrimary ? 'dock-item--primary' : ''}`
                    }
                >
                    <item.icon size={item.isPrimary ? 24 : 20} strokeWidth={item.isPrimary ? 2.5 : 2} />
                    <span className="dock-label">{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
