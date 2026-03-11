import React, { useState, useEffect } from 'react';

const ApprovalActionModal = ({ isOpen, onClose, onConfirm, request, actionType }) => {
    const [comments, setComments] = useState('');

    // Reset textarea on open
    useEffect(() => {
        if (isOpen) {
            setComments('');
        }
    }, [isOpen]);

    if (!isOpen || !request) return null;

    const isApprove = actionType === 'approve';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-sm w-full max-w-md shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] p-6 overflow-hidden transform transition-all font-mono">

                {/* Header Ribbon Colors based on action */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${isApprove ? 'bg-emerald-500' : 'bg-red-500'}`} />

                <div className="flex items-center gap-4 mb-5 mt-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-inner ${isApprove ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {isApprove ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                            {isApprove ? 'Confirm Approval' : 'Reject Request'}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">RequestID: {request.requestId?.slice(0, 12)}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-zinc-950 p-3 rounded-sm border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed uppercase tracking-wide">
                        <span className="block mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 border-b border-zinc-800 pb-1">System Context</span>
                        <span className="italic">"{request.reason}"</span>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                            {isApprove ? 'Approval Notes' : 'Rejection Reason'} <span className="text-zinc-700 font-normal">(OPTIONAL)</span>
                        </label>
                        <textarea
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-sm p-3 text-zinc-200 placeholder-zinc-800 focus:outline-none focus:border-amber-500 transition-all h-24 resize-none text-xs uppercase tracking-wider"
                            placeholder={isApprove ? "ENTER VALIDATION NOTES..." : "PROVIDE TERMINATION REASON..."}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-200 hover:bg-zinc-800 rounded-sm transition-all"
                    >
                        Abort
                    </button>
                    <button
                        onClick={() => onConfirm(comments)}
                        className={`px-5 py-2 text-[10px] font-bold text-black uppercase tracking-widest rounded-sm transition-all ${isApprove
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-red-600 hover:bg-red-500 text-white'
                            }`}
                    >
                        {isApprove ? 'Execute Approval' : 'Reject Proposal'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApprovalActionModal;
