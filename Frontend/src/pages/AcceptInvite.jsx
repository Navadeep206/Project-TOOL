import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';

const AcceptInvite = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing invitation token.');
            setVerifying(false);
            return;
        }

        const fetchInviteInfo = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/verify-invite/${token}`);
                if (res.data.data && res.data.data.name) {
                    setFormData(prev => ({ ...prev, name: res.data.data.name }));
                }
                setVerifying(false);
            } catch (err) {
                console.error('Token verification failed:', err);
                setError(err.response?.data?.message || 'Invalid or expired invitation token.');
                setVerifying(false);
            }
        };

        fetchInviteInfo();
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error('Passwords do not match');
        }

        setLoading(true);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/accept-invite`, {
                token,
                name: formData.name,
                password: formData.password
            }, { withCredentials: true });

            toast.success('Account activated successfully! Logging you in...');

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                navigate('/dashboard');
                window.location.reload(); // Refresh to update auth state
            }, 2000);

        } catch (err) {
            console.error('Accept Invite Error:', err);
            toast.error(err.response?.data?.message || 'Failed to accept invitation');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono">
                <div className="animate-pulse">VERIFYING_TOKEN...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-sm text-center">
                    <h2 className="text-red-500 font-bold uppercase tracking-widest mb-4">Access Denied</h2>
                    <p className="text-zinc-400 mb-6 font-mono text-sm">{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-zinc-800 text-zinc-300 px-6 py-2 rounded-sm hover:bg-zinc-700 font-mono text-xs uppercase"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-sm shadow-2xl">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-black text-zinc-100 uppercase tracking-tighter mb-2">
                        Activate <span className="text-amber-500">Account</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Secure Onboarding Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-2">Full Identity Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-sm focus:outline-none focus:border-amber-500/50 transition-colors font-mono text-sm"
                            placeholder="OPERATIVE_NAME"
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-2">Initialize Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-sm focus:outline-none focus:border-amber-500/50 transition-colors font-mono text-sm"
                            placeholder="********"
                        />
                    </div>

                    <div>
                        <label className="block text-zinc-500 text-[10px] font-mono uppercase tracking-widest mb-2">Confirm Authorization</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 px-4 py-3 rounded-sm focus:outline-none focus:border-amber-500/50 transition-colors font-mono text-sm"
                            placeholder="********"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-sm font-black uppercase tracking-widest text-sm transition-all ${loading
                            ? 'bg-zinc-800 text-zinc-600 cursor-not-wait'
                            : 'bg-amber-600 text-black hover:bg-amber-500 active:scale-[0.98]'
                            }`}
                    >
                        {loading ? 'PROCESSING...' : 'ACTIVATE_ACCESS'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
                    <p className="text-zinc-600 font-mono text-[10px] uppercase">
                        Secure end-to-end encrypted registration
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AcceptInvite;
