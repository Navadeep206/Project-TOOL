import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { register } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'manager'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await register(formData.name, formData.email, formData.password);
        } catch (error) {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-zinc-950 p-4 py-12">
            <div className="bg-zinc-900 border border-zinc-800 rounded-sm w-full max-w-md relative overflow-hidden">
                {/* Decorative Top header */}
                <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex justify-between items-center relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                    <h1 className="text-xl font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-sm inline-block"></span> Clearance Gen
                    </h1>
                    <span className="font-mono text-xs text-zinc-600 uppercase">SYS_NEW_USER</span>
                </div>

                <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Operative Identity</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter Designation..."
                                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                required
                            />
                        </div>
                        <div className="mb-5">
                            <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Contact Link</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@domain.core"
                                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                required
                            />
                        </div>
                        <div className="mb-8">
                            <label className="block text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Decryption Key</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create solid passphrase..."
                                className="w-full bg-zinc-950 border border-zinc-700 text-zinc-100 rounded-sm px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full ${isSubmitting ? 'bg-emerald-800 text-emerald-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-black'} py-3 rounded-sm font-bold uppercase tracking-widest text-sm transition-colors mb-6 shadow-[0_0_15px_rgba(5,150,105,0.2)]`}
                        >
                            {isSubmitting ? 'Generating...' : 'Generate Credentials'}
                        </button>
                    </form>

                    <div className="text-center border-t border-zinc-800/50 pt-6">
                        <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                            Already processed? <Link to="/login" className="text-emerald-500 hover:text-emerald-400 border-b border-emerald-500 border-dashed pb-0.5 ml-2 transition-colors">Access Uplink</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;