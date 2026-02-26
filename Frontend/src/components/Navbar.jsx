import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Hide Navbar on authentication routes
    const hiddenRoutes = ['/login', '/register'];
    if (hiddenRoutes.includes(location.pathname)) return null;

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        return `font-mono text-sm uppercase tracking-wider px-3 py-2 transition-all ${isActive
            ? 'text-amber-500 font-bold border-b-2 border-amber-500'
            : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800/50 rounded-sm'
            }`;
    };

    return (
        <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex justify-between items-center">
                {/* Logo Area */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 rounded-sm flex items-center justify-center group-hover:border-amber-500 transition-colors">
                        <span className="text-amber-500 font-black font-mono">PT</span>
                    </div>
                    <h1 className="text-xl font-black text-zinc-100 tracking-tight uppercase group-hover:text-white transition-colors">
                        Project<span className="text-zinc-500 font-mono">_TOOL</span>
                    </h1>
                </Link>

                {/* Navigation Links */}
                {user && (
                    <ul className="flex space-x-2 md:space-x-4 items-center">
                        <li><Link to="/dashboard" className={getLinkClass('/dashboard')}>[ Dashboard ]</Link></li>
                        <li><Link to="/projects" className={getLinkClass('/projects')}>[ Projects ]</Link></li>
                        <li><Link to="/tasks" className={getLinkClass('/tasks')}>[ Tasks ]</Link></li>
                        <li><Link to="/teams" className={getLinkClass('/teams')}>[ Teams ]</Link></li>

                        {/* Restricted: Admin & Manager Only */}
                        {(user.role === 'admin' || user.role === 'manager') && (
                            <li><Link to="/approvals" className={getLinkClass('/approvals')}>[ Approvals ]</Link></li>
                        )}

                        <li><Link to="/notifications" className={getLinkClass('/notifications')}>[ Alerts ]</Link></li>

                        {/* Restricted: Admin Only */}
                        {user.role === 'admin' && (
                            <li><Link to="/audit-logs" className={getLinkClass('/audit-logs')}>[ Logs ]</Link></li>
                        )}
                    </ul>
                )}

                {/* Auth Links */}
                <div className="flex space-x-3 border-l border-zinc-800 pl-4">
                    {user ? (
                        <button onClick={logout} className="text-zinc-400 hover:text-white font-mono text-sm uppercase tracking-wider px-3 py-1.5 transition-colors cursor-pointer">Disconnect</button>
                    ) : (
                        <>
                            <Link to="/login" className="text-zinc-400 hover:text-white font-mono text-sm uppercase tracking-wider px-3 py-1.5 transition-colors">Login</Link>
                            <Link to="/register" className="bg-amber-600 hover:bg-amber-500 text-black font-bold font-mono text-sm uppercase tracking-wider px-4 py-1.5 rounded-sm transition-colors">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
