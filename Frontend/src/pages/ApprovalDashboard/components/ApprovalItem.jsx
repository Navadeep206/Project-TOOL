import React from 'react';

const getStatusConfig = (status) => {
    const configs = {
        pending: { color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Pending Review' },
        in_review: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'In Review' },
        approved: { color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Approved' },
        rejected: { color: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Rejected' },
        cancelled: { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Cancelled' },
    };
    return configs[status] || configs.pending;
};

const getTypeLabel = (type) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const ApprovalItem = ({ request, isHistory, onAction }) => {
    const statusConfig = getStatusConfig(request.currentStatus);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors shadow-lg">
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">

                {/* Main Info */}
                <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-200">
                            {request.requesterId.split('_').pop().toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-500 px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800/50">
                            Role: {request.requesterRole}
                        </span>
                        <span className="text-slate-500 text-sm">requested an action</span>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {getTypeLabel(request.requestType)}
                            <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${statusConfig.color}`}>
                                {statusConfig.label}
                            </span>
                        </h3>
                        <p className="text-sm border-l-2 border-slate-700 pl-3 py-1 my-3 text-slate-300 italic">
                            "{request.reason}"
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Req ID: {request.requestId.slice(0, 10)}...
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Requires: {request.approvalLevel.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Action / Result Block */}
                <div className="lg:w-1/4 flex flex-col justify-center">
                    {!isHistory ? (
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => onAction('reject')}
                                className="flex-1 px-4 py-2 border border-red-500/20 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 hover:border-red-500/50 transition-all font-medium text-sm"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => onAction('approve')}
                                className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/20 font-medium text-sm"
                            >
                                Approve
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                            <p className="text-xs text-slate-500 mb-1">Decision by: <span className="text-slate-300 font-medium">{request.approverId}</span></p>
                            {request.comments ? (
                                <p className="text-sm text-slate-300 italic">"{request.comments}"</p>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No comments provided.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApprovalItem;
