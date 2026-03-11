import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Briefcase, CheckSquare, Calendar,
    BarChart2, Users, MessageSquare, ShieldCheck,
    Bell, Terminal, LogOut
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown/NotificationDropdown';

import Logo from './Logo';

const Navbar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    if (['/login', '/register'].includes(location.pathname)) return null;

    const NavLink = ({ to, icon: Icon, label, restricted = false }) => {
        const isActive = location.pathname === to;
        return (
            <li>
                <Link
                    to={to}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-sm transition-all font-mono text-base uppercase tracking-wider group
                        ${isActive
                            ? 'text-amber-500 bg-amber-500/5 shadow-[inset_0_-1px_0_0_#f59e0b]'
                            : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40'}`}
                >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-amber-500' : 'text-zinc-600 group-hover:text-amber-500/70'}`} />
                    <span className="hidden lg:inline">{label}</span>
                </Link>
            </li>
        );
    };

    return (
        <nav className="bg-black/90 backdrop-blur-xl border-b border-zinc-900 sticky top-0 z-50 py-0 px-4 shadow-2xl h-20 flex items-center">
            <div className="max-w-[1600px] mx-auto flex justify-between items-center gap-8 w-full">
                {/* Logo Section */}
                <Link to="/dashboard" className="flex items-center gap-2 group shrink-0">
                    <Logo size="md" showText={true} />
                </Link>

                {/* Primary Navigation */}
                {user && (
                    <div className="flex-1 flex items-center justify-between overflow-x-auto no-scrollbar">
                        <ul className="flex items-center gap-1">
                            <NavLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <div className="w-px h-4 bg-zinc-800 mx-2 hidden md:block" />
                            <NavLink to="/projects" icon={Briefcase} label="Projects" />
                            <NavLink to="/tasks" icon={CheckSquare} label="Tasks" />
                            <NavLink to="/teams" icon={Users} label="Teams" />
                        </ul>

                        <ul className="flex items-center gap-1 border-l border-zinc-900 pl-4 ml-4">
                            <NavLink to="/timeline" icon={Calendar} label="Timeline" />
                            <NavLink to="/analytics" icon={BarChart2} label="Analytics" />
                            <NavLink to="/chat" icon={MessageSquare} label="Chat" />

                            {(user.role === 'admin' || user.role === 'manager') && (
                                <NavLink to="/approvals" icon={ShieldCheck} label="Approvals" />
                            )}
                            <NotificationDropdown />

                            {user.role === 'admin' && (
                                <NavLink to="/audit-logs" icon={Terminal} label="Logs" />
                            )}
                        </ul>
                    </div>
                )}

                {/* Account Section */}
                <div className="flex items-center gap-4 border-l border-zinc-900 pl-6 shrink-0">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-[12px] font-bold text-zinc-200 uppercase tracking-tighter leading-none">{user.name}</span>
                                <span className="text-[10px] font-mono text-amber-600 uppercase tracking-widest">{user.role}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/5 rounded transition-all group"
                                title="Disconnect"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-zinc-500 hover:text-white font-mono text-xs uppercase px-3 py-1.5 transition-colors">Login</Link>
                            <Link to="/register" className="bg-amber-600 hover:bg-amber-500 text-black font-black font-mono text-[10px] uppercase px-4 py-1.5 rounded-sm shadow-lg shadow-amber-900/20">Init_App</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
