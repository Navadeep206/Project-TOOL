import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Navigation/Sidebar';
import Topbar from '../Navigation/Topbar';
import ChatWidget from '../Chat/ChatWidget';

const DashboardLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="min-h-screen bg-[#09090b] flex text-zinc-100 flex-col md:flex-row">
            {/* Desktop/Mobile Sidebar */}
            <div className={`
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out
                ${collapsed ? 'md:w-20' : 'md:w-64'}
            `}>
                <Sidebar
                    collapsed={collapsed}
                    setCollapsed={(val) => {
                        setCollapsed(val);
                        if (window.innerWidth < 768) setMobileOpen(false);
                    }}
                />
            </div>

            {/* Backdrop for mobile */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out`}>
                <Topbar onMenuClick={() => setMobileOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:px-6 md:py-8 pt-6">
                    <div className="max-w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </main>
                <ChatWidget />
            </div>
        </div>
    );
};

export default DashboardLayout;
