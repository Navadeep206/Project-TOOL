import React from 'react';
import Logo from './Logo';

const Footer = () => {
    return (
        <footer className="border-t border-zinc-900 bg-black/50 py-8 px-4 mt-auto">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <Logo size="sm" showText={true} />
                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest pl-1">
                        © 2026 TASKTACTICS _ ALL RIGHTS RESERVED
                    </p>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">System Status</span>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[11px] font-bold text-emerald-500 uppercase">Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
