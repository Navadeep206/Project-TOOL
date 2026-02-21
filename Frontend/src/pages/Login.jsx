import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(formData.email, formData.password);
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-zinc-950 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm w-full max-w-md relative overflow-hidden">
                {/* Decorative Top header */}
                <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex justify-between items-center relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                    <h1 className="text-xl font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-sm inline-block"></span> Auth Sequence
                    </h1>
                    <span className="font-mono text-xs text-zinc-600 uppercase">SYS_LOGIN</span>
                </div>

                <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Operative Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter Access Identity..."
                                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                                required
                            />
                        </div>
                        <div className="mb-8">
                            <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Passcode</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter Decryption Key..."
                                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors font-mono"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full ${isSubmitting ? 'bg-amber-800 text-amber-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-black'} py-3 rounded-sm font-bold uppercase tracking-widest text-sm transition-colors mb-6 shadow-[0_0_15px_rgba(217,119,6,0.2)]`}
                        >
                            {isSubmitting ? 'Verifying...' : 'Establish Uplink'}
                        </button>
                    </form>

                    <div className="text-center border-t border-zinc-800/50 pt-6">
                        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                            No active clearance? <Link to="/register" className="text-amber-500 hover:text-amber-400 border-b border-amber-500 border-dashed pb-0.5 ml-2 transition-colors">Request Access</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
