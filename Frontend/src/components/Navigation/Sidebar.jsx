import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SIDEBAR_CONFIG } from '../../constants/navConfig';
import {
    ChevronLeft, ChevronRight, LogOut, Settings,
    User, HelpCircle, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

import Logo from '../Logo';

const Sidebar = ({ collapsed, setCollapsed }) => {
    const location = useLocation();
    const { user, logout } = useAuth();

    const canAccess = (item) => {
        if (!item.roles) return true;
        return item.roles.includes(user?.role);
    };

    const NavItem = ({ item }) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        if (!canAccess(item)) return null;

        return (
            <Link
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-all duration-200 group relative
                    ${isActive
                        ? 'bg-amber-500/10 text-amber-500 font-bold'
                        : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/50'}`}
                title={collapsed ? item.label : ''}
            >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 
                    ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} strokeWidth={2.5} />
                {!collapsed && (
                    <span className="text-sm font-black uppercase tracking-[0.15em] transition-opacity duration-200 whitespace-nowrap">
                        {item.label}
                    </span>
                )}
                {isActive && !collapsed && (
                    <div className="absolute right-0 w-0.5 h-4 bg-amber-500 rounded-l-sm shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                )}
            </Link>
        );
    };

    return (
        <aside
            className={`fixed md:sticky left-0 top-0 h-screen bg-[#09090b] border-r border-zinc-900 z-40 transition-all duration-300 ease-in-out flex flex-col
                ${collapsed ? 'w-20' : 'w-64'}`}
        >
            <div className={`px-4 flex items-center border-b border-zinc-900/50 mb-4 h-20
                ${collapsed ? 'justify-center' : 'justify-between'}`}>
                <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                    <Logo size={collapsed ? "md" : "lg"} showText={!collapsed} />
                </Link>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`p-1 px-1.5 rounded-sm hover:bg-zinc-800 text-zinc-600 transition-colors md:flex hidden border border-transparent hover:border-zinc-700 ${collapsed ? 'hidden' : ''}`}
                >
                    {collapsed ? <PanelLeftOpen size={14} strokeWidth={2.5} /> : <PanelLeftClose size={14} strokeWidth={2.5} />}
                </button>
            </div>

            {/* Navigation Sections */}
            <div className="flex-1 overflow-y-auto px-3 space-y-6 no-scrollbar pb-20">
                {SIDEBAR_CONFIG.map((section, idx) => {
                    const filteredItems = section.items.filter(canAccess);
                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={idx} className="space-y-1">
                            {!collapsed && (
                                <h3 className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2 pl-4">
                                    {section.section}
                                </h3>
                            )}
                            {collapsed && <div className="h-px bg-zinc-900/50 my-4 mx-2" />}
                            <div className="space-y-1">
                                {filteredItems.map(item => (
                                    <NavItem key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-zinc-900 mt-auto bg-[#09090b]">
                {user && (
                    <div className={`flex items-center gap-3 p-2 rounded-sm transition-colors
                        ${collapsed ? 'justify-center' : 'bg-zinc-900/30'}`}>
                        <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-black text-xs shrink-0 shadow-lg ring-1 ring-zinc-800">
                            {user.name?.[0].toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-zinc-200 truncate leading-tight uppercase tracking-tight">{user.name}</p>
                                <p className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5">{user.role}</p>
                            </div>
                        )}
                        {!collapsed && (
                            <button
                                onClick={logout}
                                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all"
                                title="Sign out"
                            >
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
