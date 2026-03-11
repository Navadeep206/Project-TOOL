import React from 'react';

const DecisionHistoryModal = ({ isOpen, onClose, request }) => {
    if (!isOpen || !request) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-sm w-full max-w-lg shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transform transition-all font-mono">
                <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Decision Timeline
                    </h3>
                    <button onClick={onClose} className="text-zinc-600 hover:text-white transition-all">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 bg-zinc-900/50">
                    {request.decisionHistory?.length === 0 ? (
                        <div className="text-center py-10 text-zinc-600 italic text-xs uppercase font-bold tracking-widest">
                            No verification units recorded.
                        </div>
                    ) : (
                        <div className="relative border-l border-zinc-800 ml-3 space-y-8">
                            {request.decisionHistory.map((decision, index) => (
                                <div key={index} className="relative pl-8">
                                    {/* Timeline Dot */}
                                    <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border border-zinc-950 ${decision.decision === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                                        }`} />

                                    <div className="bg-zinc-950 rounded-sm p-4 border border-zinc-800 shadow-inner">
                                        <div className="flex justify-between items-start mb-3 border-b border-zinc-900 pb-2">
                                            <div>
                                                <p className="text-xs font-black text-zinc-200 uppercase tracking-tight">
                                                    {decision.approverId?.fullname || decision.approverId?.username || 'SYSTEM_CORE'}
                                                </p>
                                                <p className="text-[9px] text-zinc-600 uppercase font-black tracking-[0.2em] mt-0.5">
                                                    LEVEL_{decision.level || 0}_CLEARANCE
                                                </p>
                                            </div>
                                            <span className={`text-[9px] px-2 py-0.5 rounded-sm border font-black tracking-[0.2em] ${decision.decision === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {decision.decision.toUpperCase()}
                                            </span>
                                        </div>

                                        {decision.comments ? (
                                            <p className="text-[11px] text-zinc-400 italic uppercase tracking-wider leading-relaxed">"{decision.comments}"</p>
                                        ) : (
                                            <p className="text-[11px] text-zinc-700 italic uppercase">NO_LOG_ENTRY</p>
                                        )}

                                        <div className="mt-4 text-[9px] text-zinc-700 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                                            {new Date(decision.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-zinc-950 p-4 border-t border-zinc-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-sm transition-all text-[10px] font-bold uppercase tracking-[0.2em]"
                    >
                        EXTRACT_VIEW
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DecisionHistoryModal;
