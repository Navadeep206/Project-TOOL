import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-zinc-950 p-4">
            <div className="bg-zinc-900 border border-red-900/50 rounded-sm w-full max-w-lg relative overflow-hidden">
                {/* Decorative Top header */}
                <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex justify-between items-center relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                    <h1 className="text-xl font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-600 rounded-sm inline-block animate-pulse"></span> Critical Failure
                    </h1>
                    <span className="font-mono text-xs text-red-500/80 uppercase">ERR_404_NOT_FOUND</span>
                </div>

                <div className="p-8 flex flex-col items-center text-center">
                    <div className="mb-6 border border-zinc-800 bg-zinc-950 p-4 inline-block rounded-sm">
                        <span className="font-mono text-4xl font-black text-zinc-500 tracking-widest">
                            <span className="text-red-500">4</span>0<span className="text-amber-500">4</span>
                        </span>
                    </div>

                    <h2 className="text-xl text-zinc-300 font-mono tracking-wider uppercase mb-4">Location Unverifiable</h2>
                    <p className="text-zinc-500 font-mono text-sm leading-relaxed mb-8 max-w-md mx-auto">
                        The requested sector coordinates do not match any known uplink in the current operational environment. Return to authorized zones immediately.
                    </p>

                    <Link
                        to="/"
                        className="bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 py-2.5 px-6 rounded-sm uppercase tracking-widest text-sm font-mono transition-colors shadow-sm"
                    >
                        Return to Base
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
