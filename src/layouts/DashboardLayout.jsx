import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomDock from '../components/BottomDock';
import './DashboardLayout.css';

export default function DashboardLayout() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="dashboard-container">
            <div className="desktop-sidebar">
                <Sidebar
                    isCollapsed={isCollapsed}
                    toggleSidebar={toggleSidebar}
                />
            </div>

            <div className={`main-content ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
                <Outlet />
            </div>

            <div className="mobile-dock">
                <BottomDock />
            </div>
        </div>
    );
}
