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
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 overflow-hidden transform transition-all">

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
                        <h3 className="text-xl font-bold text-white">
                            {isApprove ? 'Confirm Approval' : 'Reject Request'}
                        </h3>
                        <p className="text-xs text-slate-400">Request: {request.requestId}</p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-slate-400">
                        <span className="block mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Request Context</span>
                        <span className="text-slate-200">"{request.reason}"</span>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Provide {isApprove ? 'Approval Notes' : 'Rejection Reason'} <span className="text-slate-600">(Optional)</span>
                        </label>
                        <textarea
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors h-24 resize-none"
                            placeholder={isApprove ? "Everything looks good..." : "Cannot approve because..."}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(comments)}
                        className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-all shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${isApprove
                                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20 focus:ring-emerald-500'
                                : 'bg-red-600 hover:bg-red-500 shadow-red-500/20 focus:ring-red-500'
                            }`}
                    >
                        {isApprove ? 'Approve Request' : 'Reject Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApprovalActionModal;
