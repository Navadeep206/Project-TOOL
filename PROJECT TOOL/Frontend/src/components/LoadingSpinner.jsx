import Logo from './Logo';

const LoadingSpinner = ({ text = "Establishing Uplink..." }) => {
    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-zinc-950 p-4">
            <div className="flex flex-col items-center">
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse"></div>
                    <div className="relative animate-[bounce_2s_infinite]">
                        <Logo size="xl" showText={false} />
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-sm flex flex-col items-center gap-2">
                    <div className="flex items-center gap-3">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                        <span className="font-mono text-zinc-400 text-sm tracking-widest uppercase">
                            {text}
                        </span>
                    </div>
                    <div className="w-full h-0.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-amber-500 animate-[loading_2s_ease-in-out_infinite] w-1/3"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
