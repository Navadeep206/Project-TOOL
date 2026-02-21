const LoadingSpinner = ({ text = "Establishing Uplink..." }) => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-zinc-950 p-4">
            <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                    <div className="absolute inset-0 border-2 border-zinc-800 rounded-sm"></div>
                    <div className="absolute inset-0 border-t-2 border-amber-500 rounded-sm animate-spin"></div>
                    <div className="absolute inset-2 border-2 border-zinc-800 rounded-sm"></div>
                    <div className="absolute inset-2 border-r-2 border-emerald-500 rounded-sm animate-[spin_1.5s_linear_infinite_reverse]"></div>
                    <div className="w-2 h-2 bg-zinc-300 rounded-sm animate-pulse"></div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-sm flex items-center gap-3">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="font-mono text-zinc-400 text-sm tracking-widest uppercase">
                        {text}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
