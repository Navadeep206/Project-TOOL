import { useState } from 'react';
import { Search, Bell, Menu, ChevronDown, User, Settings, LogOut, Globe, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useData';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import Logo from '../Logo';

const Topbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const { data: projects } = useProjects();
    const [selectedProject, setSelectedProject] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="h-20 border-b border-zinc-900 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 transition-all duration-300">
            <div className="flex items-center gap-6 flex-1 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="p-2 md:hidden text-zinc-400 hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>

                {/* Mobile/Desktop Logo Area */}
                <div className="flex items-center gap-4 shrink-0">
                    <Logo size="md" showText={true} />
                </div>

                {/* Global Search - Wrapped with margin to prevent overlap */}
                <div className="max-w-md w-full ml-10 hidden lg:block flex-shrink">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-amber-500 transition-colors" strokeWidth={2.5} />
                        <input
                            type="text"
                            placeholder="SEARCH TERMINAL..."
                            className="w-full bg-zinc-900/20 border border-zinc-800/80 rounded-sm py-3 pl-12 pr-4 text-xs text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/30 transition-all font-mono uppercase tracking-wider focus:bg-zinc-900/40"
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 ml-4 shrink-0">
                {/* Notification Bell - Larger */}
                <div className="hover:bg-zinc-800/50 p-2 rounded-sm transition-all">
                    <NotificationDropdown iconSize={24} />
                </div>

                <div className="w-px h-8 bg-zinc-800/50 mx-2" />

                {/* Profile Dropdown - Larger and smoother */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1 rounded-sm hover:bg-zinc-800/50 transition-all border border-transparent hover:border-zinc-800 group"
                    >
                        <div className="w-10 h-10 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-black group-hover:border-amber-500/50 transition-all">
                            {user?.name?.[0].toUpperCase()}
                        </div>
                        <ChevronDown size={16} className={`text-zinc-600 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="absolute right-0 mt-3 w-64 bg-zinc-950 border border-zinc-800 rounded-sm shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] z-50 py-1 overflow-hidden font-mono">
                                <div className="px-4 py-4 border-b border-zinc-900 bg-zinc-900/20">
                                    <p className="text-sm font-black text-zinc-200 uppercase tracking-tight">{user?.name}</p>
                                    <p className="text-xs text-zinc-600 font-bold uppercase tracking-widest mt-1 leading-none">{user?.role}</p>
                                </div>
                                <div className="p-1">
                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-sm transition-all">
                                        <User size={18} strokeWidth={2.5} /> My Profile
                                    </button>
                                    <button className="w-full flex items-center gap-3 px-4 py-3 text-base font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-sm transition-all">
                                        <Settings size={18} strokeWidth={2.5} /> Settings
                                    </button>
                                </div>
                                <div className="border-t border-zinc-900 p-1">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-base font-black uppercase tracking-[0.2em] text-red-900 hover:text-red-500 hover:bg-red-500/5 rounded-sm transition-all"
                                    >
                                        <LogOut size={14} strokeWidth={2.5} /> Sign out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
