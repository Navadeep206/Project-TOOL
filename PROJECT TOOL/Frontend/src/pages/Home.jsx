import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] bg-zinc-950 font-sans text-zinc-300">
            {/* Hero Section */}
            <header className="bg-zinc-950 border-b-2 border-zinc-800 relative overflow-hidden">
                {/* Decorative background grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <div className="container mx-auto px-6 py-24 md:py-32 relative flex flex-col items-center text-center">
                    <div className="inline-block border border-amber-500/30 bg-amber-500/10 px-3 py-1 mb-8 rounded-sm">
                        <span className="font-mono text-xs text-amber-500 uppercase tracking-widest font-bold">Protocol Active : System Online</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-zinc-100 uppercase tracking-tighter mb-6 relative">
                        Mission <span className="text-amber-500">Control</span> Payload
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-amber-500"></div>
                    </h1>

                    <p className="text-lg md:text-xl max-w-2xl text-zinc-400 font-mono mt-8 mb-12">
                        Advanced tracking and operational deployment infrastructure for specialized units.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
                        <Link to="/register" className="bg-amber-600 text-black font-bold uppercase tracking-widest font-mono py-3 px-8 rounded-sm hover:bg-amber-500 transition-colors shadow-[0_0_20px_rgba(217,119,6,0.3)] border border-transparent">
                            Initialize Deployment
                        </Link>
                        <Link to="/login" className="bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase tracking-widest font-mono py-3 px-8 rounded-sm hover:bg-zinc-800 hover:text-zinc-100 transition-colors">
                            Access Uplink
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="container mx-auto px-6 py-20 relative">
                {/* Decorative side line */}
                <div className="absolute left-6 top-20 bottom-20 w-px bg-zinc-800 hidden md:block"></div>

                <div className="md:pl-12">
                    <h2 className="text-xl font-bold text-zinc-100 uppercase tracking-wide mb-12 flex items-center gap-3">
                        <span className="w-8 h-px bg-amber-500"></span> Core Directives
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm hover:border-zinc-700 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            <div className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-4">Module 01</div>
                            <h3 className="text-2xl font-bold text-zinc-100 uppercase tracking-tight mb-3">Task Queue</h3>
                            <p className="text-zinc-500 font-mono text-sm">Deploy and track operation parameters with distinct team and operative assignment filtering.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm hover:border-zinc-700 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            <div className="text-emerald-500 font-mono text-xs uppercase tracking-widest mb-4">Module 02</div>
                            <h3 className="text-2xl font-bold text-zinc-100 uppercase tracking-tight mb-3">Unit Roster</h3>
                            <p className="text-zinc-500 font-mono text-sm">Dynamic network management structure. Synchronize team hierarchies and personnel assignments in real-time.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-sm hover:border-zinc-700 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                            <div className="text-purple-500 font-mono text-xs uppercase tracking-widest mb-4">Module 03</div>
                            <h3 className="text-2xl font-bold text-zinc-100 uppercase tracking-tight mb-3">Telemetry</h3>
                            <p className="text-zinc-500 font-mono text-sm">Centralized dashboarding capabilities. Monitor progress logs and execution statuses globally.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
